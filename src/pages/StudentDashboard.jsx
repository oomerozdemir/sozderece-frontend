import StudentPanel from "./panel/StudentPanel";
import OnboardingResumeBanner from "../components/OnboardingResumeBanner";

// /student/dashboard rotasının gösterdiği tek nokta — yeni öğrenci paneli
// (StudentPanel) artık HER öğrenciye açık; önceden User.panelBetaAccess
// bayrağıyla sınırlıydı (eski hali: panelBetaAccess=false olanlar
// LegacyStudentDashboard görüyordu), admin talebiyle bu kısıtlama kaldırıldı.
export default function StudentDashboard() {
  return (
    <>
      <StudentPanel />
      <OnboardingResumeBanner />
    </>
  );
}
