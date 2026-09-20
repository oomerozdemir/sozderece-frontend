import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import {
  FaCheckCircle, FaBookOpen, FaArrowRight, FaWhatsapp, FaChartLine,
} from "react-icons/fa";

const fmtMinutes = (mins) => {
  const m = Math.max(0, Math.round(mins || 0));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} sa ${rem} dk` : `${h} sa`;
};

const fmtNet = (n) => (n == null ? "—" : n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }));

function SectionEyebrow({ children, color = "#1C1B8A" }) {
  return (
    <span className="font-fredoka font-bold text-[11px] uppercase" style={{ color, letterSpacing: 2 }}>
      {children}
    </span>
  );
}

export default function GenelBakis({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [resourceCount, setResourceCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [coachNote, setCoachNote] = useState(null);
  const [topics, setTopics] = useState(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("/api/v1/ogrenci/me/summary", { headers }).then((res) => setSummary(res.data)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/resources", { headers }).then((res) => setResourceCount(res.data?.resources?.length || 0)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/announcements", { headers }).then((res) => setAnnouncementCount(res.data?.announcements?.length || 0)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/notes/latest", { headers }).then((res) => setCoachNote(res.data?.note || null)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/topics", { headers }).then((res) => setTopics(res.data?.topics || [])).catch(() => setTopics([]));
  }, [token]);

  // Konu ağacından ders bazlı ilerleme yüzdesi — "Rotam" kartı için. En
  // kalabalık 4 ders gösteriliyor, kart taşmasın diye.
  const subjectProgress = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    const bySubject = new Map();
    for (const t of topics) {
      if (!bySubject.has(t.subject)) bySubject.set(t.subject, { total: 0, mastered: 0 });
      const entry = bySubject.get(t.subject);
      entry.total += 1;
      if (t.stage === "mastered") entry.mastered += 1;
    }
    return [...bySubject.entries()]
      .map(([subject, { total, mastered }]) => ({ subject, percent: total > 0 ? Math.round((mastered / total) * 100) : 0 }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4);
  }, [topics]);

  if (!summary) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  const todayFocus = summary.todayFocus || [];
  const todayMinutes = todayFocus.reduce((sum, t) => sum + (t.durationMin || 0), 0);
  const weeklyPercent = summary.weeklyTaskTotal > 0 ? Math.round((summary.weeklyTaskDone / summary.weeklyTaskTotal) * 100) : 0;
  const subjectDeltas = summary.subjectNetDeltas || [];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Bugünkü Rotam + Bu Hafta ── */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Bugünkü Rotam — panelin en değerli alanı */}
        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <SectionEyebrow color="#FF6B35">Bugünkü Rotam</SectionEyebrow>
            {todayFocus.length > 0 && (
              <span className="font-nunito font-bold text-xs text-[#94a3b8]">
                {todayFocus.length} görev · Tahmini {fmtMinutes(todayMinutes)}
              </span>
            )}
          </div>

          {todayFocus.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2.5">
              {todayFocus.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                  <span
                    className="w-5 h-5 rounded-[6px] border-2 flex-shrink-0"
                    style={{ borderColor: "#cbd5e1" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-fredoka font-bold text-page-navy text-sm truncate">
                      {item.subject}
                      {item.topic && <span className="text-[#64748b] font-nunito text-xs font-bold"> — {item.topic}</span>}
                    </p>
                  </div>
                  {item.durationMin && (
                    <span className="font-nunito font-bold text-xs text-[#94a3b8] flex-shrink-0">{item.durationMin} dk</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-nunito text-sm text-[#64748b] mt-3">
              Bugün için planlı görev yok — istersen yaklaşan çalışmalarına göz atabilirsin.
            </p>
          )}

          <button
            onClick={() => onNavigate && onNavigate("program")}
            className="mt-5 inline-flex items-center gap-2 self-start font-fredoka font-bold text-sm px-5 py-2.5 rounded-full transition-transform hover:scale-[1.02]"
            style={{ background: "#1C1B8A", color: "#D8FF4F" }}
          >
            Bugünü Aç <FaArrowRight size={11} />
          </button>
        </div>

        {/* Bu Hafta */}
        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <SectionEyebrow>Bu Hafta</SectionEyebrow>
          <p className="font-fredoka font-bold text-page-navy text-xl mt-2">
            {summary.weeklyTaskDone} / {summary.weeklyTaskTotal} <span className="text-sm font-nunito font-bold text-[#64748b]">görev tamamlandı</span>
          </p>
          <div className="h-2.5 rounded-full bg-[#f1f5f9] overflow-hidden mt-2.5 mb-5">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(4, weeklyPercent)}%`, background: "linear-gradient(90deg, #1C1B8A, #FF6B35)" }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <MiniStat value={summary.weeklyTaskDone} label="Tamamlanan" />
            <MiniStat value={fmtMinutes(summary.weeklyMinutesCompleted)} label="Çalışma" />
            <MiniStat value={summary.topicsMasteredThisWeek > 0 ? `+${summary.topicsMasteredThisWeek}` : "0"} label="Tamamlanan Konu" />
          </div>
        </div>
      </div>

      {/* ── Koçumdan + Rotam ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col">
          <SectionEyebrow color="#7340C8">Koçumdan</SectionEyebrow>
          {coachNote ? (
            <>
              <div className="flex items-center gap-2.5 mt-3 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "#ede8fa" }}>
                  💌
                </div>
                <p className="font-fredoka font-bold text-page-navy text-sm">{coachNote.coachName}</p>
              </div>
              {coachNote.type === "text" ? (
                <p className="font-nunito text-sm text-[#334155] leading-relaxed mt-1">"{coachNote.text}"</p>
              ) : (
                <audio controls src={coachNote.audioUrl} className="h-9 mt-2 w-full" />
              )}
              <p className="font-nunito text-xs text-[#94a3b8] mt-2">
                {coachNote.isToday ? "Bugün" : new Date(coachNote.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </p>
            </>
          ) : (
            <p className="font-nunito text-sm text-[#64748b] mt-3">Koçundan henüz bir not yok — merak ettiğin bir şey varsa sen de yazabilirsin.</p>
          )}
          <a
            href="https://wa.me/905312546701"
            target="_blank"
            rel="noreferrer"
            className="mt-auto pt-4 inline-flex items-center gap-1.5 self-start font-nunito font-bold text-sm no-underline hover:underline"
            style={{ color: "#7340C8" }}
          >
            <FaWhatsapp size={13} /> Koçuma Yaz →
          </a>
        </div>

        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col">
          <SectionEyebrow color="#1C1B8A">Rotam</SectionEyebrow>
          {subjectProgress.length > 0 ? (
            <div className="mt-3 flex flex-col gap-3">
              {subjectProgress.map((s) => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-nunito font-bold text-xs text-[#334155]">{s.subject}</span>
                    <span className="font-nunito font-bold text-xs text-[#0f172a]">%{s.percent}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(4, s.percent)}%`, background: "#1C1B8A" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-nunito text-sm text-[#64748b] mt-3">Henüz konu ağacın oluşturulmadı.</p>
          )}
          <button
            onClick={() => onNavigate && onNavigate("konular")}
            className="mt-auto pt-4 font-nunito font-bold text-sm text-page-navy text-left hover:underline self-start"
          >
            Haftalık Rotamı Gör →
          </button>
        </div>
      </div>

      {/* ── Son Denemem ── */}
      <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
        <SectionEyebrow color="#c2410c">Son Denemem</SectionEyebrow>
        {summary.latestExam ? (
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap mt-2">
              <p className="font-fredoka font-bold text-page-navy text-lg">
                {summary.latestExam.examName} — {fmtNet(summary.latestExam.totalNet)} Net
              </p>
            </div>
            {subjectDeltas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {subjectDeltas.map((d) => (
                  <span
                    key={d.subject}
                    className="inline-flex items-center gap-1 font-nunito font-bold text-xs px-3 py-1.5 rounded-full"
                    style={d.delta >= 0 ? { background: "#ecfdf5", color: "#059669" } : { background: "#fef2f2", color: "#dc2626" }}
                  >
                    {d.subject} {d.delta >= 0 ? "+" : ""}{d.delta} {d.delta >= 0 ? "↑" : "↓"}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => onNavigate && onNavigate("deneme")}
              className="mt-4 inline-flex items-center gap-1.5 font-nunito font-bold text-sm hover:underline"
              style={{ color: "#c2410c" }}
            >
              <FaChartLine size={12} /> Analizi Gör →
            </button>
          </>
        ) : (
          <>
            <p className="font-nunito text-sm text-[#64748b] mt-2">
              Henüz deneme sonucun eklenmedi. Koçun ilk sonucunu girdiğinde gelişimini burada takip edebileceksin.
            </p>
            <a
              href="https://wa.me/905312546701"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-nunito font-bold text-sm no-underline hover:underline"
              style={{ color: "#c2410c" }}
            >
              <FaWhatsapp size={12} /> Koçuma Yaz →
            </a>
          </>
        )}
      </div>

      {/* ── Kaynaklarım / Gündem — küçük, kompakt ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate && onNavigate("kaynaklar")}
          className="bg-white rounded-2xl border border-[#f1f5f9] p-4 flex items-center gap-2.5 text-left hover:border-page-navy/30 transition-colors"
        >
          <FaBookOpen size={14} style={{ color: "#c2410c" }} className="flex-shrink-0" />
          <p className="font-nunito font-bold text-sm text-page-navy truncate">Kaynaklarım ({resourceCount})</p>
        </button>
        <button
          onClick={() => onNavigate && onNavigate("gundem")}
          className="bg-white rounded-2xl border border-[#f1f5f9] p-4 flex items-center gap-2.5 text-left hover:border-page-navy/30 transition-colors"
        >
          <FaCheckCircle size={14} style={{ color: "#7340C8" }} className="flex-shrink-0" />
          <p className="font-nunito font-bold text-sm text-page-navy truncate">Duyurular ({announcementCount})</p>
        </button>
      </div>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="p-3 rounded-xl text-center" style={{ background: "#f8fafc" }}>
      <p className="font-fredoka font-bold text-page-navy text-base leading-none">{value}</p>
      <p className="font-nunito font-bold text-[10px] text-[#94a3b8] mt-1.5 leading-tight">{label}</p>
    </div>
  );
}
