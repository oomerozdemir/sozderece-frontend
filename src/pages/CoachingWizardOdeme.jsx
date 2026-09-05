import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt, FaCheck, FaCheckCircle, FaSyncAlt, FaCreditCard,
  FaUserGraduate, FaMapMarkerAlt, FaLock, FaTag,
} from "react-icons/fa";
import axios from "../utils/axios";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidPostalCode,
  isValidAddress,
  isValidTcNo,
} from "../utils/validation";
import { computeCartTotals, computeCouponDiscount, computeFinalCalculations } from "../utils/checkoutPricing";
import { isExamPriceActive, isPromoActive, getExamUnitPrice } from "../utils/promoUtils";
import WizardStepBar from "../components/WizardStepBar";
import WizardUrgencyBanner from "../components/WizardUrgencyBanner";
import { getStoredVisitorId, getStoredSessionId } from "../components/VisitorTracker";
import Footer from "../components/Footer";

const WIZARD_STEPS = [{ label: "Alan" }, { label: "Paket" }, { label: "Ödeme" }];

// Ekranda kuruş göstermiyoruz (₺27000.00 yerine ₺27.000) — ödemeye giden tutarlar bundan etkilenmez.
const trPrice = (n) => Math.round(Number(n) || 0).toLocaleString("tr-TR");

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
  guaranteeText: "Siparişinizi teslim aldıktan sonra 14 gün içinde koşulsuz cayma hakkınız bulunmaktadır.",
  ctaButtonText: "Güvenli Ödemeye Geç",
};

// Ekranda gösterilen fiyatla (Paket adımındaki PackagePrice) tahsil edilen
// fiyatın birebir aynı olmasını garanti eder — sınav/promosyon indirimi
// gösterilip tam fiyat tahsil edilmesin diye.
function getEffectiveUnitPrice(pkg, activePlan) {
  if (activePlan) return Number(activePlan.unitPrice);
  if (isExamPriceActive(pkg)) {
    const kurus = getExamUnitPrice(pkg);
    if (kurus !== null && !Number.isNaN(kurus)) return kurus;
  } else if (isPromoActive(pkg) && pkg.promoUnitPrice) {
    return Number(pkg.promoUnitPrice);
  }
  return Number(pkg.unitPrice);
}

function validateStudentSection(formData) {
  const e = {};
  if (!isValidEmail(formData.email)) e.email = "Geçerli bir e-posta girin.";
  if (!isValidName(formData.name)) e.name = "Ad sadece harf içermelidir.";
  if (!isValidName(formData.surname)) e.surname = "Soyad sadece harf içermelidir.";
  if (!isValidPhone(formData.phone)) e.phone = "Telefon numarası 05XXXXXXXXX formatında olmalı.";
  if (!formData.sinif) e.sinif = "Sınıf seçimi zorunludur.";
  return e;
}

function validateAddressSection(formData) {
  const e = {};
  if (!isValidAddress(formData.address)) e.address = "Lütfen geçerli bir adres girin.";
  if (!formData.city.trim()) e.city = "Şehir boş bırakılamaz.";
  if (!formData.district.trim()) e.district = "İlçe boş bırakılamaz.";
  if (formData.postalCode && !isValidPostalCode(formData.postalCode)) e.postalCode = "5 haneli posta kodu girin.";
  if (!formData.tcNo || !formData.tcNo.trim()) e.tcNo = "TC Kimlik numarası faturalandırma için zorunludur.";
  else if (!isValidTcNo(formData.tcNo.trim())) e.tcNo = "TC Kimlik numarası geçersiz.";
  return e;
}

const inputBase =
  "py-[18px] px-3 h-14 border border-[#e2e8f0] rounded-2xl text-base bg-white w-full box-border focus:outline-none focus:border-page-navy focus:shadow-[0_0_0_3px_rgba(28,27,138,0.1)] placeholder:text-[#aaa] text-[#0f172a] transition-colors font-nunito";
const errCls = "border border-red-500 bg-[#fff0f0]";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

export default function CoachingWizardOdeme() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const alan = searchParams.get("alan") || "";
  const planParam = searchParams.get("plan");
  const planIndex = planParam !== null ? parseInt(planParam, 10) : null;

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [pkg, setPkg] = useState(null);
  const [pkgLoaded, setPkgLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openSection, setOpenSection] = useState("student");
  const [studentDone, setStudentDone] = useState(false);
  const [addressDone, setAddressDone] = useState(false);

  const [formData, setFormData] = useState({
    email: storedUser?.email || "",
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
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");

  // Tek seferlik mi yoksa aylık abonelik mi olacağını müşteri, kart
  // bilgilerini girmeden ÖNCE burada kendisi seçiyor. Sadece admin panelden
  // "aylık abonelik" olarak işaretlenmiş planlarda gösteriliyor — fiyatı
  // aylık tekrar çekime uygun olmayan (ör. sınava kadar toplu) planlarda bu
  // seçenek hiç çıkmıyor, yanlışlıkla yanlış tutarda otomatik çekim riskini
  // engelliyor.
  const [billingChoice, setBillingChoice] = useState("once");

  // Deep-link koruması: Alan/Paket adımları atlanarak buraya gelinemez.
  useEffect(() => {
    if (!slug || !alan) {
      navigate("/hemen-basla", { replace: true });
    }
  }, [slug, alan, navigate]);

  useEffect(() => {
    axios
      .get("/api/settings/payment-page")
      .then((r) => setSettings({ ...DEFAULT_SETTINGS, ...r.data }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    axios.get("/api/packages")
      .then((r) => {
        if (r.data.success) {
          setPkg(r.data.packages.find((p) => p.slug === slug) || null);
        }
      })
      .catch(() => {})
      .finally(() => setPkgLoaded(true));
  }, [slug]);

  const plans = Array.isArray(pkg?.plans) ? pkg.plans : [];
  const activePlan = planIndex !== null && plans[planIndex] ? plans[planIndex] : null;
  // Süre planı (sekmeli) seçiliyse o planın billingCycle'ı; paketin hiç süre
  // planı yoksa (tek fiyatlı paket) paketin kendi billingCycle'ı kullanılır.
  const monthlyEligible = activePlan ? activePlan.billingCycle === "monthly" : pkg?.billingCycle === "monthly";

  const chooseMonthly = () => {
    const subParams = new URLSearchParams();
    if (alan) subParams.set("alan", alan);
    subParams.set("slug", slug);
    if (planIndex !== null) subParams.set("plan", String(planIndex));
    navigate(`/abone-ol?${subParams.toString()}`);
  };

  const cart = useMemo(() => {
    if (!pkg) return [];
    const unitPrice = getEffectiveUnitPrice(pkg, activePlan);
    return [
      {
        slug: pkg.slug,
        name: activePlan?.label ? `${pkg.name} (${activePlan.label})` : pkg.name,
        price: (unitPrice / 100).toFixed(2),
        quantity: 1,
      },
    ];
  }, [pkg, activePlan]);

  const { total, eligibleTutoringTotal } = useMemo(() => computeCartTotals(cart), [cart]);
  const calculatedDiscountValue = useMemo(() => computeCouponDiscount(cart, couponData), [cart, couponData]);
  const finalCalculations = useMemo(
    () => computeFinalCalculations(total, calculatedDiscountValue, eligibleTutoringTotal),
    [total, calculatedDiscountValue, eligibleTutoringTotal]
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleApplyCoupon = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCouponMessage("Kupon kodu kullanmak için giriş yapmanız gerekiyor.");
        return;
      }
      const res = await axios.post("/api/coupon/validate", { code: couponCode });
      const data = res.data;
      if (data.validPackages && data.validPackages.length > 0) {
        const hasValidItem = cart.some((item) => data.validPackages.includes(item.slug));
        if (!hasValidItem) {
          setCouponMessage("Bu kupon seçtiğin paket için geçerli değildir.");
          setCouponData(null);
          return;
        }
      }
      setCouponData({
        code: data.code,
        type: data.type || "RATE",
        discountRate: data.discountRate || 0,
        discountAmount: data.discountAmount || 0,
        validPackages: data.validPackages || [],
      });
      setCouponMessage("Kupon başarıyla uygulandı");
    } catch (err) {
      setCouponData(null);
      setCouponMessage(err.response?.data?.error || "Kupon doğrulanamadı");
    }
  };

  const goEditAlan = () => {
    const params = new URLSearchParams();
    if (slug) params.set("slug", slug);
    if (planParam !== null) params.set("plan", planParam);
    navigate(`/hemen-basla?${params.toString()}`);
  };

  const confirmStudentSection = () => {
    const e = validateStudentSection(formData);
    if (Object.keys(e).length > 0) {
      setErrors((prev) => ({ ...prev, ...e }));
      return;
    }
    setStudentDone(true);
    setOpenSection("address");
  };

  const confirmAddressSection = () => {
    const e = validateAddressSection(formData);
    if (Object.keys(e).length > 0) {
      setErrors((prev) => ({ ...prev, ...e }));
      return;
    }
    setAddressDone(true);
    setOpenSection("payment");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentErrors = validateStudentSection(formData);
    const addressErrors = validateAddressSection(formData);
    const newErrors = { ...studentErrors, ...addressErrors };
    const { payable } = finalCalculations;

    if (!payable || isNaN(payable)) {
      alert("Geçersiz fiyat bilgisi, ödeme başlatılamadı.");
      return;
    }
    if (!isAgreed) newErrors.agreement = "Devam etmeden önce sözleşmeyi onaylamalısın.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (Object.keys(studentErrors).length > 0) setOpenSection("student");
      else if (Object.keys(addressErrors).length > 0) setOpenSection("address");
      return;
    }

    setSubmitting(true);
    try {
      if (!localStorage.getItem("token")) {
        localStorage.setItem("guestCartEmail", formData.email);
      }

      const response = await axios.post("/api/orders/prepare", {
        cart,
        billingInfo: { ...formData, alan },
        packageName: pkg.name,
        packageSlug: pkg.slug,
        couponCode: couponData ? couponCode : "",
        discountAmount: calculatedDiscountValue,
        totalPrice: Number(payable.toFixed(2)),
        totalPriceKurus: Math.round(payable * 100),
        tax: {
          vatRate: eligibleTutoringTotal > 0 ? 20 : 0,
          vatAmount: Number(finalCalculations.kdvAmount.toFixed(2)),
          baseTutoring: Number(eligibleTutoringTotal.toFixed(2)),
        },
        visitorId: getStoredVisitorId(),
        sessionId: getStoredSessionId(),
      });

      if (response.data?.token) {
        // Gerçek ödenen tutarı /order-success'e taşımak için sessionStorage'a
        // yazılıyor (PayTR iframe akışında da hayatta kalır).
        sessionStorage.setItem("lastOrderAmount", String(payable));
        navigate(`/payment/iframe/${response.data.token}`);
      } else {
        alert("Ödeme başlatılamadı.");
        setSubmitting(false);
      }
    } catch (error) {
      const detailedError = error?.response?.data;
      if (detailedError?.error) {
        alert(`Sipariş hazırlık hatası: ${detailedError.error}`);
      } else {
        alert("Sipariş hazırlığı sırasında bilinmeyen bir hata oluştu.");
      }
      setSubmitting(false);
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < (settings.socialProofStars || 5));

  if (!slug || !alan) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-[#f8fafc]"
    >
      <header className="bg-white border-b border-[#e2e8f0] shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between gap-4 max-[480px]:px-3">
          <div className="flex items-center gap-4 max-[480px]:gap-2">
            <img src={settings.logoUrl || "/images/hero-logo.webp"} alt="Sözderece" className="h-10 w-auto max-[480px]:h-8" />
            {settings.slogan && (
              <span className="font-nunito text-sm font-semibold text-[#475569] italic border-l border-[#e2e8f0] pl-4 max-[640px]:hidden">
                {settings.slogan}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 font-nunito text-xs font-bold text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1.5 rounded-full whitespace-nowrap">
            <FaShieldAlt size={13} />
            256-bit SSL Güvenli Ödeme
          </div>
        </div>
      </header>

      <WizardUrgencyBanner storageKey="hemen-basla" minutes={15} />
      <WizardStepBar currentStep={3} steps={WIZARD_STEPS} />

      <main className="flex-1">
        {!pkgLoaded ? (
          <p className="text-center text-[#64748b] font-nunito py-16">Yükleniyor…</p>
        ) : !pkg ? (
          <div className="text-center py-16">
            <p className="text-[#64748b] mb-4">Paket bulunamadı.</p>
            <button type="button" onClick={() => navigate("/hemen-basla")} className="text-page-navy font-bold underline">
              Baştan başla →
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex gap-8 p-8 max-w-[1200px] mx-auto max-[768px]:flex-col-reverse max-[768px]:p-4 max-[768px]:gap-5"
          >
            {/* ── Sol: 3 akordiyon bölüm ── */}
            <form className="flex-[2] flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-[#f1f5f9]">
                <span className="font-nunito text-sm text-[#64748b]">Alan seçimin:</span>
                <span className="font-fredoka font-bold text-sm text-page-navy">{alan}</span>
                <button type="button" onClick={goEditAlan} className="font-nunito text-xs text-page-navy underline">
                  değiştir
                </button>
              </div>

              {/* Ödeme şekli: tek seferlik mi aylık abonelik mi — kart bilgisi
                  girilmeden ÖNCE burada seçiliyor. */}
              {monthlyEligible && (
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
                  <p className="font-nunito text-sm font-bold text-[#0f172a] mb-3">Ödeme Şekli</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBillingChoice("once")}
                      className={`flex-1 py-3 px-3 rounded-xl border text-sm font-bold font-nunito transition-colors flex items-center justify-center gap-1.5 ${
                        billingChoice === "once" ? "border-page-navy text-white" : "bg-white border-[#e2e8f0] text-[#64748b]"
                      }`}
                      style={billingChoice === "once" ? { background: "#1C1B8A" } : undefined}
                    >
                      <FaCreditCard size={13} /> Tek Seferlik
                    </button>
                    <button
                      type="button"
                      onClick={chooseMonthly}
                      className="flex-1 py-3 px-3 rounded-xl border text-sm font-bold font-nunito transition-colors flex items-center justify-center gap-1.5 bg-white border-[#e2e8f0] text-[#64748b] hover:border-page-navy"
                    >
                      <FaSyncAlt size={13} /> Aylık Abonelik
                    </button>
                  </div>
                  <p className="font-nunito text-xs text-[#94a3b8] mt-2">
                    Aylık abonelik seçersen ayrı bir adımda giriş yapman ve otomatik yenilemeyi onaylaman istenecek.
                    Dilediğin zaman "Siparişlerim" sayfasından tek tıkla iptal edebilirsin.
                  </p>
                </div>
              )}

              {/* ① Öğrenci Bilgileri */}
              <motion.div {...fadeUp} className="bg-white p-7 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setOpenSection("student")}
                  className="w-full flex items-center gap-3 bg-transparent border-none cursor-pointer text-left"
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-fredoka font-bold flex-shrink-0 transition-colors"
                    style={studentDone ? { background: "#D8FF4F", color: "#0D0A2E" } : { background: "#f1f5f9", color: "#64748b" }}
                  >
                    {studentDone ? <FaCheck size={12} /> : <FaUserGraduate size={13} />}
                  </span>
                  <h2 className="m-0 text-[#0f172a] text-lg font-fredoka font-bold flex-1">Öğrenci Bilgileri</h2>
                </button>

                <AnimatePresence initial={false}>
                {openSection === "student" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                  <div className="flex flex-col gap-3 mt-5">
                    <input type="email" name="email" value={formData.email} placeholder="E-posta" onChange={handleInputChange} className={`${inputBase}${errors.email ? ` ${errCls}` : ""}`} />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-[1_1_48%] min-w-[140px]">
                        <input name="name" value={formData.name} placeholder="Ad" onChange={handleInputChange} className={`${inputBase}${errors.name ? ` ${errCls}` : ""}`} />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                      </div>
                      <div className="flex-[1_1_48%] min-w-[140px]">
                        <input name="surname" value={formData.surname} placeholder="Soyad" onChange={handleInputChange} className={`${inputBase}${errors.surname ? ` ${errCls}` : ""}`} />
                        {errors.surname && <span className="text-red-500 text-xs">{errors.surname}</span>}
                      </div>
                    </div>
                    <input name="phone" value={formData.phone} placeholder="Telefon (05XXXXXXXXX)" onChange={handleInputChange} className={`${inputBase}${errors.phone ? ` ${errCls}` : ""}`} />
                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
                    <select name="sinif" value={formData.sinif} onChange={handleInputChange} className={`${inputBase}${errors.sinif ? ` ${errCls}` : ""}`}>
                      <option value="">Sınıf Seçin</option>
                      <option value="9">9. Sınıf</option>
                      <option value="10">10. Sınıf</option>
                      <option value="11">11. Sınıf</option>
                      <option value="12">12. Sınıf</option>
                      <option value="Mezun">Mezun</option>
                      <option value="Üniversite">Üniversite</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                    {errors.sinif && <span className="text-red-500 text-xs">{errors.sinif}</span>}
                    <label className="flex items-center gap-2 font-nunito text-sm text-[#475569] cursor-pointer">
                      <input type="checkbox" checked={formData.allowEmails} name="allowEmails" onChange={handleInputChange} className="w-4 h-4 accent-page-navy" />
                      Bana e-posta gönderilmesine izin veriyorum.
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={confirmStudentSection}
                      className="mt-2 py-3.5 text-white font-fredoka font-bold rounded-2xl cursor-pointer transition-colors"
                      style={{ background: "#1C1B8A" }}
                    >
                      Devam Et →
                    </motion.button>
                  </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>

              {/* ② Adres Bilgileri */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="bg-white p-7 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => studentDone && setOpenSection("address")}
                  className={`w-full flex items-center gap-3 bg-transparent border-none text-left ${studentDone ? "cursor-pointer" : "cursor-default opacity-50"}`}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-fredoka font-bold flex-shrink-0 transition-colors"
                    style={addressDone ? { background: "#D8FF4F", color: "#0D0A2E" } : { background: "#f1f5f9", color: "#64748b" }}
                  >
                    {addressDone ? <FaCheck size={12} /> : <FaMapMarkerAlt size={13} />}
                  </span>
                  <h2 className="m-0 text-[#0f172a] text-lg font-fredoka font-bold flex-1">Adres Bilgileri</h2>
                </button>

                <AnimatePresence initial={false}>
                {openSection === "address" && studentDone && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                  <div className="flex flex-col gap-3 mt-5">
                    <input name="address" value={formData.address} placeholder="Adres" onChange={handleInputChange} className={`${inputBase}${errors.address ? ` ${errCls}` : ""}`} />
                    {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
                    <input name="district" value={formData.district} placeholder="İlçe" onChange={handleInputChange} className={`${inputBase}${errors.district ? ` ${errCls}` : ""}`} />
                    {errors.district && <span className="text-red-500 text-xs">{errors.district}</span>}
                    <input name="city" value={formData.city} placeholder="Şehir - İl" onChange={handleInputChange} className={`${inputBase}${errors.city ? ` ${errCls}` : ""}`} />
                    {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
                    <input name="postalCode" value={formData.postalCode} placeholder="Posta Kodu (opsiyonel)" onChange={handleInputChange} className={`${inputBase}${errors.postalCode ? ` ${errCls}` : ""}`} />
                    {errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode}</span>}
                    <input name="tcNo" value={formData.tcNo} placeholder="TC Kimlik No" onChange={handleInputChange} className={`${inputBase}${errors.tcNo ? ` ${errCls}` : ""}`} />
                    {errors.tcNo && <span className="text-red-500 text-xs">{errors.tcNo}</span>}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={confirmAddressSection}
                      className="mt-2 py-3.5 text-white font-fredoka font-bold rounded-2xl cursor-pointer transition-colors"
                      style={{ background: "#1C1B8A" }}
                    >
                      Devam Et →
                    </motion.button>
                  </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>

              {/* ③ Ödeme Bilgileri */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="bg-white p-7 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => addressDone && setOpenSection("payment")}
                  className={`w-full flex items-center gap-3 bg-transparent border-none text-left ${addressDone ? "cursor-pointer" : "cursor-default opacity-50"}`}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-fredoka font-bold flex-shrink-0 bg-[#f1f5f9] text-[#64748b]">
                    <FaCreditCard size={13} />
                  </span>
                  <h2 className="m-0 text-[#0f172a] text-lg font-fredoka font-bold flex-1">Ödeme Bilgileri</h2>
                </button>

                <AnimatePresence initial={false}>
                {openSection === "payment" && addressDone && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                  <div className="flex flex-col gap-4 mt-5">
                    <p className="font-nunito text-sm text-[#475569] flex items-start gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                      <FaLock size={14} className="mt-0.5 flex-shrink-0 text-[#059669]" />
                      Kart bilgilerini bir sonraki adımda, PayTR'nin 256-bit SSL korumalı güvenli ödeme sayfasında gireceksin. Kart numaran hiçbir zaman bizim sunucumuza uğramaz.
                    </p>

                    <label className="flex items-start gap-2 font-nunito text-sm text-[#475569] cursor-pointer">
                      <input type="checkbox" checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} className="w-4 h-4 mt-0.5 accent-page-navy" />
                      <span>
                        Okudum ve onaylıyorum:{" "}
                        <a href="/mesafeli-hizmet-sozlesmesi" target="_blank" rel="noreferrer" className="text-page-navy underline">
                          Mesafeli Satış Sözleşmesi
                        </a>
                      </span>
                    </label>
                    {errors.agreement && <span className="text-red-500 text-xs">{errors.agreement}</span>}

                    <motion.button
                      whileHover={{ scale: submitting ? 1 : 1.01 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="mt-1 py-4 text-white text-lg font-fredoka font-bold rounded-2xl cursor-pointer w-full disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: "#FF6B35", boxShadow: "0 8px 24px rgba(255,107,53,0.3)" }}
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Hazırlanıyor…
                        </>
                      ) : (
                        <>
                          <FaLock size={14} /> {settings.ctaButtonText || "Güvenli Ödemeye Geç"}
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {["/images/kare-logo-visa.webp", "/images/kare-logo-mastercard.webp", "/images/kare-logo-troy.webp", "/images/kare-logo-paytr.webp"].map((src, i) => (
                        <img key={i} src={src} alt="" className="h-7 object-contain opacity-70" />
                      ))}
                    </div>
                  </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>
            </form>

            {/* ── Sağ: Sipariş özeti ── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="flex-1 flex flex-col gap-4 max-[768px]:w-full md:sticky md:top-24 self-start"
            >
              <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <FaUserGraduate size={18} />
                  </div>
                  <div>
                    <p className="font-fredoka font-bold text-sm leading-tight">{settings.socialProofText || "+200 Mutlu Öğrenci"}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {stars.map((filled, i) => (
                        <span key={i} className={filled ? "text-lime text-base" : "text-white/30 text-base"}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-nunito text-white/70 text-xs">Sözderece öğrencileri YKS'de hedeflerine ulaşıyor.</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6 flex flex-col gap-4">
                <h4 className="text-[#0f172a] text-lg font-fredoka font-bold m-0">Sipariş Özeti</h4>
                <ul className="list-none p-0 m-0 space-y-3">
                  {cart.map((item, i) => (
                    <li key={i} className="pb-3 border-b border-[#f1f5f9] last:border-b-0">
                      <div className="flex justify-between items-start gap-2">
                        <strong className="font-nunito text-[#0f172a] text-sm">{item.name}</strong>
                        <span className="font-fredoka font-bold text-accent-orange text-sm whitespace-nowrap">₺{trPrice(item.price)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {(settings.includes || []).length > 0 && (
                  <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                    <p className="font-nunito text-xs font-black text-[#0f172a] uppercase tracking-wide mb-3">Dahil Olanlar</p>
                    <ul className="space-y-2">
                      {(settings.includes || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-nunito text-sm text-[#374151]">
                          <FaCheckCircle className="text-accent-orange flex-shrink-0 mt-0.5" size={13} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block mb-1.5 font-nunito text-sm font-semibold text-[#0f172a] flex items-center gap-1.5">
                    <FaTag size={12} className="text-page-navy" /> Kupon Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="İNDİRİM10"
                      className="border border-[#e2e8f0] p-2.5 rounded-xl w-full text-sm focus:outline-none focus:border-page-navy text-[#0f172a] font-nunito transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleApplyCoupon}
                      type="button"
                      className="bg-[#059669] hover:bg-[#047857] text-white px-4 rounded-xl text-sm font-fredoka font-bold transition-colors whitespace-nowrap"
                    >
                      Uygula
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {couponMessage && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 font-nunito text-xs text-[#374151]"
                      >
                        {couponMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5 text-sm font-nunito">
                  <AnimatePresence>
                    {calculatedDiscountValue > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between text-[#059669] font-semibold overflow-hidden"
                      >
                        <span>Kupon ({couponData?.code})</span>
                        <span>-₺{trPrice(calculatedDiscountValue)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {eligibleTutoringTotal > 0 && (
                    <div className="flex justify-between text-[#475569]">
                      <span>KDV (%20)</span>
                      <span>₺{trPrice(finalCalculations.kdvAmount)}</span>
                    </div>
                  )}
                  <hr className="border-[#e2e8f0] my-2" />
                  <div className="flex justify-between text-[#0f172a] font-fredoka font-black text-base">
                    <span>Toplam</span>
                    <motion.span
                      key={finalCalculations.payable}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-accent-orange"
                    >
                      ₺{trPrice(finalCalculations.payable)}
                    </motion.span>
                  </div>
                </div>

                {settings.guaranteeText && (
                  <div className="flex items-start gap-2 p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0]">
                    <FaCheckCircle className="text-[#059669] flex-shrink-0 mt-0.5" size={13} />
                    <p className="font-nunito text-xs text-[#065f46] leading-relaxed">{settings.guaranteeText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </motion.div>
  );
}
