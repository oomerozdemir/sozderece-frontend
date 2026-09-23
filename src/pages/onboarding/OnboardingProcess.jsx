import { useNavigate } from "react-router-dom";
import OnboardingShell from "../../components/OnboardingShell";

// GEÇİCİ placeholder — "Sürecimi Gör" deneyimi ayrıca tasarlanacak.
export default function OnboardingProcess() {
  const navigate = useNavigate();
  return (
    <OnboardingShell>
      <div className="bg-white rounded-[28px] p-8 md:p-10 text-center" style={{ border: "1px solid #ECEAF5" }}>
        <h1 className="font-fredoka font-bold text-page-navy text-2xl mb-3">Süreç anlatımı hazırlanıyor</h1>
        <p className="text-[#64748b] text-base leading-relaxed mb-6">Bu ekran yakında burada olacak.</p>
        <button
          type="button"
          onClick={() => navigate("/student/dashboard")}
          className="px-6 py-3 rounded-2xl font-fredoka font-bold text-[15px] border-0 cursor-pointer"
          style={{ background: "#1C1B8A", color: "#D8FF4F" }}
        >
          Panelime Git
        </button>
      </div>
    </OnboardingShell>
  );
}
