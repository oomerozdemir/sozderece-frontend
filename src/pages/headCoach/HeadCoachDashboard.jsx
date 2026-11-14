import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import axios from "../../utils/axios";
import HeadCoachLayout from "./HeadCoachLayout";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

function KpiCard({ value, label }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      <p className="font-fredoka font-bold text-page-navy text-2xl leading-none">{value}</p>
      <p className="font-nunito font-bold text-xs text-[#64748b] mt-1.5">{label}</p>
    </div>
  );
}

// Genel Bakış — K14/K15: yalnızca mevcut veriden deterministic hesaplanan
// KPI'lar + küçük "Dikkat Gerekebilir" bloğu (ayrı bir Takip sayfası YOK,
// V1 kapsam sadeleştirmesi). AI risk skoru yok, sabit 7-gün eşikli kurallar.
export default function HeadCoachDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/head-coach/overview", { headers: authHeaders() })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const attention = data?.attentionNeeded;
  const hasAttentionItems =
    attention && (attention.noPlan.length > 0 || attention.noRecentExam.length > 0 || attention.noRecentNote.length > 0);

  return (
    <HeadCoachLayout active="overview" title="Genel Bakış" subtitle="Ekibinin özeti burada">
      {loading ? (
        <p className="font-nunito text-sm text-[#94a3b8]">Yükleniyor…</p>
      ) : !data ? (
        <p className="font-nunito text-sm text-[#94a3b8]">Özet alınamadı.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard value={data.totalCoaches} label="Toplam Koç" />
            <KpiCard value={data.totalStudents} label="Toplam Öğrenci" />
            <KpiCard value={data.studentsWithPlanThisWeek} label="Bu Hafta Planı Olan Öğrenci" />
            <KpiCard value={data.studentsWithoutPlanThisWeek} label="Bu Hafta Plansız Öğrenci" />
            <KpiCard value={data.avgStudentsPerCoach} label="Koç Başına Ortalama Öğrenci" />
          </div>

          {hasAttentionItems && (
            <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
              <p className="flex items-center gap-2 font-fredoka font-bold text-amber-700 text-sm mb-3">
                <FaExclamationTriangle size={13} /> Dikkat Gerekebilir
              </p>
              <div className="flex flex-col gap-1.5">
                {[...attention.noPlan, ...attention.noRecentExam, ...attention.noRecentNote].map((s, i) => (
                  <button
                    key={`${s.id}-${i}`}
                    onClick={() => navigate(`/head-coach/students`)}
                    className="flex items-center justify-between gap-3 bg-amber-50 rounded-xl px-4 py-2.5 text-left hover:bg-amber-100 transition-colors"
                  >
                    <span className="font-nunito text-sm text-[#334155]">{s.name}</span>
                    <span className="font-nunito text-xs font-bold text-amber-700">{s.reason}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </HeadCoachLayout>
  );
}
