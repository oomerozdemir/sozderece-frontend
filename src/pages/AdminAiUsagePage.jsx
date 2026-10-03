import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { StatCard } from "../components/AdminDashboard";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
};

const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const fmtUsd = (v) => (v == null ? "—" : `$${v.toFixed(v < 1 ? 4 : 2)}`);

export default function AdminAiUsagePage() {
  const [month, setMonth] = useState(currentMonth());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionStats, setQuestionStats] = useState(null);
  const [studentBreakdown, setStudentBreakdown] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/admin/ai-usage/summary", { params: { month } })
      .then((res) => setStats(res.data?.stats || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => {
    setQuestionLoading(true);
    axios
      .get("/api/admin/ai-usage/question-summary", { params: { month } })
      .then((res) => {
        setQuestionStats(res.data?.stats || null);
        setStudentBreakdown(res.data?.studentBreakdown || []);
      })
      .catch(() => {
        setQuestionStats(null);
        setStudentBreakdown([]);
      })
      .finally(() => setQuestionLoading(false));
  }, [month]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="text-sm text-brand-navy hover:underline">
            ← Admin Paneli
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-800">🤖 AI Kullanımı</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="text-xs font-bold text-page-navy px-2 py-1"
          >
            ‹ Önceki Ay
          </button>
          <span className="text-sm font-bold text-[#475569] capitalize">{monthLabel(month)}</span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="text-xs font-bold text-page-navy px-2 py-1"
          >
            Sonraki Ay ›
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Yükleniyor…</p>
        ) : !stats ? (
          <p className="text-sm text-red-500">Veri alınamadı.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <StatCard icon="📄" label="İşlenen Program" value={stats.totalCount} color="bg-[#eff6ff]" />
              <StatCard icon="✅" label="Hazır" value={stats.readyCount} color="bg-[#ecfdf5]" />
              <StatCard icon="⚠️" label="Hata / Gözden Geçirilmeli" value={stats.needsReviewOrErrorCount} color="bg-[#fef2f2]" />
              <StatCard icon="💵" label="Toplam Maliyet" value={fmtUsd(stats.totalCostUsd)} color="bg-[#fdf4ff]" />
              <StatCard icon="📊" label="Program Başına Ortalama" value={fmtUsd(stats.avgCostPerProgram)} color="bg-[#fff7ed]" />
            </div>
            {stats.costUnknownCount > 0 && (
              <p className="text-xs text-gray-400">
                {stats.costUnknownCount} program için maliyet bilinmiyor (fiyat tablosunda tanımsız model).
              </p>
            )}
          </>
        )}

        <div className="flex items-center gap-3 mt-10 mb-6">
          <h2 className="text-xl font-bold text-gray-800">🧠 AI Soru Asistanı</h2>
        </div>

        {questionLoading ? (
          <p className="text-sm text-gray-400">Yükleniyor…</p>
        ) : !questionStats ? (
          <p className="text-sm text-red-500">Veri alınamadı.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <StatCard icon="📸" label="Bugünkü İstek" value={questionStats.todayCount} color="bg-[#eff6ff]" />
              <StatCard icon="✅" label="Çözülen (Ay)" value={questionStats.totalSolved} color="bg-[#ecfdf5]" />
              <StatCard icon="🔁" label="Toplam Deneme (Ay)" value={questionStats.totalAttempts} color="bg-[#fff7ed]" />
              <StatCard icon="👥" label="Tekil Öğrenci" value={questionStats.uniqueStudents} color="bg-[#f5f3ff]" />
              <StatCard icon="💵" label="Toplam Maliyet" value={fmtUsd(questionStats.totalCostUsd)} color="bg-[#fdf4ff]" />
              <StatCard icon="📊" label="Öğrenci Başına Maliyet" value={fmtUsd(questionStats.avgCostPerStudent)} color="bg-[#fef3c7]" />
              <StatCard icon="❓" label="Öğrenci Başına Soru" value={questionStats.avgQuestionsPerStudent ?? "—"} color="bg-[#f0fdf4]" />
              <StatCard icon="🔤" label="Toplam Token" value={(questionStats.totalInputTokens + questionStats.totalOutputTokens).toLocaleString("tr-TR")} color="bg-[#f1f5f9]" />
              <StatCard icon="🧪" label="Doğrulama Çağrısı (Ay)" value={questionStats.totalVerificationCalls ?? 0} color="bg-[#ecfeff]" />
              <StatCard icon="🧪" label="Doğrulama Maliyeti (Ay)" value={fmtUsd(questionStats.totalVerificationCostUsd)} color="bg-[#ecfeff]" />
            </div>

            {studentBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                      <th className="px-4 py-2">Öğrenci</th>
                      <th className="px-4 py-2">Deneme</th>
                      <th className="px-4 py-2">Çözülen</th>
                      <th className="px-4 py-2">Maliyet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentBreakdown.map((row) => (
                      <tr key={row.studentId} className="border-t border-gray-100">
                        <td className="px-4 py-2 text-gray-800">{row.name}</td>
                        <td className="px-4 py-2 text-gray-600">{row.attempts}</td>
                        <td className="px-4 py-2 text-gray-600">{row.solved}</td>
                        <td className="px-4 py-2 text-gray-600">{fmtUsd(row.costUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
