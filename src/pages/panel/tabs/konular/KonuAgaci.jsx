import { useEffect, useMemo, useState } from "react";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";
import SubjectCard, { StageProgressBar } from "./SubjectCard";
import TopicStatusMenu from "./TopicStatusMenu";
import {
  STAGE_ORDER,
  STAGE_META,
  filterTopicsByTrack,
  groupTopicsBySubject,
  getSubjectStats,
  getOverallStats,
  getProgressCounts,
  filterTopicsByStage,
  filterTopicsBySearch,
} from "./topicHelpers";

const STAGE_FILTER_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "none", label: "Başlanmadı" },
  { value: "studied", label: "Çalışıldı" },
  { value: "practiced", label: "Pratik" },
  { value: "mastered", label: "Güçlü" },
];

const EXAM_TYPE_STORAGE_KEY = "konuAgaci_examType";

// "Akademik İlerleme Haritası" — bu ekran bir öneri/öncelik motoru DEĞİL;
// yalnızca müfredatı gösterir, ilerlemeyi görünür kılar ve öğrencinin durum
// güncellemesini kolaylaştırır. Hangi konunun şimdi çalışılacağına koç karar
// verir.
export default function KonuAgaci({ student }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState(() => {
    try {
      return localStorage.getItem(EXAM_TYPE_STORAGE_KEY) || "TYT";
    } catch {
      return "TYT";
    }
  });
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [expandedSubjects, setExpandedSubjects] = useState(() => new Set());
  const [activeMenu, setActiveMenu] = useState(null); // {topic, anchorRect}

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

  // TYT/AYT sekmeleri yalnızca ikisi de gerçekten mevcutsa gösterilir (YKS
  // öğrencileri). LGS konularında examType alanı null — tek bucket, sekme yok.
  const availableExamTypes = useMemo(() => {
    const set = new Set(topics.map((t) => t.examType).filter(Boolean));
    return ["TYT", "AYT"].filter((et) => set.has(et));
  }, [topics]);
  const hasExamTypeTabs = availableExamTypes.length > 1;
  const effectiveExamType = hasExamTypeTabs
    ? availableExamTypes.includes(examType) ? examType : availableExamTypes[0]
    : null;

  useEffect(() => {
    if (!hasExamTypeTabs) return;
    try {
      localStorage.setItem(EXAM_TYPE_STORAGE_KEY, effectiveExamType);
    } catch {
      // localStorage erişilemiyorsa (gizli sekme vb.) sessizce yok say.
    }
  }, [hasExamTypeTabs, effectiveExamType]);

  const examTypeTopics = useMemo(() => {
    if (!hasExamTypeTabs) return topics;
    return topics.filter((t) => t.examType === effectiveExamType);
  }, [topics, hasExamTypeTabs, effectiveExamType]);

  // R5: üst özet ve her ders kartının sayıları, TYT/AYT sekmesi + track
  // filtresinden SONRAKİ bu "görünür evren"den hesaplanır — ham 177/79
  // rakamları değil.
  const { topics: visibleUniverse, isUnknownTrack } = useMemo(
    () => filterTopicsByTrack(examTypeTopics, student?.track, effectiveExamType || ""),
    [examTypeTopics, student?.track, effectiveExamType]
  );

  const overallStats = useMemo(() => getOverallStats(visibleUniverse), [visibleUniverse]);
  const progressCounts = useMemo(() => getProgressCounts(overallStats), [overallStats]);
  const bySubject = useMemo(() => groupTopicsBySubject(visibleUniverse), [visibleUniverse]);

  const isFiltering = search.trim() !== "" || stageFilter !== "all";

  const subjectEntries = useMemo(() => {
    return [...bySubject.entries()].map(([subject, subjectTopics]) => {
      const stats = getSubjectStats(subjectTopics);
      const afterSearch = filterTopicsBySearch(subjectTopics, search);
      const afterStage = filterTopicsByStage(afterSearch, stageFilter);
      return { subject, stats, visibleTopics: afterStage };
    });
  }, [bySubject, search, stageFilter]);

  const visibleSubjectEntries = isFiltering
    ? subjectEntries.filter((e) => e.visibleTopics.length > 0)
    : subjectEntries;

  const allExpanded = visibleSubjectEntries.length > 0 && visibleSubjectEntries.every((e) => expandedSubjects.has(e.subject));
  const toggleAllExpanded = () => {
    if (allExpanded) {
      setExpandedSubjects(new Set());
    } else {
      setExpandedSubjects(new Set(visibleSubjectEntries.map((e) => e.subject)));
    }
  };
  const toggleSubjectExpanded = (subject) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  const handleOpenMenu = (topic, anchorRect) => setActiveMenu({ topic, anchorRect });
  const handleCloseMenu = () => setActiveMenu(null);

  const handleSelectStage = async (stage) => {
    const topic = activeMenu?.topic;
    setActiveMenu(null);
    if (!topic || stage === topic.stage) return;
    setTopics((prev) => prev.map((t) => (t.id === topic.id ? { ...t, stage } : t)));
    try {
      await axios.patch(`/api/v1/ogrenci/me/topics/${topic.id}/mastery`, { stage }, { headers });
    } catch {
      setTopics((prev) => prev.map((t) => (t.id === topic.id ? { ...t, stage: topic.stage } : t)));
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">
        Yükleniyor…
      </div>
    );
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
    <div className="flex flex-col gap-4">
      {/* ── Konu Haritan: üst özet ── */}
      <div className="rounded-[20px] p-5 text-white relative overflow-hidden" style={{ background: "var(--color-dark)" }}>
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 200, height: 200, background: "var(--color-brand)", filter: "blur(70px)", opacity: 0.25, top: -70, right: -50 }}
        />
        <div className="relative">
          <p className="font-fredoka font-bold text-base mb-1">Konu Haritan</p>
          <p className="font-nunito text-xs mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
            {effectiveExamType ? `${effectiveExamType} — ` : ""}Toplam {overallStats.total} konu
          </p>
          <StageProgressBar stats={overallStats} className="mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STAGE_ORDER.map((stage) => (
              <div key={stage} className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="font-nunito font-bold text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {STAGE_META[stage].label}
                </p>
                <p className="font-fredoka font-bold text-lg">{overallStats[stage]}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            <p className="font-nunito text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
              İlerlenen Konu: <strong className="text-white">{progressCounts.advanced}/{overallStats.total}</strong>
            </p>
            <p className="font-nunito text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
              Güçlü Konu: <strong className="text-white">{progressCounts.mastered}/{overallStats.total}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── TYT/AYT sekmesi ── */}
      {hasExamTypeTabs && (
        <div className="inline-flex bg-[#f1f5f9] rounded-xl p-1 gap-1 self-start">
          {availableExamTypes.map((et) => (
            <button
              key={et}
              type="button"
              onClick={() => setExamType(et)}
              className="font-nunito font-bold text-xs px-4 py-2 rounded-lg min-h-[44px] transition-colors"
              style={effectiveExamType === et ? { background: "var(--color-brand)", color: "#fff" } : { color: "#64748b" }}
            >
              {et}
            </button>
          ))}
        </div>
      )}

      {/* ── R2: track tanınmıyorsa açıklayıcı banner ── */}
      {effectiveExamType === "AYT" && isUnknownTrack && (
        <div className="bg-[#fff7ea] border border-[#fde8c4] rounded-2xl p-4 flex items-start gap-3">
          <span className="text-lg shrink-0">ℹ️</span>
          <div className="flex-1 min-w-0">
            <p className="font-nunito text-sm text-[#7c4a03]">
              Alan bilgin henüz tanımlanmadığı için tüm AYT konularını görüyorsun.
            </p>
            <Button to="/hesabim" variant="link" size="sm" className="mt-1">
              Alanını Hesabım'dan güncelle →
            </Button>
          </div>
        </div>
      )}

      {/* ── Arama + durum filtreleri ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Konu ara..."
          aria-label="Konu ara"
          className="flex-1 py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito min-h-[44px]"
        />
        <div className="flex gap-1.5 overflow-x-auto">
          {STAGE_FILTER_OPTIONS.map((opt) => {
            const active = stageFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStageFilter(opt.value)}
                aria-pressed={active}
                className="shrink-0 font-nunito font-bold text-xs px-3 py-2 rounded-full border transition-colors min-h-[44px]"
                style={active ? { background: "var(--color-brand)", color: "#fff", borderColor: "var(--color-brand)" } : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {!isFiltering && visibleSubjectEntries.length > 1 && (
        <button type="button" onClick={toggleAllExpanded} className="font-nunito font-bold text-xs text-brand self-end">
          {allExpanded ? "Tümünü Kapat" : "Tümünü Aç"}
        </button>
      )}

      {/* ── Ders kartları ── */}
      {bySubject.size === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8]">Alanına uygun AYT konuları henüz eklenmemiş.</p>
        </div>
      ) : visibleSubjectEntries.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8]">
            {search.trim() ? "Aramana uygun konu bulunamadı." : "Bu durumda konu bulunmuyor."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleSubjectEntries.map(({ subject, stats, visibleTopics }) => (
            <SubjectCard
              key={subject}
              subject={subject}
              stats={stats}
              visibleTopics={visibleTopics}
              expanded={isFiltering || expandedSubjects.has(subject)}
              onToggleExpand={() => toggleSubjectExpanded(subject)}
              onOpenMenu={handleOpenMenu}
              emptyMessage={search.trim() ? "Aramana uygun konu bulunamadı." : "Bu durumda konu bulunmuyor."}
            />
          ))}
        </div>
      )}

      {activeMenu && (
        <TopicStatusMenu
          topic={activeMenu.topic}
          anchorRect={activeMenu.anchorRect}
          onSelect={handleSelectStage}
          onClose={handleCloseMenu}
        />
      )}
    </div>
  );
}
