import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "../../../utils/axios";
import {
  FaClock, FaCheck, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight,
  FaRegCircle, FaHourglassHalf, FaFrown, FaPlay, FaStop, FaForward,
} from "react-icons/fa";
import { playTaskDoneSound, playLevelUpSound } from "../../../utils/sound";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

// Mola ekranında değişen didaktik bilgi kapsülleri — beynin dinlenmeyi
// neden "kaçak" değil "yatırım" saydığını gösteren, marka sesine uygun,
// kısa bilimsel notlar.
const BREAK_TIPS = [
  "Biliyor musun? Sınavda dikkatinin dağılmasının sebebi odaklanamaman değil, beyninin yorulmadan mola vermeyi bilmemesidir.",
  "Kısa molalar, beynin az önce öğrendiğini kısa süreli bellekten uzun süreliye taşıması için gereken en verimli yoldur.",
  "5 dakikalık bu mola, çalışma süreni uzatan değil, geri kalanını daha verimli yapan bir yatırım.",
  "Gözlerini ekrandan ayır, biraz esne — kasların gevşeyince zihnin de gevşer.",
  "Su içmeyi unutma. Hafif susuzluk bile dikkat süresini ölçülebilir şekilde kısaltıyor.",
];

// Görevler bitince çıkan didaktik kutlama mesajları — sadece "tebrikler"
// demek yerine bilimsel bir tavsiye de veriyor.
const ALL_DONE_TIPS = [
  "Günün fatihi! Beynin şu an öğrendiklerini kısa süreli bellekten uzun süreli belleğe aktarıyor. Git ve büyük bir bardak su iç.",
  "Bugünü kapattın. Şimdi ekrandan uzaklaş — beynin, gündüz öğrendiklerini asıl gece pekiştirir.",
  "Harika bir gün geçirdin. Yarının programı için enerjini şimdiden biriktir, bu bir maraton.",
  "Tebrikler! Küçük, tutarlı adımlar büyük sıçramalardan daha güçlüdür — tam da bunu yaptın.",
];
const pickTip = (list, seed) => list[Math.abs(seed) % list.length];

// Emoji YOK: renkli emoji glifleri (ör. ✅) kendi rengiyle geliyor, bu yüzden
// buton "aktif değilken" bile "yeşil işaretli" gibi görünüyordu (canlı
// puppeteer doğrulamasında yakalandı). Tek renkli ikon kullanılınca aktif/
// pasif durumu sadece bizim style'ımız belirliyor.
const STATUS_META = {
  done: { label: "Bitti", Icon: FaCheck, color: "#059669", bg: "#ecfdf5" },
  partial: { label: "Yarıda Kaldı", Icon: FaHourglassHalf, color: "#c2740c", bg: "#fff7ea" },
  stuck: { label: "Zorlandım", Icon: FaFrown, color: "#dc2626", bg: "#fef2f2" },
};

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

const toISO = (d) => d.toISOString().slice(0, 10);

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

// Görevin yanındaki üç durum butonu — "Bitti" dışında "Yarıda Kaldı"/
// "Zorlandım" ile koç öğrencinin nerede takıldığını anlık görür. Aktif
// olana tekrar basmak "pending"e geri alır (yanlışlıkla işaretlemeyi
// düzeltmek için).
function StatusButtons({ status, onChange, compact }) {
  const size = compact ? 26 : 32;
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {Object.entries(STATUS_META).map(([key, meta]) => {
        const active = status === key;
        const Icon = meta.Icon;
        return (
          <button
            key={key}
            type="button"
            title={meta.label}
            aria-label={meta.label}
            aria-pressed={active}
            onClick={() => onChange(active ? "pending" : key)}
            className="flex items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{
              width: size,
              height: size,
              background: active ? meta.bg : "#f1f5f9",
              border: active ? `2px solid ${meta.color}` : "2px solid transparent",
              color: active ? meta.color : "#94a3b8",
            }}
          >
            <Icon size={compact ? 11 : 13} />
          </button>
        );
      })}
    </div>
  );
}

// Görevin başında küçük bir Pomodoro başlat/çalışıyor göstergesi. Aynı anda
// tek tur olabildiği için (backend tek "aktif" oturuma izin veriyor), başka
// bir görevde tur çalışırken bu buton pasif görünüyor.
function PomodoroButton({ item, pomodoro, onStart, compact }) {
  const isThisRunning = pomodoro.phase === "focus" && pomodoro.session?.studyPlanItemId === item.id;
  const blockedByOther = pomodoro.phase !== "idle" && !isThisRunning;
  const size = compact ? 26 : 32;

  if (isThisRunning) {
    return (
      <span
        className="flex items-center gap-1.5 font-nunito font-black flex-shrink-0 px-2.5 rounded-full"
        style={{ height: size, fontSize: compact ? 10 : 11, background: "#ede8fa", color: "#1C1B8A" }}
      >
        🍅 {fmtClock(pomodoro.remaining)}
      </span>
    );
  }

  return (
    <button
      type="button"
      title={blockedByOther ? "Başka bir Pomodoro çalışıyor" : "Pomodoro Başlat (25 dk)"}
      disabled={blockedByOther}
      onClick={() => onStart(item)}
      className="flex items-center justify-center rounded-full flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
      style={{ width: size, height: size, background: "#f1f5f9", color: "#7340C8" }}
    >
      <FaPlay size={compact ? 9 : 10} />
    </button>
  );
}

// Görev tamamlandığı ANI fiziksel bir tatmine dönüştürüyor: sert bir
// neo-brutalist çerçeve+gölge anlık parlayıp sarsılıyor (CSS shake), metnin
// üstü kalın bir fosforlu çizgiyle "çiziliyor" (0.3sn'de genişleyen bar) ve
// kısa bir "klik" sesi çalıyor. Sadece "done"a geçişte — partial/stuck
// nötr/olumsuz sonuçlar, kutlama almaz.
function TaskRow({ item, onChange, compact, pomodoro, onStartPomodoro }) {
  const meta = STATUS_META[item.status];
  const prevStatusRef = useRef(item.status);
  const [celebrate, setCelebrate] = useState(false);
  const [strikeOn, setStrikeOn] = useState(item.status === "done");

  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev !== "done" && item.status === "done") {
      playTaskDoneSound();
      setCelebrate(true);
      setStrikeOn(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setStrikeOn(true)));
      const t = setTimeout(() => setCelebrate(false), 550);
      prevStatusRef.current = item.status;
      return () => clearTimeout(t);
    }
    if (item.status !== "done") setStrikeOn(false);
    prevStatusRef.current = item.status;
  }, [item.status]);

  return (
    <div
      className={`flex items-start sm:items-center gap-3 rounded-xl px-3.5 py-3 flex-wrap sm:flex-nowrap transition-colors ${celebrate ? "sd-task-pop" : ""}`}
      style={{
        background: meta ? meta.bg : "#f8fafc",
        border: celebrate ? "3px solid #0f172a" : "3px solid transparent",
        boxShadow: celebrate ? "4px 4px 0px #00e676" : "none",
      }}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5 sm:mt-0"
        style={{ width: 22, height: 22, color: meta ? meta.color : "#cbd5e1" }}
      >
        {item.status === "done" ? <FaCheck size={11} /> : <FaRegCircle size={11} />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="relative inline-block">
          <span className={`block font-nunito font-bold text-sm ${item.status === "done" ? "text-[#64748b]" : "text-[#0f172a]"}`}>
            {item.subject}
          </span>
          {item.status === "done" && (
            <span
              className="absolute left-0 top-1/2 h-[3px] rounded-full pointer-events-none"
              style={{ background: "#00c853", width: strikeOn ? "100%" : "0%", transition: "width 0.3s ease" }}
            />
          )}
        </span>
        {item.topic && <span className="block font-nunito text-xs text-[#64748b] mt-0.5">{item.topic}</span>}
        <span className="flex items-center gap-3 mt-1">
          {item.durationMin && (
            <span className="flex items-center gap-1 font-nunito text-[11px] text-[#94a3b8]">
              <FaClock size={9} /> {item.durationMin} dk
            </span>
          )}
          {meta && (
            <span className="font-nunito font-bold text-[11px]" style={{ color: meta.color }}>
              {meta.label}
            </span>
          )}
        </span>
      </span>
      <PomodoroButton item={item} pomodoro={pomodoro} onStart={onStartPomodoro} compact={compact} />
      <StatusButtons status={item.status} compact={compact} onChange={(next) => onChange(item.id, next)} />
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
        <p className="font-fredoka font-bold text-base mb-0.5">🎉 Bugünün Z-Raporu Hazır!</p>
        <p className="font-nunito text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
          Bugünkü tüm görevlerin sonuçlandı — koçun bu özeti panelinde görebilir.
        </p>
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
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Zorlandım</p>
          </div>
        </div>
        <p className="font-nunito text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>
          Planlanan süre: {fmtMinutes(report.totalMinutes)} · Gerçek çalışma: {fmtMinutes(report.actualStudyMinutes)}
        </p>
        <p className="font-nunito text-xs mt-3 pt-3 leading-relaxed" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
          💡 {tip}
        </p>
      </div>
    </div>
  );
}

// Odak/mola turu çalışırken üstte beliren büyük sayaç kartı.
function PomodoroBanner({ pomodoro, activeItem, onStop, onSkipBreak }) {
  // Her yeni mola için BİR tip seçilir (mola süresince sabit kalır, sonraki
  // molada değişir) — breakStartedAt her yeni molada yeni bir değer alıyor.
  const breakTip = useMemo(() => pickTip(BREAK_TIPS, pomodoro.breakStartedAt || 0), [pomodoro.breakStartedAt]);
  if (pomodoro.phase === "idle") return null;
  const isFocus = pomodoro.phase === "focus";
  const totalSecs = isFocus ? FOCUS_SECONDS : BREAK_SECONDS;
  const pct = Math.max(2, Math.round(((totalSecs - pomodoro.remaining) / totalSecs) * 100));

  return (
    <div
      className="rounded-[20px] p-5 text-white relative overflow-hidden"
      style={{ background: isFocus ? "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" : "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)" }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap relative">
        <div>
          <p className="font-fredoka font-bold text-base">{isFocus ? "🍅 Odak Modu" : "☕ Mola Zamanı"}</p>
          <p className="font-nunito text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
            {isFocus ? activeItem?.subject || "Bir görev üzerinde çalışıyorsun" : "5 dakika nefes al, sonra devam et."}
          </p>
        </div>
        <span className="font-fredoka font-bold text-3xl tabular-nums">{fmtClock(pomodoro.remaining)}</span>
      </div>
      <div className="h-2 rounded-full mt-4 overflow-hidden relative" style={{ background: "rgba(255,255,255,0.2)" }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: isFocus ? "#D8FF4F" : "#fff" }} />
      </div>
      {!isFocus && (
        <p className="font-nunito text-xs mt-3.5 relative leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          💡 {breakTip}
        </p>
      )}
      <div className="mt-4 relative">
        {isFocus ? (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 font-nunito font-bold text-xs px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <FaStop size={9} /> Turu Durdur
          </button>
        ) : (
          <button
            onClick={onSkipBreak}
            className="flex items-center gap-1.5 font-nunito font-bold text-xs px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <FaForward size={9} /> Molayı Geç
          </button>
        )}
      </div>
    </div>
  );
}

export default function HaftalikProgram() {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekOpen, setWeekOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [plan, setPlan] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [pomodoro, setPomodoro] = useState({ phase: "idle", session: null, remaining: 0 });
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
  }, [loadToday]);

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

  // Sayfa yenilendiğinde sunucudaki aktif Pomodoro turunu bir kereliğine
  // devral — sonrasında bu bileşenin kendi tik-tak state'i otoriter olur.
  useEffect(() => {
    if (hydratedRef.current || loading) return;
    hydratedRef.current = true;
    const s = today?.activePomodoro;
    if (!s) return;
    const elapsed = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
    const remaining = s.plannedSeconds - elapsed;
    if (remaining > 0) {
      setPomodoro({ phase: "focus", session: s, remaining });
    } else {
      // Sekme kapalıyken süresi dolmuş — sessizce kapat, mola ekranı açma.
      axios.patch(`/api/v1/ogrenci/me/pomodoro/${s.id}/stop`, { completed: true }, { headers }).catch(() => {}).finally(loadToday);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, today]);

  // Saniye sayacı
  useEffect(() => {
    if (pomodoro.phase === "idle") return;
    const t = setInterval(() => {
      setPomodoro((p) => (p.remaining <= 1 ? { ...p, remaining: 0 } : { ...p, remaining: p.remaining - 1 }));
    }, 1000);
    return () => clearInterval(t);
  }, [pomodoro.phase]);

  // Süre dolunca faz geçişi: odak bitince mola başlasın, mola bitince boşa düşsün.
  useEffect(() => {
    if (pomodoro.remaining !== 0 || pomodoro.phase === "idle") return;
    if (pomodoro.phase === "focus") {
      const sessionId = pomodoro.session?.id;
      if (sessionId) {
        axios.patch(`/api/v1/ogrenci/me/pomodoro/${sessionId}/stop`, { completed: true }, { headers }).catch(() => {}).finally(loadToday);
      }
      setPomodoro({ phase: "break", session: null, remaining: BREAK_SECONDS, breakStartedAt: Date.now() });
    } else {
      setPomodoro({ phase: "idle", session: null, remaining: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoro.remaining, pomodoro.phase]);

  // Z-Raporu ilk kez bu oturumda belirdiğinde ("günü bitirdin" anı) küçük
  // bir zafer sesi çalar — sayfa ilk açıldığında (gün zaten bitmişse) çalmaz,
  // sadece SON görev az önce burada işaretlenip rapor yeni oluştuğunda çalar.
  useEffect(() => {
    const reportId = today?.report?.id ?? null;
    if (prevReportIdRef.current !== undefined && prevReportIdRef.current === null && reportId !== null) {
      playLevelUpSound();
    }
    prevReportIdRef.current = reportId;
  }, [today?.report?.id]);

  const handleStartPomodoro = async (item) => {
    if (pomodoro.phase !== "idle") return;
    try {
      const { data } = await axios.post("/api/v1/ogrenci/me/pomodoro/start", { studyPlanItemId: item.id }, { headers });
      const s = data.session;
      const elapsed = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
      setPomodoro({ phase: "focus", session: s, remaining: Math.max(1, s.plannedSeconds - elapsed) });
    } catch {
      // sessizce yut
    }
  };

  const handleStopPomodoro = async () => {
    const sessionId = pomodoro.session?.id;
    setPomodoro({ phase: "idle", session: null, remaining: 0 });
    if (sessionId) {
      try {
        await axios.patch(`/api/v1/ogrenci/me/pomodoro/${sessionId}/stop`, { completed: false }, { headers });
      } catch {
        // sessizce yut
      } finally {
        loadToday();
      }
    }
  };

  const handleSkipBreak = () => setPomodoro({ phase: "idle", session: null, remaining: 0 });

  // İyimser güncelleme: buton anında tepki versin, sonra sunucudan (Z-Raporu
  // oluşmuş olabilir diye) otoriter veriyi tekrar çek.
  const setStatus = async (itemId, status, isToday) => {
    if (isToday) {
      setToday((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status } : it)) } : prev));
    } else {
      setPlan((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status } : it)) } : prev));
    }
    try {
      await axios.patch(`/api/v1/ogrenci/me/study-plan/items/${itemId}/status`, { status }, { headers });
    } catch {
      // sessizce yut, aşağıdaki refetch gerçek durumu geri getirir
    } finally {
      if (isToday) loadToday();
      else if (toISO(weekStart) === toISO(toMonday(new Date()))) loadToday();
    }
  };

  const items = today?.items || [];
  const total = items.length;
  const resolved = items.filter((i) => i.status !== "pending").length;
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const activeItem = items.find((i) => i.id === pomodoro.session?.studyPlanItemId) || null;

  const itemsByDay = useMemo(() => {
    const map = Array.from({ length: 7 }, () => []);
    (plan?.items || []).forEach((it) => {
      if (it.dayOfWeek >= 0 && it.dayOfWeek <= 6) map[it.dayOfWeek].push(it);
    });
    return map;
  }, [plan]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Bugün başlığı ── */}
      <div>
        <p className="font-fredoka font-bold text-page-navy text-lg capitalize">{fmtToday(today?.date) || "Bugün"}</p>
        <p className="font-nunito text-xs text-[#64748b] mt-0.5">Sadece bugüne odaklan — haftanın tamamı aşağıda seni bekliyor.</p>
      </div>

      <PomodoroBanner pomodoro={pomodoro} activeItem={activeItem} onStop={handleStopPomodoro} onSkipBreak={handleSkipBreak} />

      {loading ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>
      ) : total === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <div className="text-3xl mb-3 opacity-40">🎉</div>
          <p className="font-nunito text-sm text-[#94a3b8]">Bugün için planlı görev yok. Koçun henüz eklemediyse yakında ekleyecek!</p>
        </div>
      ) : (
        <>
          {/* İlerleme çubuğu — neon yeşil */}
          <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-nunito font-bold text-xs text-[#334155]">Bugünkü İlerleme</span>
              <span className="font-fredoka font-bold text-sm" style={{ color: "#00b34a" }}>
                {resolved}/{total} · %{pct}
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
            <p className="font-nunito text-[11px] text-[#94a3b8] mt-2.5 flex items-center gap-1.5">
              🍅 Gerçek Çalışma Süresi (Pomodoro): <span className="font-bold text-[#334155]">{fmtMinutes(today?.actualStudyMinutesToday)}</span>
            </p>
          </div>

          <ZRaporuCard report={today?.report} />

          <div className="flex flex-col gap-2.5">
            {items.map((it) => (
              <TaskRow
                key={it.id}
                item={it}
                onChange={(id, status) => setStatus(id, status, true)}
                pomodoro={pomodoro}
                onStartPomodoro={handleStartPomodoro}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Bu Haftanın Tamamı (katlanır) ── */}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          onClick={() => setWeekOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="font-fredoka font-bold text-page-navy text-sm">Bu Haftanın Tamamı</span>
          {weekOpen ? <FaChevronUp size={12} className="text-[#94a3b8]" /> : <FaChevronDown size={12} className="text-[#94a3b8]" />}
        </button>

        {weekOpen && (
          <div className="px-5 pb-5 border-t border-[#f1f5f9] pt-4">
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
                          <TaskRow
                            key={it.id}
                            item={it}
                            compact
                            onChange={(id, status) => setStatus(id, status, false)}
                            pomodoro={pomodoro}
                            onStartPomodoro={handleStartPomodoro}
                          />
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
    </div>
  );
}
