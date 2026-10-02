import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { netDivisor, computeSubjectNet, computeBlank, subjectRowError, formatNet } from "./examHelpers";

// min-w-0: grid hücrelerinin varsayılan min-width:auto'su (number input'ların
// intrinsic içerik genişliği) sütunu 60/70px'in ötesine genişletip sağdaki
// tüm sütunları kaydırıyordu — w-full + min-w-0 + box-border bu grid'in her
// hücresini kendi sütun genişliğine kilitler.
const cellCls = "w-full min-w-0 box-border py-2 px-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito";
const readOnlyCellCls = "w-full min-w-0 box-border py-2 px-2.5 rounded-lg text-sm bg-[#f8fafc] text-[#475569] font-nunito text-center tabular-nums";

// Ders bazlı Doğru|Yanlış girişi — hem canlı denemenin sonuç adımında
// (ExamResultForm) hem geçmiş deneme eklerken (ManualExamForm) kullanılan
// PAYLAŞILAN component, mantık iki yerde tekrar edilmiyor. Öğrenci yalnızca
// Doğru/Yanlış (ve "Ders Ekle" ile eklenen özel bir ders için Soru) girer —
// Boş ve Net her zaman buradan türetilir, hiçbir zaman ayrı bir input değildir.
// Net/Boş yalnızca client-side ÖNİZLEME için burada hesaplanır — otorite her
// zaman sunucuda (bkz. utils/examCalculations.js).
export default function SubjectNetRows({ examType, track, initialSubjects, onChange }) {
  const [rows, setRows] = useState(() =>
    (initialSubjects || []).map((s) => ({ subject: s.subject, questionCount: s.questionCount ?? "", correct: "", wrong: "", isCustom: false }))
  );

  useEffect(() => {
    onChange(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const updateRow = (i, field, value) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((prev) => [...prev, { subject: "", questionCount: "", correct: "", wrong: "", isCustom: true }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const divisor = netDivisor(examType, track);

  let totalCorrect = 0, totalWrong = 0, totalBlank = 0, totalNet = 0;
  rows.forEach((r) => {
    const correct = Number(r.correct) || 0;
    const wrong = Number(r.wrong) || 0;
    totalCorrect += correct;
    totalWrong += wrong;
    totalBlank += computeBlank(r.questionCount, correct, wrong);
    totalNet += computeSubjectNet(correct, wrong, divisor);
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1.4fr_70px_60px_60px_60px_70px_auto] gap-1.5 items-center max-[640px]:hidden">
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Ders</span>
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Soru</span>
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Doğru</span>
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Yanlış</span>
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Boş</span>
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Net</span>
        <span />
      </div>
      {rows.map((r, i) => {
        const correct = Number(r.correct) || 0;
        const wrong = Number(r.wrong) || 0;
        const hasEntry = r.correct !== "" || r.wrong !== "";
        const error = hasEntry || r.isCustom ? subjectRowError(r) : null;
        const blank = computeBlank(r.questionCount, correct, wrong);
        const net = hasEntry ? computeSubjectNet(correct, wrong, divisor) : null;
        return (
          <div key={i}>
            <div className={`grid grid-cols-[1.4fr_70px_60px_60px_60px_70px_auto] gap-1.5 items-center ${error ? "bg-[#fef2f2] rounded-lg p-1" : ""}`}>
              <input className={cellCls} placeholder="Ders" value={r.subject} onChange={(e) => updateRow(i, "subject", e.target.value)} />
              {r.isCustom ? (
                <input className={cellCls} type="number" min="0" placeholder="—" value={r.questionCount} onChange={(e) => updateRow(i, "questionCount", e.target.value)} />
              ) : (
                <span className={readOnlyCellCls}>{r.questionCount !== "" ? r.questionCount : "—"}</span>
              )}
              <input className={cellCls} type="number" min="0" value={r.correct} onChange={(e) => updateRow(i, "correct", e.target.value)} />
              <input className={cellCls} type="number" min="0" value={r.wrong} onChange={(e) => updateRow(i, "wrong", e.target.value)} />
              <span className={readOnlyCellCls}>{r.questionCount !== "" ? blank : "—"}</span>
              <span className="w-full min-w-0 box-border text-sm font-bold text-page-navy text-center tabular-nums">{net != null ? formatNet(net) : "—"}</span>
              <button onClick={() => removeRow(i)} className="text-[#ef4444] p-1.5 justify-self-center"><FaTrash size={11} /></button>
            </div>
            {error && <p className="text-[10px] font-bold text-[#dc2626] mt-0.5">⚠ {r.subject ? `${r.subject}: ` : ""}{error}</p>}
          </div>
        );
      })}
      <button onClick={addRow} className="flex items-center gap-1.5 text-xs font-bold text-page-navy"><FaPlus size={10} /> Ders Ekle</button>

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 mt-1 border-t border-[#f1f5f9] text-xs font-nunito">
          <span className="font-bold text-page-navy">Toplam:</span>
          <span className="text-[#64748b]">Doğru: <strong className="text-page-navy tabular-nums">{totalCorrect}</strong></span>
          <span className="text-[#64748b]">Yanlış: <strong className="text-page-navy tabular-nums">{totalWrong}</strong></span>
          <span className="text-[#64748b]">Boş: <strong className="text-page-navy tabular-nums">{totalBlank}</strong></span>
          <span className="text-[#64748b]">Net: <strong className="text-page-navy tabular-nums">{formatNet(totalNet)}</strong></span>
        </div>
      )}
    </div>
  );
}
