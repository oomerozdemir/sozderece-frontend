import { useEffect, useRef } from "react";
import { DAY_LABELS_SHORT, dayDateForIndex, getDayStats, getDayStatus, toISO } from "./programHelpers";

const STATUS_STYLE = {
  EMPTY: { bg: "#fff", border: "#f1f5f9", bar: "#e2e8f0" },
  PLANNED: { bg: "#fff", border: "#e2e8f0", bar: "#cbd5e1" },
  IN_PROGRESS: { bg: "#fff", border: "#e2e8f0", bar: "var(--color-brand)" },
  COMPLETED: { bg: "#f0fdf4", border: "#bbf7d0", bar: "#059669" },
  MISSED: { bg: "#fffbeb", border: "#fde68a", bar: "#d97706" },
};

// 7 günlük kart şeridi — desktop'ta tek satır grid, mobilde yatay kaydırma.
// Seçili gün değişince (ya da ilk açılışta) kendi butonuna scrollIntoView ile
// kaydırıyoruz ki öğrenci haftanın ortasındaysa şerit solda takılı kalmasın.
export default function WeekDayStrip({ weekStart, weekDays, selectedDay, onSelectDay, todayDate }) {
  const dayRefs = useRef([]);

  useEffect(() => {
    const el = dayRefs.current[selectedDay];
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [selectedDay]);

  return (
    <div className="grid grid-cols-7 gap-2 md:grid-cols-7 max-md:flex max-md:overflow-x-auto max-md:gap-2 max-md:pb-1 max-md:-mx-1 max-md:px-1">
      {DAY_LABELS_SHORT.map((label, idx) => {
        const items = weekDays[idx] || [];
        const dayDate = dayDateForIndex(weekStart, idx);
        const stats = getDayStats(items);
        const status = getDayStatus(items, dayDate, todayDate);
        const style = STATUS_STYLE[status];
        const isToday = toISO(dayDate) === toISO(todayDate);
        const isSelected = idx === selectedDay;

        return (
          <button
            key={idx}
            ref={(el) => { dayRefs.current[idx] = el; }}
            type="button"
            onClick={() => onSelectDay(idx)}
            aria-current={isSelected ? "date" : undefined}
            aria-label={`${label} ${dayDate.getDate()}, ${stats.total === 0 ? "görev yok" : `${stats.completed}/${stats.total} tamamlandı`}`}
            className="relative flex-shrink-0 min-w-[64px] md:min-w-0 min-h-[72px] rounded-2xl border px-2 py-2.5 flex flex-col items-center gap-1 transition-colors"
            style={{
              background: isSelected ? "var(--color-brand)" : style.bg,
              borderColor: isSelected ? "var(--color-brand)" : style.border,
              borderWidth: isToday && !isSelected ? 2 : 1,
            }}
          >
            {isToday && !isSelected && (
              <span
                className="absolute -top-2 left-1/2 -translate-x-1/2 font-nunito font-bold text-[9px] px-1.5 py-[1px] rounded-full text-white"
                style={{ background: "var(--color-brand)" }}
              >
                Bugün
              </span>
            )}
            <span className={`font-fredoka font-bold text-[11px] ${isSelected ? "text-white" : "text-[#94a3b8]"}`}>{label}</span>
            <span className={`font-fredoka font-bold text-sm ${isSelected ? "text-white" : "text-page-navy"}`}>{dayDate.getDate()}</span>
            <span className={`font-nunito font-bold text-[11px] tabular-nums ${isSelected ? "text-white/90" : "text-[#64748b]"}`}>
              {stats.total === 0 ? "—" : `${stats.completed}/${stats.total}`}
            </span>
            {stats.total > 0 && (
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: isSelected ? "rgba(255,255,255,0.3)" : "#f1f5f9" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(stats.percentage > 0 ? 8 : 0, stats.percentage)}%`, background: isSelected ? "#fff" : style.bar }}
                />
              </div>
            )}
            {stats.partialOrStuck > 0 && (
              <span className={`font-nunito font-bold text-[9px] ${isSelected ? "text-white/80" : "text-[#c2740c]"}`}>
                {stats.partialOrStuck} yarıda/zorlandı
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
