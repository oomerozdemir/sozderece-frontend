import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

const DEFAULT_STEPS = [{ label: "Alan" }, { label: "Paket" }, { label: "Ödeme" }];

// StepIndicator.jsx ile aynı görsel dil — CartPage/PaymentPage/OrderSuccessPage
// zaten StepIndicator'a bağımlı olduğu için o dosyaya dokunmadan, adımları
// prop'lanabilir yapan izole bir kopya.
const WizardStepBar = ({ currentStep, steps = DEFAULT_STEPS }) => {
  return (
    <div className="flex items-center justify-center pt-6 pb-4 px-5 gap-0 flex-wrap">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center gap-0">
            <motion.div
              animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[0.85rem] font-fredoka font-bold flex-shrink-0 transition-colors duration-300
                ${isCompleted ? "text-page-dark" : ""}
                ${isActive ? "text-page-dark shadow-[0_0_0_4px_rgba(216,255,79,0.28)]" : ""}
                ${!isCompleted && !isActive ? "bg-white text-[#cbd5e1] border-2 border-[#e2e8f0]" : ""}
              `}
              style={isCompleted || isActive ? { background: "#D8FF4F" } : undefined}
            >
              {isCompleted ? <FaCheck size={12} /> : stepNum}
            </motion.div>
            <span
              className={`font-nunito text-[0.78rem] ml-2 whitespace-nowrap transition-colors duration-300 ${
                isActive ? "text-page-navy font-bold" : isCompleted ? "text-[#475569] font-bold" : "text-[#94a3b8]"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-[60px] h-[2px] mx-2 flex-shrink-0 relative overflow-hidden bg-[#e2e8f0]">
                <motion.div
                  className="absolute inset-0 origin-left"
                  style={{ background: "#D8FF4F" }}
                  initial={false}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WizardStepBar;
