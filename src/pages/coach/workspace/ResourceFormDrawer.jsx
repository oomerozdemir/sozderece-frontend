import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "../../../utils/axios";
import { RESOURCE_TYPES, RESOURCE_EXAM_TYPES, RESOURCE_SUBJECT_REQUIRED_TYPES, TYPE_META, getSubjectOptions } from "./resourceMeta";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-page-navy transition-colors";

// "+ Kaynak Ekle" / "Düzenle" — ProgramImportPanel.jsx'in sağdan-kayan
// drawer kabuğunu izler (coach workspace'teki tek overlay emsali). Add ve
// edit aynı component'i kullanır (initialData verilirse edit modu).
export default function ResourceFormDrawer({ student, initialData, onClose, onSaved }) {
  const isEdit = !!initialData;
  const [type, setType] = useState(initialData?.type || "BOOK");
  const [examType, setExamType] = useState(initialData?.examType || "TYT");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [publisher, setPublisher] = useState(initialData?.publisher || "");
  const [note, setNote] = useState(initialData?.note || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [duplicateConfirm, setDuplicateConfirm] = useState(false);

  const subjectOptions = useMemo(() => getSubjectOptions(examType, student?.track), [examType, student?.track]);
  const showSubjectField = type !== "MOCK_EXAM";
  const subjectRequired = RESOURCE_SUBJECT_REQUIRED_TYPES.has(type);

  // examType değişince, artık geçerli olmayan bir ders seçiliyse temizle —
  // kullanıcı ders listesi değişmeden önce TYT Matematik seçip sonra AYT'ye
  // geçerse sessizce yanlış dersle kaydedilmesin.
  useEffect(() => {
    if (subject && !subjectOptions.includes(subject)) setSubject("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examType]);

  const requestClose = () => {
    const dirty = title.trim() || publisher.trim() || note.trim() || (isEdit && (
      type !== initialData.type || examType !== initialData.examType || subject !== (initialData.subject || "")
    ));
    if (dirty && !saving) {
      const ok = window.confirm("Kaydedilmemiş değişiklikler kaybolacak, emin misin?");
      if (!ok) return;
    }
    onClose();
  };

  const submit = async (force = false) => {
    if (saving) return;
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return setError("Kaynak adı zorunludur.");
    if (trimmedTitle.length > 150) return setError("Kaynak adı en fazla 150 karakter olabilir.");
    if (showSubjectField && subjectRequired && !subject) return setError("Bu kaynak türü için ders seçimi zorunludur.");

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        type,
        examType,
        subject: showSubjectField ? (subject || null) : null,
        title: trimmedTitle,
        publisher: publisher.trim() || null,
        note: note.trim() || null,
        force,
      };
      const url = isEdit
        ? `/api/coach/students/${student.id}/resources/${initialData.id}`
        : `/api/coach/students/${student.id}/resources`;
      const res = await axios[isEdit ? "patch" : "post"](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      onSaved(res.data.resource, isEdit);
      onClose();
    } catch (err) {
      if (!isEdit && err?.response?.status === 409 && err.response.data?.duplicate) {
        setDuplicateConfirm(true);
      } else {
        setError(err?.response?.data?.message || "Kaynak kaydedilemedi.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={requestClose} />
      <div className="relative w-full sm:w-[420px] h-full bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9] sticky top-0 bg-white z-10">
          <p className="font-fredoka font-bold text-page-navy text-base">{isEdit ? "Kaynağı Düzenle" : "Kaynak Ekle"}</p>
          <button onClick={requestClose} className="text-[#94a3b8] p-1"><FaTimes size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#475569] block mb-1">Kaynak Türü *</label>
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#475569] block mb-1">Sınav *</label>
            <select className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value)}>
              {RESOURCE_EXAM_TYPES.map((et) => <option key={et} value={et}>{et}</option>)}
            </select>
          </div>

          {showSubjectField && (
            <div>
              <label className="text-xs font-bold text-[#475569] block mb-1">
                Ders {subjectRequired ? "*" : "(opsiyonel)"}
              </label>
              <select className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Seçiniz</option>
                {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#475569] block mb-1">Kaynak Adı *</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Orijinal Matematik Soru Bankası" />
          </div>

          <div>
            <label className="text-xs font-bold text-[#475569] block mb-1">Yayınevi</label>
            <input className={inputCls} value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Orijinal Yayınları" />
          </div>

          <div>
            <label className="text-xs font-bold text-[#475569] block mb-1">Koç Notu</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Önce problemler ve temel kavramlar bölümlerinden ilerle." />
          </div>

          {duplicateConfirm && (
            <div className="bg-[#fff7ea] border border-[#fde8c4] rounded-xl p-3 space-y-2">
              <p className="text-xs text-[#7c4a03]">Bu öğrenciye benzer bir kaynak zaten eklenmiş.</p>
              <div className="flex gap-2">
                <button onClick={() => setDuplicateConfirm(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-[#64748b] bg-white border border-[#e2e8f0]">Vazgeç</button>
                <button onClick={() => submit(true)} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-brand-navy disabled:opacity-60">Yine de Ekle</button>
              </div>
            </div>
          )}

          {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

          {!duplicateConfirm && (
            <div className="flex gap-2 pt-1">
              <button onClick={requestClose} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold text-[#64748b] bg-[#f1f5f9] disabled:opacity-60">İptal</button>
              <button onClick={() => submit(false)} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-brand-navy disabled:opacity-60">
                {saving ? "Kaydediliyor…" : isEdit ? "Kaydet" : "Kaynağı Ekle"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
