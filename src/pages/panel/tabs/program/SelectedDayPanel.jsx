import { FaCheck, FaRegCircle, FaFrown, FaClock } from "react-icons/fa";
import { DAY_LABELS, dayDateForIndex, getDayStats } from "./programHelpers";

const STATUS_ICON_COLOR = { done: "#059669", stuck: "#dc2626", partial: "#c2740c", pending: "#cbd5e1" };

function TaskIcon({ status }) {
  const color = STATUS_ICON_COLOR[status] || STATUS_ICON_COLOR.pending;
  if (status === "done") return <FaCheck size={11} style={{ color }} />;
  if (status === "stuck") return <FaFrown size={11} style={{ color }} />;
  return <FaRegCircle size={11} style={{ color }} />;
}

// Seçili günün detayı — K3: zengin Pomodoro/feeling akışı yok, yalnızca
// mevcut cycleWeekStatus'un done/pending tıkla-değiştir modeli (tek kaynak,
// mantık tekrarlanmıyor). Task satırı burada gömülü (K6, ayrı dosya değil).
export default function SelectedDayPanel({ weekStart, selectedDay, items, activeSession, hideCompleted, onToggleHideCompleted, onToggleStatus }) {
  const dayDate = dayDateForIndex(weekStart, selectedDay);
  const stats = getDayStats(items);
  const visibleItems = hideCompleted ? items.filter((i) => i.status !== "done") : items;
  const allDoneButHidden = hideCompleted && items.length > 0 && visibleItems.length === 0;

  return (
    <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <p className="font-fredoka font-bold text-page-navy text-base">
          {DAY_LABELS[selectedDay]}, {dayDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
        </p>
        {stats.total > 0 && (
          <span className="font-fredoka font-bold text-sm" style={{ color: "#00b34a" }}>
            {stats.completed} / {stats.total} tamamlandı
          </span>
        )}
      </div>

      {stats.total > 0 && (
        <div
          className="h-2.5 rounded-full bg-[#f1f5f9] overflow-hidden mb-4"
          role="progressbar"
          aria-valuenow={stats.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(stats.percentage > 0 ? 6 : 0, stats.percentage)}%`, background: "linear-gradient(90deg, #00c853, #00e676)" }}
          />
        </div>
      )}

      {stats.total === 0 ? (
        <div className="text-center py-8">
          <p className="font-nunito text-sm text-[#94a3b8]">Bu gün için planlanmış görev yok.</p>
          <p className="font-nunito text-xs text-[#cbd5e1] mt-1">Diğer günlere göz atabilirsin.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2.5">
            <button
              type="button"
              onClick={onToggleHideCompleted}
              className="font-nunito font-bold text-[11px] text-[#94a3b8] hover:text-page-navy underline transition-colors"
            >
              {hideCompleted ? "Tamamlananları göster" : "Tamamlananları gizle"}
            </button>
          </div>

          {allDoneButHidden ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2 opacity-60">✅</div>
              <p className="font-fredoka font-bold text-page-navy text-sm">Bu günün tüm görevlerini tamamladın.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleItems.map((item) => {
                const isActive = activeSession?.studyPlanItemId === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onToggleStatus(item)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleStatus(item); } }}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 bg-[#f8fafc] cursor-pointer hover:bg-[#f1f5f9] transition-colors"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 18, height: 18 }}>
                      <TaskIcon status={item.status} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-nunito font-bold text-sm text-[#0f172a] truncate">{item.subject}</span>
                      {item.topic && <span className="block font-nunito text-xs text-[#64748b] truncate">{item.topic}</span>}
                    </span>
                    {isActive && (
                      <span className="font-nunito font-bold text-[10px] px-2 py-1 rounded-full text-white flex-shrink-0" style={{ background: "var(--color-brand)" }}>
                        Şu an çalışılıyor
                      </span>
                    )}
                    {item.durationMin && (
                      <span className="flex items-center gap-1 font-nunito text-[11px] text-[#94a3b8] flex-shrink-0">
                        <FaClock size={9} /> {item.durationMin} dk
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
