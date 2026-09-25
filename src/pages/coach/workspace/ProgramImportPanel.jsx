import { useRef, useState } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import axios from "../../../utils/axios";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const inputClsSmall =
  "w-full py-2 px-2.5 border border-[#e2e8f0] rounded-lg text-xs bg-white outline-none focus:border-page-navy transition-colors";

// AI ile Program Aktarma drawer'ı — kısa süreli, tek amaçlı bir dosya
// yükleme/önizleme aksiyonu. KRİTİK: bu component HİÇBİR ZAMAN backend'e
// program kaydetmiyor (POST .../study-plan burada hiç çağrılmıyor) —
// yalnızca parse-image'i çağırıp satırları önizler, "Programa Aktar →"
// tıklanınca onImport(rows) ile satırları ProgramTab'a devreder. DB'ye
// yazan tek yer ProgramTab'daki mevcut "Programı Kaydet" (değişmedi).
export default function ProgramImportPanel({ studentId, onClose, onImport }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedRows, setParsedRows] = useState(null); // null = henüz sonuç yok
  const [reviewStatus, setReviewStatus] = useState(null);

  const hasUnconfirmedResult = Array.isArray(parsedRows) && parsedRows.length > 0;

  const requestClose = () => {
    if (hasUnconfirmedResult) {
      const ok = window.confirm("Aktarılmamış satırlar kaybolacak, emin misin?");
      if (!ok) return;
    }
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    setParsedRows(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(
        `/api/coach/students/${studentId}/study-plan/parse-image`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rows = (res.data?.rows || []).map((r) => ({
        dayOfWeek: r.dayOfWeek,
        subject: r.subject || "",
        topic: r.topic || "",
        durationMin: r.durationMin != null ? String(r.durationMin) : "",
      }));
      setParsedRows(rows);
      setReviewStatus(res.data?.reviewStatus || null);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Görsel okunamadı, tekrar dene.");
    } finally {
      setUploading(false);
    }
  };

  const updateParsedRow = (i, field, value) =>
    setParsedRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const removeParsedRow = (i) => setParsedRows((prev) => prev.filter((_, idx) => idx !== i));
  const addParsedRow = () => setParsedRows((prev) => [...(prev || []), { dayOfWeek: 0, subject: "", topic: "", durationMin: "" }]);

  const transferToProgram = () => {
    onImport(parsedRows);
    setParsedRows(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={requestClose} />
      <div className="relative w-full sm:w-[420px] h-full bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9] sticky top-0 bg-white z-10">
          <p className="font-fredoka font-bold text-page-navy text-base">✨ AI ile Program Aktar</p>
          <button onClick={requestClose} className="text-[#94a3b8] p-1"><FaTimes size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 rounded-xl text-sm font-black text-white bg-brand-navy disabled:opacity-60"
          >
            {uploading ? "Okunuyor…" : "Görsel / PDF Yükle"}
          </button>

          {errorMsg && <p className="text-xs font-bold text-[#dc2626]">{errorMsg}</p>}

          {parsedRows && (
            <>
              <p className="text-xs font-bold text-[#059669]">
                ✅ {parsedRows.length} görev bulundu{reviewStatus === "needs_review" ? " — bazı satırlarda eksik bilgi var" : ""}
              </p>
              <div className="space-y-2">
                {parsedRows.map((r, i) => {
                  const incomplete = !r.subject?.trim() || r.dayOfWeek === null || r.dayOfWeek === undefined;
                  return (
                    <div key={i} className={`rounded-lg border p-2.5 space-y-1.5 ${incomplete ? "border-[#fca5a5] bg-[#fef2f2]" : "border-[#e2e8f0]"}`}>
                      <div className="flex gap-1.5">
                        <select
                          className={`${inputClsSmall} w-20 flex-shrink-0`}
                          value={r.dayOfWeek === null || r.dayOfWeek === undefined ? "" : r.dayOfWeek}
                          onChange={(e) => updateParsedRow(i, "dayOfWeek", e.target.value === "" ? null : parseInt(e.target.value))}
                        >
                          <option value="" disabled>Gün</option>
                          {DAY_LABELS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                        </select>
                        <input className={inputClsSmall} placeholder="Ders" value={r.subject} onChange={(e) => updateParsedRow(i, "subject", e.target.value)} />
                        <button onClick={() => removeParsedRow(i)} className="text-[#ef4444] p-1 flex-shrink-0"><FaTrash size={11} /></button>
                      </div>
                      <input className={inputClsSmall} placeholder="Detay (opsiyonel)" value={r.topic} onChange={(e) => updateParsedRow(i, "topic", e.target.value)} />
                      <input className={`${inputClsSmall} w-20`} type="number" placeholder="dk" value={r.durationMin} onChange={(e) => updateParsedRow(i, "durationMin", e.target.value)} />
                      {incomplete && <p className="text-[10px] font-bold text-[#dc2626]">⚠ eksik bilgi</p>}
                    </div>
                  );
                })}
              </div>
              <button onClick={addParsedRow} className="text-xs font-bold text-page-navy">+ Görev Ekle</button>

              <button
                onClick={transferToProgram}
                className="w-full py-3 rounded-xl text-sm font-black text-white bg-brand-navy"
              >
                Programa Aktar →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
