import { useEffect, useMemo, useState, useRef } from "react";
import axios from "../../../utils/axios";
import { FaWhatsapp } from "react-icons/fa";
import WeeklyProgramSection from "./program/WeeklyProgramSection";
import { toMonday, toISO, fmtMinutes } from "./program/programHelpers";
import useTodayTasks from "./program/useTodayTasks";
import TodayTaskCard from "./program/TodayTaskCard";
import KocumdanCard from "./program/KocumdanCard";

// Görevler bitince çıkan didaktik kutlama mesajları — sadece "tebrikler"
// demek yerine bilimsel bir tavsiye de veriyor.
const ALL_DONE_TIPS = [
  "Günün fatihi! Beynin şu an öğrendiklerini kısa süreli bellekten uzun süreli belleğe aktarıyor. Git ve büyük bir bardak su iç.",
  "Bugünü kapattın. Şimdi ekrandan uzaklaş — beynin, gündüz öğrendiklerini asıl gece pekiştirir.",
  "Harika bir gün geçirdin. Yarının programı için enerjini şimdiden biriktir, bu bir maraton.",
  "Tebrikler! Küçük, tutarlı adımlar büyük sıçramalardan daha güçlüdür — tam da bunu yaptın.",
];
const pickTip = (list, seed) => list[Math.abs(seed) % list.length];

// toMonday/toISO/fmtMinutes artık ./program/programHelpers.js'ten import
// ediliyor (tek kaynak, WeeklyProgramSection ile paylaşılıyor). Pomodoro/
// bugünkü-görev state'i ./program/useTodayTasks.js'te (GenelBakis.jsx ile
// paylaşılıyor), TodayTaskCard ./program/TodayTaskCard.jsx'te.

const fmtToday = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
};

function SectionEyebrow({ children, color = "var(--color-warning)" }) {
  return (
    <span className="font-fredoka font-bold text-[11px] uppercase" style={{ color, letterSpacing: 2 }}>
      {children}
    </span>
  );
}

function ZRaporuCard({ report }) {
  const tip = useMemo(() => (report ? pickTip(ALL_DONE_TIPS, report.id + report.doneTasks) : ""), [report]);
  if (!report) return null;
  return (
    <div
      className="rounded-[20px] p-5 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f7a3d 0%, #059669 100%)" }}
    >
      <div className="absolute rounded-full pointer-events-none" style={{ width: 160, height: 160, background: "#00e676", filter: "blur(60px)", opacity: 0.35, top: -50, right: -40 }} />
      <div className="relative">
        <p className="font-fredoka font-bold text-base mb-0.5">🎉 Bugünkü rotanı tamamladın</p>
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.14)" }}>
            <p className="font-fredoka font-bold text-lg">{report.doneTasks}</p>
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Bitti</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.14)" }}>
            <p className="font-fredoka font-bold text-lg">{report.partialTasks}</p>
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Yarıda Kaldı</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.14)" }}>
            <p className="font-fredoka font-bold text-lg">{report.stuckTasks}</p>
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Yapamadım</p>
          </div>
        </div>
        <p className="font-nunito text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>
          Planlanan süre: {fmtMinutes(report.totalMinutes)} · Gerçek çalışma: {fmtMinutes(report.actualStudyMinutes)}
        </p>
        <p className="font-nunito text-xs mt-3 pt-3 leading-relaxed" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
          💡 {tip}
        </p>
        <p className="font-nunito font-bold text-xs mt-3">Yarın görüşürüz. 👋</p>
      </div>
    </div>
  );
}

export default function HaftalikProgram({ student }) {
  const {
    today, loading,
    activeSession, elapsedSeconds,
    feelingPromptId, reasonPromptId,
    loadToday,
    handleStart, handleCancelActive, handleFinishActive, handleDirectComplete,
    handleSubmitFeeling, handleSkipFeeling,
    handleOpenReason, handleCancelReason, handleSubmitReason,
  } = useTodayTasks();

  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [plan, setPlan] = useState(null);
  const [planWeekStartISO, setPlanWeekStartISO] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [coachNote, setCoachNote] = useState(null);
  const weeklyRef = useRef(null);

  // Haftalık Rotam artık her zaman görünür (K1) — "Yarının Rotasını Gör"
  // artık bir şey "açmıyor", yalnızca zaten görünür olan bölüme kaydırıyor.
  const scrollToWeekly = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    weeklyRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    axios.get("/api/v1/ogrenci/me/notes/latest", { headers }).then((res) => setCoachNote(res.data?.note || null)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWeek = useMemo(
    () => async (ws) => {
      setWeekLoading(true);
      try {
        const { data } = await axios.get("/api/v1/ogrenci/me/study-plan", { headers, params: { weekStart: toISO(ws) } });
        setPlan(data?.plan || null);
        // K4: dönen plan'ın gerçekten hangi haftaya ait olduğunu (backend
        // echo'su) ayrıca tutuyoruz — WeeklyProgramSection, selectedDay'i
        // yalnızca bu, istenen weekStart'a eşitse yeniden çözüyor. Backend
        // weekStart'ı ham UTC ISO timestamp olarak döner (ör.
        // "2026-10-04T21:00:00.000Z") — toISO() ise yerel "YYYY-MM-DD"
        // üretiyor; karşılaştırmanın anlamlı olması için aynı normalize
        // formata çevriliyor (new Date(...) + toISO), yoksa iki string asla
        // eşleşmez ve gün hiç çözülmez.
        setPlanWeekStartISO(data?.weekStart ? toISO(new Date(data.weekStart)) : toISO(ws));
      } catch {
        setPlan(null);
      } finally {
        setWeekLoading(false);
      }
    },
    [headers]
  );

  // Haftalık bölüm artık her zaman görünür (K1) — toggle'a değil mount'a ve
  // hafta değişimine bağlı yükleniyor, "Bugünkü Rotam" ile paralel.
  useEffect(() => {
    loadWeek(weekStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  // Haftalık (salt-okunur) görünümdeki durumu tek tıkla değiştirmeye devam
  // etsin diye ayrı, sade bir handler.
  const cycleWeekStatus = (item) => {
    const next = item.status === "done" ? "pending" : "done";
    setPlan((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === item.id ? { ...it, status: next } : it)) } : prev));
    axios
      .patch(`/api/v1/ogrenci/me/study-plan/items/${item.id}/status`, { status: next }, { headers })
      .catch(() => {})
      .finally(() => {
        if (toISO(weekStart) === toISO(toMonday(new Date()))) loadToday();
      });
  };

  const items = useMemo(() => today?.items || [], [today]);
  const total = items.length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const resolved = items.filter((i) => i.status !== "pending").length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const totalEstimatedMin = items.reduce((sum, i) => sum + (i.durationMin || 0), 0);
  const distinctSubjects = useMemo(() => new Set(items.filter((i) => i.status === "done").map((i) => i.subject)).size, [items]);
  const firstName = student?.name?.split(" ")[0] || "";

  // Ekran öğrencinin gününe tepki versin: sabah / yarı yolda / hepsi bitti /
  // gün kapandı ama hepsi "tamam" değil (bazıları "yapamadım" — bunu sahte
  // bir kutlamayla örtmüyoruz, nötr bir kapanış mesajı veriyoruz).
  const greeting = (() => {
    if (total === 0) return null;
    if (resolved === total) {
      return doneCount === total ? "Bugünkü rotanı tamamladın 🎉" : "Bugünü kapattın. Yarın kaldığın yerden devam.";
    }
    if (doneCount === 0) return `Günaydın${firstName ? `, ${firstName}` : ""} 👋 İlk görevine hazır olduğunda başlayabilirsin.`;
    return "Rotanın yarısı tamamlandı, devam!";
  })();

  return (
    <div data-tour="weekly-program" className="flex flex-col gap-4">
      {/* ── Bugünkü Rotam başlığı ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <SectionEyebrow>Bugünkü Rotam</SectionEyebrow>
          <p className="font-nunito text-xs text-[#94a3b8] mt-0.5 capitalize">{fmtToday(today?.date) || "Bugün"}</p>
        </div>
      </div>

      {greeting && <p className="font-fredoka font-bold text-page-navy text-base -mt-2">{greeting}</p>}

      <KocumdanCard note={coachNote} />

      {loading ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>
      ) : total === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          {today?.hasWeekPlan ? (
            <>
              <div className="text-3xl mb-3 opacity-40">🌿</div>
              <p className="font-fredoka font-bold text-page-navy text-sm mb-1.5">Bugün dinlenme günü.</p>
              <p className="font-nunito text-sm text-[#94a3b8] leading-relaxed">Rotanda bugün planlı çalışma bulunmuyor. Yarın kaldığın yerden devam edeceksin.</p>
              <button onClick={scrollToWeekly} className="font-nunito font-bold text-sm text-page-navy underline mt-3">
                Yarının Rotasını Gör →
              </button>
            </>
          ) : (
            <>
              <div className="text-3xl mb-3 opacity-40">🗓️</div>
              <p className="font-fredoka font-bold text-page-navy text-sm mb-1.5">Bugünkü rotan henüz hazırlanmadı.</p>
              <p className="font-nunito text-sm text-[#94a3b8] leading-relaxed mb-3">Koçun programını hazırladığında burada göreceksin.</p>
              <a href="https://wa.me/905312546701" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-nunito font-bold text-sm no-underline" style={{ color: "var(--color-brand)" }}>
                <FaWhatsapp size={12} /> Koçuma Yaz
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          {/* İlerleme çubuğu */}
          <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-nunito font-bold text-xs text-[#334155]">
                Bugün {total} görevin var {totalEstimatedMin > 0 && `· Tahmini ${fmtMinutes(totalEstimatedMin)}`}
              </span>
              <span className="font-fredoka font-bold text-sm" style={{ color: "#00b34a" }}>
                {doneCount}/{total} · %{pct}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct > 0 ? 6 : 0, pct)}%`,
                  background: "linear-gradient(90deg, #00c853, #00e676)",
                  boxShadow: pct > 0 ? "0 0 10px rgba(0,230,118,0.6)" : "none",
                }}
              />
            </div>
            <p className="font-nunito text-[11px] text-[#94a3b8] mt-2.5">
              Çalıştığın süre: <span className="font-bold text-[#334155]">{fmtMinutes(today?.actualStudyMinutesToday)}</span>
              {distinctSubjects > 0 && <> · <span className="font-bold text-[#334155]">{distinctSubjects} ders</span></>}
            </p>
          </div>

          <ZRaporuCard report={today?.report} />

          <div className="flex flex-col gap-2.5">
            {items.map((it) => (
              <TodayTaskCard
                key={it.id}
                item={it}
                isActive={activeSession?.studyPlanItemId === it.id}
                elapsedSeconds={elapsedSeconds}
                disabledStart={!!activeSession && activeSession.studyPlanItemId !== it.id}
                onStart={handleStart}
                onCancelActive={handleCancelActive}
                onFinishActive={handleFinishActive}
                onDirectComplete={handleDirectComplete}
                feelingOpen={feelingPromptId === it.id}
                onSubmitFeeling={handleSubmitFeeling}
                onSkipFeeling={handleSkipFeeling}
                reasonOpen={reasonPromptId === it.id}
                onOpenReason={handleOpenReason}
                onSubmitReason={handleSubmitReason}
                onCancelReason={handleCancelReason}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Haftalık Rotam — her zaman görünür (K1) ── */}
      <div ref={weeklyRef}>
        <WeeklyProgramSection
          plan={plan}
          planWeekStartISO={planWeekStartISO}
          weekStart={weekStart}
          weekLoading={weekLoading}
          activeSession={activeSession}
          setWeekStart={setWeekStart}
          onToggleStatus={cycleWeekStatus}
        />
      </div>
    </div>
  );
}
