import { FaCheckCircle } from "react-icons/fa";

export default function QuotaReachedState() {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-4 text-brand">
        <FaCheckCircle size={24} />
      </div>
      <p className="font-fredoka font-bold text-page-navy text-base mb-1.5">
        Bugünkü 10 soruluk AI Soru Asistanı hakkını kullandın.
      </p>
      <p className="font-nunito text-sm text-[#64748b]">Yeni soru hakkın yarın yenilenecek.</p>
    </div>
  );
}
