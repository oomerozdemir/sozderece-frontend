import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";

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

// Koçun bir öğrenci için haftalık program hazırladığı + deneme sonucu girdiği
// modal. İki basit sekme: Program / Deneme Sonucu.
export default function StudentPanelEditor({ student, onClose }) {
  const [tab, setTab] = useState("program");
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  /* ── Program sekmesi ── */
  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [planTitle, setPlanTitle] = useState("");
  const [rows, setRows] = useState([{ dayOfWeek: 0, subject: "", topic: "", durationMin: "" }]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [planMsg, setPlanMsg] = useState("");

  useEffect(() => {
    if (tab !== "program") return;
    setPlanLoading(true);
    axios
      .get(`/api/coach/students/${student.id}/study-plan`, { ...authHeaders, params: { weekStart: toISO(weekStart) } })
      .then((res) => {
        const plan = res.data?.plan;
        if (plan) {
          setPlanTitle(plan.title || "");
          setRows(
            plan.items.map((it) => ({
              dayOfWeek: it.dayOfWeek,
              subject: it.subject,
              topic: it.topic || "",
              durationMin: it.durationMin || "",
            }))
          );
        } else {
          setPlanTitle("");
          setRows([{ dayOfWeek: 0, subject: "", topic: "", durationMin: "" }]);
        }
      })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, weekStart, student.id]);

  const updateRow = (i, field, value) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((prev) => [...prev, { dayOfWeek: 0, subject: "", topic: "", durationMin: "" }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const savePlan = async () => {
    const validRows = rows.filter((r) => r.subject.trim());
    if (validRows.length === 0) {
      setPlanMsg("En az bir satıra ders girmelisin.");
      return;
    }
    setPlanSaving(true);
    setPlanMsg("");
    try {
      await axios.post(
        `/api/coach/students/${student.id}/study-plan`,
        { weekStart: toISO(weekStart), title: planTitle, items: validRows },
        authHeaders
      );
      setPlanMsg("Program kaydedildi ✓");
    } catch {
      setPlanMsg("Kaydedilemedi, tekrar dene.");
    } finally {
      setPlanSaving(false);
    }
  };

  /* ── Deneme sekmesi ── */
  const [examDate, setExamDate] = useState("");
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [totalNet, setTotalNet] = useState("");
  const [ranking, setRanking] = useState("");
  const [notes, setNotes] = useState("");
  const [subjectNets, setSubjectNets] = useState([{ subject: "", net: "" }]);
  const [examSaving, setExamSaving] = useState(false);
  const [examMsg, setExamMsg] = useState("");
  const [pastExams, setPastExams] = useState([]);

  const loadExams = () => {
    axios
      .get(`/api/coach/students/${student.id}/exam-results`, authHeaders)
      .then((res) => setPastExams(res.data?.results || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (tab === "deneme") loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, student.id]);

  const updateSubjectNet = (i, field, value) => setSubjectNets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const addSubjectNet = () => setSubjectNets((prev) => [...prev, { subject: "", net: "" }]);
  const removeSubjectNet = (i) => setSubjectNets((prev) => prev.filter((_, idx) => idx !== i));

  const saveExam = async () => {
    if (!examDate || !examName.trim()) {
      setExamMsg("Sınav tarihi ve adı zorunlu.");
      return;
    }
    setExamSaving(true);
    setExamMsg("");
    try {
      await axios.post(
        `/api/coach/students/${student.id}/exam-results`,
        {
          examDate,
          examName,
          examType,
          totalNet: totalNet || undefined,
          ranking: ranking || undefined,
          notes,
          subjectNets: subjectNets.filter((s) => s.subject.trim()).map((s) => ({ subject: s.subject, net: parseFloat(s.net) || 0 })),
        },
        authHeaders
      );
      setExamMsg("Deneme sonucu eklendi ✓");
      setExamDate(""); setExamName(""); setTotalNet(""); setRanking(""); setNotes("");
      setSubjectNets([{ subject: "", net: "" }]);
      loadExams();
    } catch {
      setExamMsg("Eklenemedi, tekrar dene.");
    } finally {
      setExamSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[640px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] sticky top-0 bg-white">
          <div>
            <h3 className="font-black text-[#0f172a] text-base">{student.name}</h3>
            <p className="text-xs text-[#64748b]">{student.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b]">
            <FaTimes size={13} />
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => setTab("program")}
            className={`px-4 py-2 rounded-full text-xs font-bold ${tab === "program" ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
          >
            Haftalık Program
          </button>
          <button
            onClick={() => setTab("deneme")}
            className={`px-4 py-2 rounded-full text-xs font-bold ${tab === "deneme" ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
          >
            Deneme Sonucu
          </button>
        </div>

        <div className="p-6">
          {tab === "program" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() - 7); return n; })}
                  className="text-xs font-bold text-page-navy px-2 py-1"
                >
                  ‹ Önceki
                </button>
                <span className="text-xs font-bold text-[#475569]">Hafta: {toISO(weekStart)}</span>
                <button
                  onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() + 7); return n; })}
                  className="text-xs font-bold text-page-navy px-2 py-1"
                >
                  Sonraki ›
                </button>
              </div>

              <input className={inputCls} placeholder="Program başlığı (opsiyonel, ör. 12. Hafta)" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} />

              {planLoading ? (
                <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
              ) : (
                <div className="space-y-2">
                  {rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-[100px_1fr_1fr_70px_auto] gap-1.5 items-center max-[560px]:grid-cols-2">
                      <select className={inputCls} value={r.dayOfWeek} onChange={(e) => updateRow(i, "dayOfWeek", parseInt(e.target.value))}>
                        {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                      <input className={inputCls} placeholder="Ders (Matematik)" value={r.subject} onChange={(e) => updateRow(i, "subject", e.target.value)} />
                      <input className={inputCls} placeholder="Konu (opsiyonel)" value={r.topic} onChange={(e) => updateRow(i, "topic", e.target.value)} />
                      <input className={inputCls} type="number" placeholder="dk" value={r.durationMin} onChange={(e) => updateRow(i, "durationMin", e.target.value)} />
                      <button onClick={() => removeRow(i)} className="text-[#ef4444] p-2"><FaTrash size={12} /></button>
                    </div>
                  ))}
                  <button onClick={addRow} className="flex items-center gap-1.5 text-xs font-bold text-page-navy"><FaPlus size={10} /> Satır Ekle</button>
                </div>
              )}

              {planMsg && <p className="text-xs font-bold text-[#059669]">{planMsg}</p>}
              <button onClick={savePlan} disabled={planSaving} className="w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-black disabled:opacity-60">
                {planSaving ? "Kaydediliyor…" : "Programı Kaydet"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                <select className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value)}>
                  <option value="TYT">TYT</option>
                  <option value="AYT">AYT</option>
                  <option value="LGS">LGS</option>
                </select>
                <input className={`${inputCls} col-span-2`} placeholder="Sınav adı (ör. 3D Yayınları TYT Deneme 4)" value={examName} onChange={(e) => setExamName(e.target.value)} />
                <input className={inputCls} type="number" step="0.01" placeholder="Toplam net" value={totalNet} onChange={(e) => setTotalNet(e.target.value)} />
                <input className={inputCls} type="number" placeholder="Sıralama (opsiyonel)" value={ranking} onChange={(e) => setRanking(e.target.value)} />
              </div>

              <div>
                <p className="text-xs font-bold text-[#475569] mb-1.5">Branş Bazlı Netler (opsiyonel)</p>
                <div className="space-y-1.5">
                  {subjectNets.map((s, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input className={inputCls} placeholder="Ders (Matematik)" value={s.subject} onChange={(e) => updateSubjectNet(i, "subject", e.target.value)} />
                      <input className={`${inputCls} w-24 flex-shrink-0`} type="number" step="0.01" placeholder="Net" value={s.net} onChange={(e) => updateSubjectNet(i, "net", e.target.value)} />
                      <button onClick={() => removeSubjectNet(i)} className="text-[#ef4444] p-2 flex-shrink-0"><FaTrash size={12} /></button>
                    </div>
                  ))}
                  <button onClick={addSubjectNet} className="flex items-center gap-1.5 text-xs font-bold text-page-navy"><FaPlus size={10} /> Ders Ekle</button>
                </div>
              </div>

              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Not (opsiyonel)" value={notes} onChange={(e) => setNotes(e.target.value)} />

              {examMsg && <p className="text-xs font-bold text-[#059669]">{examMsg}</p>}
              <button onClick={saveExam} disabled={examSaving} className="w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-black disabled:opacity-60">
                {examSaving ? "Kaydediliyor…" : "Deneme Sonucunu Ekle"}
              </button>

              {pastExams.length > 0 && (
                <div className="pt-3 border-t border-[#f1f5f9]">
                  <p className="text-xs font-bold text-[#475569] mb-2">Girilmiş Denemeler</p>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {pastExams.map((r) => (
                      <div key={r.id} className="text-xs text-[#475569] bg-[#f8fafc] rounded-lg px-3 py-2">
                        {r.examName} — {r.totalNet ?? "—"} net ({new Date(r.examDate).toLocaleDateString("tr-TR")})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
