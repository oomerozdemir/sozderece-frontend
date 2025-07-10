import { useNavigate } from "react-router-dom";

const PaymentFailPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>❌ Ödeme Başarısız</h2>
      <p>Bir hata oluştu. Lütfen tekrar deneyin.</p>
      <button onClick={() => navigate("/")}>Ana Sayfaya Dön</button>
    </div>
  );
};

export default PaymentFailPage;
