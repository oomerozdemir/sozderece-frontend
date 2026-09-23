import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import StepIndicator from "../components/StepIndicator";
import axios from "../utils/axios";

const tokenUserId = () => {
  try {
    const t = localStorage.getItem("token");
    const p = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return p.exp * 1000 > Date.now() ? p.id : null;
  } catch {
    return null;
  }
};

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user"));
  // "checking": ödeme sunucuda doğrulanıp onboarding'e yönlendirilirken; "static": eski başarı ekranı.
  const [phase, setPhase] = useState(() =>
    window.self === window.top && sessionStorage.getItem("lastMerchantOid") ? "checking" : "static"
  );
  const userName = user?.name || "Değerli öğrencimiz";

  useEffect(() => {
    try {
      clearCart();
      console.log("🧹 Sepet temizlendi.");
    } catch (err) {
      console.error("clearCart hatası:", err);
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
        console.log("Meta Pixel 'Purchase' (Satış) olayı gönderildi.");
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
      console.warn("Gerçek sipariş tutarı bulunamadı, dönüşüm olayı gönderilmedi.");
    }

    if (window.self !== window.top) {
      window.parent.postMessage("PAYMENT_SUCCESS", "*");
    }
  }, []); 

  // Koçluk paketi alındıysa: sipariş sunucuda "paid" olunca onboarding'e geç.
  // PayTR callback'i yönlendirmeden sonra gelebildiği için kısa süre yoklanır.
  useEffect(() => {
    const oid = window.self === window.top ? sessionStorage.getItem("lastMerchantOid") : null;
    if (!oid) return;
    let cancelled = false;
    let timer;
    let tries = 0;
    const tick = async () => {
      tries += 1;
      try {
        const { data } = await axios.post("/api/onboarding/claim", { merchantOid: oid });
        if (cancelled) return;
        if (data.status === "paid") {
          if (data.onboarding) {
            if (data.token && tokenUserId() !== data.userId) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
            if (tokenUserId() === data.userId) {
              sessionStorage.removeItem("lastMerchantOid");
              navigate("/onboarding/hos-geldin", { replace: true });
              return;
            }
          }
          setPhase("static");
          return;
        }
        if (data.status === "failed" || data.status === "unknown") {
          setPhase("static");
          return;
        }
      } catch {
        // geçici ağ hatası — yoklamaya devam
      }
      if (tries >= 25) {
        setPhase("static");
        return;
      }
      timer = setTimeout(tick, 2000);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate]);

  // Eski davranış: onboarding'e girmeyen siparişlerde 10 sn sonra ana sayfa.
  useEffect(() => {
    if (phase !== "static" || window.self !== window.top) return;
    const timer = setTimeout(() => navigate("/"), 10000);
    return () => clearTimeout(timer);
  }, [phase, navigate]);

  if (phase === "checking") {
    return (
      <div className="flex justify-center items-center min-h-[80vh] p-5" style={{ background: "#F8F7FF" }}>
        <div className="bg-white p-8 rounded-[28px] text-center max-w-[460px] w-full" style={{ border: "1px solid #ECEAF5", boxShadow: "0 16px 44px rgba(28,27,138,0.10)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-5 animate-spin" style={{ border: "4px solid #E4E1F0", borderTopColor: "#1C1B8A" }} />
          <h2 className="font-fredoka font-bold text-2xl m-0 mb-2" style={{ color: "#1C1B8A" }}>Ödemen onaylanıyor…</h2>
          <p className="text-[#64748b] text-base m-0">Birkaç saniye içinde seni karşılayacağız.</p>
        </div>
      </div>
    );
  }

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