import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import HeadCoachLayout from "./HeadCoachLayout";
import AssignmentModal from "./AssignmentModal";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const PAGE_SIZE = 20;

// Öğrenciler — ekibin TÜM öğrencileri (kendi doğrudan öğrencileri + tüm
// supervise edilen koçların öğrencileri, backend'de tek bir OR filtresiyle
// birleşik). Filtre/arama/pagination — teacher.controller.js#listMyLessons
// ile aynı sayfalama deseni (plan K6/K9).
export default function StudentsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [coachId, setCoachId] = useState("");
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferTarget, setTransferTarget] = useState(null);

  useEffect(() => {
    axios.get("/api/head-coach/coaches", { headers: authHeaders() }).then((res) => setCoaches(res.data?.coaches || [])).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    axios
      .get("/api/head-coach/students", { headers: authHeaders(), params: { page, pageSize: PAGE_SIZE, q: q || undefined, coachId: coachId || undefined } })
      .then((res) => {
        setItems(res.data?.items || []);
        setTotal(res.data?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, coachId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleTransferred = (studentId, newCoachId) => {
    setItems((prev) =>
      coachId && newCoachId !== parseInt(coachId)
        ? prev.filter((s) => s.id !== studentId)
        : prev.map((s) => (s.id === studentId ? { ...s, assignedCoachId: newCoachId, assignedCoach: coaches.find((c) => c.id === newCoachId) || s.assignedCoach } : s))
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <HeadCoachLayout active="students" title="Öğrenciler" subtitle={`${total} öğrenci ekibinde`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[180px]">
          <input
            className="w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito"
            placeholder="Öğrenci ara…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
        <select
          className="py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none font-nunito"
          value={coachId}
          onChange={(e) => { setCoachId(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Koçlar</option>
          {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-nunito text-sm text-[#94a3b8]">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8]">Bu ekipte henüz öğrenci bulunmuyor.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] text-left">
                  <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Öğrenci</th>
                  <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Koç</th>
                  <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Sınav</th>
                  <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Durum</th>
                  <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-[#f8fafc] last:border-0">
                    <td className="px-4 py-3 font-nunito font-bold text-page-navy">{s.name}</td>
                    <td className="px-4 py-3 font-nunito text-[#64748b]">{s.assignedCoach?.name || "—"}</td>
                    <td className="px-4 py-3 font-nunito text-[#64748b]">{s.track || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full"
                        style={s.hasPlanThisWeek ? { background: "#ecfdf5", color: "#065f46" } : { background: "#fef2f2", color: "#991b1b" }}
                      >
                        {s.hasPlanThisWeek ? "Planı var" : "Plansız"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => navigate(`/head-coach/students/${s.id}`, { state: { student: s } })} className="font-nunito font-bold text-xs text-page-navy hover:underline mr-3">
                        Öğrenciye Git
                      </button>
                      <button onClick={() => setTransferTarget(s)} className="font-nunito font-bold text-xs text-brand hover:underline">
                        Koçu Değiştir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f1f5f9] text-[#64748b] disabled:opacity-50">‹ Önceki</button>
              <span className="text-xs font-bold text-[#64748b] px-2">Sayfa {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f1f5f9] text-[#64748b] disabled:opacity-50">Sonraki ›</button>
            </div>
          )}
        </>
      )}

      {transferTarget && (
        <AssignmentModal student={transferTarget} coaches={coaches} onClose={() => setTransferTarget(null)} onTransferred={handleTransferred} />
      )}
    </HeadCoachLayout>
  );
}
