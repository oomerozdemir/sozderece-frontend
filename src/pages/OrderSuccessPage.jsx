import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import StepIndicator from "../components/StepIndicator";

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

    // Misafir kimliği artık gerçek bir hesaba bağlandı (backend PayTR
    // callback'inde otomatik oluşturdu) — sonraki tamamen farklı bir misafire
    // bu e-postanın miras kalmaması için temizleniyor.
    localStorage.removeItem("guestCartEmail");

    // Gerçek ödenen tutar PaymentPage/CoachingWizardOdeme tarafından ödeme
    // tetiklenmeden hemen önce sessionStorage'a yazılıyor. Bulunamazsa sabit
    // bir tutar UYDURMAK yerine dönüşüm olayı hiç gönderilmiyor.
    const rawAmount = sessionStorage.getItem("lastOrderAmount");
    const amount = rawAmount ? parseFloat(rawAmount) : null;
    sessionStorage.removeItem("lastOrderAmount");

    if (amount && !isNaN(amount)) {
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          value: amount,
          currency: 'TRY',
          content_name: 'Kocluk Basvuru/Siparis Tamamlandi',
          content_type: 'product'
        });
        console.log("✅ Meta Pixel 'Purchase' (Satış) olayı gönderildi.");
      }

      if (window.gtag) {
        window.gtag("event", "conversion", {
          send_to: "AW-17399744724/16ynCJSfIaobENSR7OhA",
          value: amount,
          currency: "TRY",
          transaction_id: Date.now()
        });
      }
    } else {
      console.warn("⚠️ Gerçek sipariş tutarı bulunamadı, dönüşüm olayı gönderilmedi.");
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
    <>
      <StepIndicator currentStep={3} />
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100 p-5">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-[600px] w-full">
        <h2 className="text-green-500 text-3xl">🎉 Siparişiniz başarıyla tamamlandı!</h2>
        <p className="text-base mt-2.5">
          Teşekkürler <strong>{userName}</strong>, ödemeniz başarıyla alındı.
        </p>
        <p className="text-base mt-2.5">Destek ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
        <p className="mt-7 italic text-gray-500">
          10 saniye içinde ana sayfaya yönlendirileceksiniz...
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-green-500 text-white py-2.5 px-5 border-none rounded-md cursor-pointer text-sm transition-colors hover:bg-green-600"
          >
            🏠 Ana Sayfa
          </button>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="bg-blue-500 text-white py-2.5 px-5 border-none rounded-md cursor-pointer text-sm transition-colors hover:bg-blue-600"
          >
            📦 Siparişlerim
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrderSuccessPage;