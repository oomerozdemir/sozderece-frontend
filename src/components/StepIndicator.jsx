const STEPS = [
  { label: "Sepet" },
  { label: "Ödeme" },
  { label: "Tamamlandı" },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center pt-6 pb-4 px-5 gap-0">
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center gap-0">
            <div
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[0.9rem] font-semibold flex-shrink-0 transition-all
                ${isCompleted ? "bg-brand-orange text-white border-2 border-brand-orange" : ""}
                ${isActive ? "bg-brand-orange text-white border-2 border-brand-orange shadow-[0_0_0_4px_rgba(228,94,4,0.15)]" : ""}
                ${!isCompleted && !isActive ? "bg-white text-gray-300 border-2 border-gray-200" : ""}
              `}
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
              className={`text-[0.78rem] ml-2 whitespace-nowrap ${
                isActive ? "text-brand-orange font-semibold" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`w-[60px] h-[2px] mx-2 flex-shrink-0 transition-colors ${
                  isCompleted ? "bg-brand-orange" : "bg-gray-200"
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
