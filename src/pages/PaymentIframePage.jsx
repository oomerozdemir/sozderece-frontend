import { useEffect } from "react";
import { useParams } from "react-router-dom";
import "../cssFiles/paymentIframe.css";

const PaymentIframePage = () => {
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      console.error("⚠️ Ödeme token'ı bulunamadı.");
    }
  }, [token]);

  return (
    <div className="iframe-container">
      {token ? (
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          id="paytriframe"
          frameBorder="0"
          scrolling="no"
          style={{ width: "100%", height: "100vh", border: "none" }}
        ></iframe>
      ) : (
        <div className="error-message">⚠️ Ödeme sayfası yüklenemedi.</div>
      )}
    </div>
  );
};

export default PaymentIframePage;
