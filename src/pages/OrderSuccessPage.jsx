import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import "../cssFiles/orderSuccess.css";

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  // Kullanıcı adı alma
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Değerli öğrencimiz";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <h2>🎉 Siparişiniz başarıyla tamamlandı!</h2>
        <p>Teşekkürler <strong>{userName}</strong>, ödeme bilgileriniz başarıyla alındı.</p>
    
          <p>Destek ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>

        <p className="redirect-msg">10 saniye içinde ana sayfaya yönlendirileceksiniz...</p>

        <div className="button-group">
          <button onClick={() => navigate("/")} className="success-btn">🏠 Ana Sayfa</button>
          <button onClick={() => navigate("/orders")} className="success-btn secondary">📦 Siparişlerim</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
