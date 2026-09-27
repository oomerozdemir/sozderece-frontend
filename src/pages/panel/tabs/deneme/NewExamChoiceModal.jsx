import { FaBolt, FaPen } from "react-icons/fa";

// "+ Yeni Deneme" → A) Deneme Başlat / B) Geçmiş Deneme Ekle seçimi.
// RefundModal.jsx'in basit fixed-inset-0 kalıbıyla aynı.
export default function NewExamChoiceModal({ onClose, onChooseLive, onChooseManual }) {
  return (
    <div className="fixed inset-0 bg-page-dark/50 flex items-center justify-center z-[999] p-4" onClick={onClose}>
      <div
        className="bg-white p-6 rounded-[24px] w-[440px] max-w-full shadow-[0_20px_50px_rgba(13,10,46,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-fredoka font-bold text-page-navy text-lg mb-4">Yeni Deneme</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={onChooseLive}
            className="flex items-center gap-3 text-left p-4 rounded-2xl border border-[#e2e8f0] hover:border-brand hover:bg-brand-light/40 transition-colors"
          >
            <span className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0 text-brand">
              <FaBolt size={16} />
            </span>
            <span>
              <span className="block font-nunito font-bold text-sm text-page-navy">Deneme Başlat</span>
              <span className="block font-nunito text-xs text-[#64748b]">Şimdi çözeceğim.</span>
            </span>
          </button>
          <button
            onClick={onChooseManual}
            className="flex items-center gap-3 text-left p-4 rounded-2xl border border-[#e2e8f0] hover:border-brand hover:bg-brand-light/40 transition-colors"
          >
            <span className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 text-[#475569]">
              <FaPen size={14} />
            </span>
            <span>
              <span className="block font-nunito font-bold text-sm text-page-navy">Geçmiş Deneme Ekle</span>
              <span className="block font-nunito text-xs text-[#64748b]">Daha önce çözdüm.</span>
            </span>
          </button>
        </div>
        <button onClick={onClose} className="mt-4 w-full text-center font-nunito text-xs text-[#94a3b8] hover:text-[#64748b]">
          Vazgeç
        </button>
      </div>
    </div>
  );
}
