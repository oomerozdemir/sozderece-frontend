import { useEffect, useMemo, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import axios from "../../../utils/axios";
import { MASTERY_META } from "./statusMeta";

const SUB_TABS = [
  { key: "history", label: "Tarihçe" },
  { key: "insights", label: "İçgörüler" },
  { key: "mastery", label: "Konu Ağacı" },
];

// Takip sekmesi — eski "bugun" sekmesinin Z-Raporu geçmişi + "icgoruler" +
// "konular" (mastery) sekmelerini tek dosyada, iç segmented control ile
// birleştiriyor (bkz. plan §3). Her alt bölüm yalnızca ilk seçildiğinde
// fetch edilir — sekme mount'ta 3 isteği birden ateşlemiyor.
export default function TrackingTab({ student }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const [subTab, setSubTab] = useState("history");
  const [fetched, setFetched] = useState({ history: false, insights: false, mastery: false });

  /* ── Tarihçe (Z-Raporu) ── */
  const [dayReports, setDayReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ── İçgörüler ── */
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [addingInsightId, setAddingInsightId] = useState(null);
  const [addedInsightIds, setAddedInsightIds] = useState([]);

  /* ── Konu Ağacı ── */
  const [masteryTopics, setMasteryTopics] = useState([]);
  const [masteryLoading, setMasteryLoading] = useState(false);

  useEffect(() => {
    if (subTab === "history" && !fetched.history) {
      setHistoryLoading(true);
      axios
        .get(`/api/coach/students/${student.id}/day-reports`, authHeaders)
        .then((res) => setDayReports(res.data?.reports || []))
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
      setFetched((f) => ({ ...f, history: true }));
    }
    if (subTab === "insights" && !fetched.insights) {
      setInsightsLoading(true);
      axios
        .get(`/api/coach/students/${student.id}/insights`, authHeaders)
        .then((res) => setInsights(res.data?.insights || []))
        .catch(() => {})
        .finally(() => setInsightsLoading(false));
      setFetched((f) => ({ ...f, insights: true }));
    }
    if (subTab === "mastery" && !fetched.mastery) {
      setMasteryLoading(true);
      axios
        .get(`/api/coach/students/${student.id}/mastery`, authHeaders)
        .then((res) => setMasteryTopics(res.data?.topics || []))
        .catch(() => {})
        .finally(() => setMasteryLoading(false));
      setFetched((f) => ({ ...f, mastery: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab, student.id]);

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

  const masteryGrouped = useMemo(() => {
    const byExamType = new Map();
    for (const t of masteryTopics) {
      const key = t.examType || "GENEL";
      if (!byExamType.has(key)) byExamType.set(key, new Map());
      const bySubject = byExamType.get(key);
      if (!bySubject.has(t.subject)) bySubject.set(t.subject, []);
      bySubject.get(t.subject).push(t);
    }
    return byExamType;
  }, [masteryTopics]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold ${subTab === t.key ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
        {subTab === "history" && (
          <>
            <p className="text-xs font-bold text-[#475569] mb-2">Z-Raporu Geçmişi (son 14 gün)</p>
            {historyLoading ? (
              <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
            ) : dayReports.length === 0 ? (
              <p className="text-xs text-[#94a3b8]">Henüz tamamlanmış bir gün yok.</p>
            ) : (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
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
          </>
        )}

        {subTab === "insights" && (
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
        )}

        {subTab === "mastery" && (
          <div className="space-y-4">
            <p className="text-xs text-[#64748b]">
              Öğrencinin konu ustalık haritası (salt-okunur) — ders planı hazırlarken zayıf konulara göre şekillendir.
            </p>
            {masteryLoading ? (
              <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
            ) : masteryTopics.length === 0 ? (
              <p className="text-xs text-[#94a3b8]">Konu listesi henüz hazırlanmadı.</p>
            ) : (
              [...masteryGrouped.entries()].map(([examType, bySubject]) => (
                <div key={examType} className="space-y-2">
                  {examType !== "GENEL" && (
                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide">{examType}</p>
                  )}
                  {[...bySubject.entries()].map(([subject, subjectTopics]) => {
                    const masteredCount = subjectTopics.filter((t) => t.stage === "mastered").length;
                    return (
                      <div key={subject} className="bg-[#f8fafc] rounded-xl p-3.5 border border-[#f1f5f9]">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black text-[#0f172a]">{subject}</p>
                          <span className="text-[11px] font-bold text-amber-700">⭐ {masteredCount}/{subjectTopics.length} Full</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {subjectTopics.map((t) => {
                            const meta = MASTERY_META[t.stage] || MASTERY_META.none;
                            return (
                              <span
                                key={t.id}
                                title={`${t.name} — ${meta.label}`}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                                style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
                              >
                                {t.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
