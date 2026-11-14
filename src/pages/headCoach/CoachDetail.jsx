import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "../../utils/axios";
import HeadCoachLayout from "./HeadCoachLayout";
import AssignmentModal from "./AssignmentModal";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("tr-TR") : "—");

// Koç detay sayfası — bu koça atanmış öğrencilerin sade bir tablosu
// (plan: "Öğrenci/Sınav/Program/Son Deneme/Son Takip/Durum", yalnızca
// repo'nun gerçekten desteklediği kolonlarla).
export default function CoachDetail() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [students, setStudents] = useState([]);
  const [myCoaches, setMyCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferTarget, setTransferTarget] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      axios.get(`/api/head-coach/coaches/${coachId}`, { headers: authHeaders() }),
      axios.get("/api/head-coach/coaches", { headers: authHeaders() }),
    ])
      .then(([detailRes, listRes]) => {
        setCoach(detailRes.data?.coach || null);
        setStudents(detailRes.data?.students || []);
        setMyCoaches(listRes.data?.coaches || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [coachId]);

  const handleTransferred = (studentId, newCoachId) => {
    if (newCoachId === parseInt(coachId)) return load();
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  return (
    <HeadCoachLayout active="coaches" title={coach?.name || "Koç"} subtitle={coach?.subject}>
      <button onClick={() => navigate("/head-coach/coaches")} className="flex items-center gap-1.5 font-nunito font-bold text-xs text-[#64748b] hover:text-page-navy mb-4">
        <FaArrowLeft size={11} /> Koçlarıma Dön
      </button>

      {loading ? (
        <p className="font-nunito text-sm text-[#94a3b8]">Yükleniyor…</p>
      ) : !coach ? (
        <p className="font-nunito text-sm text-[#94a3b8]">Bu koç size bağlı değil.</p>
      ) : students.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8]">Bu koça henüz öğrenci atanmamış.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-left">
                <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Öğrenci</th>
                <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Sınav</th>
                <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Program</th>
                <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Son Deneme</th>
                <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3">Son Takip</th>
                <th className="font-nunito font-bold text-xs text-[#94a3b8] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-[#f8fafc] last:border-0">
                  <td className="px-4 py-3 font-nunito font-bold text-page-navy">{s.name}</td>
                  <td className="px-4 py-3 font-nunito text-[#64748b]">{s.track || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className="font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full"
                      style={s.hasPlanThisWeek ? { background: "#ecfdf5", color: "#065f46" } : { background: "#fef2f2", color: "#991b1b" }}
                    >
                      {s.hasPlanThisWeek ? "Var" : "Yok"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-nunito text-[#64748b]">{fmtDate(s.lastExamDate)}</td>
                  <td className="px-4 py-3 font-nunito text-[#64748b]">{fmtDate(s.lastNoteAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setTransferTarget({ ...s, assignedCoachId: parseInt(coachId) })}
                      className="font-nunito font-bold text-xs text-brand hover:underline"
                    >
                      Koçu Değiştir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transferTarget && (
        <AssignmentModal
          student={transferTarget}
          coaches={myCoaches}
          onClose={() => setTransferTarget(null)}
          onTransferred={handleTransferred}
        />
      )}
    </HeadCoachLayout>
  );
}
