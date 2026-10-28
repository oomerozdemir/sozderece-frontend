import { FaCheck } from "react-icons/fa";
import { DAY_LABELS_SHORT, dayDateForIndex, toISO, getDayStats, getDayStatus } from "./programHelpers";

// Haftalık "çizelge" görünümü — 7 günü AYNI ANDA yan yana gösterir (video
// geri bildirimindeki Canva örneğine benzer: gün sütunları + tikler).
// WeekDayStrip+SelectedDayPanel'in YERİNE değil YANINA: yalnızca masaüstünde
// (lg+) görünür, tek-bakışta-hafta özeti için — detaylı gün etkileşimi
// (Pomodoro/sayaç dahil) hâlâ aşağıdaki strip+panel üzerinden yapılır. Tik'e
// tıklamak burada da mevcut cycleWeekStatus (onToggleStatus) ile aynı anlık
// güncellemeyi tetikler.
export default function WeeklyGridView({ weekStart, weekDays, todayDate, onToggleStatus }) {
  const todayISO = toISO(todayDate);

  return (
    <div className="hidden lg:grid grid-cols-7 gap-2">
      {weekDays.map((items, dayIdx) => {
        const dayDate = dayDateForIndex(weekStart, dayIdx);
        const isToday = toISO(dayDate) === todayISO;
        const status = getDayStatus(items, dayDate, todayDate);
        const stats = getDayStats(items);
        const barColor = status === "COMPLETED" ? "#059669" : status === "MISSED" ? "#dc2626" : "var(--color-brand)";

        return (
          <div
            key={dayIdx}
            className="rounded-2xl border p-3 flex flex-col gap-2 min-h-[140px]"
            style={{ borderColor: isToday ? "var(--color-brand)" : "#f1f5f9", background: isToday ? "var(--color-brand-light)" : "#fff" }}
          >
            <div>
              <p className="font-fredoka font-bold text-page-navy text-xs uppercase" style={{ letterSpacing: 0.5 }}>
                {DAY_LABELS_SHORT[dayIdx]}
              </p>
              <p className="font-nunito text-[10px] text-[#94a3b8]">
                {dayDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </p>
            </div>

            {stats.total > 0 && (
              <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden flex-shrink-0">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(stats.percentage > 0 ? 8 : 0, stats.percentage)}%`, background: barColor }} />
              </div>
            )}

            <div className="flex flex-col gap-1">
              {items.length === 0 ? (
                <p className="font-nunito text-[10px] text-[#cbd5e1] mt-1">—</p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggleStatus(item)}
                    className="flex items-start gap-1.5 text-left rounded-lg px-1 py-1 hover:bg-black/5 transition-colors"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-[4px] border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                      style={{
                        borderColor: item.status === "done" ? "#059669" : "#cbd5e1",
                        background: item.status === "done" ? "#059669" : "transparent",
                      }}
                    >
                      {item.status === "done" && <FaCheck size={7} className="text-white" />}
                    </span>
                    <span
                      className="font-nunito text-[11px] font-bold leading-tight"
                      style={{ color: item.status === "done" ? "#059669" : "#334155", textDecoration: item.status === "done" ? "line-through" : "none" }}
                    >
                      {item.subject}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
