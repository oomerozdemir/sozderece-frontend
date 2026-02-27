const STEPS = [
  { label: "Sepet" },
  { label: "Ödeme" },
  { label: "Tamamlandı" },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="step-indicator">
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="step-indicator__item">
            <div
              className={`step-indicator__circle ${
                isCompleted
                  ? "step-indicator__circle--completed"
                  : isActive
                  ? "step-indicator__circle--active"
                  : "step-indicator__circle--upcoming"
              }`}
            >
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7L5.5 10.5L12 3.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                stepNum
              )}
            </div>
            <span
              className={`step-indicator__label ${
                isActive ? "step-indicator__label--active" : ""
              }`}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`step-indicator__line ${
                  isCompleted ? "step-indicator__line--completed" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
