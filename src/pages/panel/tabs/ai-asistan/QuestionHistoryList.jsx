import { fmtDate, STATUS_LABELS } from "./aiAsistanHelpers";

export default function QuestionHistoryList({ questions, onSelect }) {
  if (questions.length === 0) {
    return <p className="font-nunito text-sm text-[#94a3b8] text-center py-6">Henüz bir soru yüklemedin.</p>;
  }

  return (
    <div className="grid gap-2.5">
      {questions.map((q) => {
        const statusMeta = STATUS_LABELS[q.status] || STATUS_LABELS.ERROR;
        return (
          <button
            key={q.id}
            onClick={() => onSelect(q)}
            className="text-left bg-white rounded-2xl border border-[#f1f5f9] p-4 flex items-center gap-3 hover:border-brand/40 transition-colors"
          >
            {q.imageUrl && (
              <img src={q.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-[#f1f5f9]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-fredoka font-bold text-page-navy text-sm truncate">
                {[q.subject, q.topic].filter(Boolean).join(" • ") || "Soru"}
              </p>
              <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">{fmtDate(q.createdAt)}</p>
            </div>
            <span
              className="font-nunito font-bold text-[10px] px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: statusMeta.bg, color: statusMeta.color }}
            >
              {statusMeta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
