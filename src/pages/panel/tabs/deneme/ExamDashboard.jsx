import { useMemo, useState } from "react";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  RadarController,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FaDiceD20, FaChartLine } from "react-icons/fa";
import { comparisonKey, comparisonLabel } from "./examConfig";
import { fmtDate, formatNet } from "./examHelpers";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, RadialLinearScale, RadarController, Tooltip, Legend, Filler);

// Token-temiz renk paleti — eski NEON_PALETTE'teki (#D8FF4F, #7340C8 vb.)
// rebrand-öncesi literal hex'ler kaldırıldı.
const SUBJECT_PALETTE = ["#0E7C88", "#7340C8", "#c2410c", "#0B6976", "#a78bfa", "#059669"];

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#17252D", titleColor: "#fff", bodyColor: "#fff", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
    y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#f1f5f9" } },
  },
};

const multiLineOptions = {
  ...lineOptions,
  plugins: {
    ...lineOptions.plugins,
    legend: { display: true, position: "bottom", labels: { color: "#475569", font: { family: "Nunito", weight: "700", size: 11 }, boxWidth: 10, padding: 12 } },
  },
};

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#17252D", titleColor: "#fff", bodyColor: "#fff" },
  },
  scales: {
    r: {
      beginAtZero: true,
      angleLines: { color: "#e2e8f0" },
      grid: { color: "#f1f5f9" },
      pointLabels: { color: "#475569", font: { family: "Nunito", weight: "700", size: 11 } },
      ticks: { display: false, backdropColor: "transparent" },
    },
  },
};

const KpiCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-2xl border border-[#f1f5f9] p-4">
    <p className="font-nunito text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">{label}</p>
    <p className="font-fredoka font-bold text-page-navy text-xl">{value}</p>
    {sub && <p className="font-nunito text-[11px] text-[#94a3b8] mt-0.5">{sub}</p>}
  </div>
);

// KPI + filtreler + grafikler. Yeni bir backend zaman-serisi endpoint'i
// kurulmuyor — GET /me/exam-results zaten tüm alanları döndüğü için tüm
// agregasyon burada, client-side useMemo ile yapılıyor (AdminDashboard.jsx'in
// aylık sipariş grafiği ve bu ekranın kendi eski radar/line grafikleri de
// zaten aynı deseni kullanıyordu).
export default function ExamDashboard({ results }) {
  const [filter, setFilter] = useState("ALL");

  const filterOptions = useMemo(() => {
    const seen = new Map();
    for (const r of results) {
      const key = comparisonKey(r);
      if (!seen.has(key)) seen.set(key, comparisonLabel(r));
    }
    return [...seen.entries()];
  }, [results]);

  const filtered = useMemo(
    () => (filter === "ALL" ? results : results.filter((r) => comparisonKey(r) === filter)),
    [results, filter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(a.examDate) - new Date(b.examDate)), [filtered]);

  const kpis = useMemo(() => {
    if (sorted.length === 0) return null;
    const last = sorted[sorted.length - 1];
    const bestNet = sorted.reduce((best, r) => (r.totalNet != null && (best == null || r.totalNet > best) ? r.totalNet : best), null);
    return {
      lastNet: last.totalNet,
      bestNet,
      lastDuration: last.durationSeconds,
      total: sorted.length,
    };
  }, [sorted]);

  const netChartData = useMemo(() => {
    const hasTarget = sorted.some((r) => r.targetNet != null);
    const datasets = [
      {
        label: "Net",
        data: sorted.map((r) => (r.totalNet != null ? r.totalNet : null)),
        borderColor: "#0E7C88",
        backgroundColor: "rgba(14,124,136,0.08)",
        pointBackgroundColor: "#0E7C88",
        tension: 0.3,
        fill: true,
        spanGaps: true,
      },
    ];
    if (hasTarget) {
      datasets.push({
        label: "Hedef Net",
        data: sorted.map((r) => (r.targetNet != null ? r.targetNet : null)),
        borderColor: "#94a3b8",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        spanGaps: true,
      });
    }
    return { labels: sorted.map((r) => fmtDate(r.examDate)), datasets };
  }, [sorted]);

  const durationChartData = useMemo(() => ({
    labels: sorted.map((r) => fmtDate(r.examDate)),
    datasets: [
      {
        label: "Süre (dk)",
        // Eksik/legacy veri kuralı: durationSeconds null ise nokta ÇİZİLMEZ
        // (sahte "0 dakika" olarak gösterilmez) — spanGaps ile boşluk bırakılır.
        data: sorted.map((r) => (r.durationSeconds != null ? Math.round(r.durationSeconds / 60) : null)),
        borderColor: "#0B6976",
        backgroundColor: "rgba(11,105,118,0.08)",
        pointBackgroundColor: "#0B6976",
        tension: 0.3,
        fill: true,
        spanGaps: true,
      },
    ],
  }), [sorted]);

  const subjectChartData = useMemo(() => {
    const subjects = [...new Set(sorted.flatMap((r) => (Array.isArray(r.subjectNets) ? r.subjectNets.map((s) => s.subject) : [])))];
    return {
      labels: sorted.map((r) => fmtDate(r.examDate)),
      datasets: subjects.map((subject, i) => ({
        label: subject,
        data: sorted.map((r) => {
          const s = (r.subjectNets || []).find((x) => x.subject === subject);
          return s ? s.net : null;
        }),
        borderColor: SUBJECT_PALETTE[i % SUBJECT_PALETTE.length],
        backgroundColor: "transparent",
        tension: 0.3,
        spanGaps: true,
      })),
    };
  }, [sorted]);

  const radarData = useMemo(() => {
    const last3 = sorted.slice(-3);
    const sums = {};
    const counts = {};
    for (const r of last3) {
      for (const s of r.subjectNets || []) {
        sums[s.subject] = (sums[s.subject] || 0) + (s.net || 0);
        counts[s.subject] = (counts[s.subject] || 0) + 1;
      }
    }
    const subjects = Object.keys(sums);
    if (subjects.length < 3) return null;
    return {
      labels: subjects,
      datasets: [{
        label: "Ortalama Net (son 3 deneme)",
        data: subjects.map((s) => Number((sums[s] / counts[s]).toFixed(1))),
        backgroundColor: "rgba(115,64,200,0.15)",
        borderColor: "#7340C8",
        pointBackgroundColor: "#7340C8",
        pointBorderColor: "#fff",
        borderWidth: 2,
      }],
    };
  }, [sorted]);

  if (results.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <FaChartLine className="mx-auto mb-3 text-[#cbd5e1]" size={28} />
        <p className="font-nunito text-sm text-[#94a3b8]">İlk denemeni eklediğinde net, süre ve gelişim grafiklerini burada göreceksin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {filterOptions.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${filter === "ALL" ? "bg-page-navy text-white border-page-navy" : "bg-white text-[#64748b] border-[#e2e8f0]"}`}
          >
            Tümü
          </button>
          {filterOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${filter === key ? "bg-page-navy text-white border-page-navy" : "bg-white text-[#64748b] border-[#e2e8f0]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Son Net" value={formatNet(kpis.lastNet)} />
          <KpiCard label="En İyi Net" value={formatNet(kpis.bestNet)} />
          <KpiCard label="Son Deneme Süresi" value={kpis.lastDuration != null ? `${Math.round(kpis.lastDuration / 60)} dk` : "—"} />
          <KpiCard label="Toplam Deneme" value={kpis.total} />
        </div>
      )}

      {sorted.length === 1 ? (
        <p className="font-nunito text-xs text-[#94a3b8] text-center py-2">İkinci denemeni eklediğinde gelişim grafiklerin burada görünecek.</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
            <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Net Gelişimi</p>
            <div style={{ height: 220 }}><Line data={netChartData} options={lineOptions} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
            <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Süre Gelişimi</p>
            <div style={{ height: 200 }}><Line data={durationChartData} options={lineOptions} /></div>
          </div>
          {subjectChartData.datasets.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
              <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Derslere Göre Gelişim</p>
              <div style={{ height: 240 }}><Line data={subjectChartData} options={multiLineOptions} /></div>
            </div>
          )}
          {radarData && (
            <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
              <div className="flex items-center gap-2 mb-1">
                <FaDiceD20 className="text-[#7340C8]" size={13} />
                <span className="font-fredoka font-bold text-page-navy text-sm">Yetenek Radarın</span>
              </div>
              <p className="font-nunito text-[11px] text-[#94a3b8] mb-2">Dış çembere yakın = güçlü yönün. İçe çöken köşe = orada çalışman gereken yer.</p>
              <div style={{ height: 260 }}><Radar data={radarData} options={radarOptions} /></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
