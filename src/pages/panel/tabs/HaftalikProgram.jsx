import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "../../../utils/axios";
import {
  FaClock, FaCheck, FaChevronLeft, FaChevronRight,
  FaRegCircle, FaFrown, FaPlay, FaStop, FaWhatsapp,
} from "react-icons/fa";
import { playTaskDoneSound, playLevelUpSound } from "../../../utils/sound";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Görevler bitince çıkan didaktik kutlama mesajları — sadece "tebrikler"
// demek yerine bilimsel bir tavsiye de veriyor.
const ALL_DONE_TIPS = [
  "Günün fatihi! Beynin şu an öğrendiklerini kısa süreli bellekten uzun süreli belleğe aktarıyor. Git ve büyük bir bardak su iç.",
  "Bugünü kapattın. Şimdi ekrandan uzaklaş — beynin, gündüz öğrendiklerini asıl gece pekiştirir.",
  "Harika bir gün geçirdin. Yarının programı için enerjini şimdiden biriktir, bu bir maraton.",
  "Tebrikler! Küçük, tutarlı adımlar büyük sıçramalardan daha güçlüdür — tam da bunu yaptın.",
];
const pickTip = (list, seed) => list[Math.abs(seed) % list.length];

const FEELING_META = {
  kolay: { emoji: "😌", label: "Kolay" },
  normal: { emoji: "🙂", label: "Normal" },
  zor: { emoji: "😓", label: "Zor" },
};

const NOT_COMPLETED_REASONS = [
  "Vaktim yetmedi",
  "Konu zor geldi",
  "Okul/kurstan dolayı yetişmedi",
  "Motivasyonum düşüktü",
  "Diğer",
];

const toMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtRange = (monday) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts = { day: "numeric", month: "long" };
  return `${monday.toLocaleDateString("tr-TR", opts)} — ${sunday.toLocaleDateString("tr-TR", opts)}`;
};

// d.toISOString() UTC'ye çevirir — İstanbul (+3) yerel gece yarısı bir
// önceki güne kayar (Pazartesi 00:00 -> Pazar 21:00 UTC). Bu yüzden yerel
// takvim bileşenlerinden elle string kuruyoruz, backend'e her zaman doğru
// (bir gün kaymamış) tarih gitsin diye.
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fmtToday = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
};

const fmtMinutes = (mins) => {
  const m = Math.max(0, Math.round(mins || 0));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} sa ${rem} dk` : `${h} sa`;
};

const fmtClock = (totalSeconds) => {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

function SectionEyebrow({ children, color = "#FF6B35" }) {
  return (
    <span className="font-fredoka font-bold text-[11px] uppercase" style={{ color, letterSpacing: 2 }}>
      {children}
    </span>
  );
}

// Görev tamamlandığı ANI fiziksel bir tatmine dönüştürüyor: sert bir
// neo-brutalist çerçeve+gölge anlık parlayıp sarsılıyor (CSS shake), metnin
// üstü kalın bir fosforlu çizgiyle "çiziliyor" ve kısa bir "klik" sesi çalıyor.
function useCelebration(status) {
  const prevRef = useRef(status);
  const [celebrate, setCelebrate] = useState(false);
  const [strikeOn, setStrikeOn] = useState(status === "done");

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== "done" && status === "done") {
      playTaskDoneSound();
      setCelebrate(true);
      setStrikeOn(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setStrikeOn(true)));
      const t = setTimeout(() => setCelebrate(false), 550);
      prevRef.current = status;
      return () => clearTimeout(t);
    }
    if (status !== "done") setStrikeOn(false);
    prevRef.current = status;
  }, [status]);

  return { celebrate, strikeOn };
}

// Görev tamamlanınca / "Bugün Yapamadım" denince açılan hafif inline geri
// bildirim istemi — devasa bir form değil, tek satırlık emoji seçimi +
// opsiyonel not. "Atla" ile tamamen geçilebilir.
function FeelingPrompt({ onSubmit, onSkip }) {
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  return (
    <div className="mt-3 pt-3 border-t border-black/5">
      <p className="font-nunito font-bold text-xs text-[#334155] mb-2">Nasıl geçti?</p>
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(FEELING_META).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSubmit(key, note)}
            className="flex items-center gap-1.5 font-nunito font-bold text-xs px-3 py-2 rounded-full bg-white border border-[#e2e8f0] hover:border-page-navy/40 transition-colors"
          >
            <span className="text-base leading-none">{meta.emoji}</span> {meta.label}
          </button>
        ))}
        <button type="button" onClick={onSkip} className="font-nunito text-[11px] text-[#94a3b8] underline ml-1">
          Atla
        </button>
      </div>
      {!noteOpen ? (
        <button type="button" onClick={() => setNoteOpen(true)} className="font-nunito font-bold text-[11px] text-page-navy underline mt-2.5">
          Koçuma not bırak
        </button>
      ) : (
        <textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: Fonksiyonlarda bileşke kısmında zorlandım."
          maxLength={500}
          rows={2}
          className="w-full mt-2.5 px-3 py-2 rounded-xl border border-[#e2e8f0] outline-none text-xs font-nunito bg-white focus:border-page-navy resize-none"
        />
      )}
    </div>
  );
}

// "Bugün Yapamadım" akışı — öğrenciyi suçlu hissettirmeden nedeni öğrenir,
// bu bile koçluk verisine dönüşür.
function ReasonPrompt({ onSubmit, onCancel }) {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");

  if (reason) {
    return (
      <div className="mt-3 pt-3 border-t border-black/5">
        {reason === "Diğer" && (
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kısaca anlat..."
            maxLength={500}
            rows={2}
            className="w-full mb-2.5 px-3 py-2 rounded-xl border border-[#e2e8f0] outline-none text-xs font-nunito bg-white focus:border-page-navy resize-none"
          />
        )}
        <button
          type="button"
          onClick={() => onSubmit(reason, note)}
          className="font-nunito font-bold text-xs px-4 py-2 rounded-full text-white"
          style={{ background: "#1C1B8A" }}
        >
          Gönder
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-black/5">
      <p className="font-nunito font-bold text-xs text-[#334155] mb-2">Neden?</p>
      <div className="flex flex-col gap-1.5 items-start">
        {NOT_COMPLETED_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className="font-nunito font-bold text-xs px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] hover:border-page-navy/40 transition-colors"
          >
            {r}
          </button>
        ))}
      </div>
      <button type="button" onClick={onCancel} className="font-nunito text-[11px] text-[#94a3b8] underline mt-2">
        Vazgeç
      </button>
    </div>
  );
}

// "Bugünüm" ekranının ana birimi — sıradan bir liste satırı değil, gerçekten
// uygulanabilir bir çalışma kartı: Başla → çalış → Bitir, tamamlanınca hafif
// bir "nasıl geçti?" istemi, yapılamadıysa suçlamadan sebep sorma.
function TodayTaskCard({
  item, isActive, elapsedSeconds, disabledStart,
  onStart, onCancelActive, onFinishActive, onDirectComplete,
  feelingOpen, onSubmitFeeling, onSkipFeeling,
  reasonOpen, onOpenReason, onSubmitReason, onCancelReason,
}) {
  const { celebrate, strikeOn } = useCelebration(item.status);
  const feelingMeta = item.feeling ? FEELING_META[item.feeling] : null;

  return (
    <div
      className={`rounded-2xl border transition-colors ${celebrate ? "sd-task-pop" : ""}`}
      style={{
        background: item.status === "done" ? "#f0fdf4" : item.status === "stuck" ? "#fef2f2" : "#fff",
        borderColor: celebrate ? "#0f172a" : item.status === "done" ? "#bbf7d0" : item.status === "stuck" ? "#fecaca" : "#f1f5f9",
        borderWidth: celebrate ? 3 : 1,
        boxShadow: celebrate ? "4px 4px 0px #00e676" : "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
            style={{ width: 22, height: 22, color: item.status === "done" ? "#059669" : item.status === "stuck" ? "#dc2626" : "#cbd5e1" }}
          >
            {item.status === "done" ? <FaCheck size={11} /> : item.status === "stuck" ? <FaFrown size={11} /> : <FaRegCircle size={11} />}
          </span>
          <div className="min-w-0 flex-1">
            <span className="relative inline-block">
              <span className="block font-fredoka font-bold text-page-navy text-sm uppercase" style={{ letterSpacing: 0.5 }}>
                {item.subject}
              </span>
              {item.status === "done" && (
                <span
                  className="absolute left-0 top-1/2 h-[3px] rounded-full pointer-events-none"
                  style={{ background: "#00c853", width: strikeOn ? "100%" : "0%", transition: "width 0.3s ease" }}
                />
              )}
            </span>
            {item.topic && <p className="font-nunito text-xs text-[#64748b] mt-0.5">{item.topic}</p>}

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {item.status === "done" ? (
                <span className="flex items-center gap-1 font-nunito font-bold text-[11px] text-[#059669]">
                  <FaClock size={9} /> {fmtMinutes(item.actualMinutes || item.durationMin)}
                </span>
              ) : item.durationMin ? (
                <span className="flex items-center gap-1 font-nunito text-[11px] text-[#94a3b8]">
                  <FaClock size={9} /> ~{item.durationMin} dk
                </span>
              ) : null}
              {feelingMeta && (
                <span className="font-nunito font-bold text-[11px]" style={{ color: "#059669" }}>
                  {feelingMeta.emoji} {feelingMeta.label}
                </span>
              )}
              {item.status === "stuck" && item.notCompletedReason && (
                <span className="font-nunito font-bold text-[11px] text-[#dc2626]">{item.notCompletedReason}</span>
              )}
            </div>
            {item.note && (
              <p className="font-nunito text-[11px] text-[#94a3b8] italic mt-1.5">"{item.note}"</p>
            )}
          </div>

          {/* Sağdaki aksiyon alanı — sadece pending & prompt kapalıyken */}
          {item.status === "pending" && !feelingOpen && !reasonOpen && (
            <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
              {isActive ? (
                <>
                  <span className="font-fredoka font-bold text-sm text-page-navy tabular-nums">{fmtClock(elapsedSeconds)}</span>
                  <button
                    type="button"
                    onClick={() => onFinishActive(item)}
                    className="flex items-center gap-1.5 font-nunito font-bold text-xs px-3.5 py-2 rounded-full text-white"
                    style={{ background: "#1C1B8A" }}
                  >
                    <FaStop size={9} /> Bitir
                  </button>
                  <button type="button" onClick={onCancelActive} className="font-nunito text-[10px] text-[#94a3b8] underline">
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={disabledStart}
                    onClick={() => onStart(item)}
                    className="flex items-center gap-1.5 font-nunito font-bold text-xs px-3.5 py-2 rounded-full text-white disabled:opacity-30"
                    style={{ background: "#1C1B8A" }}
                  >
                    <FaPlay size={9} /> Başla
                  </button>
                  <button type="button" onClick={() => onDirectComplete(item)} className="font-nunito font-bold text-[11px] text-[#059669] underline">
                    Tamamla
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {feelingOpen && <FeelingPrompt onSubmit={(f, n) => onSubmitFeeling(item, f, n)} onSkip={() => onSkipFeeling(item)} />}
        {reasonOpen && <ReasonPrompt onSubmit={(r, n) => onSubmitReason(item, r, n)} onCancel={onCancelReason} />}

        {item.status === "pending" && !isActive && !feelingOpen && !reasonOpen && (
          <button type="button" onClick={() => onOpenReason(item)} className="font-nunito text-[11px] text-[#cbd5e1] hover:text-[#94a3b8] underline mt-2.5">
            Bugün yapamadım
          </button>
        )}
      </div>
    </div>
  );
}

// Hafta görünümü için sade, salt-görüntüleme satırı (birincil etkileşim
// alanı bugünkü kartlar olsun diye burası bilinçli olarak basit tutuldu).
function WeekTaskRow({ item }) {
  const color = item.status === "done" ? "#059669" : item.status === "stuck" ? "#dc2626" : item.status === "partial" ? "#c2740c" : "#cbd5e1";
  return (
    <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 bg-[#f8fafc]">
      <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 18, height: 18, color }}>
        {item.status === "done" ? <FaCheck size={10} /> : <FaRegCircle size={10} />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-nunito font-bold text-sm text-[#0f172a]">{item.subject}</span>
        {item.topic && <span className="block font-nunito text-xs text-[#64748b]">{item.topic}</span>}
      </span>
      {item.durationMin && (
        <span className="flex items-center gap-1 font-nunito text-[11px] text-[#94a3b8] flex-shrink-0">
          <FaClock size={9} /> {item.durationMin} dk
        </span>
      )}
    </div>
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

function KocumdanCard({ note }) {
  if (!note) return null;
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#ede8fa" }}>
        👋
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-fredoka font-bold text-[10px] uppercase text-[#7340C8] mb-1" style={{ letterSpacing: 1 }}>Koçumdan</p>
        {note.type === "text" ? (
          <p className="font-nunito font-bold text-sm text-[#334155]">"{note.text}"</p>
        ) : (
          <audio controls src={note.audioUrl} className="h-8 mt-1 max-w-full" />
        )}
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-nunito text-[11px] text-[#94a3b8]">{note.coachName} · {note.isToday ? "Bugün" : ""}</p>
          <a href="https://wa.me/905312546701" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-nunito font-bold text-[11px] no-underline" style={{ color: "#7340C8" }}>
            <FaWhatsapp size={11} /> Koçuma Yaz
          </a>
        </div>
      </div>
    </div>
  );
}

export default function HaftalikProgram({ student }) {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekOpen, setWeekOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [plan, setPlan] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [coachNote, setCoachNote] = useState(null);
  const [activeSession, setActiveSession] = useState(null); // {id, studyPlanItemId, startedAt}
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [feelingPromptId, setFeelingPromptId] = useState(null);
  const [reasonPromptId, setReasonPromptId] = useState(null);
  const hydratedRef = useRef(false);
  const prevReportIdRef = useRef(undefined);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/ogrenci/me/today", { headers });
      setToday(data || null);
    } catch {
      setToday(null);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadToday();
    axios.get("/api/v1/ogrenci/me/notes/latest", { headers }).then((res) => setCoachNote(res.data?.note || null)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWeek = useCallback(
    async (ws) => {
      setWeekLoading(true);
      try {
        const { data } = await axios.get("/api/v1/ogrenci/me/study-plan", { headers, params: { weekStart: toISO(ws) } });
        setPlan(data?.plan || null);
      } catch {
        setPlan(null);
      } finally {
        setWeekLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    if (weekOpen) loadWeek(weekStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOpen, weekStart]);

  // Sayfa yenilendiğinde sunucudaki aktif turu bir kereliğine devral.
  useEffect(() => {
    if (hydratedRef.current || loading) return;
    hydratedRef.current = true;
    if (today?.activePomodoro) setActiveSession(today.activePomodoro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, today]);

  // Açık uçlu (yukarı sayan) kronometre — 25dk'lık zorunlu bir tur değil,
  // öğrenci "Bitir"e basana kadar sayar.
  useEffect(() => {
    if (!activeSession) return;
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activeSession]);

  // Z-Raporu ilk kez bu oturumda belirdiğinde ("günü bitirdin" anı) zafer sesi çalar.
  useEffect(() => {
    const reportId = today?.report?.id ?? null;
    if (prevReportIdRef.current !== undefined && prevReportIdRef.current === null && reportId !== null) {
      playLevelUpSound();
    }
    prevReportIdRef.current = reportId;
  }, [today?.report?.id]);

  const handleStart = async (item) => {
    if (activeSession) return;
    try {
      const { data } = await axios.post("/api/v1/ogrenci/me/pomodoro/start", { studyPlanItemId: item.id }, { headers });
      setActiveSession(data.session);
    } catch {
      // sessizce yut
    }
  };

  const handleCancelActive = async () => {
    const id = activeSession?.id;
    setActiveSession(null);
    if (id) {
      try {
        await axios.patch(`/api/v1/ogrenci/me/pomodoro/${id}/stop`, { completed: false }, { headers });
      } catch {
        // sessizce yut
      } finally {
        loadToday();
      }
    }
  };

  const handleFinishActive = async (item) => {
    const id = activeSession?.id;
    setActiveSession(null);
    if (id) {
      try {
        await axios.patch(`/api/v1/ogrenci/me/pomodoro/${id}/stop`, { completed: true }, { headers });
      } catch {
        // sessizce yut
      }
    }
    setFeelingPromptId(item.id);
  };

  const handleDirectComplete = (item) => setFeelingPromptId(item.id);

  // İyimser güncelleme + gerçek veriyi (Z-Raporu oluşmuş olabilir) tekrar çek.
  const setStatus = async (itemId, status, extra = {}) => {
    setToday((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status, ...extra } : it)) } : prev));
    try {
      await axios.patch(`/api/v1/ogrenci/me/study-plan/items/${itemId}/status`, { status, ...extra }, { headers });
    } catch {
      // sessizce yut, aşağıdaki refetch gerçek durumu geri getirir
    } finally {
      loadToday();
    }
  };

  const handleSubmitFeeling = (item, feeling, note) => {
    setFeelingPromptId(null);
    setStatus(item.id, "done", { feeling, note: note?.trim() || undefined });
  };
  const handleSkipFeeling = (item) => {
    setFeelingPromptId(null);
    setStatus(item.id, "done", {});
  };

  const handleOpenReason = (item) => setReasonPromptId(item.id);
  const handleCancelReason = () => setReasonPromptId(null);
  const handleSubmitReason = (item, reason, note) => {
    setReasonPromptId(null);
    setStatus(item.id, "stuck", { notCompletedReason: reason, note: note?.trim() || undefined });
  };

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

  const itemsByDay = useMemo(() => {
    const map = Array.from({ length: 7 }, () => []);
    (plan?.items || []).forEach((it) => {
      if (it.dayOfWeek >= 0 && it.dayOfWeek <= 6) map[it.dayOfWeek].push(it);
    });
    return map;
  }, [plan]);

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
    <div className="flex flex-col gap-4">
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
              <button onClick={() => setWeekOpen(true)} className="font-nunito font-bold text-sm text-page-navy underline mt-3">
                Yarının Rotasını Gör →
              </button>
            </>
          ) : (
            <>
              <div className="text-3xl mb-3 opacity-40">🗓️</div>
              <p className="font-fredoka font-bold text-page-navy text-sm mb-1.5">Bugünkü rotan henüz hazırlanmadı.</p>
              <p className="font-nunito text-sm text-[#94a3b8] leading-relaxed mb-3">Koçun programını hazırladığında burada göreceksin.</p>
              <a href="https://wa.me/905312546701" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-nunito font-bold text-sm no-underline" style={{ color: "#7340C8" }}>
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

      {/* ── Haftalık Rotam — ikincil, küçük bir erişim noktası ── */}
      <div className="text-center pt-1">
        <button onClick={() => setWeekOpen((v) => !v)} className="font-nunito font-bold text-xs text-[#94a3b8] hover:text-page-navy underline transition-colors">
          {weekOpen ? "Haftalık Rotamı Gizle" : "Haftalık Rotamı Gör →"}
        </button>
      </div>

      {weekOpen && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 pb-5 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() - 7); return n; })}
              className="w-8 h-8 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
            >
              <FaChevronLeft size={11} className="text-[#475569]" />
            </button>
            <span className="font-fredoka font-bold text-page-navy text-xs px-1">{fmtRange(weekStart)}</span>
            <button
              onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() + 7); return n; })}
              className="w-8 h-8 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
            >
              <FaChevronRight size={11} className="text-[#475569]" />
            </button>
            {toISO(weekStart) !== toISO(toMonday(new Date())) && (
              <button onClick={() => setWeekStart(toMonday(new Date()))} className="font-nunito font-bold text-xs text-page-navy underline ml-1">
                Bu hafta
              </button>
            )}
          </div>

          {weekLoading ? (
            <p className="font-nunito text-sm text-[#94a3b8] text-center py-6">Yükleniyor…</p>
          ) : !plan || (plan.items || []).length === 0 ? (
            <p className="font-nunito text-sm text-[#94a3b8] text-center py-6">Bu hafta için henüz bir program hazırlanmadı.</p>
          ) : (
            <div className="grid gap-3">
              {DAY_LABELS.map((label, dayIdx) => {
                const dItems = itemsByDay[dayIdx];
                if (dItems.length === 0) return null;
                return (
                  <div key={dayIdx}>
                    <p className="font-fredoka font-bold text-[#334155] text-xs mb-2">{label}</p>
                    <div className="flex flex-col gap-2">
                      {dItems.map((it) => (
                        <div key={it.id} onClick={() => cycleWeekStatus(it)} className="cursor-pointer">
                          <WeekTaskRow item={it} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
