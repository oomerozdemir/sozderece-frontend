import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import SubscriptionAuthGate from "../components/SubscriptionAuthGate";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidPostalCode,
  isValidAddress,
  isValidTcNo,
} from "../utils/validation";
import Footer from "../components/Footer";

// Backend'deki SUBSCRIPTION_CONSENT_TEXT ile BİREBİR aynı olmalı
// (subscription.controller.js) — chargeback/itiraz kanıt izinin parçası.
const SUBSCRIPTION_CONSENT_TEXT =
  "Bu paketin her ay otomatik olarak yenileneceğini, kayıtlı kartımdan tekrar çekim yapılacağını ve dilediğim zaman \"Siparişlerim\" sayfasından iptal edebileceğimi anladım ve onaylıyorum.";

const inputBase =
  "py-[18px] px-3 h-14 border border-[#e2e8f0] rounded-2xl text-base bg-white w-full box-border focus:outline-none focus:border-[#f35900] focus:shadow-[0_0_0_3px_rgba(243,89,0,0.1)] placeholder:text-[#aaa] text-[#0f172a]";
const errCls = "border border-red-500 bg-[#fff0f0]";

function validateBilling(formData) {
  const e = {};
  if (!isValidEmail(formData.email)) e.email = "Geçerli bir e-posta girin.";
  if (!isValidName(formData.name)) e.name = "Ad sadece harf içermelidir.";
  if (!isValidName(formData.surname)) e.surname = "Soyad sadece harf içermelidir.";
  if (!isValidPhone(formData.phone)) e.phone = "Telefon numarası 05XXXXXXXXX formatında olmalı.";
  if (!isValidAddress(formData.address)) e.address = "Lütfen geçerli bir adres girin.";
  if (!formData.city.trim()) e.city = "Şehir boş bırakılamaz.";
  if (!formData.district.trim()) e.district = "İlçe boş bırakılamaz.";
  if (formData.postalCode && !isValidPostalCode(formData.postalCode)) e.postalCode = "5 haneli posta kodu girin.";
  if (!formData.tcNo || !isValidTcNo(formData.tcNo.trim())) e.tcNo = "TC Kimlik numarası geçerli değil.";
  if (!formData.sinif) e.sinif = "Sınıf seçimi zorunludur.";
  return e;
}

export default function SubscriptionStart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get("slug");
  const planIndex = searchParams.get("plan");

  const [authenticated, setAuthenticated] = useState(false);
  const [pkg, setPkg] = useState(null);
  const [pkgLoaded, setPkgLoaded] = useState(false);
  const [step, setStep] = useState("billing"); // "billing" | "card"
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    address: "",
    district: "",
    city: "",
    postalCode: "",
    phone: "",
    tcNo: "",
    sinif: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [payTrFields, setPayTrFields] = useState(null);
  const [payTrEndpoint, setPayTrEndpoint] = useState(null);
  const [cardData, setCardData] = useState({ cc_owner: "", card_number: "", expiry_month: "", expiry_year: "", cvv: "" });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (!slug) {
      navigate("/hemen-basla", { replace: true });
      return;
    }
    axios
      .get("/api/packages")
      .then((r) => {
        if (r.data.success) setPkg(r.data.packages.find((p) => p.slug === slug) || null);
      })
      .catch(() => {})
      .finally(() => setPkgLoaded(true));
  }, [slug, navigate]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.email) setFormData((prev) => ({ ...prev, email: user.email }));
    } catch {}
  }, [authenticated]);

  // PayTR alanları hazır olunca formu otomatik olarak (kullanıcı submit'e bastıktan sonra) gönder
  useEffect(() => {
    if (payTrFields && formRef.current) {
      formRef.current.submit();
    }
  }, [payTrFields]);

  if (!slug) return null;

  if (!authenticated) {
    return <SubscriptionAuthGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const plans = Array.isArray(pkg?.plans) ? pkg.plans : [];
  const hasPlanIndex = planIndex !== null && plans[parseInt(planIndex)];
  // Süre planı (sekmeli) yoksa paketin kendi billingCycle/unitPrice'ı
  // "sanal bir plan" gibi kullanılıyor.
  const plan = hasPlanIndex
    ? plans[parseInt(planIndex)]
    : (pkg ? { label: pkg.name, unitPrice: pkg.unitPrice, billingCycle: pkg.billingCycle, priceText: pkg.priceText } : null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const confirmBilling = (e) => {
    e.preventDefault();
    const newErrors = validateBilling(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep("card");
  };

  const submitCardForm = async (e) => {
    e.preventDefault();
    if (!cardData.cc_owner || !cardData.card_number || !cardData.expiry_month || !cardData.expiry_year || !cardData.cvv) {
      setErrors((prev) => ({ ...prev, card: "Tüm kart bilgilerini doldurun." }));
      return;
    }
    if (!consentAccepted) {
      setErrors((prev) => ({ ...prev, card: "Devam etmeden önce otomatik yenileme onayını işaretlemelisin." }));
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/subscriptions/start",
        { slug, planIndex: hasPlanIndex ? parseInt(planIndex) : null, billingInfo: formData, consentAccepted: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayTrEndpoint(res.data.paytrEndpoint);
      setPayTrFields(res.data.fields);
      // form submit useEffect'te otomatik tetiklenecek
    } catch (err) {
      setErrors((prev) => ({ ...prev, card: err?.response?.data?.error || "Abonelik başlatılamadı." }));
      setSubmitting(false);
    }
  };

  if (!pkgLoaded) return <p className="text-center py-16 text-[#64748b]">Yükleniyor…</p>;
  if (!pkg || !plan || plan.billingCycle !== "monthly") {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748b] mb-4">Bu bağlantı geçerli bir abonelik planına ait değil.</p>
        <button onClick={() => navigate("/hemen-basla")} className="text-[#f35900] font-bold underline">
          Baştan başla →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="bg-white border-b border-[#e2e8f0] shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <img src="/images/hero-logo.webp" alt="Sözderece" className="h-10 w-auto" />
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1.5 rounded-full whitespace-nowrap">
            256-bit SSL Güvenli Ödeme
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[560px] mx-auto px-5 py-10 w-full">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6 mb-5">
          <p className="text-xs font-black text-[#0f172a] uppercase tracking-wide mb-1">🔁 Aylık Abonelik</p>
          <h1 className="text-lg font-bold text-[#0f172a]">{hasPlanIndex ? `${pkg.name} — ${plan.label}` : pkg.name}</h1>
          <p className="text-2xl font-black text-[#f35900] mt-1">{plan.priceText || `${(plan.unitPrice / 100).toFixed(2)} TL`} <span className="text-sm font-semibold text-[#64748b]">/ ay</span></p>
          <p className="text-xs text-[#94a3b8] mt-2">
            Her ay otomatik olarak yenilenir. "Siparişlerim" sayfasından dilediğin zaman tek tıkla iptal edebilirsin —
            iptal ettiğinde ödediğin dönem sonuna kadar erişimin devam eder.
          </p>
        </div>

        {step === "billing" && (
          <form onSubmit={confirmBilling} className="bg-white p-7 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9] flex flex-col gap-3">
            <h2 className="m-0 text-[#f35900] text-lg font-bold mb-1">① Bilgilerin</h2>
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
            <button type="submit" className="mt-2 py-4 bg-[#f35900] hover:bg-[#d44e00] text-white text-lg font-bold rounded-2xl cursor-pointer w-full transition-colors">
              Devam Et →
            </button>
          </form>
        )}

        {step === "card" && (
          <div className="bg-white p-7 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#f1f5f9] flex flex-col gap-3">
            <h2 className="m-0 text-[#f35900] text-lg font-bold mb-1">② Kart Bilgilerin</h2>
            <p className="text-xs text-[#94a3b8] -mt-2 mb-1">
              Kart bilgilerin doğrudan PayTR'nin güvenli sistemine iletilir, sunucumuzda hiç saklanmaz.
            </p>

            {/* Bu form doğrudan PayTR'ye POST eder — action PayTR'nin kendi endpoint'i.
                Kart alanları BİZİM sunucumuza hiç gitmiyor. */}
            <form ref={formRef} action={payTrEndpoint || undefined} method="post" onSubmit={submitCardForm}>
              {payTrFields &&
                Object.entries(payTrFields).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}

              <input
                type="text"
                name="cc_owner"
                autoComplete="cc-name"
                placeholder="Kart Üzerindeki İsim"
                value={cardData.cc_owner}
                onChange={(e) => setCardData({ ...cardData, cc_owner: e.target.value })}
                className={inputBase}
              />
              <input
                type="text"
                name="card_number"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="Kart Numarası"
                value={cardData.card_number}
                onChange={(e) => setCardData({ ...cardData, card_number: e.target.value.replace(/\D/g, "") })}
                className={`${inputBase} mt-3`}
              />
              <div className="flex gap-3 mt-3">
                <select
                  name="expiry_month"
                  autoComplete="cc-exp-month"
                  value={cardData.expiry_month}
                  onChange={(e) => setCardData({ ...cardData, expiry_month: e.target.value })}
                  className={`${inputBase} flex-1`}
                >
                  <option value="">Ay</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  name="expiry_year"
                  autoComplete="cc-exp-year"
                  value={cardData.expiry_year}
                  onChange={(e) => setCardData({ ...cardData, expiry_year: e.target.value })}
                  className={`${inputBase} flex-1`}
                >
                  <option value="">Yıl</option>
                  {Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() % 100 + i)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="cvv"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  placeholder="CVV"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                  className={`${inputBase} flex-1`}
                  maxLength={4}
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-[#475569] mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => { setConsentAccepted(e.target.checked); setErrors((prev) => ({ ...prev, card: "" })); }}
                  className="w-4 h-4 mt-0.5 accent-[#f35900] flex-shrink-0"
                />
                <span>{SUBSCRIPTION_CONSENT_TEXT}</span>
              </label>

              {errors.card && <span className="text-red-500 text-xs block mt-2">{errors.card}</span>}

              <button
                type="submit"
                disabled={submitting || !consentAccepted}
                className="mt-4 py-4 bg-[#f35900] hover:bg-[#d44e00] text-white text-lg font-bold rounded-2xl cursor-pointer w-full transition-colors disabled:opacity-60"
              >
                {submitting ? "Yönlendiriliyor…" : `Aboneliği Başlat — ${plan.priceText || ""}`}
              </button>

              <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                {["/images/kare-logo-visa.webp", "/images/kare-logo-mastercard.webp", "/images/kare-logo-troy.webp", "/images/kare-logo-paytr.webp"].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-7 object-contain opacity-70" />
                ))}
              </div>
            </form>

            <button type="button" onClick={() => setStep("billing")} className="text-xs text-[#94a3b8] underline mt-1">
              ← Bilgilerimi düzenle
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
