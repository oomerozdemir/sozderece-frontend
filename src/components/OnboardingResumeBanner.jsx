import { Link } from "react-router-dom";
import useOnboarding from "../hooks/useOnboarding";

// Tanışma formunu bitirmemiş öğrencilere, panelde gezinirken sabit duran tek
// bir "devam et" yönlendirmesi. Onboarding yoksa / tamamsa hiçbir şey göstermez.
export default function OnboardingResumeBanner() {
  const { loading, data } = useOnboarding();
  const ob = data?.onboarding;
  if (loading || !ob || ob.processCompleted) return null;

  const to = ob.formCompleted ? "/onboarding/surec" : ob.stage === "payment_completed" ? "/onboarding/hos-geldin" : "/onboarding/tanisma";
  return (
    <Link
      to={to}
      className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-[2500] no-underline font-fredoka font-bold text-[15px] px-6 py-3.5 rounded-full whitespace-nowrap"
      style={{ background: "#D8FF4F", color: "#0D0A2E", boxShadow: "0 10px 30px rgba(13,10,46,0.35)" }}
    >
      Onboarding'ine Devam Et →
    </Link>
  );
}
