import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import { EXAM_TYPE_LABELS, EXAM_TYPE_DEFAULTS, defaultTotalQuestions, FOCUS_AREA_OPTIONS } from "./examConfig";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito";

// Deneme öncesi hedef formu — "Denemeyi Başlat" öncesi son adım. Data-driven:
// examType/track'e göre varsayılan toplam soru sayısını önerir, kullanıcı
// değiştirebilir.
export default function ExamSetupForm({ student, defaultExamType, onSubmit, onCancel, submitting }) {
  const track = student?.track || "";
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState(defaultExamType || "TYT");
  const [branch, setBranch] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [targetNet, setTargetNet] = useState("");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const suggested = defaultTotalQuestions(examType, track);
    if (suggested) setTotalQuestions(String(suggested));
  }, [examType, track]);

  const toggleFocusArea = (value) =>
    setFocusAreas((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const handleSubmit = () => {
    if (!examName.trim()) {
      setError("Deneme adı zorunlu.");
      return;
    }
    if (examType === "BRANS" && !branch) {
      setError("Branş denemesi için bir ders seçmelisin.");
      return;
    }
    setError("");
    onSubmit({
      examName: examName.trim(),
      examType,
      branch: examType === "BRANS" ? branch : null,
      totalQuestions: totalQuestions ? parseInt(totalQuestions) : null,
      targetNet: targetNet ? parseFloat(targetNet) : null,
      targetDurationMinutes: targetDurationMinutes ? parseInt(targetDurationMinutes) : null,
      focusAreas,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1">Deneme Adı *</label>
        <input className={inputCls} placeholder="ör. 3D Yayınları TYT Deneme 4" value={examName} onChange={(e) => setExamName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Deneme Türü *</label>
          <select className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value)}>
            {Object.keys(EXAM_TYPE_LABELS).map((t) => (
              <option key={t} value={t}>{EXAM_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Toplam Soru Sayısı</label>
          <input className={inputCls} type="number" min="1" value={totalQuestions} onChange={(e) => setTotalQuestions(e.target.value)} />
        </div>
      </div>

      {examType === "BRANS" && (
        <div>
          <label className="text-xs font-bold text-[#475569] block mb-1">Branş *</label>
          <select className={inputCls} value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">Seçiniz</option>
            {EXAM_TYPE_DEFAULTS.BRANS.subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <div className="pt-3 border-t border-[#f1f5f9]">
        <p className="text-xs font-bold text-[#475569] mb-2">Hedefler (opsiyonel)</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-[#64748b] block mb-1">Hedef Net</label>
            <input className={inputCls} type="number" step="0.25" value={targetNet} onChange={(e) => setTargetNet(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#64748b] block mb-1">Hedef Süre (dk)</label>
            <input className={inputCls} type="number" value={targetDurationMinutes} onChange={(e) => setTargetDurationMinutes(e.target.value)} />
          </div>
        </div>
        <label className="text-xs text-[#64748b] block mb-1.5">Bu denemede özellikle neye dikkat edeceksin?</label>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_AREA_OPTIONS.map((opt) => {
            const active = focusAreas.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleFocusArea(opt.value)}
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

      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} fullWidth>Vazgeç</Button>
        <Button variant="primary" onClick={handleSubmit} loading={submitting} fullWidth>Denemeyi Başlat</Button>
      </div>
    </div>
  );
}
