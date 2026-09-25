import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "../../../utils/axios";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-page-navy transition-colors";

// Denemeler sekmesi — StudentPanelEditor.jsx'in "deneme" sekmesinden
// kopyala-sonra-stillendir olarak taşındı. Backend endpoint'lerine
// (exam-results, topics) ve payload şekline dokunulmadı.
export default function ExamsTab({ student }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [examDate, setExamDate] = useState("");
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [totalNet, setTotalNet] = useState("");
  const [ranking, setRanking] = useState("");
  const [notes, setNotes] = useState("");
  const [subjectNets, setSubjectNets] = useState([{ subject: "", net: "", wrongTopicIds: [] }]);
  const [examSaving, setExamSaving] = useState(false);
  const [examMsg, setExamMsg] = useState("");
  const [pastExams, setPastExams] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicPickerOpen, setTopicPickerOpen] = useState(null);

  const loadExams = () => {
    axios
      .get(`/api/coach/students/${student.id}/exam-results`, authHeaders)
      .then((res) => setPastExams(res.data?.results || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadExams();
    axios
      .get(`/api/coach/students/${student.id}/topics`, authHeaders)
      .then((res) => setTopics(res.data?.topics || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const updateSubjectNet = (i, field, value) => setSubjectNets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const addSubjectNet = () => setSubjectNets((prev) => [...prev, { subject: "", net: "", wrongTopicIds: [] }]);
  const removeSubjectNet = (i) => setSubjectNets((prev) => prev.filter((_, idx) => idx !== i));
  const toggleWrongTopic = (i, topicId) =>
    setSubjectNets((prev) =>
      prev.map((s, idx) => {
        if (idx !== i) return s;
        const has = (s.wrongTopicIds || []).includes(topicId);
        return { ...s, wrongTopicIds: has ? s.wrongTopicIds.filter((id) => id !== topicId) : [...(s.wrongTopicIds || []), topicId] };
      })
    );

  const topicsForRow = (subjectText) => {
    const norm = (subjectText || "").trim().toLowerCase();
    if (!norm) return [];
    return topics.filter((t) => {
      const subjectMatches = t.subject.trim().toLowerCase() === norm;
      const examTypeMatches = examType === "LGS" ? !t.examType : t.examType === examType;
      return subjectMatches && examTypeMatches;
    });
  };

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
          subjectNets: subjectNets
            .filter((s) => s.subject.trim())
            .map((s) => ({ subject: s.subject, net: parseFloat(s.net) || 0, wrongTopicIds: s.wrongTopicIds || [] })),
        },
        authHeaders
      );
      setExamMsg("Deneme sonucu eklendi ✓");
      setExamDate(""); setExamName(""); setTotalNet(""); setRanking(""); setNotes("");
      setSubjectNets([{ subject: "", net: "", wrongTopicIds: [] }]);
      loadExams();
    } catch {
      setExamMsg("Eklenemedi, tekrar dene.");
    } finally {
      setExamSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className={inputCls} type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        <select className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value)}>
          <option value="TYT">TYT</option>
          <option value="AYT">AYT</option>
          <option value="LGS">LGS</option>
        </select>
        <input className={`${inputCls} sm:col-span-2`} placeholder="Sınav adı (ör. 3D Yayınları TYT Deneme 4)" value={examName} onChange={(e) => setExamName(e.target.value)} />
        <input className={inputCls} type="number" step="0.01" placeholder="Toplam net" value={totalNet} onChange={(e) => setTotalNet(e.target.value)} />
        <input className={inputCls} type="number" placeholder="Sıralama (opsiyonel)" value={ranking} onChange={(e) => setRanking(e.target.value)} />
      </div>

      <div>
        <p className="text-xs font-bold text-[#475569] mb-1.5">Branş Bazlı Netler (opsiyonel)</p>
        <div className="space-y-1.5">
          {subjectNets.map((s, i) => {
            const matchingTopics = topicsForRow(s.subject);
            const wrongCount = (s.wrongTopicIds || []).length;
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input className={`${inputCls} flex-1 min-w-0`} placeholder="Ders (Matematik)" value={s.subject} onChange={(e) => updateSubjectNet(i, "subject", e.target.value)} />
                  <input className={`${inputCls.replace("w-full", "w-24")} flex-shrink-0`} type="number" step="0.01" placeholder="Net" value={s.net} onChange={(e) => updateSubjectNet(i, "net", e.target.value)} />
                  <button onClick={() => removeSubjectNet(i)} className="text-[#ef4444] p-2 flex-shrink-0"><FaTrash size={12} /></button>
                </div>
                {matchingTopics.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setTopicPickerOpen((prev) => (prev === i ? null : i))}
                      className="text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      {wrongCount > 0 ? `⚠️ ${wrongCount} yanlış konu seçili` : "Yanlış Yapılan Konuları Seç (opsiyonel)"}
                    </button>
                    {topicPickerOpen === i && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 p-2.5 bg-[#f8fafc] rounded-lg max-h-[140px] overflow-y-auto">
                        {matchingTopics.map((t) => {
                          const active = (s.wrongTopicIds || []).includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleWrongTopic(i, t.id)}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors"
                              style={active ? { background: "#fef2f2", borderColor: "#dc2626", color: "#dc2626" } : { background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
            {pastExams.map((r) => (
              <div key={r.id} className="text-xs text-[#475569] bg-[#f8fafc] rounded-lg px-3 py-2">
                {r.examName} — {r.totalNet ?? "—"} net ({new Date(r.examDate).toLocaleDateString("tr-TR")})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
