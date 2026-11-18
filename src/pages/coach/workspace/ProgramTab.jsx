import { useEffect, useMemo, useRef, useState } from "react";
import { FaPen, FaTrash, FaCheck } from "react-icons/fa";
import axios from "../../../utils/axios";
import ProgramImportPanel from "./ProgramImportPanel";
import usePanelAccess from "./PanelAccessContext";
import DayColumn from "./program/DayColumn";

const DAY_OPTIONS = [
  { value: 0, label: "Pazartesi" },
  { value: 1, label: "Salı" },
  { value: 2, label: "Çarşamba" },
  { value: 3, label: "Perşembe" },
  { value: 4, label: "Cuma" },
  { value: 5, label: "Cumartesi" },
  { value: 6, label: "Pazar" },
];
const DAY_LABELS_SHORT = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-page-navy transition-colors";

const toMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};
// d.toISOString() UTC'ye çevirir — İstanbul (+3) yerel gece yarısı bir
// önceki güne kayar, backend'deki toMondayStart o günü PAZAR sanıp bir
// önceki haftanın pazartesine yuvarlıyordu (bkz. istanbulTime.js). Koç
// kaydettiği programı KENDİ panelinde doğru görüyordu çünkü GET'i de aynı
// kaymış tarihle çağırıyordu — ama öğrenci panelinin kendi toISO'su
// (panel/tabs/program/programHelpers.js) zaten doğru hafta pazartesini
// gönderdiği için öğrenci "o hafta" hiçbir program bulamıyordu. Öğrenci
// panelindekiyle BİREBİR aynı, yerel takvim bileşenlerinden string kurma
// yöntemine geçildi.
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const isBlankRow = (r) => !r.subject?.trim() && !r.topic?.trim() && !String(r.durationMin ?? "").trim();
const isIncompleteRow = (r) => !isBlankRow(r) && (!r.subject?.trim() || r.dayOfWeek === null || r.dayOfWeek === undefined);

// Program sekmesi — koçun haftalık program hazırladığı çalışma masası.
// Mevcut backend endpoint'lerine (GET/POST .../study-plan, POST .../parse-image)
// ve payload şekline hiç dokunulmuyor; bu dosya yalnızca StudentPanelEditor.jsx'in
// "program" sekmesindeki mantığın gün-gruplu/drawer'lı yeniden sunumu.
export default function ProgramTab({ student, onDirtyChange }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const { apiPrefix, canImportProgramImage } = usePanelAccess();

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
  const columnRefs = useRef({});
  const scrollToDay = (dayValue) => {
    const el = columnRefs.current[dayValue];
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const loadPlan = () => {
    setLoading(true);
    axios
      .get(`/api/${apiPrefix}/students/${student.id}/study-plan`, { ...authHeaders, params: { weekStart: toISO(weekStart) } })
      .then((res) => {
        const plan = res.data?.plan;
        if (plan) {
          setPlanTitle(plan.title || "");
          setRows(plan.items.map((it) => ({ id: it.id, dayOfWeek: it.dayOfWeek, subject: it.subject, topic: it.topic || "", durationMin: it.durationMin || "" })));
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
      await axios.post(`/api/${apiPrefix}/students/${student.id}/study-plan`, { weekStart: toISO(weekStart), title: planTitle, items: validRows }, authHeaders);
      setMsg("Program kaydedildi ✓");
      setDirty(false);
      setImportBanner(0);
    } catch (err) {
      setMsgError(true);
      setMsg(err?.response?.data?.message || "Kaydedilemedi, tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  const indexedRows = rows.map((r, idx) => ({ ...r, _idx: idx }));
  const undatedRows = indexedRows.filter((r) => r.dayOfWeek === null || r.dayOfWeek === undefined);

  // Kolonlar artık dar (220-260px) olduğu için düzenleme formu YATAY 5
  // sütunlu ızgaradan DİKEY yığına döndü — mantık (updateRow/removeRow/
  // editingIdx) AYNEN korunuyor, sadece yerleşim kompakt kolona uyarlandı.
  // Gün seçici KORUNDU: koç bir görevi düzenlerken başka bir güne taşıyabilsin
  // diye (drag&drop V1 kapsamında değil, bu tek alternatif yol).
  const renderRow = (r) => {
    const incomplete = isIncompleteRow(r);
    if (editingIdx === r._idx) {
      return (
        <div key={r._idx} className="flex flex-col gap-1.5 p-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
          <select className={inputCls} value={r.dayOfWeek === null || r.dayOfWeek === undefined ? "" : r.dayOfWeek} onChange={(e) => updateRow(r._idx, "dayOfWeek", e.target.value === "" ? null : parseInt(e.target.value))}>
            <option value="" disabled>— seç —</option>
            {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <input className={inputCls} placeholder="Ders (Matematik)" value={r.subject} onChange={(e) => updateRow(r._idx, "subject", e.target.value)} />
          <input className={inputCls} placeholder="Nokta atışı görev" value={r.topic} onChange={(e) => updateRow(r._idx, "topic", e.target.value)} />
          <input className={inputCls} type="number" placeholder="dk" value={r.durationMin} onChange={(e) => updateRow(r._idx, "durationMin", e.target.value)} />
          <div className="flex justify-end gap-1">
            <button onClick={() => setEditingIdx(null)} className="text-[#059669] p-1.5"><FaCheck size={12} /></button>
            <button onClick={() => removeRow(r._idx)} className="text-[#ef4444] p-1.5"><FaTrash size={12} /></button>
          </div>
        </div>
      );
    }
    return (
      <div key={r._idx} className={`flex items-start justify-between gap-1.5 py-2 px-2.5 rounded-lg cursor-pointer hover:bg-[#f8fafc] ${incomplete ? "bg-[#fef2f2]" : ""}`} onClick={() => setEditingIdx(r._idx)}>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#0f172a] truncate">{r.subject || <span className="italic text-[#94a3b8]">(ders girilmemiş)</span>}</p>
          {r.topic && <p className="text-[11px] text-[#64748b] truncate">{r.topic}</p>}
          <div className="flex items-center gap-1.5 mt-0.5">
            {r.durationMin && <span className="text-[10px] font-bold text-[#94a3b8]">{r.durationMin} dk</span>}
            {incomplete && <span className="text-[10px] font-bold text-[#dc2626]">⚠ eksik</span>}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setEditingIdx(r._idx); }} className="text-[#94a3b8] p-1 flex-shrink-0"><FaPen size={10} /></button>
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
        {canImportProgramImage && (
          <button onClick={() => setDrawerOpen(true)} className="text-xs font-black text-white bg-brand-navy px-4 py-2.5 rounded-full">
            ✨ AI ile Program Aktar
          </button>
        )}
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
        <div>
          {/* Mobil/orta ekran gün-pili seçici — board zaten kendi başına
              kaydırılabilir, bu sadece doğrudan bir güne atlama kolaylığı. */}
          <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
            {DAY_OPTIONS.map((day, i) => (
              <button
                key={day.value}
                onClick={() => scrollToDay(day.value)}
                className="flex-shrink-0 font-fredoka font-bold text-[11px] px-3 py-1.5 rounded-full border"
                style={{ borderColor: "#E4F7F8", background: "#F7F7F2", color: "#17252D" }}
              >
                {DAY_LABELS_SHORT[i]}
              </button>
            ))}
          </div>

          {/* Board — TEK sarmalayıcı, breakpoint'e göre mod DEĞİŞTİRMEZ: her
              kolon min 220px, container overflow-x-auto. Geniş ekranda 7
              kolon (+ varsa "Gün Belirsiz") sığar, dar ekranda doğal olarak
              kayar; mobilde snap ile ~1 kolon odakta durur. */}
          <div className="overflow-x-auto pb-2">
            <div
              className="grid grid-flow-col gap-3 auto-cols-[minmax(220px,1fr)] max-[480px]:auto-cols-[85%] snap-x snap-mandatory"
            >
              {undatedRows.length > 0 && (
                <DayColumn
                  label="Gün Belirsiz"
                  count={undatedRows.length}
                  rows={undatedRows}
                  renderRow={renderRow}
                  highlight
                />
              )}
              {DAY_OPTIONS.map((day) => {
                const dayRows = indexedRows.filter((r) => r.dayOfWeek === day.value);
                return (
                  <DayColumn
                    key={day.value}
                    ref={(el) => { columnRefs.current[day.value] = el; }}
                    label={day.label}
                    count={dayRows.length}
                    rows={dayRows}
                    renderRow={renderRow}
                    onAddRow={() => addRowForDay(day.value)}
                  />
                );
              })}
            </div>
          </div>
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
