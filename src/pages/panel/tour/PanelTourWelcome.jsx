import Button from "../../../components/ui/Button";
import useFocusTrap from "./useFocusTrap";

// ADIM 1 (karşılama) ve Bitiş ekranı için ortak, tam ekran/merkezi modal.
// Hiçbir element highlight edilmez — RefundModal.jsx'in fixed-inset-0
// kalıbına görsel olarak benzer ama bu projede hiçbir modalde olmayan
// role/aria-modal/focus-trap/Escape burada eklendi (bkz. plan FAZ 0 §7).
export default function PanelTourWelcome({ title, text, cta, secondaryCta, onPrimary, onSecondary, onEscape }) {
  const containerRef = useFocusTrap({ active: true, onEscape: onSecondary || onEscape });

  return (
    // "bg-page-dark/60" KULLANILMIYOR — page-dark CSS var() üzerinden
    // tanımlı (tailwind.config.js), Tailwind'in opacity-modifier'ı bunun
    // için hiçbir kural üretmiyor (canlı testte doğrulandı: computed
    // background rgba(0,0,0,0) çıkıyor — proje genelinde NewExamChoiceModal
    // gibi aynı deseni kullanan başka yerlerde de aynı sorun var, bu dosyada
    // StudentPanel.jsx'in "Diğer" sheet'inin zaten kullandığı ÇALIŞAN
    // "bg-black/40" deseniyle tutarlı hale getiriliyor.
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1200] p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-tour-welcome-title"
        tabIndex={-1}
        className="bg-white rounded-[24px] w-[440px] max-w-full shadow-[0_20px_50px_rgba(13,10,46,0.25)] p-7 text-center outline-none"
      >
        <h2 id="panel-tour-welcome-title" className="font-fredoka font-bold text-page-navy text-xl mb-3">
          {title}
        </h2>
        <p className="font-nunito text-sm text-[#64748b] leading-relaxed mb-6">{text}</p>
        <div className="flex flex-col gap-2.5">
          <Button variant="primary" fullWidth onClick={onPrimary}>
            {cta}
          </Button>
          {secondaryCta && (
            <button
              onClick={onSecondary}
              className="font-nunito font-bold text-xs text-[#94a3b8] hover:text-[#64748b] py-1"
            >
              {secondaryCta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
