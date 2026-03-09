import { useState, useMemo, useEffect } from "react";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { isValidEmail, isValidName, isValidPhone, isValidPostalCode, isValidAddress, isValidTcNo } from "../utils/validation";
import StepIndicator from "../components/StepIndicator";

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
    sinif: "",
    alan: "",
  });

  // --- GÜNCELLENEN STATE YAPISI ---
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

  // --- FİYAT HESAPLAMA DÜZELTİLDİ ---
  const lineTL = (it) => {
    // ÖNEMLİ: Miktarı her zaman 1 olarak kabul et
    const qty = 1;

    if (typeof it?.unitPrice === "number") return (it.unitPrice / 100) * qty;
    return (parseTL(it?.price) || 0) * qty;
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

  // --- İNDİRİM HESAPLAMA ---
  const calculatedDiscountValue = useMemo(() => {
    if (!couponData) return 0;

    let discountVal = 0;
    const { type, discountRate, discountAmount, validPackages } = couponData;

    const isEligible = (item) => {
      if (validPackages && validPackages.length > 0) {
        return validPackages.includes(item.slug);
      }
      return true;
    };

    if (type === "RATE") {
      items.forEach(item => {
        if (isEligible(item)) {
          discountVal += lineTL(item) * (discountRate / 100);
        }
      });
    } else if (type === "FIXED") {
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

      if (data.validPackages && data.validPackages.length > 0) {
        const hasValidItem = items.some(item => data.validPackages.includes(item.slug));

        if (!hasValidItem) {
          setCouponMessage("❌ Bu kupon sepetinizdeki ürünler için geçerli değildir.");
          setCouponData(null);
          return;
        }
      }

      setCouponData({
        code: data.code,
        type: data.type || "RATE",
        discountRate: data.discountRate || 0,
        discountAmount: data.discountAmount || 0,
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
    if (!formData.sinif) newErrors.sinif = "Sınıf seçimi zorunludur.";
    if (!formData.alan) newErrors.alan = "Alan seçimi zorunludur.";

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

          couponCode: couponData ? couponCode : "",
          discountAmount: calculatedDiscountValue,

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

  const inputBase = "py-[18px] px-3 h-14 border border-[#ccc] rounded-[20px] text-base bg-white w-full box-border focus:outline-none focus:border-[#f35900] focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] placeholder:text-[#aaa]";
  const errCls = "border border-red-500 bg-[#fff0f0]";

  return (
    <>
      <StepIndicator currentStep={2} />
    <div className="flex justify-between gap-10 p-10 max-w-[1200px] mx-auto max-[768px]:flex-col-reverse max-[768px]:p-5 max-[768px]:gap-6">
      <form className="flex-[2] flex flex-col gap-4 bg-[#f9f9f9] p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06)] relative" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-2">
          <h2 className="m-0 text-[#f35900]">İletişim</h2>
          {user ? <span className="text-[0.9rem] text-black cursor-pointer transition-colors hover:text-[#dd500f]">{user.name}</span> : <a href="/login">Oturum aç</a>}
        </div>

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="E-posta"
          onChange={handleInputChange}
          className={`${inputBase}${errors.email ? ` ${errCls}` : ""}`}
          required
        />
        {errors.email && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.email}</span>}

        <label>
          <input type="checkbox" checked={formData.allowEmails} name="allowEmails" onChange={handleInputChange} />
          Bana e-posta gönderilmesine izin veriyorum.
        </label>

        <h3 className="flex text-[#f35900] font-normal m-0">Fatura Adresi</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-[1_1_48%] min-w-[140px]">
            <input name="name" value={formData.name} placeholder="Ad" onChange={handleInputChange} className={`${inputBase}${errors.name ? ` ${errCls}` : ""}`} required />
            {errors.name && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.name}</span>}
          </div>
          <div className="flex-[1_1_48%] min-w-[140px]">
            <input name="surname" value={formData.surname} placeholder="Soyad" onChange={handleInputChange} className={`${inputBase}${errors.surname ? ` ${errCls}` : ""}`} required />
            {errors.surname && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.surname}</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-[1_1_100%] min-w-[140px]">
            <input name="address" value={formData.address} placeholder="Adres" onChange={handleInputChange} className={`${inputBase}${errors.address ? ` ${errCls}` : ""}`} required />
            {errors.address && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.address}</span>}
          </div>
          <div className="flex-[1_1_100%] min-w-[140px]">
            <input name="district" value={formData.district} placeholder="İlçe" onChange={handleInputChange} className={`${inputBase}${errors.district ? ` ${errCls}` : ""}`} required />
            {errors.district && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.district}</span>}
          </div>
          <div className="flex-[1_1_100%] min-w-[140px]">
            <input name="postalCode" value={formData.postalCode} placeholder="Posta Kodu" onChange={handleInputChange} className={`${inputBase}${errors.postalCode ? ` ${errCls}` : ""}`} />
            {errors.postalCode && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.postalCode}</span>}
          </div>
          <div className="flex-[1_1_100%] min-w-[140px]">
            <input name="city" value={formData.city} placeholder="Şehir - İl" onChange={handleInputChange} className={`${inputBase}${errors.city ? ` ${errCls}` : ""}`} required />
            {errors.city && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.city}</span>}
          </div>
          <div className="flex-[1_1_100%] min-w-[140px]">
            <input name="phone" value={formData.phone} placeholder="Telefon" onChange={handleInputChange} className={`${inputBase}${errors.phone ? ` ${errCls}` : ""}`} required />
            {errors.phone && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.phone}</span>}
          </div>
          <div className="flex-[1_1_100%] min-w-[140px]">
            <input
              name="tcNo"
              value={formData.tcNo}
              placeholder="TC Kimlik No"
              onChange={handleInputChange}
              className={`${inputBase}${errors.tcNo ? ` ${errCls}` : ""}`}
              required
            />
            {errors.tcNo && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.tcNo}</span>}
          </div>
          <div className="flex-[1_1_48%] min-w-[140px]">
            <select
              name="sinif"
              value={formData.sinif}
              onChange={handleInputChange}
              className={`${inputBase}${errors.sinif ? ` ${errCls}` : ""}`}
              required
            >
              <option value="">Sınıf Seçin</option>
              <option value="9">9. Sınıf</option>
              <option value="10">10. Sınıf</option>
              <option value="11">11. Sınıf</option>
              <option value="12">12. Sınıf</option>
              <option value="Mezun">Mezun</option>
              <option value="Üniversite">Üniversite</option>
              <option value="Diğer">Diğer</option>
            </select>
            {errors.sinif && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.sinif}</span>}
          </div>
          <div className="flex-[1_1_48%] min-w-[140px]">
            <select
              name="alan"
              value={formData.alan}
              onChange={handleInputChange}
              className={`${inputBase}${errors.alan ? ` ${errCls}` : ""}`}
              required
            >
              <option value="">Alan Seçin</option>
              <option value="Sayısal">Sayısal</option>
              <option value="Sözel">Sözel</option>
              <option value="Eşit Ağırlık">Eşit Ağırlık</option>
              <option value="Dil">Dil</option>
              <option value="Diğer">Diğer</option>
            </select>
            {errors.alan && <span className="text-red-500 text-[0.85rem] mt-0.5 block">{errors.alan}</span>}
          </div>
        </div>

        <button type="submit" className="mt-5 py-4 bg-[rgb(241,90,3)] text-white text-[1.3rem] border border-[#ccc] rounded-[20px] cursor-pointer font-bold w-full hover:bg-[#e44608] transition-colors max-[768px]:text-[1.1rem] max-[768px]:py-3.5">Güvenli Ödemeye Geç</button>
      </form>

      <div className="flex-1 bg-white p-8 rounded-lg border border-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-evenly gap-4 max-[768px]:w-full max-[768px]:p-5">
        <h4 className="text-[#d84207] text-[1.5rem] pb-[30px] m-0 max-[768px]:text-[1.3rem]">Sepet Özeti</h4>
        <ul className="list-none p-0 m-0">
          {items.map((item, i) => (
            <li key={i} className="py-2 text-[1.2rem] flex flex-col justify-between items-center">
              <div>
                <strong>{item.name}</strong>
                <p className="m-0 text-[#666] text-[0.85rem] leading-[1.4]">{item.description}</p>
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

        <div className="text-[1.5rem] text-black text-right mt-2.5 max-[768px]:text-left">
          <p>Ara Toplam (Özel Ders): <strong>₺{tutoringTotal.toFixed(2)}</strong></p>
          <p>Ara Toplam (Diğer): <strong>₺{otherTotal.toFixed(2)}</strong></p>

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
          <p className="text-[0.85rem] text-[#888] mt-2">
            Özel ders seçimleri için <strong>%20 KDV</strong> ödeme adımında eklenir. Diğer paketleriniz KDV dâhildir.
          </p>
        )}

        <div className="mt-3 p-2.5 bg-[#e6f4ea] rounded-md text-[#2e7d70] text-sm font-medium">
          📝 Siparişinizi teslim aldıktan sonra <strong>5 gün içinde</strong> koşulsuz cayma hakkınız bulunmaktadır.
        </div>
      </div>
    </div>
    </>
  );
};

export default PaymentPage;
