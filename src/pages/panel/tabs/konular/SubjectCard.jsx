import { STAGE_ORDER, STAGE_META } from "./topicHelpers";

// Stage dağılımını tek bir segmentli bar'da gösterir — R1: ağırlıklı/uydurma
// bir "genel ilerleme %" yerine ham dağılımın kendisi. Üst özette ve her
// ders kartında aynı component kullanılıyor.
export function StageProgressBar({ stats, className = "" }) {
  const total = stats.total || 1;
  const progressed = stats.total - stats.none;
  return (
    <div
      className={`w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden flex ${className}`}
      role="progressbar"
      aria-valuenow={progressed}
      aria-valuemin={0}
      aria-valuemax={stats.total}
      aria-label={`${progressed}/${stats.total} konuda ilerleme kaydedildi`}
    >
      {STAGE_ORDER.filter((s) => s !== "none").map((stage) => {
        const count = stats[stage];
        if (count === 0) return null;
        return <div key={stage} style={{ width: `${(count / total) * 100}%`, background: STAGE_META[stage].border }} />;
      })}
    </div>
  );
}

function TopicChip({ topic, onOpenMenu }) {
  const meta = STAGE_META[topic.stage] || STAGE_META.none;
  return (
    <button
      type="button"
      onClick={(e) => onOpenMenu(topic, e.currentTarget.getBoundingClientRect())}
      className="font-nunito font-bold text-xs px-3 py-2 rounded-xl border-2 text-left min-h-[44px] transition-transform hover:scale-[1.02]"
      style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
    >
      <span className="block truncate max-w-[160px]">{topic.name}</span>
      <span className="block text-[10px] mt-0.5 opacity-80">{meta.label}</span>
    </button>
  );
}

// Collapsible ders kartı. Header'daki sayılar (`stats`) her zaman o dersin
// aktif TYT/AYT+track filtresi SONRASI tam durumunu gösterir — arama/stage
// filtresinden etkilenmez (R5). Yalnızca `visibleTopics` arama/stage
// filtresine göre daralır.
export default function SubjectCard({ subject, stats, visibleTopics, expanded, onToggleExpand, onOpenMenu, emptyMessage }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 p-4 text-left min-h-[44px]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="font-fredoka font-bold text-page-navy text-sm truncate">{subject}</p>
            <span className="font-nunito font-bold text-xs text-[#64748b] shrink-0">{stats.total} konu</span>
          </div>
          <StageProgressBar stats={stats} className="mb-2" />
          <div className="flex gap-2.5 flex-wrap">
            {STAGE_ORDER.map((stage) => (
              <span key={stage} className="font-nunito font-bold text-[10px]" style={{ color: STAGE_META[stage].color }}>
                {STAGE_META[stage].label}: {stats[stage]}
              </span>
            ))}
          </div>
        </div>
        <span className="font-nunito font-bold text-xs text-brand shrink-0">{expanded ? "Kapat" : "Aç"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[#f1f5f9]">
          {visibleTopics.length === 0 ? (
            <p className="font-nunito text-xs text-[#94a3b8] py-4 text-center">{emptyMessage}</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              {visibleTopics.map((t) => (
                <TopicChip key={t.id} topic={t} onOpenMenu={onOpenMenu} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
