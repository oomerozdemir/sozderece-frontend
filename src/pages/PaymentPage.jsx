import { useState, useMemo, useEffect } from "react";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { isValidEmail, isValidName, isValidPhone, isValidPostalCode, isValidAddress, isValidTcNo } from "../utils/validation";
import Footer from "../components/Footer";

const user = JSON.parse(localStorage.getItem("user"));

const DEFAULT_SETTINGS = {
  logoUrl: "/images/hero-logo.webp",
  slogan: "Başarıya giden yol buradan geçiyor",
  socialProofText: "+200 Mutlu Öğrenci",
  socialProofStars: 5,
  avatars: [
    { initials: "AY", color: "#f39c12" },
    { initials: "MK", color: "#100481" },
    { initials: "ZD", color: "#e74c3c" },
  ],
  includes: [
    "Rehberlik Videoları",
    "Adım Adım Belgeler ve Şablonlar",
    "Özel Topluluğa Erişim",
    "Kurs Güncellemelerine Ömür Boyu Erişim",
  ],
  guaranteeText: "Siparişinizi teslim aldıktan sonra 5 gün içinde koşulsuz cayma hakkınız bulunmaktadır.",
  ctaButtonText: "Güvenli Ödemeye Geç",
};

const PaymentPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [paytrToken, setPaytrToken] = useState(null);

  useEffect(() => {
    axios.get("/api/settings/payment-page")
      .then((r) => setSettings({ ...DEFAULT_SETTINGS, ...r.data }))
      .catch(() => {});
  }, []);

  // PayTR postMessage listener
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "https://www.paytr.com") return;
      if (event.data === "PAYMENT_SUCCESS") {
        navigate("/order-success");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  // çoklu id desteği
  const requestIds = useMemo(() => {
    const s = location?.state;
    const fromState = Array.isArray(s?.requestIds)
      ? s.requestIds
      : (s?.requestId ? [s.requestId] : []);
    const qsMany = (searchParams.get("requestIds") || "")
      .split(",").map(x => x.trim()).filter(Boolean);
    const qsOne = searchParams.get("requestId");
    const lsMany = JSON.parse(localStorage.getItem("activeRequestIds") || "[]");
    const lsOne  = localStorage.getItem("activeRequestId");
    const all = [...fromState, ...qsMany, ...(qsOne ? [qsOne] : []), ...lsMany, ...(lsOne ? [lsOne] : [])];
    return Array.from(new Set(all.map(String)));
  }, [location, searchParams]);

  const items = useMemo(() => {
    if (!cart) return [];
    if (Array.isArray(cart)) return cart;
    if (Array.isArray(cart.items)) return cart.items;
    return [];
  }, [cart]);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: "",
    surname: "",
    address: "",
    district: "",
    city: "",
    postalCode: "",
    phone: "",
    allowEmails: false,
    tcNo: "",
    sinif: "",
    alan: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [errors, setErrors] = useState({});

  const parseTL = (val) =>
    parseFloat(String(val || "").replace("₺", "").replace(/[^\d.]/g, "")) || 0;

  function isTutorPackageItem(it) {
    const fromFlags =
      (it?.source === "TutorPackage" && it?.itemType === "tutoring") ||
      (it?.meta?.source === "TutorPackage" && it?.meta?.itemType === "tutoring");
    const slug = (it?.slug || "").toLowerCase();
    const name = (it?.name || it?.title || "").toLowerCase();
    const slugPattern = /^tek-ders$/.test(slug) || /^paket-\d+$/.test(slug) || /ozel-ders/.test(slug);
    const namePattern = /özel ders|tutor|ders/.test(name);
    return fromFlags || slugPattern || namePattern;
  }

  function isKdvEligibleTutorPackage(it) {
    const slug = (it?.slug || "").toLowerCase();
    const name = (it?.name || it?.title || "").toLowerCase();
    const hasTPFlags =
      (it?.source === "TutorPackage" && it?.itemType === "tutoring") ||
      (it?.meta?.source === "TutorPackage" && it?.meta?.itemType === "tutoring");
    const slugMatch = /^tek-ders$/.test(slug) || /^paket-(3|6)$/.test(slug) || /^3-ders$/.test(slug) || /^6-ders$/.test(slug);
    const nameMatch = /(tek\s*ders\b)|(3\s*ders\b)|(6\s*ders\b)/.test(name);
    return slugMatch || (hasTPFlags && nameMatch);
  }

  const lineTL = (it) => {
    if (typeof it?.unitPrice === "number") return it.unitPrice / 100;
    return parseTL(it?.price) || 0;
  };

  const { tutoringTotal, otherTotal, total } = useMemo(() => {
    let t = 0, o = 0;
    for (const it of items) {
      const line = lineTL(it);
      if (isTutorPackageItem(it)) t += line;
      else o += line;
    }
    return { tutoringTotal: t, otherTotal: o, total: t + o };
  }, [items]);

  const eligibleTutoringTotal = useMemo(() => {
    let e = 0;
    for (const it of items) {
      const line = lineTL(it);
      if (isKdvEligibleTutorPackage(it)) e += line;
    }
    return e;
  }, [items]);

  const calculatedDiscountValue = useMemo(() => {
    if (!couponData) return 0;
    let discountVal = 0;
    const { type, discountRate, discountAmount, validPackages } = couponData;
    const isEligible = (item) => {
      if (validPackages && validPackages.length > 0) return validPackages.includes(item.slug);
      return true;
    };
    if (type === "RATE") {
      items.forEach(item => {
        if (isEligible(item)) discountVal += lineTL(item) * (discountRate / 100);
      });
    } else if (type === "FIXED") {
      const eligibleItemsTotal = items.reduce((acc, item) => isEligible(item) ? acc + lineTL(item) : acc, 0);
      discountVal = Math.min((discountAmount || 0) / 100, eligibleItemsTotal);
    }
    return discountVal;
  }, [couponData, items]);

  const finalCalculations = useMemo(() => {
    const subTotalAfterDiscount = total - calculatedDiscountValue;
    const discountRatio = total > 0 ? (subTotalAfterDiscount / total) : 1;
    const kdvBase = eligibleTutoringTotal * discountRatio;
    const kdvAmount = kdvBase * 0.20;
    const payable = subTotalAfterDiscount + kdvAmount;
    return { kdvAmount, payable: payable > 0 ? payable : 0 };
  }, [total, calculatedDiscountValue, eligibleTutoringTotal]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleApplyCoupon = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setCouponMessage("Kupon kodu kullanmak için giriş yapmanız gerekiyor."); return; }
      const res = await axios.post("/api/coupon/validate", { code: couponCode }, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      if (data.validPackages && data.validPackages.length > 0) {
        const hasValidItem = items.some(item => data.validPackages.includes(item.slug));
        if (!hasValidItem) { setCouponMessage("❌ Bu kupon sepetinizdeki ürünler için geçerli değildir."); setCouponData(null); return; }
      }
      setCouponData({ code: data.code, type: data.type || "RATE", discountRate: data.discountRate || 0, discountAmount: data.discountAmount || 0, validPackages: data.validPackages || [] });
      setCouponMessage("✅ Kupon başarıyla uygulandı");
    } catch (err) {
      setCouponData(null);
      setCouponMessage(err.response?.data?.error || "❌ Kupon doğrulanamadı");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const newErrors = {};
    const { payable } = finalCalculations;
    if (!payable || isNaN(payable)) { alert("Geçersiz fiyat bilgisi, ödeme başlatılamadı."); return; }
    if (!isValidEmail(formData.email)) newErrors.email = "Geçerli bir e-posta girin.";
    if (!isValidName(formData.name)) newErrors.name = "Ad sadece harf içermelidir.";
    if (!isValidName(formData.surname)) newErrors.surname = "Soyad sadece harf içermelidir.";
    if (!isValidPhone(formData.phone)) newErrors.phone = "Telefon numarası 05XXXXXXXXX formatında olmalı.";
    if (!isValidAddress(formData.address)) newErrors.address = "Lütfen geçerli bir adres girin.";
    if (!formData.tcNo || !formData.tcNo.trim()) {
      newErrors.tcNo = "TC Kimlik numarası faturalandırma için zorunludur.";
    } else if (!isValidTcNo(formData.tcNo.trim())) {
      newErrors.tcNo = "TC Kimlik numarası geçersiz.";
    }
    if (!formData.city.trim()) newErrors.city = "Şehir boş bırakılamaz.";
    if (!formData.district.trim()) newErrors.district = "İlçe boş bırakılamaz.";
    if (formData.postalCode && !isValidPostalCode(formData.postalCode)) newErrors.postalCode = "5 haneli posta kodu girin.";
    if (!formData.sinif) newErrors.sinif = "Sınıf seçimi zorunludur.";
    if (!formData.alan) newErrors.alan = "Alan seçimi zorunludur.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      // Guest kullanıcılar için email'i localStorage'a kaydet (cart sync için)
      if (!localStorage.getItem("token")) {
        localStorage.setItem("guestCartEmail", formData.email);
      }

      const response = await axios.post(
        "/api/orders/prepare",
        {
          cart,
          billingInfo: formData,
          packageName: items[0]?.name,
          couponCode: couponData ? couponCode : "",
          discountAmount: calculatedDiscountValue,
          totalPrice: Number(payable.toFixed(2)),
          totalPriceKurus: Math.round(payable * 100),
          tax: {
            vatRate: eligibleTutoringTotal > 0 ? 20 : 0,
            vatAmount: Number(finalCalculations.kdvAmount.toFixed(2)),
            baseTutoring: Number(eligibleTutoringTotal.toFixed(2)),
          },
          requestIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newToken = response.data?.token;
      if (newToken) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `https://www.paytr.com/odeme/guvenli/${newToken}`;
        } else {
          setPaytrToken(newToken);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        alert("Ödeme başlatılamadı.");
      }
    } catch (error) {
      console.error("❌ Ödeme hazırlanırken hata:", error);
      const detailedError = error?.response?.data;
      if (detailedError?.error) alert(`Sipariş hazırlık hatası: ${detailedError.error}`);
      else alert("Sipariş hazırlığı sırasında bilinmeyen bir hata oluştu.");
    }
  };

  useEffect(() => () => {
    localStorage.removeItem("activeRequestId");
    localStorage.removeItem("activeRequestIds");
  }, []);

  const inputBase = "py-[18px] px-3 h-14 border border-[#e2e8f0] rounded-2xl text-base bg-white w-full box-border focus:outline-none focus:border-[#f35900] focus:shadow-[0_0_0_3px_rgba(243,89,0,0.1)] placeholder:text-[#aaa] text-[#0f172a]";
  const errCls = "border border-red-500 bg-[#fff0f0]";

  const stars = Array.from({ length: 5 }, (_, i) => i < (settings.socialProofStars || 5));

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* ── Navbar ── */}
      <header className="bg-white border-b border-[#e2e8f0] shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between gap-4 max-[480px]:px-3">
          <div className="flex items-center gap-4 max-[480px]:gap-2">
            <img
              src={settings.logoUrl || "/images/hero-logo.webp"}
              alt="Sözderece"
              className="h-10 w-auto max-[480px]:h-8"
            />
            {settings.slogan && (
              <span className="text-sm font-semibold text-[#475569] italic border-l border-[#e2e8f0] pl-4 max-[640px]:hidden">
                {settings.slogan}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1.5 rounded-full whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL Güvenli Ödeme
          </div>
        </div>
      </header>

      <main className="flex-1">
        {paytrToken ? (
          /* ── PayTR iframe görünümü ── */
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="bg-gradient-to-r from-[#100481] to-[#1a05b3] px-6 py-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#a7f3d0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-white font-bold text-sm">Güvenli Ödeme Sayfası — PayTR</span>
              </div>
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                id="paytriframe"
                title="Ödeme Sayfası"
                allowFullScreen
                scrolling="yes"
                style={{ width: "100%", height: "700px", border: "none", display: "block" }}
              />
            </div>
          </div>
        ) : (
          /* ── Form + Sidebar görünümü ── */
          <div className="flex gap-8 p-8 max-w-[1200px] mx-auto max-[768px]:flex-col-reverse max-[768px]:p-4 max-[768px]:gap-5">

            {/* ── Sol: Form ── */}
            <form
              className="flex-[2] flex flex-col gap-4 bg-white p-7 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9]"
              onSubmit={handleSubmit}
            >
              <div className="flex justify-between items-center mb-2 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1.5">
                <h2 className="m-0 text-[#f35900] text-xl font-bold">İletişim Bilgileri</h2>
                {user
                  ? <span className="text-sm text-[#64748b]">{user.name}</span>
                  : <a href="/login" className="text-sm text-[#f35900] hover:underline">Oturum aç</a>
                }
              </div>

              <input type="email" name="email" value={formData.email} placeholder="E-posta" onChange={handleInputChange} className={`${inputBase}${errors.email ? ` ${errCls}` : ""}`} required />
              {errors.email && <span className="text-red-500 text-xs mt-0.5 block">{errors.email}</span>}

              <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
                <input type="checkbox" checked={formData.allowEmails} name="allowEmails" onChange={handleInputChange} className="w-4 h-4 accent-[#f35900]" />
                Bana e-posta gönderilmesine izin veriyorum.
              </label>

              <h3 className="text-[#f35900] font-semibold m-0 mt-2">Fatura Adresi</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex-[1_1_48%] min-w-[140px]">
                  <input name="name" value={formData.name} placeholder="Ad" onChange={handleInputChange} className={`${inputBase}${errors.name ? ` ${errCls}` : ""}`} required />
                  {errors.name && <span className="text-red-500 text-xs mt-0.5 block">{errors.name}</span>}
                </div>
                <div className="flex-[1_1_48%] min-w-[140px]">
                  <input name="surname" value={formData.surname} placeholder="Soyad" onChange={handleInputChange} className={`${inputBase}${errors.surname ? ` ${errCls}` : ""}`} required />
                  {errors.surname && <span className="text-red-500 text-xs mt-0.5 block">{errors.surname}</span>}
                </div>
                <div className="flex-[1_1_100%]">
                  <input name="address" value={formData.address} placeholder="Adres" onChange={handleInputChange} className={`${inputBase}${errors.address ? ` ${errCls}` : ""}`} required />
                  {errors.address && <span className="text-red-500 text-xs mt-0.5 block">{errors.address}</span>}
                </div>
                <div className="flex-[1_1_100%]">
                  <input name="district" value={formData.district} placeholder="İlçe" onChange={handleInputChange} className={`${inputBase}${errors.district ? ` ${errCls}` : ""}`} required />
                  {errors.district && <span className="text-red-500 text-xs mt-0.5 block">{errors.district}</span>}
                </div>
                <div className="flex-[1_1_100%]">
                  <input name="postalCode" value={formData.postalCode} placeholder="Posta Kodu" onChange={handleInputChange} className={`${inputBase}${errors.postalCode ? ` ${errCls}` : ""}`} />
                  {errors.postalCode && <span className="text-red-500 text-xs mt-0.5 block">{errors.postalCode}</span>}
                </div>
                <div className="flex-[1_1_100%]">
                  <input name="city" value={formData.city} placeholder="Şehir - İl" onChange={handleInputChange} className={`${inputBase}${errors.city ? ` ${errCls}` : ""}`} required />
                  {errors.city && <span className="text-red-500 text-xs mt-0.5 block">{errors.city}</span>}
                </div>
                <div className="flex-[1_1_100%]">
                  <input name="phone" value={formData.phone} placeholder="Telefon (05XXXXXXXXX)" onChange={handleInputChange} className={`${inputBase}${errors.phone ? ` ${errCls}` : ""}`} required />
                  {errors.phone && <span className="text-red-500 text-xs mt-0.5 block">{errors.phone}</span>}
                </div>
                <div className="flex-[1_1_100%]">
                  <input name="tcNo" value={formData.tcNo} placeholder="TC Kimlik No" onChange={handleInputChange} className={`${inputBase}${errors.tcNo ? ` ${errCls}` : ""}`} required />
                  {errors.tcNo && <span className="text-red-500 text-xs mt-0.5 block">{errors.tcNo}</span>}
                </div>
                <div className="flex-[1_1_48%] min-w-[140px]">
                  <select name="sinif" value={formData.sinif} onChange={handleInputChange} className={`${inputBase}${errors.sinif ? ` ${errCls}` : ""}`} required>
                    <option value="">Sınıf Seçin</option>
                    <option value="9">9. Sınıf</option>
                    <option value="10">10. Sınıf</option>
                    <option value="11">11. Sınıf</option>
                    <option value="12">12. Sınıf</option>
                    <option value="Mezun">Mezun</option>
                    <option value="Üniversite">Üniversite</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                  {errors.sinif && <span className="text-red-500 text-xs mt-0.5 block">{errors.sinif}</span>}
                </div>
                <div className="flex-[1_1_48%] min-w-[140px]">
                  <select name="alan" value={formData.alan} onChange={handleInputChange} className={`${inputBase}${errors.alan ? ` ${errCls}` : ""}`} required>
                    <option value="">Alan Seçin</option>
                    <option value="Sayısal">Sayısal</option>
                    <option value="Sözel">Sözel</option>
                    <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                    <option value="Dil">Dil</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                  {errors.alan && <span className="text-red-500 text-xs mt-0.5 block">{errors.alan}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 py-4 bg-[#f35900] hover:bg-[#d44e00] text-white text-lg font-bold rounded-2xl cursor-pointer w-full transition-colors shadow-[0_4px_16px_rgba(243,89,0,0.3)] max-[480px]:text-base max-[480px]:py-3.5"
              >
                {settings.ctaButtonText || "Güvenli Ödemeye Geç"}
              </button>

              {/* Ödeme logoları */}
              <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
                {["/images/kare-logo-visa.webp", "/images/kare-logo-mastercard.webp", "/images/kare-logo-troy.webp", "/images/kare-logo-paytr.webp"].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-7 object-contain opacity-70" />
                ))}
              </div>
            </form>

            {/* ── Sağ: Sidebar ── */}
            <div className="flex-1 flex flex-col gap-4 max-[768px]:w-full">

              {/* Sosyal kanıt */}
              <div className="bg-gradient-to-br from-[#100481] to-[#1a05b3] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {(settings.avatars || []).map((av, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ backgroundColor: av.color || "#100481" }}
                      >
                        {av.initials || "?"}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{settings.socialProofText || "+200 Mutlu Öğrenci"}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {stars.map((filled, i) => (
                        <span key={i} className={filled ? "text-[#f39c12] text-base" : "text-white/30 text-base"}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/70 text-xs">Sözderece öğrencileri YKS'de hedeflerine ulaşıyor.</p>
              </div>

              {/* Sepet özeti */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6 flex flex-col gap-4">
                <h4 className="text-[#0f172a] text-lg font-bold m-0">Sepet Özeti</h4>
                <ul className="list-none p-0 m-0 space-y-3">
                  {items.map((item, i) => (
                    <li key={i} className="pb-3 border-b border-[#f1f5f9] last:border-b-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <strong className="text-[#0f172a] text-sm block">{item.name}</strong>
                          {item.description && <p className="m-0 text-[#64748b] text-xs leading-relaxed mt-0.5">{item.description}</p>}
                        </div>
                        <span className="text-[#f35900] font-bold text-sm whitespace-nowrap">₺{lineTL(item).toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Dahil Olanlar */}
                {(settings.includes || []).length > 0 && (
                  <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                    <p className="text-xs font-black text-[#0f172a] uppercase tracking-wide mb-3">Dahil Olanlar</p>
                    <ul className="space-y-2">
                      {(settings.includes || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                          <svg className="w-4 h-4 text-[#f35900] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Kupon */}
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-[#0f172a]">Kupon Kodu</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="İNDİRİM10"
                      className="border border-[#e2e8f0] p-2.5 rounded-xl w-full text-sm focus:outline-none focus:border-[#f35900] text-[#0f172a]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      type="button"
                      className="bg-[#059669] hover:bg-[#047857] text-white px-4 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                    >
                      Uygula
                    </button>
                  </div>
                  {couponMessage && <p className="mt-1.5 text-xs text-[#374151]">{couponMessage}</p>}
                </div>

                {/* Fiyat özeti */}
                <div className="space-y-1.5 text-sm">
                  {tutoringTotal > 0 && (
                    <div className="flex justify-between text-[#475569]">
                      <span>Özel Ders</span>
                      <span>₺{tutoringTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {otherTotal > 0 && (
                    <div className="flex justify-between text-[#475569]">
                      <span>Diğer</span>
                      <span>₺{otherTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {calculatedDiscountValue > 0 && (
                    <div className="flex justify-between text-[#059669] font-semibold">
                      <span>Kupon ({couponData?.code})</span>
                      <span>-₺{calculatedDiscountValue.toFixed(2)}</span>
                    </div>
                  )}
                  {eligibleTutoringTotal > 0 && (
                    <div className="flex justify-between text-[#475569]">
                      <span>KDV (%20)</span>
                      <span>₺{finalCalculations.kdvAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="border-[#e2e8f0] my-2" />
                  <div className="flex justify-between text-[#0f172a] font-black text-base">
                    <span>Toplam</span>
                    <span className="text-[#f35900]">₺{finalCalculations.payable.toFixed(2)}</span>
                  </div>
                </div>

                {tutoringTotal > 0 && (
                  <p className="text-xs text-[#94a3b8]">
                    Özel ders paketleri için %20 KDV ödeme adımında eklenir. Diğer paketleriniz KDV dâhildir.
                  </p>
                )}

                {/* Garanti */}
                {settings.guaranteeText && (
                  <div className="flex items-start gap-2 p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0]">
                    <svg className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-xs text-[#065f46] leading-relaxed">{settings.guaranteeText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;
