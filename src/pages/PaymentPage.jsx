import { useState, useMemo, useEffect } from "react";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "../cssFiles/payment.css";
import { isValidEmail, isValidName, isValidPhone, isValidPostalCode, isValidAddress, isValidTcNo } from "../utils/validation";

const user = JSON.parse(localStorage.getItem("user"));

const PaymentPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

 // çoklu id desteği: state -> query -> localStorage (KORUNDU)
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
 }, [location, searchParams])

  // UI/Server cart normalize (KORUNDU)
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
  });

  // --- GÜNCELLENEN STATE YAPISI ---
  const [couponCode, setCouponCode] = useState("");
  // discountRate yerine couponData kullanıyoruz, çünkü artık tip ve tutar da var
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

  // Helper: Satır fiyatını hesapla (KORUNDU ve YENİ MANTIKTA KULLANILDI)
  const lineTL = (it) => {
    if (typeof it?.unitPrice === "number") return (it.unitPrice / 100) * (it.quantity || 1);
    return (parseTL(it?.price) || 0) * (it.quantity || 1);
  };

  // Sepet Toplamları (KORUNDU)
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

  // --- YENİ: GELİŞMİŞ İNDİRİM HESAPLAMA ---
  const calculatedDiscountValue = useMemo(() => {
    if (!couponData) return 0;

    let discountVal = 0;
    const { type, discountRate, discountAmount, validPackages } = couponData;

    // Helper: Bu ürün için kupon geçerli mi?
    const isEligible = (item) => {
      // Eğer kuponda paket kısıtlaması varsa ve ürün bu listede yoksa -> geçersiz
      if (validPackages && validPackages.length > 0) {
        return validPackages.includes(item.slug);
      }
      return true; // Kısıtlama yoksa hepsi geçerli
    };

    if (type === "RATE") {
      // 1. Yüzdelik İndirim
      items.forEach(item => {
        if (isEligible(item)) {
          discountVal += lineTL(item) * (discountRate / 100);
        }
      });
    } else if (type === "FIXED") {
      // 2. Sabit Tutar İndirimi
      const eligibleItemsTotal = items.reduce((acc, item) => {
        return isEligible(item) ? acc + lineTL(item) : acc;
      }, 0);

      const fixedAmount = (discountAmount || 0) / 100;
      discountVal = Math.min(fixedAmount, eligibleItemsTotal);
    }

    return discountVal;
  }, [couponData, items]);

  const finalCalculations = useMemo(() => {
    const subTotalAfterDiscount = total - calculatedDiscountValue;

    const discountRatio = total > 0 ? (subTotalAfterDiscount / total) : 1;
    const kdvBase = eligibleTutoringTotal * discountRatio;
    
    const KDV_RATE = 0.20;
    const kdvAmount = kdvBase * KDV_RATE;
    
    const payable = subTotalAfterDiscount + kdvAmount;

    return {
      kdvAmount,
      payable: payable > 0 ? payable : 0
    };
  }, [total, calculatedDiscountValue, eligibleTutoringTotal]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- KUPON UYGULAMA  ---
  const handleApplyCoupon = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCouponMessage("🔒 Giriş yapmanız gerekiyor");
        return;
      }
      const res = await axios.post(
        "/api/coupon/validate",
        { code: couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      // 1. Paket Kısıtlaması Kontrolü 
      if (data.validPackages && data.validPackages.length > 0) {
        const hasValidItem = items.some(item => data.validPackages.includes(item.slug));
        
        if (!hasValidItem) {
          setCouponMessage("❌ Bu kupon sepetinizdeki ürünler için geçerli değildir.");
          setCouponData(null);
          return;
        }
      }

      // 2. Kupon Verisini Kaydet
      setCouponData({
        code: data.code,
        type: data.type || "RATE", // RATE veya FIXED
        discountRate: data.discountRate || 0,
        discountAmount: data.discountAmount || 0, // Kuruş
        validPackages: data.validPackages || []
      });

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

    if (!payable || isNaN(payable)) {
      alert("Geçersiz fiyat bilgisi, ödeme başlatılamadı.");
      return;
    }
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(
        "/api/orders/prepare",
        {
          cart,
          billingInfo: formData,
          packageName: items[0]?.name,
          
          // Güncellenen kupon verileri
          couponCode: couponData ? couponCode : "",
          discountAmount: calculatedDiscountValue, // İndirim tutarı
          
          totalPrice: Number(payable.toFixed(2)),
          totalPriceKurus: Math.round(payable * 100),
          tax: {
            vatRate: eligibleTutoringTotal > 0 ? 20 : 0,
            vatAmount: Number(finalCalculations.kdvAmount.toFixed(2)),
            baseTutoring: Number(eligibleTutoringTotal.toFixed(2)), 
          },
          requestIds: requestIds, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paytrToken = response.data?.token;
      if (paytrToken) navigate(`/payment/iframe/${paytrToken}`);
      else alert("Ödeme başlatılamadı.");
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

  return (
    <div className="payment-container">
      <form className="payment-form" onSubmit={handleSubmit}>
        <div className="payment-form-header">
          <h2>İletişim</h2>
          {user ? <span className="login-link">{user.name}</span> : <a href="/login">Oturum aç</a>}
        </div>

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="E-posta"
          onChange={handleInputChange}
          className={errors.email ? "error-input" : ""}
          required
        />
        {errors.email && <span className="error-text">{errors.email}</span>}

        <label>
          <input type="checkbox" checked={formData.allowEmails} name="allowEmails" onChange={handleInputChange} />
          Bana e-posta gönderilmesine izin veriyorum.
        </label>

        <h3>Fatura Adresi</h3>
        <div className="input-row">
          <div>
            <input name="name" value={formData.name} placeholder="Ad" onChange={handleInputChange} className={errors.name ? "error-input" : ""} required />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div>
            <input name="surname" value={formData.surname} placeholder="Soyad" onChange={handleInputChange} className={errors.surname ? "error-input" : ""} required />
            {errors.surname && <span className="error-text">{errors.surname}</span>}
          </div>
        </div>

        <div className="input-row-half">
          <div>
            <input name="address" value={formData.address} placeholder="Adres" onChange={handleInputChange} className={errors.address ? "error-input" : ""} required />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>
          <div>
            <input name="district" value={formData.district} placeholder="İlçe" onChange={handleInputChange} className={errors.district ? "error-input" : ""} required />
            {errors.district && <span className="error-text">{errors.district}</span>}
          </div>
          <div>
            <input name="postalCode" value={formData.postalCode} placeholder="Posta Kodu" onChange={handleInputChange} className={errors.postalCode ? "error-input" : ""} />
            {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
          </div>
          <div>
            <input name="city" value={formData.city} placeholder="Şehir - İl" onChange={handleInputChange} className={errors.city ? "error-input" : ""} required />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>
          <div>
            <input name="phone" value={formData.phone} placeholder="Telefon" onChange={handleInputChange} className={errors.phone ? "error-input" : ""} required />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
            <div>
            <input
              name="tcNo"
              value={formData.tcNo}
              placeholder="TC Kimlik No"
              onChange={handleInputChange}
              className={errors.tcNo ? "error-input" : ""}
              required
            />
            {errors.tcNo && <span className="error-text">{errors.tcNo}</span>}
          </div>
        </div>

        <button type="submit" className="pay-button">Güvenli Ödemeye Geç</button>
      </form>

      <div className="payment-summary">
        <h4>Sepet Özeti</h4>
        <ul>
          {items.map((item, i) => (
            <li key={i} className="summary-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
              <div>₺{lineTL(item).toFixed(2)}</div>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <label className="block mb-1 font-semibold">Kupon Kodu</label>
          <div className="flex">
            <input 
              type="text" 
              value={couponCode} 
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
              placeholder="İNDİRİM10" 
              className="border p-2 rounded-l w-full" 
            />
            <button onClick={handleApplyCoupon} className="bg-green-600 text-white px-4 rounded-r">Uygula</button>
          </div>
          {couponMessage && <p className="mt-1 text-sm text-gray-700">{couponMessage}</p>}
        </div>

        <div className="summary-total">
          <p>Ara Toplam (Özel Ders): <strong>₺{tutoringTotal.toFixed(2)}</strong></p>
          <p>Ara Toplam (Diğer): <strong>₺{otherTotal.toFixed(2)}</strong></p>
          
          {/* GÜNCELLENEN İNDİRİM GÖSTERİMİ */}
          {calculatedDiscountValue > 0 && (
            <p className="text-green-600">
              Kupon İndirimi ({couponData?.code}): 
              <strong> -₺{calculatedDiscountValue.toFixed(2)}</strong>
              {couponData?.validPackages?.length > 0 && <span className="text-xs ml-1">(Seçili Ürünler)</span>}
            </p>
          )}

          {eligibleTutoringTotal > 0 && (
            <p>KDV (%20 — Tek/3/6 Ders paketleri): <strong>₺{finalCalculations.kdvAmount.toFixed(2)}</strong></p>
          )}
          <hr />
          <p className="text-xl">Ödenecek Toplam: <strong>₺{finalCalculations.payable.toFixed(2)}</strong></p>
        </div>

        {tutoringTotal > 0 && (
          <p className="cart-note mt-2">
            Özel ders seçimleri için <strong>%20 KDV</strong> ödeme adımında eklenir. Diğer paketleriniz KDV dâhildir.
          </p>
        )}

        <div className="refund-note">
          📝 Siparişinizi teslim aldıktan sonra <strong>5 gün içinde</strong> koşulsuz cayma hakkınız bulunmaktadır.
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;