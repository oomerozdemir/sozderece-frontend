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
          scrolling="yes"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="error-message">⚠️ Ödeme sayfası yüklenemedi.</div>
      )}
    </div>
    <footer className="custom-footer">
              <div className="footer-icons">
                <FaInstagram />
                <FaTiktok />
                <FaYoutube />
              </div>
              <div className="footer-links">
                <a href="/hakkimizda">Hakkımızda</a>
                <a href="/ucretsiz-on-gorusme">İletişim</a>
                <a href="/gizlilik-politikasi-kvkk">Gizlilik ve KVKK</a>
                <a href="/mesafeli-hizmet-sozlesmesi">Mesafeli Hizmet Sözleşmesi</a>
                <a href="/iade-ve-cayma-politikasi">İade Politikası</a>
              </div>
              <div className="footer-copy">© 2025 SÖZDERECE KOÇLUK Her Hakkı Saklıdır</div>
            </footer>
    
    </>
  );
};

export default PaymentIframePage;
