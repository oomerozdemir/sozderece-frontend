import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { netDivisor, computeSubjectNet, formatNet } from "./examHelpers";

const cellCls = "py-2 px-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito";

// Ders bazlı Doğru|Yanlış|Boş girişi — hem canlı denemenin sonuç adımında
// (ExamResultForm) hem geçmiş deneme eklerken (ManualExamForm) kullanılan
// PAYLAŞILAN component, mantık iki yerde tekrar edilmiyor. Net, yalnızca
// client-side ÖNİZLEME için burada hesaplanır — otorite her zaman sunucuda.
export default function SubjectNetRows({ examType, track, initialSubjects, onChange }) {
  const [rows, setRows] = useState(() =>
    (initialSubjects || []).map((s) => ({ subject: s.subject, questionCount: s.questionCount ?? "", correct: "", wrong: "", blank: "" }))
  );

  useEffect(() => {
    onChange(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const updateRow = (i, field, value) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((prev) => [...prev, { subject: "", questionCount: "", correct: "", wrong: "", blank: "" }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const divisor = netDivisor(examType, track);

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
        const blank = Number(r.blank) || 0;
        const qc = r.questionCount !== "" ? Number(r.questionCount) : null;
        const mismatch = qc != null && correct + wrong + blank !== qc && (r.correct !== "" || r.wrong !== "" || r.blank !== "");
        const net = r.correct !== "" || r.wrong !== "" ? computeSubjectNet(correct, wrong, divisor) : null;
        return (
          <div key={i}>
            <div className={`grid grid-cols-[1.4fr_70px_60px_60px_60px_70px_auto] gap-1.5 items-center ${mismatch ? "bg-[#fef2f2] rounded-lg p-1" : ""}`}>
              <input className={cellCls} placeholder="Ders" value={r.subject} onChange={(e) => updateRow(i, "subject", e.target.value)} />
              <input className={cellCls} type="number" placeholder="—" value={r.questionCount} onChange={(e) => updateRow(i, "questionCount", e.target.value)} />
              <input className={cellCls} type="number" value={r.correct} onChange={(e) => updateRow(i, "correct", e.target.value)} />
              <input className={cellCls} type="number" value={r.wrong} onChange={(e) => updateRow(i, "wrong", e.target.value)} />
              <input className={cellCls} type="number" value={r.blank} onChange={(e) => updateRow(i, "blank", e.target.value)} />
              <span className="text-sm font-bold text-page-navy text-center tabular-nums">{net != null ? formatNet(net) : "—"}</span>
              <button onClick={() => removeRow(i)} className="text-[#ef4444] p-1.5 justify-self-center"><FaTrash size={11} /></button>
            </div>
            {mismatch && <p className="text-[10px] font-bold text-[#dc2626] mt-0.5">⚠ Doğru+Yanlış+Boş, soru sayısıyla uyuşmuyor</p>}
          </div>
        );
      })}
      <button onClick={addRow} className="flex items-center gap-1.5 text-xs font-bold text-page-navy"><FaPlus size={10} /> Ders Ekle</button>
    </div>
  );
}
