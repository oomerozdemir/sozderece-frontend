import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingShell, { OnboardingLoading } from "../../components/OnboardingShell";
import useOnboarding from "../../hooks/useOnboarding";

export default function OnboardingDone() {
  const navigate = useNavigate();
  const { loading, data } = useOnboarding();
  const ob = data?.onboarding;

  useEffect(() => {
    if (loading) return;
    if (!ob) navigate("/student/dashboard", { replace: true });
    else if (!ob.formCompleted) navigate("/onboarding/hos-geldin", { replace: true });
  }, [loading, ob, navigate]);

  if (loading || !ob?.formCompleted) return <OnboardingLoading />;

  return (
    <OnboardingShell>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-[28px] p-8 md:p-10 text-center"
        style={{ border: "1px solid #ECEAF5", boxShadow: "0 16px 44px rgba(28,27,138,0.10)" }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
          style={{ background: "#D8FF4F", color: "#0D0A2E", boxShadow: "0 8px 24px rgba(216,255,79,0.45)" }}
        >
          ✓
        </div>
        <h1 className="font-fredoka font-bold text-page-navy mb-4 leading-tight" style={{ fontSize: "clamp(28px, 6vw, 36px)" }}>
          Harika, ilk adımı tamamladın. ✓
        </h1>
        <p className="text-[#475569] text-base leading-relaxed mb-3">
          Artık seni ve hedeflerini biraz daha yakından tanıyoruz.
        </p>
        <p className="text-[#475569] text-base leading-relaxed mb-8">
          Şimdi Sözderece'de bundan sonra seni nelerin beklediğini görelim.
        </p>
        <button
          type="button"
          onClick={() => navigate("/onboarding/surec")}
          className="w-full py-4 rounded-2xl font-fredoka font-bold text-[17px] border-0 cursor-pointer transition-transform hover:scale-[1.02]"
          style={{ background: "#1C1B8A", color: "#D8FF4F", boxShadow: "0 8px 24px rgba(28,27,138,0.25)" }}
        >
          Sürecimi Gör →
        </button>
      </motion.div>
    </OnboardingShell>
  );
}
