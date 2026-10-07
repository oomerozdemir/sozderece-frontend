import { useEffect, useRef, useState } from "react";
import { STAGE_ORDER, STAGE_META } from "./topicHelpers";

// Konu durumunu değiştirme menüsü — R6: masaüstünde chip'e yakın küçük
// popover, mobilde StudentPanel'in "Diğer" sheet'iyle aynı desende alttan
// açılan tam genişlik action-sheet. Her iki modda da seçenekler büyük, net
// etiketli satırlar (küçük radio nokta değil) — yanlışlıkla seçim riski
// azaltılıyor. `setTopicMastery` zaten {stage} body'siyle doğrudan seçilen
// seviyeye ayarlanabiliyor, cycle davranışına ihtiyaç yok.
export default function TopicStatusMenu({ topic, anchorRect, onSelect, onClose }) {
  const menuRef = useRef(null);
  const [isMobile] = useState(() => {
    try {
      return window.matchMedia("(max-width: 640px)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  if (!topic) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={`${topic.name} durumunu güncelle`}>
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div
          ref={menuRef}
          className="relative w-full bg-white rounded-t-[24px] px-4 pt-4 pb-2 animate-[sdSheetUp_0.18s_ease-out]"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="font-fredoka font-bold text-page-navy text-sm truncate pr-2">{topic.name}</p>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b] shrink-0"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            {STAGE_ORDER.map((stage) => {
              const meta = STAGE_META[stage];
              const isSelected = stage === topic.stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => onSelect(stage)}
                  className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5 text-left min-h-[44px] border-2"
                  style={{
                    background: isSelected ? meta.bg : "#f8fafc",
                    borderColor: isSelected ? meta.border : "transparent",
                    color: isSelected ? meta.color : "#334155",
                  }}
                >
                  <span className="font-nunito font-bold text-sm">{meta.label}</span>
                  {isSelected && <span className="font-nunito font-bold text-xs">Seçili</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const top = Math.min(anchorRect.bottom + 8, window.innerHeight - 260);
  const left = Math.min(anchorRect.left, window.innerWidth - 240);

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-label={`${topic.name} durumunu güncelle`}
      className="fixed z-50 bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 w-[220px]"
      style={{ top, left }}
    >
      <p className="font-nunito font-bold text-[11px] text-[#94a3b8] px-2 py-1 truncate">{topic.name}</p>
      <div className="flex flex-col gap-1">
        {STAGE_ORDER.map((stage) => {
          const meta = STAGE_META[stage];
          const isSelected = stage === topic.stage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => onSelect(stage)}
              className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left min-h-[44px]"
              style={{ background: isSelected ? meta.bg : "transparent", color: isSelected ? meta.color : "#334155" }}
            >
              <span className="font-nunito font-bold text-sm">{meta.label}</span>
              {isSelected && <span className="font-nunito font-bold text-[10px]">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
