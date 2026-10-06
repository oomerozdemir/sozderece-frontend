import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import WeekDayStrip from "./WeekDayStrip";
import SelectedDayPanel from "./SelectedDayPanel";
import WeeklyProgressSummary from "./WeeklyProgressSummary";
import { toMonday, toISO, fmtRange, groupTasksByDay, getWeekStats, getDefaultSelectedDay } from "./programHelpers";

// "Haftalık Rotam" — eski collapse-edilmiş Pazartesi→Pazar dikey listenin
// yerine geçiyor. Her zaman görünür (K1); state tek bu component'te:
// selectedDay + hideCompleted. Tüm istatistikler `plan`'dan useMemo ile
// türüyor (K5) — status değişince (HaftalikProgram.jsx'teki onToggleStatus
// zaten optimistic setPlan yapıyor) burada ekstra bir senkron gerekmiyor.
export default function WeeklyProgramSection({ plan, planWeekStartISO, weekStart, weekLoading, activeSession, setWeekStart, onToggleStatus }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const resolvedForWeekRef = useRef(null);
  const todayDate = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => groupTasksByDay(plan?.items), [plan]);
  const weekStats = useMemo(() => getWeekStats(weekDays), [weekDays]);

  // K4: yalnızca gösterilen plan, istenen haftaya aitse (ve yüklenme
  // bitmişse) default günü çöz — eski haftanın verisiyle yanlış gün
  // seçilmez. Aynı hafta içinde kullanıcı manuel gün seçtiyse (ref zaten bu
  // haftayı "çözülmüş" işaretlemiştir) üzerine yazılmaz.
  useEffect(() => {
    const weekISO = toISO(weekStart);
    if (weekLoading || planWeekStartISO !== weekISO) return;
    if (resolvedForWeekRef.current === weekISO) return;
    setSelectedDay(getDefaultSelectedDay(weekStart, weekDays, todayDate));
    resolvedForWeekRef.current = weekISO;
  }, [weekStart, weekLoading, planWeekStartISO, weekDays, todayDate]);

  const isCurrentWeek = toISO(weekStart) === toISO(toMonday(todayDate));
  const effectiveSelectedDay = selectedDay ?? 0;
  const selectedItems = weekDays[effectiveSelectedDay] || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="order-1 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-fredoka font-bold text-page-navy text-base">Haftalık Rotam</p>
          <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">{fmtRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() - 7); return n; })}
            aria-label="Önceki hafta"
            className="w-8 h-8 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
          >
            <FaChevronLeft size={11} className="text-[#475569]" />
          </button>
          {!isCurrentWeek && (
            <button onClick={() => setWeekStart(toMonday(todayDate))} className="font-nunito font-bold text-xs text-page-navy underline">
              Bu hafta
            </button>
          )}
          <button
            onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() + 7); return n; })}
            aria-label="Sonraki hafta"
            className="w-8 h-8 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
          >
            <FaChevronRight size={11} className="text-[#475569]" />
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div className="order-2">
        {weekLoading ? (
          <p className="font-nunito text-sm text-[#94a3b8] text-center py-6">Yükleniyor…</p>
        ) : (
          <WeekDayStrip weekStart={weekStart} weekDays={weekDays} selectedDay={effectiveSelectedDay} onSelectDay={setSelectedDay} todayDate={todayDate} />
        )}
      </div>

      {!weekLoading && weekStats.total === 0 ? (
        <p className="order-3 font-nunito text-sm text-[#94a3b8] text-center py-6">Bu hafta için henüz bir program hazırlanmadı.</p>
      ) : !weekLoading && (
        <>
          {/* K7: desktop'ta özet şeridin hemen altında, mobilde en altta */}
          <div className="order-4 md:order-3">
            <WeeklyProgressSummary stats={weekStats} />
          </div>
          <div className="order-3 md:order-4">
            <SelectedDayPanel
              weekStart={weekStart}
              selectedDay={effectiveSelectedDay}
              items={selectedItems}
              activeSession={activeSession}
              hideCompleted={hideCompleted}
              onToggleHideCompleted={() => setHideCompleted((v) => !v)}
              onToggleStatus={onToggleStatus}
            />
          </div>
        </>
      )}
    </div>
  );
}
