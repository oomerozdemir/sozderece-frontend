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

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/admin/ai-usage/summary", { params: { month } })
      .then((res) => setStats(res.data?.stats || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
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
      </div>
    </div>
  );
}
