import { useState } from "react";
import { FaPlay, FaStop, FaClock } from "react-icons/fa";
import { fmtClock } from "./TodayTaskCard";

// Genel Bakış'taki "Bugünkü Rotam" kartının yerini alan görev-bağımsız odak
// sayacı — öğrenci kaç saat çalışacağını girer, sayaç 0'dan yukarı sayar ve
// hedefe göre ilerleme gösterir (açık uçlu: hedefe ulaşınca da durmaz,
// öğrenci istediği an "Bitir"e basar — panelin geri kalanındaki mevcut
// açık-uçlu sayaç deseniyle aynı).
export default function FocusTimerCard({ activeSession, elapsedSeconds, onStart, onStop }) {
  const [hours, setHours] = useState(1);

  const isThisTimerActive = !!activeSession && activeSession.studyPlanItemId == null;
  const isOtherTimerActive = !!activeSession && activeSession.studyPlanItemId != null;

  if (isThisTimerActive) {
    const planned = activeSession.plannedSeconds || 0;
    const percent = planned > 0 ? Math.min(100, Math.round((elapsedSeconds / planned) * 100)) : 0;
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-4">
        <p className="font-fredoka font-bold text-page-navy text-4xl tabular-nums">{fmtClock(elapsedSeconds)}</p>
        <p className="font-nunito font-bold text-xs text-[#94a3b8] mt-1">hedef: {fmtClock(planned)}</p>
        <div className="w-full max-w-xs h-2.5 rounded-full bg-[#f1f5f9] overflow-hidden mt-4">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.max(4, percent)}%`, background: "linear-gradient(90deg, var(--color-dark), var(--color-brand))" }}
          />
        </div>
        <button
          onClick={onStop}
          className="mt-5 inline-flex items-center gap-2 font-fredoka font-bold text-sm px-6 py-2.5 rounded-full transition-transform hover:scale-[1.02]"
          style={{ background: "var(--color-dark)", color: "var(--color-brand-on-dark)" }}
        >
          <FaStop size={11} /> Bitir
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-4 gap-4">
      <FaClock size={28} style={{ color: "var(--color-warning)" }} />
      <div className="text-center">
        <p className="font-fredoka font-bold text-page-navy text-base">Kaç saat çalışacaksın?</p>
        {isOtherTimerActive && (
          <p className="font-nunito text-xs text-[#94a3b8] mt-1">Şu an bir görev için sayaç çalışıyor — önce onu bitir.</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0.5}
          max={8}
          step={0.5}
          value={hours}
          disabled={isOtherTimerActive}
          onChange={(e) => setHours(Math.min(8, Math.max(0.5, Number(e.target.value) || 0.5)))}
          className="w-20 text-center font-fredoka font-bold text-page-navy text-lg border border-[#e5e7eb] rounded-xl px-2 py-2 disabled:opacity-50"
        />
        <span className="font-nunito font-bold text-sm text-[#64748b]">saat</span>
      </div>
      <button
        onClick={() => onStart(hours)}
        disabled={isOtherTimerActive}
        className="inline-flex items-center gap-2 font-fredoka font-bold text-sm px-6 py-2.5 rounded-full transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        style={{ background: "var(--color-dark)", color: "var(--color-brand-on-dark)" }}
      >
        <FaPlay size={11} /> Sayacı Başlat
      </button>
    </div>
  );
}
