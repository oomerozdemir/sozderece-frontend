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
import {
  isReportableExam,
  filterResultsByPeriod,
  sortResultsChronologically,
  getAvailableComparisonFilters,
  filterResultsByComparisonKey,
  getMostRecentComparisonKey,
  calculateMovingAverage,
  calculateDevelopmentSummary,
  getAvailableSubjects,
  buildSubjectTrend,
  calculateMostImprovedSubject,
  fmtDate,
  formatNet,
} from "./examHelpers";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, RadialLinearScale, RadarController, Tooltip, Legend, Filler);

// Token-temiz renk paleti — eski NEON_PALETTE'teki (#D8FF4F, #7340C8 vb.)
// rebrand-öncesi literal hex'ler kaldırıldı.
const SUBJECT_PALETTE = ["#0E7C88", "#7340C8", "#c2410c", "#0B6976", "#a78bfa", "#059669"];

const PERIOD_OPTIONS = [
  { key: "30d", label: "Son 30 Gün" },
  { key: "3m", label: "Son 3 Ay" },
  { key: "6m", label: "Son 6 Ay" },
  { key: "all", label: "Tümü" },
];

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

const ChipRow = ({ options, activeKey, onSelect }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => onSelect(key)}
        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${activeKey === key ? "bg-page-navy text-white border-page-navy" : "bg-white text-[#64748b] border-[#e2e8f0]"}`}
      >
        {label}
      </button>
    ))}
  </div>
);

// KPI + zaman/tip filtreleri + grafikler. Yeni bir backend zaman-serisi
// endpoint'i kurulmuyor — GET /me/exam-results zaten tüm alanları döndüğü
// için tüm agregasyon burada, client-side useMemo ile yapılıyor.
//
// Tek veri kaynağı garantisi: `chronological` dizisi reportable (IN_PROGRESS/
// RESULT_PENDING hariç) + aktif period + aktif comparisonKey'den türer; KPI
// kartları, net grafiği, hareketli ortalama, süre grafiği, radar, ders
// seçici/grafiği ve "en çok gelişen ders" içgörüsü HEPSİ bu tek diziden
// beslenir — hiçbiri bağımsız bir filtre yolu kullanmaz.
export default function ExamDashboard({ results }) {
  const [period, setPeriod] = useState("3m");
  const [comparisonFilterState, setComparisonFilterState] = useState(null);
  const [selectedSubjectState, setSelectedSubjectState] = useState(null);

  const reportable = useMemo(() => results.filter(isReportableExam), [results]);
  const filterOptions = useMemo(
    () => getAvailableComparisonFilters(reportable).map(([key, label]) => ({ key, label })),
    [reportable]
  );
  const defaultComparisonKey = useMemo(() => getMostRecentComparisonKey(reportable), [reportable]);
  // "Tümü" seçeneği yok — her zaman TEK bir comparisonKey kapsamında
  // (TYT/AYT/LGS/BRANS:{branch} asla aynı grafikte karışmaz). Seçim geçersiz
  // kalırsa (veri yenilendi/ilk mount) en güncel reportable denemenin
  // türüne otomatik düşer.
  const activeComparisonFilter = filterOptions.some((o) => o.key === comparisonFilterState)
    ? comparisonFilterState
    : defaultComparisonKey;

  const periodFiltered = useMemo(() => filterResultsByPeriod(reportable, period), [reportable, period]);
  const typeFiltered = useMemo(
    () => filterResultsByComparisonKey(periodFiltered, activeComparisonFilter),
    [periodFiltered, activeComparisonFilter]
  );
  const chronological = useMemo(() => sortResultsChronologically(typeFiltered), [typeFiltered]);

  const summary = useMemo(() => calculateDevelopmentSummary(chronological), [chronological]);
  const subjects = useMemo(() => getAvailableSubjects(chronological), [chronological]);
  const activeSubject = subjects.includes(selectedSubjectState) ? selectedSubjectState : (subjects[0] ?? null);
  const subjectTrendPoints = useMemo(
    () => (activeSubject ? buildSubjectTrend(chronological, activeSubject) : []),
    [chronological, activeSubject]
  );
  const mostImproved = useMemo(() => calculateMostImprovedSubject(chronological), [chronological]);

  const netChartData = useMemo(() => {
    const hasTarget = chronological.some((r) => r.targetNet != null);
    const datasets = [
      {
        label: "Net",
        data: chronological.map((r) => (r.totalNet != null ? r.totalNet : null)),
        borderColor: "#0E7C88",
        backgroundColor: "rgba(14,124,136,0.08)",
        pointBackgroundColor: "#0E7C88",
        tension: 0.3,
        fill: true,
        spanGaps: true,
      },
    ];
    if (chronological.length >= 3) {
      const ma = calculateMovingAverage(chronological);
      datasets.push({
        label: "Son 3 Deneme Ortalaması",
        data: ma.map((p) => p.movingAverage),
        borderColor: "rgba(23,37,45,0.4)",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: false,
        spanGaps: true,
      });
    }
    if (hasTarget) {
      datasets.push({
        label: "Hedef Net",
        data: chronological.map((r) => (r.targetNet != null ? r.targetNet : null)),
        borderColor: "#94a3b8",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        spanGaps: true,
      });
    }
    return { labels: chronological.map((r) => fmtDate(r.examDate)), datasets };
  }, [chronological]);

  const netChartOptions = useMemo(
    () => ({
      ...lineOptions,
      plugins: {
        legend: { display: true, position: "bottom", labels: { color: "#475569", font: { family: "Nunito", weight: "700", size: 11 }, boxWidth: 10, padding: 12 } },
        tooltip: {
          backgroundColor: "#17252D",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          callbacks: {
            title: (items) => chronological[items[0]?.dataIndex]?.examName || "",
            label: (item) => {
              const exam = chronological[item.dataIndex];
              const dateStr = exam ? fmtDate(exam.examDate) : "";
              if (item.dataset.label === "Net") return `${dateStr} · ${formatNet(item.raw)} net`;
              return `${item.dataset.label}: ${item.raw != null ? formatNet(item.raw) : "—"}`;
            },
          },
        },
      },
      scales: lineOptions.scales,
    }),
    [chronological]
  );

  const durationChartData = useMemo(
    () => ({
      labels: chronological.map((r) => fmtDate(r.examDate)),
      datasets: [
        {
          label: "Süre (dk)",
          // Eksik/legacy veri kuralı: durationSeconds null ise nokta ÇİZİLMEZ
          // (sahte "0 dakika" olarak gösterilmez) — spanGaps ile boşluk bırakılır.
          data: chronological.map((r) => (r.durationSeconds != null ? Math.round(r.durationSeconds / 60) : null)),
          borderColor: "#0B6976",
          backgroundColor: "rgba(11,105,118,0.08)",
          pointBackgroundColor: "#0B6976",
          tension: 0.3,
          fill: true,
          spanGaps: true,
        },
      ],
    }),
    [chronological]
  );

  const subjectChartData = useMemo(
    () => ({
      labels: chronological.map((r) => fmtDate(r.examDate)),
      datasets: [
        {
          label: activeSubject || "",
          data: subjectTrendPoints.map((p) => p.net),
          borderColor: SUBJECT_PALETTE[0],
          backgroundColor: "rgba(14,124,136,0.08)",
          pointBackgroundColor: SUBJECT_PALETTE[0],
          tension: 0.3,
          fill: true,
          spanGaps: true,
        },
      ],
    }),
    [chronological, activeSubject, subjectTrendPoints]
  );

  const radarData = useMemo(() => {
    const last3 = chronological.slice(-3);
    const sums = {};
    const counts = {};
    for (const r of last3) {
      for (const s of r.subjectNets || []) {
        sums[s.subject] = (sums[s.subject] || 0) + (s.net || 0);
        counts[s.subject] = (counts[s.subject] || 0) + 1;
      }
    }
    const subjectKeys = Object.keys(sums);
    if (subjectKeys.length < 3) return null;
    return {
      labels: subjectKeys,
      datasets: [{
        label: "Ortalama Net (son 3 deneme)",
        data: subjectKeys.map((s) => Number((sums[s] / counts[s]).toFixed(1))),
        backgroundColor: "rgba(115,64,200,0.15)",
        borderColor: "#7340C8",
        pointBackgroundColor: "#7340C8",
        pointBorderColor: "#fff",
        borderWidth: 2,
      }],
    };
  }, [chronological]);

  if (results.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <FaChartLine className="mx-auto mb-3 text-[#cbd5e1]" size={28} />
        <p className="font-nunito text-sm text-[#94a3b8]">İlk denemeni eklediğinde net, süre ve gelişim grafiklerini burada göreceksin.</p>
      </div>
    );
  }

  if (reportable.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <FaChartLine className="mx-auto mb-3 text-[#cbd5e1]" size={28} />
        <p className="font-nunito text-sm text-[#94a3b8]">Sonuçları tamamlanmış bir denemen olduğunda burası dolacak.</p>
      </div>
    );
  }

  const recentAverageLabel = summary.recentAverageCount <= 1 ? "Son Deneme Ortalaması" : `Son ${summary.recentAverageCount} Deneme Ortalaması`;
  const changeValue = summary.change == null ? "—" : summary.change > 0 ? `+${formatNet(summary.change)}` : formatNet(summary.change);
  const changeSub = summary.change == null ? "En az 2 deneme gerekir" : `İlk net: ${formatNet(summary.firstNet)}`;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <ChipRow options={PERIOD_OPTIONS} activeKey={period} onSelect={setPeriod} />
        {filterOptions.length > 0 && (
          <ChipRow options={filterOptions} activeKey={activeComparisonFilter} onSelect={setComparisonFilterState} />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Son Net" value={formatNet(summary.latestNet)} />
        <KpiCard label="Değişim" value={changeValue} sub={changeSub} />
        <KpiCard label={recentAverageLabel} value={formatNet(summary.recentAverage)} />
        <KpiCard label="Toplam Deneme" value={summary.totalExams} sub={summary.bestNet != null ? `En iyi: ${formatNet(summary.bestNet)}` : undefined} />
      </div>

      {chronological.length === 0 ? (
        <p className="font-nunito text-xs text-[#94a3b8] text-center py-2">Bu filtrede sonuç yok.</p>
      ) : chronological.length === 1 ? (
        <p className="font-nunito text-xs text-[#94a3b8] text-center py-2">İkinci denemeni eklediğinde net gelişim grafiğin burada oluşacak.</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
            <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Net Gelişimi</p>
            <div style={{ height: 300 }}><Line data={netChartData} options={netChartOptions} /></div>
          </div>

          {subjects.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
              <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Derslere Göre Gelişim</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubjectState(s)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${activeSubject === s ? "bg-brand text-white border-brand" : "bg-white text-[#64748b] border-[#e2e8f0]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {subjectTrendPoints.filter((p) => p.net != null).length >= 2 ? (
                <div style={{ height: 200 }}><Line data={subjectChartData} options={lineOptions} /></div>
              ) : (
                <p className="font-nunito text-xs text-[#94a3b8] text-center py-8">Bu ders için yeterli veri yok.</p>
              )}
              {mostImproved && (
                <p className="font-nunito text-xs text-[#475569] mt-3 pt-3 border-t border-[#f1f5f9]">
                  <span className="font-bold text-brand">En çok gelişen ders:</span> {mostImproved.subject}{" "}
                  <span className="font-bold text-page-navy">+{formatNet(mostImproved.delta)} net</span>
                </p>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
            <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Süre Gelişimi</p>
            <div style={{ height: 200 }}><Line data={durationChartData} options={lineOptions} /></div>
          </div>

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
