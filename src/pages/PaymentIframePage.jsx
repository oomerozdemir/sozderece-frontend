import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../cssFiles/paymentIframe.css";



const PaymentIframePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.error("⚠️ Ödeme token'ı bulunamadı.");
    }
  }, [token]);

  // 🔁 Iframe'den gelen başarı mesajını dinle
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "PAYMENT_SUCCESS") {
        console.log("✅ Ana sayfa: Ödeme başarılı mesajı alındı. /order-success sayfasına yönlendiriliyor");
        navigate("/order-success");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  return (
    <>
    <div className="iframe-container">
      {token ? (
        <iframe
  src={`https://www.paytr.com/odeme/guvenli/${token}`}
  id="paytriframe"
  title="Ödeme Sayfası"
  allowFullScreen
  style={{
    width: "100%",
    height: "100vh",
    minHeight: "1500px",
    border: "none",
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    display: "block"
  }}
/>
      ) : (
        <div className="error-message">⚠️ Ödeme sayfası yüklenemedi.</div>
      )}
    </div>
   
    </>
  );
};

export default PaymentIframePage;
