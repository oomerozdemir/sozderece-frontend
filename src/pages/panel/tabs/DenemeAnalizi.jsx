import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { FaExclamationTriangle, FaBolt } from "react-icons/fa";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "");

// "Siber" tema için neon renk paleti — brand'ın lime'ı da içinde, ama bu
// grafikler bilinçli olarak sitenin geri kalanından ayrı, koyu bir zeminde.
const NEON_PALETTE = ["#00e5ff", "#D8FF4F", "#ff2ea6", "#a78bfa", "#ff9f1c", "#34d399"];

const cyberChartOptions = (dark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: dark, position: "bottom", labels: { color: "rgba(255,255,255,0.75)", font: { family: "Nunito", weight: "700", size: 11 }, boxWidth: 10, padding: 14 } },
    tooltip: { backgroundColor: "#0a0a2e", titleColor: "#fff", bodyColor: "#fff", borderColor: "rgba(255,255,255,0.15)", borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.06)" } },
    y: { ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.06)" } },
  },
});

export default function DenemeAnalizi({ onNavigate }) {
  const [results, setResults] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get("/api/v1/ogrenci/me/exam-results", { headers }).then((res) => res.data?.results || []),
      axios.get("/api/v1/ogrenci/me/insights", { headers }).then((res) => res.data?.insights || []).catch(() => []),
    ])
      .then(([r, i]) => { setResults(r); setInsights(i); })
      .finally(() => setLoading(false));
  }, [token]);

  const totalChartData = useMemo(
    () => ({
      labels: results.map((r) => fmtDate(r.examDate)),
      datasets: [
        {
          label: "Toplam Net",
          data: results.map((r) => r.totalNet ?? null),
          borderColor: "#D8FF4F",
          backgroundColor: "rgba(216,255,79,0.12)",
          pointBackgroundColor: "#D8FF4F",
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [results]
  );

  const subjectChartData = useMemo(() => {
    const subjects = [...new Set(results.flatMap((r) => (Array.isArray(r.subjectNets) ? r.subjectNets.map((s) => s.subject) : [])))];
    return {
      labels: results.map((r) => fmtDate(r.examDate)),
      datasets: subjects.map((subject, i) => ({
        label: subject,
        data: results.map((r) => {
          const s = (r.subjectNets || []).find((x) => x.subject === subject);
          return s ? s.net : null;
        }),
        borderColor: NEON_PALETTE[i % NEON_PALETTE.length],
        backgroundColor: "transparent",
        tension: 0.35,
        spanGaps: true,
      })),
    };
  }, [results]);

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  if (results.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <div className="text-3xl mb-3 opacity-40">📊</div>
        <p className="font-nunito text-sm text-[#94a3b8]">Henüz deneme sonucun girilmemiş. Koçun ilk deneme sonucunu eklediğinde burada göreceksin.</p>
      </div>
    );
  }

  const reversed = [...results].reverse(); // en yeni en üstte listelensin
  const hasSubjectData = subjectChartData.datasets.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Akıllı Deneme Analizi: tekrar eden hatalar ── */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
          <p className="flex items-center gap-2 font-fredoka font-bold text-amber-700 text-sm mb-3">
            <FaExclamationTriangle size={13} /> Akıllı Deneme Analizi — Tekrar Eden Hatalar
          </p>
          <div className="flex flex-col gap-2">
            {insights.map((ins) => (
              <div key={ins.topicId} className="flex items-center justify-between gap-3 bg-amber-50 rounded-xl px-4 py-3 flex-wrap">
                <p className="font-nunito text-sm text-[#334155]">
                  Son <strong>{ins.checkedExams}</strong> denemenin <strong>{ins.count}</strong> tanesinde{" "}
                  <strong className="text-amber-800">{ins.subject} — {ins.topicName}</strong> konusunda hata var.
                </p>
              </div>
            ))}
          </div>
          <p className="font-nunito text-[11px] text-[#94a3b8] mt-3">Koçun bu konuları programına ekleyebilir.</p>
        </div>
      )}

      {/* ── Siber temalı grafikler ── */}
      <div className="rounded-[20px] p-5 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #05051a 0%, #0d0b2e 60%, #150a35 100%)" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 240, height: 240, background: "#00e5ff", filter: "blur(90px)", opacity: 0.15, top: -80, left: -60 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: "#ff2ea6", filter: "blur(90px)", opacity: 0.12, bottom: -60, right: -40 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <FaBolt className="text-[#00e5ff]" size={13} />
            <span className="font-fredoka font-bold text-[11px] uppercase text-[#00e5ff]" style={{ letterSpacing: 2 }}>Net Trendi</span>
          </div>
          <div style={{ height: 220 }}>
            <Line data={totalChartData} options={cyberChartOptions(false)} />
          </div>

          {hasSubjectData && (
            <>
              <div className="flex items-center gap-2 mt-6 mb-1">
                <FaBolt className="text-[#D8FF4F]" size={13} />
                <span className="font-fredoka font-bold text-[11px] uppercase text-[#D8FF4F]" style={{ letterSpacing: 2 }}>Branş Bazlı Trend</span>
              </div>
              <div style={{ height: 240 }}>
                <Line data={subjectChartData} options={cyberChartOptions(true)} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {reversed.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <p className="font-fredoka font-bold text-page-navy text-base">{r.examName}</p>
                <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">{r.examType} · {fmtDate(r.examDate)}{r.ranking ? ` · Sıralama: ${r.ranking.toLocaleString("tr-TR")}` : ""}</p>
              </div>
              {r.totalNet != null && (
                <span className="font-fredoka font-bold text-lg px-3 py-1 rounded-full" style={{ background: "#ede8fa", color: "#1C1B8A" }}>
                  {r.totalNet} net
                </span>
              )}
            </div>
            {Array.isArray(r.subjectNets) && r.subjectNets.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#f1f5f9]">
                {r.subjectNets.map((s, i) => (
                  <span key={i} className="font-nunito text-xs font-semibold text-[#334155] bg-[#f8fafc] px-2.5 py-1 rounded-full">
                    {s.subject}: <strong className="text-[#0f172a]">{s.net}</strong>
                    {Array.isArray(s.wrongTopicIds) && s.wrongTopicIds.length > 0 && (
                      <span className="text-amber-600"> · {s.wrongTopicIds.length} konu tekrar gerekiyor</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {r.notes && <p className="font-nunito text-xs text-[#64748b] mt-3 leading-relaxed">{r.notes}</p>}
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigate && onNavigate("konular")}
        className="font-nunito font-bold text-sm text-page-navy text-left hover:underline"
      >
        Konu Ağacımı Aç →
      </button>
    </div>
  );
}
