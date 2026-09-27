import Button from "../../../../components/ui/Button";
import { EXAM_TYPE_LABELS, comparisonKey } from "./examConfig";
import { formatNet, formatMetric, fmtDurationMinutes } from "./examHelpers";

// Deneme tamamlandı özeti. Karşılaştırma YALNIZCA aynı comparisonKey'e
// sahip (aynı sınav türü, BRANS'ta aynı ders) önceki bir deneme varsa
// yapılır — TYT'yi AYT ile ya da farklı branşları birbiriyle asla
// karıştırmaz.
export default function ExamSummary({ exam, allResults, onDone }) {
  const key = comparisonKey(exam);
  const comparable = allResults
    .filter((r) => r.id !== exam.id && comparisonKey(r) === key && new Date(r.examDate) < new Date(exam.examDate))
    .sort((a, b) => new Date(b.examDate) - new Date(a.examDate))[0];

  const netDelta = comparable && exam.totalNet != null && comparable.totalNet != null ? exam.totalNet - comparable.totalNet : null;
  const durationDelta = comparable && exam.durationSeconds != null && comparable.durationSeconds != null
    ? Math.round((exam.durationSeconds - comparable.durationSeconds) / 60)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-5">
      <div className="text-center">
        <p className="font-nunito text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Deneme Sonucun</p>
        <p className="font-fredoka font-bold text-page-navy" style={{ fontSize: "clamp(32px,6vw,44px)" }}>{formatNet(exam.totalNet)} <span className="text-lg">net</span></p>
        {exam.targetNet != null && <p className="font-nunito text-xs text-[#64748b]">Hedef: {exam.targetNet} net</p>}

        <p className="font-fredoka font-bold text-page-navy mt-4" style={{ fontSize: "clamp(20px,4vw,28px)" }}>{fmtDurationMinutes(exam.durationSeconds)}</p>
        {exam.targetDurationMinutes != null && <p className="font-nunito text-xs text-[#64748b]">Hedef: {exam.targetDurationMinutes} dk</p>}
      </div>

      {comparable && (
        <div className="bg-[#f8fafc] rounded-xl p-4">
          <p className="font-nunito font-bold text-xs text-[#475569] mb-2">Önceki denemene göre ({EXAM_TYPE_LABELS[exam.examType] || exam.examType})</p>
          <div className="flex gap-4">
            {netDelta != null && (
              <p className={`font-fredoka font-bold text-sm ${netDelta >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}>
                {netDelta >= 0 ? "+" : ""}{formatNet(netDelta)} net
              </p>
            )}
            {durationDelta != null && (
              <p className={`font-fredoka font-bold text-sm ${durationDelta <= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}>
                {durationDelta >= 0 ? "+" : ""}{durationDelta} dk
              </p>
            )}
          </div>
        </div>
      )}

      {Array.isArray(exam.subjectNets) && exam.subjectNets.length > 0 && (
        <div>
          <p className="font-nunito font-bold text-xs text-[#475569] mb-2">Ders Bazlı Sonuçlar</p>
          <div className="flex flex-wrap gap-2">
            {exam.subjectNets.map((s, i) => (
              <span key={i} className="font-nunito text-xs font-semibold text-[#334155] bg-[#f8fafc] px-2.5 py-1 rounded-full">
                {s.subject}: <strong className="text-page-navy">{formatMetric(s.net)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {exam.nextImprovement && (
        <div className="bg-brand-light/50 rounded-xl p-4">
          <p className="font-nunito font-bold text-xs text-brand mb-1">Bir sonraki denemede:</p>
          <p className="font-nunito text-sm text-page-navy">{exam.nextImprovement}</p>
        </div>
      )}

      <Button variant="primary" fullWidth onClick={onDone}>Tamam</Button>
    </div>
  );
}
