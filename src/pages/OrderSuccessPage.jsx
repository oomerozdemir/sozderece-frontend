import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import "../cssFiles/orderSuccess.css";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Değerli öğrencimiz";

  useEffect(() => {
    try {
      clearCart(); 
      console.log("🧹 Sepet temizlendi.");
    } catch (err) {
      console.error("❌ clearCart hatası:", err);
    }

    if (window.fbq) {
      
      window.fbq('track', 'Purchase', {
        value: 2500.00,       
        currency: 'TRY',      
        content_name: 'Kocluk Basvuru/Siparis Tamamlandi', 
        content_type: 'product'
      });
      
      console.log("✅ Meta Pixel 'Purchase' (Satış) olayı gönderildi.");
    }

    if (window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "AW-17399744724/16ynCJSfIaobENSR7OhA",
        value: 2500.0,       
        currency: "TRY",
        transaction_id: Date.now() 
      });
    }

    if (window.self !== window.top) {
      window.parent.postMessage("PAYMENT_SUCCESS", "*");
    } else {
      const timer = setTimeout(() => {
        console.log("➡️ Navigating to /");
        navigate("/");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []); 

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <h2>🎉 Siparişiniz başarıyla tamamlandı!</h2>
        <p>
          Teşekkürler <strong>{userName}</strong>, ödemeniz başarıyla alındı.
        </p>
        <p>Destek ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
        <p className="redirect-msg">
          10 saniye içinde ana sayfaya yönlendirileceksiniz...
        </p>

        <div className="order-success-button-group">
          <button type="button" onClick={() => navigate("/")} className="order-success-btn">
            🏠 Ana Sayfa
          </button>
          <button type="button" onClick={() => navigate("/orders")} className="order-success-btn secondary">
            📦 Siparişlerim
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;