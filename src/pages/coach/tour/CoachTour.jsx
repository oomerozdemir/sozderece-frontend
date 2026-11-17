import useCoachTour from "./useCoachTour";
import PanelTourWelcome from "../../../components/tour/PanelTourWelcome";
import PanelTourTooltip from "../../../components/tour/PanelTourTooltip";
import { WELCOME_STEP, FINISH_STEP, FINISH_STEP_NO_STUDENTS } from "./coachTourSteps";

// Orkestratör — CoachDashboard.jsx VE StudentWorkspace.jsx'in HER İKİSİNE
// de ayrı ayrı mount edilir (bkz. plan K5) — ayrı bir Context/Provider yok,
// sessionStorage + backend `coachTourCompletedVersion` ile koordine olur.
export default function CoachTour(props) {
  const tour = useCoachTour(props);

  if (tour.phase === "WELCOME") {
    return (
      <PanelTourWelcome
        title={WELCOME_STEP.title}
        text={WELCOME_STEP.text}
        cta={WELCOME_STEP.cta}
        secondaryCta="Şimdilik Geç"
        onPrimary={tour.startTour}
        onSecondary={tour.dismiss}
      />
    );
  }

  if (tour.phase === "RUNNING") {
    if (!tour.step || tour.step.page !== props.page || !tour.targetEl) return null;
    return (
      <PanelTourTooltip
        targetEl={tour.targetEl}
        rectVersion={tour.rectVersion}
        title={tour.step.title}
        text={tour.step.text}
        stepNumber={tour.stepNumber}
        totalSteps={tour.totalSteps}
        hasPrev={tour.hasPrev}
        isLast={tour.isLast}
        nextLabel={tour.step.nextLabel}
        onPrev={tour.prevStep}
        onNext={tour.nextStep}
        onClose={tour.dismiss}
      />
    );
  }

  if (tour.phase === "FINISHED") {
    const finishContent = tour.finishedWithStudents ? FINISH_STEP : FINISH_STEP_NO_STUDENTS;
    const onPrimary = tour.finishedWithStudents ? tour.finishTour : tour.finishPending;
    return (
      <PanelTourWelcome
        title={finishContent.title}
        text={finishContent.text}
        cta={finishContent.cta}
        onPrimary={onPrimary}
        onEscape={onPrimary}
      />
    );
  }

  return null;
}
