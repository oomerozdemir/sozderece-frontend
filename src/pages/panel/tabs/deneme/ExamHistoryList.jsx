import { EXAM_TYPE_LABELS, comparisonLabel } from "./examConfig";
import { fmtDate, formatNet, fmtDurationMinutes } from "./examHelpers";

const STATUS_LABELS = {
  IN_PROGRESS: { label: "Devam Ediyor", bg: "#eff6ff", color: "#1d4ed8" },
  RESULT_PENDING: { label: "Sonuç Bekliyor", bg: "#fff7ed", color: "#c2410c" },
  ANALYSIS_PENDING: { label: "Analiz Bekliyor", bg: "#fef3c7", color: "#92400e" },
};

// Deneme geçmişi — en yeni en üstte. Karta tıklayınca detay ekranı açılır.
export default function ExamHistoryList({ results, onSelect }) {
  if (results.length === 0) return null;
  const reversed = [...results].sort((a, b) => new Date(b.examDate) - new Date(a.examDate));

  return (
    <div>
      <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Deneme Geçmişim</p>
      <div className="grid gap-3">
        {reversed.map((r) => {
          const statusMeta = STATUS_LABELS[r.status];
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r)}
              className="text-left bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 hover:border-brand/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-fredoka font-bold text-page-navy text-base">{r.examName}</p>
                  <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">
                    {comparisonLabel(r) || EXAM_TYPE_LABELS[r.examType]} · {fmtDate(r.examDate)}
                    {r.entryMode === "LIVE" && " · Canlı"}
                    {r.ranking ? ` · Sıralama: ${r.ranking.toLocaleString("tr-TR")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusMeta && (
                    <span className="font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full" style={{ background: statusMeta.bg, color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                  )}
                  {r.totalNet != null && (
                    <span className="font-fredoka font-bold text-base px-3 py-1 rounded-full bg-brand-light text-brand">
                      {formatNet(r.totalNet)} net
                    </span>
                  )}
                </div>
              </div>
              <p className="font-nunito text-xs text-[#64748b] mt-2">Süre: {fmtDurationMinutes(r.durationSeconds)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
