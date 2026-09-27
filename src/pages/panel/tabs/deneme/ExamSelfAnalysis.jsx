import { useState } from "react";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";
import { DIFFICULTY_REASON_OPTIONS } from "./examConfig";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito resize-none";

// LIVE akışının son adımı: öz analiz. Sistem öğrencinin yerine yorum
// üretmez — bu ekran yalnızca öğrencinin kendi gözlemini kaydetmesi için.
export default function ExamSelfAnalysis({ exam, onSubmitted }) {
  const [difficultyReasons, setDifficultyReasons] = useState([]);
  const [didWell, setDidWell] = useState("");
  const [nextImprovement, setNextImprovement] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleReason = (value) =>
    setDifficultyReasons((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/v1/ogrenci/me/exam-results/${exam.id}/analysis`,
        { difficultyReasons, didWell: didWell.trim(), nextImprovement: nextImprovement.trim(), studentNote: studentNote.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSubmitted(res.data.exam);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-5">
      <div>
        <p className="font-fredoka font-bold text-page-navy text-base">Denemeni Analiz Et</p>
        <p className="font-nunito text-xs text-[#64748b]">Kendi denemeni analiz etmeyi öğrenmenin en önemli adımı bu.</p>
      </div>

      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1.5">Bu denemede seni en çok ne zorladı?</label>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY_REASON_OPTIONS.map((opt) => {
            const active = difficultyReasons.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleReason(opt.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  active ? "bg-brand text-white border-brand" : "bg-white text-[#64748b] border-[#e2e8f0]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1">Bu denemede iyi yaptığım şey</label>
        <textarea className={inputCls} rows={2} value={didWell} onChange={(e) => setDidWell(e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1">Bir sonraki denemede değiştireceğim şey</label>
        <textarea className={inputCls} rows={2} value={nextImprovement} onChange={(e) => setNextImprovement(e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1">Kendime not</label>
        <textarea className={inputCls} rows={2} value={studentNote} onChange={(e) => setStudentNote(e.target.value)} />
      </div>

      <Button variant="primary" fullWidth onClick={handleSubmit} loading={saving}>Analizi Tamamla</Button>
    </div>
  );
}
