import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../cssFiles/paymentIframe.css";

const PaymentIframePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // iOS cihazlarda iframe sorun çıkardığı için direkt yönlendirme yap
      window.location.href = `https://www.paytr.com/odeme/guvenli/${token}`;
    }
  }, [token]);

  useEffect(() => {
    const handleMessage = (event) => {
      // Güvenlik: Sadece PayTR'den gelen mesajı işleyelim
      if (event.origin !== "https://www.paytr.com") return;

      if (event.data === "PAYMENT_SUCCESS") {
        console.log("✅ Ödeme başarılı, yönlendiriliyor");
        navigate("/order-success");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  return (
    <div className="iframe-container">
      {token ? (
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          id="paytriframe"
          title="Ödeme Sayfası"
          allowFullScreen
          scrolling="yes"
          style={{
            width: "100%",
            height: "1500px",
            border: "none",
            display: "block",
            WebkitOverflowScrolling: "touch",
          }}
        />
      ) : (
        <div className="error-message">⚠️ Ödeme sayfası yüklenemedi.</div>
      )}
    </div>
  );
};

export default PaymentIframePage;
