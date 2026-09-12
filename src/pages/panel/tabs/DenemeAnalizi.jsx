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

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "");

export default function DenemeAnalizi() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/exam-results", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setResults(res.data?.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [token]);

  const chartData = useMemo(
    () => ({
      labels: results.map((r) => fmtDate(r.examDate)),
      datasets: [
        {
          label: "Toplam Net",
          data: results.map((r) => r.totalNet ?? null),
          borderColor: "#1C1B8A",
          backgroundColor: "rgba(28,27,138,0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [results]
  );

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

  return (
    <div className="flex flex-col gap-5">
      {results.some((r) => r.totalNet != null) && (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
          <p className="font-fredoka font-bold text-page-navy text-sm mb-4">Net Trendi</p>
          <div style={{ height: 220 }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      )}

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
                  </span>
                ))}
              </div>
            )}
            {r.notes && <p className="font-nunito text-xs text-[#64748b] mt-3 leading-relaxed">{r.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
