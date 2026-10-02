import { useLayoutEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import Button from "../../../components/ui/Button";
import useFocusTrap from "./useFocusTrap";

const PADDING = 10; // spotlight hedefin etrafındaki boşluk (8-12px aralığında)
const RADIUS = 14; // 12-16px aralığında
const MARGIN = 16; // tooltip ile spotlight arası + viewport kenar güvenlik payı
const MOBILE_QUERY = "(max-width: 767px)";

function getRect(el) {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
}

// Spotlight overlay + adım 2-9 için pozisyonlanmış tooltip (masaüstü) /
// bottom-sheet (mobil, StudentPanel.jsx'in "Diğer" sheet'iyle aynı
// animate-[sdSheetUp_...] deseni). Karar #7: TÜM arka plan tıklanamaz —
// ayrı, görünmez tam-ekran bir katman her tıklamayı yakalar; spotlight
// "deliği" yalnızca görsel (box-shadow), fonksiyonel bir boşluk değil.
export default function PanelTourTooltip({
  targetEl,
  rectVersion,
  title,
  text,
  stepNumber,
  totalSteps,
  hasPrev,
  isLast,
  onPrev,
  onNext,
  onClose,
}) {
  const tooltipRef = useRef(null);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({ top: -9999, left: -9999 });
  const isMobile = typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

  const containerRef = useFocusTrap({ active: true, onEscape: onClose });

  useLayoutEffect(() => {
    if (!targetEl) return;
    setTargetRect(getRect(targetEl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetEl, rectVersion]);

  useLayoutEffect(() => {
    if (!targetRect || isMobile || !tooltipRef.current) return;
    const tw = tooltipRef.current.offsetWidth;
    const th = tooltipRef.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceBelow = vh - (targetRect.bottom + PADDING);
    const spaceAbove = targetRect.top - PADDING;

    let top;
    if (spaceBelow >= th + MARGIN) {
      top = targetRect.bottom + PADDING + MARGIN;
    } else if (spaceAbove >= th + MARGIN) {
      top = targetRect.top - PADDING - MARGIN - th;
    } else {
      // Ne üstte ne altta yeterli yer — görünür alana sabitle.
      top = Math.max(MARGIN, Math.min(vh - th - MARGIN, targetRect.top));
    }

    let left = targetRect.left;
    left = Math.max(MARGIN, Math.min(vw - tw - MARGIN, left));
    top = Math.max(MARGIN, Math.min(vh - th - MARGIN, top));

    setTooltipStyle({ top, left });
  }, [targetRect, isMobile]);

  if (!targetRect) return null;

  const spotlightStyle = {
    position: "fixed",
    top: targetRect.top - PADDING,
    left: targetRect.left - PADDING,
    width: targetRect.width + PADDING * 2,
    height: targetRect.height + PADDING * 2,
    borderRadius: RADIUS,
    boxShadow: "0 0 0 9999px rgba(13,10,30,0.6)",
    outline: "2px solid var(--color-brand)",
    outlineOffset: 2,
    pointerEvents: "none",
    zIndex: 1101,
    transition: "top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease",
  };

  const progress = `${stepNumber} / ${totalSteps}`;

  const Controls = (
    <div className="flex items-center justify-between gap-3 mt-4">
      <span className="font-nunito font-bold text-[11px] text-[#94a3b8]">{progress}</span>
      <div className="flex items-center gap-2">
        {hasPrev && (
          <Button variant="ghost" size="sm" onClick={onPrev}>
            Geri
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={onNext}>
          {isLast ? "Bitir" : "İleri"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Tam ekran, tıklama-yutan görünmez katman — spotlight'ın "deliği" dahil hiçbir yer tıklanamaz (karar #7) */}
      <div className="fixed inset-0 z-[1100]" style={{ pointerEvents: "auto" }} />
      {/* Görsel spotlight (karartma + turkuaz glow) — yalnızca görsel, tıklama almaz */}
      <div style={spotlightStyle} aria-hidden="true" />

      {isMobile ? (
        <div
          ref={(el) => {
            containerRef.current = el;
            tooltipRef.current = el;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-tour-tooltip-title"
          tabIndex={-1}
          className="fixed bottom-0 left-0 right-0 z-[1102] bg-white rounded-t-[24px] px-5 pt-4 pb-2 animate-[sdSheetUp_0.18s_ease-out] outline-none"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)", maxHeight: "70vh", overflowY: "auto" }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 id="panel-tour-tooltip-title" className="font-fredoka font-bold text-page-navy text-base">
              {title}
            </h3>
            <button onClick={onClose} aria-label="Turu Kapat" className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b] flex-shrink-0">
              <FaTimes size={11} />
            </button>
          </div>
          <p className="font-nunito text-sm text-[#64748b] leading-relaxed">{text}</p>
          {Controls}
        </div>
      ) : (
        <div
          ref={(el) => {
            containerRef.current = el;
            tooltipRef.current = el;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-tour-tooltip-title"
          tabIndex={-1}
          className="fixed z-[1102] bg-white rounded-2xl shadow-[0_20px_50px_rgba(13,10,46,0.3)] p-5 w-[340px] outline-none"
          style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 id="panel-tour-tooltip-title" className="font-fredoka font-bold text-page-navy text-base">
              {title}
            </h3>
            <button onClick={onClose} aria-label="Turu Kapat" className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b] flex-shrink-0">
              <FaTimes size={11} />
            </button>
          </div>
          <p className="font-nunito text-sm text-[#64748b] leading-relaxed">{text}</p>
          {Controls}
        </div>
      )}
    </>
  );
}
