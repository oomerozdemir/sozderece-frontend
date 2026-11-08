import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";
import { EXAM_TYPE_LABELS } from "./examConfig";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito";

const todayIso = () => new Date().toISOString().slice(0, 10);

// "Deneme Analizi Yap" — net/doğru-yanlış istemez (ManualExamForm'un aksine).
// Öğrenci panelde ya da başka bir yerde çözdüğü bir deneme için sadece
// bilmediği/tekrar etmesi gereken konuları/soruları tek tek ekler; her madde
// sonradan ExamDetail'de ayrı ayrı tiklenebilir bir "tekrar programı" olur.
export default function ExamAnalysisOnlyForm({ onSubmitted, onCancel }) {
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [examDate, setExamDate] = useState(todayIso());
  const [items, setItems] = useState([""]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateItem = (i, value) => setItems((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  const addItem = () => setItems((prev) => [...prev, ""]);
  const removeItem = (i) => setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const handleSubmit = async () => {
    if (!examName.trim()) return setError("Deneme adı zorunlu.");
    const cleanedItems = items.map((v) => v.trim()).filter(Boolean);
    if (cleanedItems.length === 0) return setError("En az bir konu/soru girmelisin.");

    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/v1/ogrenci/me/exam-results/review-only",
        { examName: examName.trim(), examType, examDate, items: cleanedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSubmitted(res.data.exam);
    } catch (err) {
      setError(err?.response?.data?.message || "Analiz programı oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-5">
      <div>
        <p className="font-fredoka font-bold text-page-navy text-base">Deneme Analizi Yap</p>
        <p className="font-nunito text-xs text-[#64748b] mt-1">
          Net girmene gerek yok — panelde ya da başka bir yerde çözdüğün deneme için bilmediğin/tekrar etmen gereken konuları tek tek ekle, kendine bir tekrar programı oluştur.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold text-[#475569] block mb-1">Deneme Adı *</label>
        <input className={inputCls} value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Örn: 3D Yayınları TYT Deneme 5" />
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

      <div>
        <label className="text-xs font-bold text-[#475569] block mb-2">Bilmediğim / Tekrar Etmem Gereken Konular *</label>
        <div className="flex flex-col gap-2">
          {items.map((value, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputCls}
                value={value}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder="Örn: Üslü sayılarda bileşke işlemler"
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="flex-shrink-0 text-[#94a3b8] hover:text-[#dc2626] p-2">
                  <FaTimes size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 inline-flex items-center gap-1.5 font-nunito font-bold text-xs text-brand hover:underline"
        >
          <FaPlus size={9} /> Konu/Soru Ekle
        </button>
      </div>

      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} fullWidth>Vazgeç</Button>
        <Button variant="primary" onClick={handleSubmit} loading={saving} fullWidth>Analiz Programını Başlat</Button>
      </div>
    </div>
  );
}
