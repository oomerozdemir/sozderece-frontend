import { useState, useMemo } from "react";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import "../cssFiles/payment.css";

const user = JSON.parse(localStorage.getItem("user"));

const PaymentPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

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
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.price?.toString().replace("₺", "").replace(/[^\d.]/g, ""));
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cart]);

  const discountedTotal = useMemo(() => {
    return discountRate > 0 ? total * (1 - discountRate / 100) : total;
  }, [total, discountRate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
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
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDiscountRate(res.data.discountRate);
    setCouponMessage("✅ Kupon başarıyla uygulandı");
  } catch (err) {
    setDiscountRate(0);
    setCouponMessage(err.response?.data?.error || "❌ Kupon doğrulanamadı");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!discountedTotal || isNaN(discountedTotal)) {
      alert("Geçersiz fiyat bilgisi, ödeme başlatılamadı.");
      return;
    }

    try {
     

      const response = await axios.post(
        "/api/orders/prepare",
        {
          cart,
          billingInfo: formData,
          packageName: cart[0]?.name,
          discountRate,
          couponCode,
          totalPrice: discountedTotal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paytrToken = response.data?.token;
      if (paytrToken) {
        navigate(`/payment/iframe/${paytrToken}`);
      } else {
        alert("Ödeme başlatılamadı.");
      }
    } catch (error) {
  console.error("❌ Ödeme hazırlanırken hata:", error);

  const detailedError = error?.response?.data;
  console.log("🧠 Detaylı hata:", detailedError);

  if (detailedError?.error) {
    alert(`Sipariş hazırlık hatası: ${detailedError.error}`);
  } else {
    alert("Sipariş hazırlığı sırasında bilinmeyen bir hata oluştu.");
  }
}
  };

  return (
    <div className="payment-container">
      <form className="payment-form" onSubmit={handleSubmit}>
        <div className="payment-form-header">
          <h2>İletişim</h2>
          {user ? <span className="login-link">{user.name}</span> : <a href="/login">Oturum aç</a>}
        </div>

        <input type="email" name="email" value={formData.email} placeholder="E-posta" required onChange={handleInputChange} />

        <label>
          <input type="checkbox" checked={formData.allowEmails} name="allowEmails" onChange={handleInputChange} />
          Bana e-posta gönderilmesine izin veriyorum.
        </label>

        <h3>Fatura Adresi</h3>
        <div className="input-row">
          <input name="name" value={formData.name} placeholder="Ad" onChange={handleInputChange} required />
          <input name="surname" value={formData.surname} placeholder="Soyad" onChange={handleInputChange} required />
        </div>
        <div className="input-row-half">
          <input name="address" value={formData.address} placeholder="Adres" onChange={handleInputChange} required />
          <input name="district" value={formData.district} placeholder="İlçe" onChange={handleInputChange} required />
          <input name="postalCode" value={formData.postalCode} placeholder="Posta Kodu" onChange={handleInputChange} />
          <input name="city" value={formData.city} placeholder="Şehir - İl" onChange={handleInputChange} required />
          <input name="phone" value={formData.phone} placeholder="Telefon" onChange={handleInputChange} required />
        </div>

        <button type="submit" className="pay-button">Şimdi öde</button>
      </form>

      <div className="payment-summary">
        <h4>Sepet Özeti</h4>
        <ul>
          {cart.map((item, i) => (
            <li key={i} className="summary-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
              <div>
                ₺{(parseFloat(item.price.replace("₺", "").replace(/[^\d.]/g, "")) * item.quantity).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <label className="block mb-1 font-semibold">Kupon Kodu</label>
          <div className="flex">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="İNDİRİM10"
              className="border p-2 rounded-l w-full"
            />
            <button onClick={handleApplyCoupon} className="bg-green-600 text-white px-4 rounded-r">
              Uygula
            </button>
          </div>
          {couponMessage && <p className="mt-1 text-sm text-gray-700">{couponMessage}</p>}
        </div>

        <div className="summary-total">
          {discountRate > 0 ? (
            <>
              <p className="line-through text-gray-500">Toplam: ₺{total.toFixed(2)}</p>
              <p className="text-green-600 font-semibold">
                🎉 İndirimli Toplam (%{discountRate}): ₺{discountedTotal.toFixed(2)}
              </p>
            </>
          ) : (
            <p>Toplam: ₺{total.toFixed(2)}</p>
          )}
        </div>

        <div className="refund-note">
          📝 Siparişinizi teslim aldıktan sonra <strong>5 gün içinde</strong> koşulsuz cayma hakkınız bulunmaktadır.
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
