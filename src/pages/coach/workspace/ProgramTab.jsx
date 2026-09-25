import { useEffect, useMemo, useState } from "react";
import { FaPen, FaTrash, FaCheck } from "react-icons/fa";
import axios from "../../../utils/axios";
import ProgramImportPanel from "./ProgramImportPanel";

const DAY_OPTIONS = [
  { value: 0, label: "Pazartesi" },
  { value: 1, label: "Salı" },
  { value: 2, label: "Çarşamba" },
  { value: 3, label: "Perşembe" },
  { value: 4, label: "Cuma" },
  { value: 5, label: "Cumartesi" },
  { value: 6, label: "Pazar" },
];

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-page-navy transition-colors";

const toMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};
const toISO = (d) => d.toISOString().slice(0, 10);

const isBlankRow = (r) => !r.subject?.trim() && !r.topic?.trim() && !String(r.durationMin ?? "").trim();
const isIncompleteRow = (r) => !isBlankRow(r) && (!r.subject?.trim() || r.dayOfWeek === null || r.dayOfWeek === undefined);

// Program sekmesi — koçun haftalık program hazırladığı çalışma masası.
// Mevcut backend endpoint'lerine (GET/POST .../study-plan, POST .../parse-image)
// ve payload şekline hiç dokunulmuyor; bu dosya yalnızca StudentPanelEditor.jsx'in
// "program" sekmesindeki mantığın gün-gruplu/drawer'lı yeniden sunumu.
export default function ProgramTab({ student, onDirtyChange }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [planTitle, setPlanTitle] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgError, setMsgError] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [importBanner, setImportBanner] = useState(0); // AI'dan aktarılan satır sayısı, bilgilendirme şeridi için

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const loadPlan = () => {
    setLoading(true);
    axios
      .get(`/api/coach/students/${student.id}/study-plan`, { ...authHeaders, params: { weekStart: toISO(weekStart) } })
      .then((res) => {
        const plan = res.data?.plan;
        if (plan) {
          setPlanTitle(plan.title || "");
          setRows(plan.items.map((it) => ({ dayOfWeek: it.dayOfWeek, subject: it.subject, topic: it.topic || "", durationMin: it.durationMin || "" })));
        } else {
          setPlanTitle("");
          setRows([]);
        }
        setDirty(false);
        setImportBanner(0);
        setEditingIdx(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, student.id]);

  const goToWeek = (delta) => {
    if (dirty) {
      const ok = window.confirm("Kaydedilmemiş değişiklikler var, hafta değiştirirsen kaybolacak. Devam edilsin mi?");
      if (!ok) return;
    }
    setWeekStart((w) => {
      const n = new Date(w);
      n.setDate(n.getDate() + delta * 7);
      return n;
    });
  };

  const updateRow = (i, field, value) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    setDirty(true);
  };
  const removeRow = (i) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setEditingIdx(null);
    setDirty(true);
  };
  const addRowForDay = (dayOfWeek) => {
    setRows((prev) => {
      const next = [...prev, { dayOfWeek, subject: "", topic: "", durationMin: "" }];
      setEditingIdx(next.length - 1);
      return next;
    });
    setDirty(true);
  };

  // Guarantee #1 (plan §11): AI satırları mevcut satırlara EKLENİR, hiçbir
  // mevcut satır silinmez/üzerine yazılmaz, olası duplicate sessizce
  // birleştirilmez/silinmez.
  const handleAiImport = (importedRows) => {
    setRows((prev) => [...prev, ...importedRows]);
    setImportBanner(importedRows.length);
    setDirty(true);
  };

  const savePlan = async () => {
    const incompleteCount = rows.filter(isIncompleteRow).length;
    if (incompleteCount > 0) {
      setMsgError(true);
      setMsg(`${incompleteCount} satırda eksik bilgi var — tamamla ya da satırı sil.`);
      return;
    }
    const validRows = rows.filter((r) => !isBlankRow(r));
    if (validRows.length === 0) {
      setMsgError(true);
      setMsg("En az bir satıra ders girmelisin.");
      return;
    }
    setSaving(true);
    setMsg("");
    setMsgError(false);
    try {
      await axios.post(`/api/coach/students/${student.id}/study-plan`, { weekStart: toISO(weekStart), title: planTitle, items: validRows }, authHeaders);
      setMsg("Program kaydedildi ✓");
      setDirty(false);
      setImportBanner(0);
    } catch {
      setMsgError(true);
      setMsg("Kaydedilemedi, tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  const indexedRows = rows.map((r, idx) => ({ ...r, _idx: idx }));
  const undatedRows = indexedRows.filter((r) => r.dayOfWeek === null || r.dayOfWeek === undefined);

  const renderRow = (r) => {
    const incomplete = isIncompleteRow(r);
    if (editingIdx === r._idx) {
      return (
        <div key={r._idx} className="grid grid-cols-[100px_1fr_1fr_70px_auto] gap-1.5 items-center max-[560px]:grid-cols-2 py-1.5">
          <select className={inputCls} value={r.dayOfWeek === null || r.dayOfWeek === undefined ? "" : r.dayOfWeek} onChange={(e) => updateRow(r._idx, "dayOfWeek", e.target.value === "" ? null : parseInt(e.target.value))}>
            <option value="" disabled>— seç —</option>
            {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <input className={inputCls} placeholder="Ders (Matematik)" value={r.subject} onChange={(e) => updateRow(r._idx, "subject", e.target.value)} />
          <input className={inputCls} placeholder="Nokta atışı görev" value={r.topic} onChange={(e) => updateRow(r._idx, "topic", e.target.value)} />
          <input className={inputCls} type="number" placeholder="dk" value={r.durationMin} onChange={(e) => updateRow(r._idx, "durationMin", e.target.value)} />
          <div className="flex gap-1">
            <button onClick={() => setEditingIdx(null)} className="text-[#059669] p-2"><FaCheck size={12} /></button>
            <button onClick={() => removeRow(r._idx)} className="text-[#ef4444] p-2"><FaTrash size={12} /></button>
          </div>
        </div>
      );
    }
    return (
      <div key={r._idx} className={`flex items-center justify-between gap-2 py-2 px-2.5 rounded-lg cursor-pointer hover:bg-[#f8fafc] ${incomplete ? "bg-[#fef2f2]" : ""}`} onClick={() => setEditingIdx(r._idx)}>
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-[#0f172a] truncate">{r.subject || <span className="italic text-[#94a3b8]">(ders girilmemiş)</span>}{r.durationMin ? `, ${r.durationMin} dk` : ""}</p>
          {r.topic && <p className="text-xs text-[#64748b] truncate">— {r.topic}</p>}
          {incomplete && <span className="text-[10px] font-bold text-[#dc2626]">⚠ eksik</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); setEditingIdx(r._idx); }} className="text-[#94a3b8] p-1.5 flex-shrink-0"><FaPen size={11} /></button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap bg-white rounded-2xl border border-[#f1f5f9] p-4">
        <div className="flex items-center gap-2">
          <button onClick={() => goToWeek(-1)} className="text-xs font-bold text-page-navy px-2 py-1">‹ Önceki Hafta</button>
          <span className="text-xs font-bold text-[#475569]">Hafta: {toISO(weekStart)}</span>
          <button onClick={() => goToWeek(1)} className="text-xs font-bold text-page-navy px-2 py-1">Sonraki Hafta ›</button>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="text-xs font-black text-white bg-brand-navy px-4 py-2.5 rounded-full">
          ✨ AI ile Program Aktar
        </button>
      </div>

      <input className={inputCls} placeholder="Program başlığı (opsiyonel, ör. 12. Hafta)" value={planTitle} onChange={(e) => { setPlanTitle(e.target.value); setDirty(true); }} />

      {importBanner > 0 && (
        <p className="text-xs font-bold text-[#059669] bg-[#ecfdf5] rounded-lg px-3.5 py-2.5">
          ✓ {importBanner} görev AI ile aktarıldı. Kaydetmeden önce programı kontrol et.
        </p>
      )}

      {loading ? (
        <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] divide-y divide-[#f1f5f9]">
          {undatedRows.length > 0 && (
            <div className="p-4">
              <p className="text-xs font-black text-[#dc2626] uppercase mb-2">Gün Belirsiz · {undatedRows.length} görev</p>
              <div className="space-y-1">{undatedRows.map(renderRow)}</div>
            </div>
          )}
          {DAY_OPTIONS.map((day) => {
            const dayRows = indexedRows.filter((r) => r.dayOfWeek === day.value);
            return (
              <div key={day.value} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black text-page-navy uppercase">{day.label} · {dayRows.length} görev</p>
                  <button onClick={() => addRowForDay(day.value)} className="text-xs font-bold text-page-navy">+ Görev Ekle</button>
                </div>
                {dayRows.length === 0 ? (
                  <p className="text-xs text-[#94a3b8]">Henüz görev yok.</p>
                ) : (
                  <div className="space-y-1">{dayRows.map(renderRow)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {msg && <p className={`text-xs font-bold ${msgError ? "text-[#dc2626]" : "text-[#059669]"}`}>{msg}</p>}
      <button onClick={savePlan} disabled={saving} className="w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-black disabled:opacity-60">
        {saving ? "Kaydediliyor…" : "Programı Kaydet"}
      </button>

      {drawerOpen && (
        <ProgramImportPanel studentId={student.id} onClose={() => setDrawerOpen(false)} onImport={handleAiImport} />
      )}
    </div>
  );
}
