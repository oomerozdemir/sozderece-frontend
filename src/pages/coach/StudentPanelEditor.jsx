import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../../utils/axios";
import { FaTimes, FaPlus, FaTrash, FaExclamationTriangle, FaMicrophone, FaStop, FaPaperPlane, FaVolumeUp } from "react-icons/fa";

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

const STATUS_META = {
  pending: { label: "Bekliyor", color: "#94a3b8", bg: "#f1f5f9" },
  done: { label: "Bitti", color: "#059669", bg: "#ecfdf5" },
  partial: { label: "Yarıda Kaldı", color: "#c2740c", bg: "#fff7ea" },
  stuck: { label: "Zorlandım", color: "#dc2626", bg: "#fef2f2" },
};

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
  const [subjectNets, setSubjectNets] = useState([{ subject: "", net: "", wrongTopicIds: [] }]);
  const [examSaving, setExamSaving] = useState(false);
  const [examMsg, setExamMsg] = useState("");
  const [pastExams, setPastExams] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicPickerOpen, setTopicPickerOpen] = useState(null); // hangi subjectNets satırı açık

  const loadExams = () => {
    axios
      .get(`/api/coach/students/${student.id}/exam-results`, authHeaders)
      .then((res) => setPastExams(res.data?.results || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (tab !== "deneme") return;
    loadExams();
    axios
      .get(`/api/coach/students/${student.id}/topics`, authHeaders)
      .then((res) => setTopics(res.data?.topics || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, student.id]);

  /* ── İçgörüler sekmesi ── */
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [addingInsightId, setAddingInsightId] = useState(null);
  const [addedInsightIds, setAddedInsightIds] = useState([]);

  const loadInsights = () => {
    setInsightsLoading(true);
    axios
      .get(`/api/coach/students/${student.id}/insights`, authHeaders)
      .then((res) => setInsights(res.data?.insights || []))
      .catch(() => {})
      .finally(() => setInsightsLoading(false));
  };

  useEffect(() => {
    if (tab === "icgoruler") loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, student.id]);

  const addInsightToPlan = async (topicId) => {
    setAddingInsightId(topicId);
    try {
      await axios.post(`/api/coach/students/${student.id}/insights/${topicId}/add-to-plan`, {}, authHeaders);
      setAddedInsightIds((prev) => [...prev, topicId]);
    } catch {
      // sessizce yut
    } finally {
      setAddingInsightId(null);
    }
  };

  /* ── Günlük Not sekmesi (yazılı + sesli) ── */
  const [noteHistory, setNoteHistory] = useState([]);
  const [noteHistoryLoading, setNoteHistoryLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSending, setNoteSending] = useState(false);
  const [noteMsg, setNoteMsg] = useState("");
  const [recState, setRecState] = useState("idle"); // "idle" | "recording" | "preview"
  const [recSeconds, setRecSeconds] = useState(0);
  const [recBlobUrl, setRecBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const recBlobRef = useRef(null);

  const loadNoteHistory = () => {
    setNoteHistoryLoading(true);
    axios
      .get(`/api/coach/students/${student.id}/notes`, authHeaders)
      .then((res) => setNoteHistory(res.data?.notes || []))
      .catch(() => {})
      .finally(() => setNoteHistoryLoading(false));
  };

  useEffect(() => {
    if (tab === "not") loadNoteHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, student.id]);

  const sendTextNote = async () => {
    if (!noteText.trim()) return;
    setNoteSending(true);
    setNoteMsg("");
    try {
      await axios.post(`/api/coach/students/${student.id}/notes/text`, { text: noteText.trim() }, authHeaders);
      setNoteText("");
      setNoteMsg("Not gönderildi ✓");
      loadNoteHistory();
    } catch {
      setNoteMsg("Gönderilemedi, tekrar dene.");
    } finally {
      setNoteSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        recBlobRef.current = blob;
        setRecBlobUrl(URL.createObjectURL(blob));
        setRecState("preview");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecState("recording");
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      setNoteMsg("Mikrofon izni alınamadı.");
    }
  };

  const stopRecording = () => {
    clearInterval(recTimerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const discardRecording = () => {
    setRecState("idle");
    setRecBlobUrl(null);
    recBlobRef.current = null;
    setRecSeconds(0);
  };

  const sendAudioNote = async () => {
    if (!recBlobRef.current) return;
    setNoteSending(true);
    setNoteMsg("");
    try {
      const form = new FormData();
      form.append("audio", recBlobRef.current, "note.webm");
      // Content-Type kasten set edilmiyor — axios/tarayıcı multipart boundary'yi
      // kendi ekliyor, elle "multipart/form-data" yazmak boundary'yi kaybettirip
      // sunucunun formu parse edememesine yol açar.
      await axios.post(`/api/coach/students/${student.id}/notes/audio`, form, authHeaders);
      discardRecording();
      setNoteMsg("Sesli not gönderildi ✓");
      loadNoteHistory();
    } catch {
      setNoteMsg("Gönderilemedi, tekrar dene.");
    } finally {
      setNoteSending(false);
    }
  };

  useEffect(() => () => clearInterval(recTimerRef.current), []);

  /* ── Bugünkü Durum sekmesi ── */
  const [todayItems, setTodayItems] = useState([]);
  const [dayReports, setDayReports] = useState([]);
  const [todayLoading, setTodayLoading] = useState(false);

  useEffect(() => {
    if (tab !== "bugun") return;
    setTodayLoading(true);
    Promise.all([
      axios.get(`/api/coach/students/${student.id}/today`, authHeaders),
      axios.get(`/api/coach/students/${student.id}/day-reports`, authHeaders),
    ])
      .then(([todayRes, reportsRes]) => {
        setTodayItems(todayRes.data?.items || []);
        setDayReports(reportsRes.data?.reports || []);
      })
      .catch(() => {})
      .finally(() => setTodayLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, student.id]);

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

  // Serbest metin "Ders" alanı ile Topic kataloğunu eşleştirir (gevşek: küçük
  // harfe çevirip kırpar) + sınav türüne (TYT/AYT/LGS) göre filtreler.
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
          <button
            onClick={() => setTab("bugun")}
            className={`px-4 py-2 rounded-full text-xs font-bold ${tab === "bugun" ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
          >
            Bugünkü Durum
          </button>
          <button
            onClick={() => setTab("icgoruler")}
            className={`px-4 py-2 rounded-full text-xs font-bold ${tab === "icgoruler" ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
          >
            İçgörüler
          </button>
          <button
            onClick={() => setTab("not")}
            className={`px-4 py-2 rounded-full text-xs font-bold ${tab === "not" ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
          >
            Günlük Not
          </button>
        </div>

        <div className="p-6">
          {tab === "not" ? (
            <div className="space-y-4">
              <p className="text-xs text-[#64748b]">
                Panelin en üstünde, her sekmede sabit görünen kısa bir günlük mesaj — "abla/abin"in orada olduğunu hissettirir.
              </p>

              <div>
                <p className="text-xs font-bold text-[#475569] mb-1.5">Yazılı Not</p>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  maxLength={1000}
                  placeholder="Örn: Bugün harikaydın, aynen devam! 💪"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <button
                  onClick={sendTextNote}
                  disabled={noteSending || !noteText.trim()}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white rounded-lg text-xs font-black disabled:opacity-60"
                >
                  <FaPaperPlane size={10} /> {noteSending ? "Gönderiliyor…" : "Yazılı Not Gönder"}
                </button>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9]">
                <p className="text-xs font-bold text-[#475569] mb-1.5">Sesli Not (~10sn)</p>
                {recState === "idle" && (
                  <button onClick={startRecording} className="flex items-center gap-1.5 px-4 py-2 bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-lg text-xs font-black">
                    <FaMicrophone size={11} /> Kaydı Başlat
                  </button>
                )}
                {recState === "recording" && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-black text-[#dc2626]">
                      <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" /> Kaydediliyor… {recSeconds}sn
                    </span>
                    <button onClick={stopRecording} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] text-white rounded-lg text-xs font-black">
                      <FaStop size={10} /> Durdur
                    </button>
                  </div>
                )}
                {recState === "preview" && recBlobUrl && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <audio controls src={recBlobUrl} className="h-9" />
                    <button onClick={sendAudioNote} disabled={noteSending} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded-lg text-xs font-black disabled:opacity-60">
                      <FaPaperPlane size={10} /> {noteSending ? "Gönderiliyor…" : "Gönder"}
                    </button>
                    <button onClick={discardRecording} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] text-[#64748b] rounded-lg text-xs font-black">
                      <FaTrash size={10} /> Sil, Tekrar Kaydet
                    </button>
                  </div>
                )}
              </div>

              {noteMsg && <p className="text-xs font-bold text-[#059669]">{noteMsg}</p>}

              <div className="pt-3 border-t border-[#f1f5f9]">
                <p className="text-xs font-bold text-[#475569] mb-2">Geçmiş Notlar</p>
                {noteHistoryLoading ? (
                  <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
                ) : noteHistory.length === 0 ? (
                  <p className="text-xs text-[#94a3b8]">Henüz not bırakılmadı.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {noteHistory.map((n) => (
                      <div key={n.id} className="bg-[#f8fafc] rounded-lg px-3 py-2.5">
                        <p className="text-[11px] text-[#94a3b8] mb-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</p>
                        {n.type === "text" ? (
                          <p className="text-xs text-[#334155]">{n.text}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FaVolumeUp className="text-page-navy flex-shrink-0" size={12} />
                            <audio controls src={n.audioUrl} className="h-8" style={{ maxWidth: 260 }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : tab === "icgoruler" ? (
            <div className="space-y-3">
              <p className="text-xs text-[#64748b] mb-1">
                Son 3 denemenin en az 2'sinde yanlış işaretlenen konular — tekrar eden hatalar. Tek tıkla bugünün programına ekleyebilirsin.
              </p>
              {insightsLoading ? (
                <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
              ) : insights.length === 0 ? (
                <p className="text-xs text-[#94a3b8]">Şu an tekrar eden bir hata örüntüsü yok (ya da deneme sonuçları henüz konu bazlı girilmedi).</p>
              ) : (
                <div className="space-y-2">
                  {insights.map((ins) => {
                    const added = addedInsightIds.includes(ins.topicId);
                    return (
                      <div key={ins.topicId} className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex-wrap">
                        <div className="min-w-0 flex items-start gap-2">
                          <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={13} />
                          <p className="text-xs text-[#334155]">
                            Son <strong>{ins.checkedExams}</strong> denemenin <strong>{ins.count}</strong> tanesinde{" "}
                            <strong className="text-amber-800">{ins.subject} — {ins.topicName}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => addInsightToPlan(ins.topicId)}
                          disabled={added || addingInsightId === ins.topicId}
                          className="flex-shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-black disabled:opacity-60 transition-colors"
                        >
                          {added ? "Eklendi ✓" : addingInsightId === ins.topicId ? "…" : "Bugüne Ekle"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : tab === "bugun" ? (
            <div className="space-y-4">
              {todayLoading ? (
                <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold text-[#475569] mb-2">Bugünün Görevleri</p>
                    {todayItems.length === 0 ? (
                      <p className="text-xs text-[#94a3b8]">Bugün için planlı görev yok.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {todayItems.map((it) => {
                          const meta = STATUS_META[it.status] || STATUS_META.pending;
                          return (
                            <div key={it.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5" style={{ background: meta.bg }}>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0f172a] truncate">{it.subject}</p>
                                {it.topic && <p className="text-[11px] text-[#64748b] truncate">{it.topic}</p>}
                              </div>
                              <span className="text-[11px] font-bold flex-shrink-0" style={{ color: meta.color }}>{meta.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#f1f5f9]">
                    <p className="text-xs font-bold text-[#475569] mb-2">Z-Raporu Geçmişi (son 14 gün)</p>
                    {dayReports.length === 0 ? (
                      <p className="text-xs text-[#94a3b8]">Henüz tamamlanmış bir gün yok.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                        {dayReports.map((r) => (
                          <div key={r.id} className="flex items-center justify-between text-xs text-[#475569] bg-[#f8fafc] rounded-lg px-3 py-2">
                            <span className="font-bold">{new Date(r.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" })}</span>
                            <span>
                              <span className="text-[#059669] font-bold">{r.doneTasks} bitti</span>
                              {r.partialTasks > 0 && <span className="text-[#c2740c] font-bold"> · {r.partialTasks} yarıda</span>}
                              {r.stuckTasks > 0 && <span className="text-[#dc2626] font-bold"> · {r.stuckTasks} zorlandı</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : tab === "program" ? (
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
                      <input className={inputCls} placeholder="Nokta atışı görev (ör. 3D Yayınları, Syf 45-52, 4 Test)" value={r.topic} onChange={(e) => updateRow(i, "topic", e.target.value)} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  {subjectNets.map((s, i) => {
                    const matchingTopics = topicsForRow(s.subject);
                    const wrongCount = (s.wrongTopicIds || []).length;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex gap-1.5">
                          <input className={`${inputCls} flex-1 min-w-0`} placeholder="Ders (Matematik)" value={s.subject} onChange={(e) => updateSubjectNet(i, "subject", e.target.value)} />
                          {/* Not: inputCls'in kendi w-full'unu bir w-24 ile aynı elemente eklemek CSS
                              çakışmasına yol açıyordu (Tailwind'in kendi sıralamasında w-full, w-24'ü
                              eziyor) — Net kutusu tüm satırı kaplayıp Ders kutusunu 26px'e sıkıştırıyordu.
                              inputCls'teki w-full'u burada w-24 ile değiştirerek çakışmayı kökten kaldırıyoruz. */}
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
