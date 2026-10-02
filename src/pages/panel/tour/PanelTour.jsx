import usePanelTour from "./usePanelTour";
import PanelTourWelcome from "./PanelTourWelcome";
import PanelTourTooltip from "./PanelTourTooltip";
import { WELCOME_STEP, FINISH_STEP } from "./panelTourSteps";

// Orkestratör — StudentPanel.jsx içine render edilir, panelin zaten var olan
// tab/setTab/moreOpen/setMoreOpen state'ini paylaşır (ayrı bir context/route
// gerekmiyor, aynı component ağacı içinde).
export default function PanelTour({ student, tab, setTab, moreOpen, setMoreOpen, manualStartSignal }) {
  const tour = usePanelTour({ student, tab, setTab, moreOpen, setMoreOpen, manualStartSignal });

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
    if (!tour.targetEl) return null; // hedef hâlâ çözümleniyor/aranıyor
    return (
      <PanelTourTooltip
        targetEl={tour.targetEl}
        rectVersion={tour.rectVersion}
        title={tour.step.title}
        text={tour.step.text}
        stepNumber={tour.stepIndex + 1}
        totalSteps={tour.totalSteps}
        hasPrev={tour.stepIndex > 0}
        isLast={tour.stepIndex === tour.totalSteps - 1}
        onPrev={tour.prevStep}
        onNext={tour.nextStep}
        onClose={tour.dismiss}
      />
    );
  }

  if (tour.phase === "FINISHED") {
    return (
      <PanelTourWelcome
        title={FINISH_STEP.title}
        text={FINISH_STEP.text}
        cta={FINISH_STEP.cta}
        onPrimary={tour.finishTour}
        onEscape={tour.finishTour}
      />
    );
  }

  return null;
}
