// ─── Statik Promo ────────────────────────────────────────────────────────────

export function isPromoActive(pkg) {
  if (!pkg || !pkg.promoPrice || !pkg.promoEndDate) return false;
  return new Date(pkg.promoEndDate) > new Date();
}

export function formatPromoEndDate(isoString) {
  return new Date(isoString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Sınava Özel Dinamik Fiyat ───────────────────────────────────────────────

/** Sınava kaç gün kaldığını döndürür. Sınav geçmişse 0. */
export function getExamDaysLeft(pkg) {
  if (!pkg?.examDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = new Date(pkg.examDate) - today;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

/** Sınav fiyatı aktif mi? */
export function isExamPriceActive(pkg) {
  return getExamDaysLeft(pkg) > 0;
}

/**
 * Güncel sınav fiyatını ₺ olarak hesaplar.
 * Formül: (kalan gün / 30) × aylık fiyat × (1 - indirim%)
 */
export function getExamPrice(pkg) {
  const daysLeft = getExamDaysLeft(pkg);
  if (daysLeft <= 0) return null;
  const rate = pkg.examDiscountRate ?? 5;
  const total = (daysLeft / 30) * pkg.price;
  return Math.round(total * (1 - rate / 100));
}

/** Sınav fiyatını kuruş cinsinden döndürür (ödeme sistemi için). */
export function getExamUnitPrice(pkg) {
  const price = getExamPrice(pkg);
  return price !== null ? price * 100 : null;
}

/**
 * Gösterim için en yüksek öncelikli fiyatı döndürür:
 * 1. Sınav dinamik fiyatı (aktifse)
 * 2. Statik promo (aktifse)
 * 3. Normal fiyat
 */
export function getDisplayPrice(pkg) {
  if (isExamPriceActive(pkg)) {
    return { type: "exam", price: getExamPrice(pkg) };
  }
  if (isPromoActive(pkg)) {
    return { type: "promo", price: pkg.promoPrice };
  }
  return { type: "normal", price: null };
}
