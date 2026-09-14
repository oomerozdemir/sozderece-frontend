import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaStar } from "react-icons/fa";

const STAGE_META = {
  none: { label: "Henüz Başlanmadı", short: "—", bg: "#f1f5f9", border: "#e2e8f0", color: "#94a3b8" },
  studied: { label: "Çalıştım", short: "Çalıştım", bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8" },
  practiced: { label: "Test Çözdüm", short: "Test Çözdüm", bg: "#f5f3ff", border: "#7340C8", color: "#6d28d9" },
  mastered: { label: "Branşta Full", short: "Full ⭐", bg: "linear-gradient(135deg,#fde68a,#f59e0b)", border: "#f59e0b", color: "#7c2d12" },
};
const STAGE_ORDER = ["none", "studied", "practiced", "mastered"];

function TopicNode({ topic, onClick }) {
  const meta = STAGE_META[topic.stage] || STAGE_META.none;
  const isGradient = topic.stage === "mastered";
  return (
    <button
      onClick={onClick}
      title={`${topic.name} — ${meta.label} (tıkla, sıradaki seviyeye geç)`}
      className="font-nunito font-bold text-xs px-3 py-2 rounded-xl border-2 transition-transform hover:scale-105 text-left"
      style={{
        background: isGradient ? meta.bg : meta.bg,
        borderColor: meta.border,
        color: meta.color,
      }}
    >
      <span className="block">{topic.name}</span>
      <span className="block text-[10px] mt-0.5 opacity-80">{meta.short}</span>
    </button>
  );
}

function SubjectSection({ subject, topics, onCycle }) {
  const masteredCount = topics.filter((t) => t.stage === "mastered").length;
  const pct = Math.round((masteredCount / topics.length) * 100);
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="font-fredoka font-bold text-page-navy text-sm">{subject}</p>
        <span className="font-nunito font-bold text-xs px-2.5 py-1 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
          <FaStar size={9} className="inline mr-1 mb-0.5" />
          {masteredCount}/{topics.length} Full (%{pct})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <TopicNode key={t.id} topic={t} onClick={() => onCycle(t)} />
        ))}
      </div>
    </div>
  );
}

export default function KonuAgaci() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/topics", { headers })
      .then((res) => setTopics(res.data?.topics || []))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleTopic = async (topic) => {
    const nextIdx = (STAGE_ORDER.indexOf(topic.stage) + 1) % STAGE_ORDER.length;
    const nextStage = STAGE_ORDER[nextIdx];
    setTopics((prev) => prev.map((t) => (t.id === topic.id ? { ...t, stage: nextStage } : t)));
    try {
      await axios.patch(`/api/v1/ogrenci/me/topics/${topic.id}/mastery`, {}, { headers });
    } catch {
      setTopics((prev) => prev.map((t) => (t.id === topic.id ? { ...t, stage: topic.stage } : t)));
    }
  };

  const grouped = useMemo(() => {
    const byExamType = new Map();
    for (const t of topics) {
      const key = t.examType || "GENEL";
      if (!byExamType.has(key)) byExamType.set(key, new Map());
      const bySubject = byExamType.get(key);
      if (!bySubject.has(t.subject)) bySubject.set(t.subject, []);
      bySubject.get(t.subject).push(t);
    }
    return byExamType;
  }, [topics]);

  const totalMastered = topics.filter((t) => t.stage === "mastered").length;
  const overallPct = topics.length > 0 ? Math.round((totalMastered / topics.length) * 100) : 0;

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  if (topics.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <div className="text-3xl mb-3 opacity-40">🌳</div>
        <p className="font-nunito text-sm text-[#94a3b8]">Konu listesi henüz hazırlanmadı.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Genel özet + lejant ── */}
      <div className="rounded-[20px] p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: "#f59e0b", filter: "blur(70px)", opacity: 0.25, top: -70, right: -50 }} />
        <div className="flex items-center justify-between gap-4 flex-wrap relative">
          <div>
            <p className="font-fredoka font-bold text-base">🌳 Konu Takip Ağacın</p>
            <p className="font-nunito text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
              {totalMastered}/{topics.length} konuda branş denemesinde full yaptın — %{overallPct} ustalık
            </p>
          </div>
          <div className="flex gap-2 flex-wrap relative">
            {STAGE_ORDER.filter((s) => s !== "none").map((s) => {
              const meta = STAGE_META[s];
              return (
                <span key={s} className="font-nunito font-bold text-[10px] px-2.5 py-1 rounded-full border" style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}>
                  {meta.short}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {[...grouped.entries()].map(([examType, bySubject]) => (
        <div key={examType} className="flex flex-col gap-3">
          {examType !== "GENEL" && (
            <p className="font-fredoka font-bold text-[11px] uppercase text-accent-orange" style={{ letterSpacing: 2 }}>{examType}</p>
          )}
          {[...bySubject.entries()].map(([subject, subjectTopics]) => (
            <SubjectSection key={subject} subject={subject} topics={subjectTopics} onCycle={cycleTopic} />
          ))}
        </div>
      ))}
    </div>
  );
}
