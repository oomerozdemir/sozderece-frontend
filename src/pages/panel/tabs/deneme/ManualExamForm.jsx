import { useState } from "react";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";
import SubjectNetRows from "./SubjectNetRows";
import { EXAM_TYPE_LABELS, EXAM_TYPE_DEFAULTS, getDefaultSubjects, DIFFICULTY_REASON_OPTIONS } from "./examConfig";
import { validateSubjectRows } from "./examHelpers";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito";

const todayIso = () => new Date().toISOString().slice(0, 10);

// "Geçmiş Deneme Ekle" — timer kullanılmaz, tüm alanlar tek formda. Sonuç
// girişi zorunlu (net gelişim grafiklerine dahil olabilmesi için); hedef/
// süre/öz-analiz opsiyonel.
export default function ManualExamForm({ student, onSubmitted, onCancel }) {
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [branch, setBranch] = useState("");
  const [examDate, setExamDate] = useState(todayIso());
  const [totalQuestions, setTotalQuestions] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [targetNet, setTargetNet] = useState("");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState("");
  const [subjectNets, setSubjectNets] = useState([]);
  const [difficultyReasons, setDifficultyReasons] = useState([]);
  const [didWell, setDidWell] = useState("");
  const [nextImprovement, setNextImprovement] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleReason = (value) =>
    setDifficultyReasons((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const initialSubjects = examType === "BRANS"
    ? (branch ? [{ subject: branch, questionCount: totalQuestions || null }] : [])
    : getDefaultSubjects(examType, student?.track);

  const handleSubmit = async () => {
    if (!examName.trim()) return setError("Deneme adı zorunlu.");
    if (examType === "BRANS" && !branch) return setError("Branş denemesi için bir ders seçmelisin.");
    const rows = subjectNets.filter((r) => r.subject.trim());
    if (rows.length === 0) return setError("En az bir ders sonucu girmelisin.");
    const validation = validateSubjectRows(rows);
    if (!validation.valid) return setError(validation.message);

    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/v1/ogrenci/me/exam-results/manual",
        {
          examName: examName.trim(),
          examType,
          branch: examType === "BRANS" ? branch : null,
          examDate,
          totalQuestions: totalQuestions ? parseInt(totalQuestions) : null,
          durationMinutes: durationMinutes || null,
          targetNet: targetNet || null,
          targetDurationMinutes: targetDurationMinutes || null,
          subjectNets: rows.map((r) => ({ subject: r.subject, questionCount: Number(r.questionCount), correct: Number(r.correct) || 0, wrong: Number(r.wrong) || 0 })),
          difficultyReasons,
          didWell: didWell.trim(),
          nextImprovement: nextImprovement.trim(),
          studentNote: studentNote.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSubmitted(res.data.exam);
    } catch (err) {
      setError(err?.response?.data?.message || "Deneme eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-5">
      <p className="font-fredoka font-bold text-page-navy text-base">Geçmiş Deneme Ekle</p>

      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1">Deneme Adı *</label>
        <input className={inputCls} value={examName} onChange={(e) => setExamName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Tür *</label>
          <select className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value)}>
            {Object.keys(EXAM_TYPE_LABELS).map((t) => <option key={t} value={t}>{EXAM_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Tarih *</label>
          <input className={inputCls} type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
      </div>

      {examType === "BRANS" && (
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Branş *</label>
          <select className={inputCls} value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">Seçiniz</option>
            {EXAM_TYPE_DEFAULTS.BRANS.subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Toplam Soru Sayısı</label>
          <input className={inputCls} type="number" value={totalQuestions} onChange={(e) => setTotalQuestions(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Tamamladığın Süre (dk, varsa)</label>
          <input className={inputCls} type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-[#475569] block mb-2">Ders Bazlı Sonuçlar *</label>
        <SubjectNetRows examType={examType} track={student?.track} initialSubjects={initialSubjects} onChange={setSubjectNets} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#f1f5f9]">
        <div>
          <label className="text-xs text-[#64748b] block mb-1">Hedef Net (varsa)</label>
          <input className={inputCls} type="number" step="0.25" value={targetNet} onChange={(e) => setTargetNet(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#64748b] block mb-1">Hedef Süre (dk, varsa)</label>
          <input className={inputCls} type="number" value={targetDurationMinutes} onChange={(e) => setTargetDurationMinutes(e.target.value)} />
        </div>
      </div>

      <div className="pt-3 border-t border-[#f1f5f9] space-y-3">
        <p className="text-xs font-bold text-[#475569]">Kendi Analizin (opsiyonel)</p>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY_REASON_OPTIONS.map((opt) => {
            const active = difficultyReasons.includes(opt.value);
            return (
              <button key={opt.value} type="button" onClick={() => toggleReason(opt.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-brand text-white border-brand" : "bg-white text-[#64748b] border-[#e2e8f0]"}`}>
                {opt.label}
              </button>
            );
          })}
        </div>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="İyi yaptığım şey" value={didWell} onChange={(e) => setDidWell(e.target.value)} />
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Bir sonraki denemede değiştireceğim şey" value={nextImprovement} onChange={(e) => setNextImprovement(e.target.value)} />
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Kendime not" value={studentNote} onChange={(e) => setStudentNote(e.target.value)} />
      </div>

      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} fullWidth>Vazgeç</Button>
        <Button variant="primary" onClick={handleSubmit} loading={saving} fullWidth>Denemeyi Ekle</Button>
      </div>
    </div>
  );
}
