// Sepet kalemlerinden fiyat/KDV/kupon hesaplayan saf fonksiyonlar.
// PaymentPage.jsx ve CoachingWizardOdeme.jsx arasında paylaşılır — davranış
// (özellikle KDV hesabı) iki yerde birbirinden bağımsız sürüklenmesin diye
// tek kaynaktan yönetilir.

export const parseTL = (val) =>
  parseFloat(String(val || "").replace("₺", "").replace(/[^\d.]/g, "")) || 0;

export function isTutorPackageItem(it) {
  const fromFlags =
    (it?.source === "TutorPackage" && it?.itemType === "tutoring") ||
    (it?.meta?.source === "TutorPackage" && it?.meta?.itemType === "tutoring");
  const slug = (it?.slug || "").toLowerCase();
  const name = (it?.name || it?.title || "").toLowerCase();
  const slugPattern = /^tek-ders$/.test(slug) || /^paket-\d+$/.test(slug) || /ozel-ders/.test(slug);
  const namePattern = /özel ders|tutor|ders/.test(name);
  return fromFlags || slugPattern || namePattern;
}

export function isKdvEligibleTutorPackage(it) {
  const slug = (it?.slug || "").toLowerCase();
  const name = (it?.name || it?.title || "").toLowerCase();
  const hasTPFlags =
    (it?.source === "TutorPackage" && it?.itemType === "tutoring") ||
    (it?.meta?.source === "TutorPackage" && it?.meta?.itemType === "tutoring");
  const slugMatch = /^tek-ders$/.test(slug) || /^paket-(3|6)$/.test(slug) || /^3-ders$/.test(slug) || /^6-ders$/.test(slug);
  const nameMatch = /(tek\s*ders\b)|(3\s*ders\b)|(6\s*ders\b)/.test(name);
  return slugMatch || (hasTPFlags && nameMatch);
}

export const lineTL = (it) => {
  if (typeof it?.unitPrice === "number") return it.unitPrice / 100;
  return parseTL(it?.price) || 0;
};

// items içindeki kalemleri özel-ders / diğer olarak ayırıp toplamları çıkarır.
export function computeCartTotals(items) {
  let tutoringTotal = 0;
  let otherTotal = 0;
  let eligibleTutoringTotal = 0;
  for (const it of items || []) {
    const line = lineTL(it);
    if (isTutorPackageItem(it)) tutoringTotal += line;
    else otherTotal += line;
    if (isKdvEligibleTutorPackage(it)) eligibleTutoringTotal += line;
  }
  return { tutoringTotal, otherTotal, total: tutoringTotal + otherTotal, eligibleTutoringTotal };
}

// Kupon verisine göre indirim tutarını (TL) hesaplar.
export function computeCouponDiscount(items, couponData) {
  if (!couponData) return 0;
  let discountVal = 0;
  const { type, discountRate, discountAmount, validPackages } = couponData;
  const isEligible = (item) => {
    if (validPackages && validPackages.length > 0) return validPackages.includes(item.slug);
    return true;
  };
  if (type === "RATE") {
    (items || []).forEach((item) => {
      if (isEligible(item)) discountVal += lineTL(item) * (discountRate / 100);
    });
  } else if (type === "FIXED") {
    const eligibleItemsTotal = (items || []).reduce(
      (acc, item) => (isEligible(item) ? acc + lineTL(item) : acc),
      0
    );
    discountVal = Math.min((discountAmount || 0) / 100, eligibleItemsTotal);
  }
  return discountVal;
}

// İndirim + KDV uygulanmış ödenecek tutarı hesaplar.
export function computeFinalCalculations(total, discountValue, eligibleTutoringTotal) {
  const subTotalAfterDiscount = total - discountValue;
  const discountRatio = total > 0 ? subTotalAfterDiscount / total : 1;
  const kdvBase = eligibleTutoringTotal * discountRatio;
  const kdvAmount = kdvBase * 0.2;
  const payable = subTotalAfterDiscount + kdvAmount;
  return { kdvAmount, payable: payable > 0 ? payable : 0 };
}
