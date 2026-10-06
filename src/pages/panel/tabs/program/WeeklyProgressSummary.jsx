// Haftalık özet — 4 küçük metrik, K2 gereği yalnızca done/total oranı.
export default function WeeklyProgressSummary({ stats }) {
  const metrics = [
    { label: "Toplam Görev", value: stats.total },
    { label: "Tamamlanan", value: stats.completed },
    { label: "Tamamlanma", value: `%${stats.percentage}` },
    { label: "Kalan", value: stats.remaining },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {metrics.map((m) => (
        <div key={m.label} className="bg-white rounded-xl border border-[#f1f5f9] px-2 py-2.5 text-center">
          <p className="font-fredoka font-bold text-page-navy text-base md:text-lg leading-none">{m.value}</p>
          <p className="font-nunito font-bold text-[9px] md:text-[10px] text-[#94a3b8] uppercase tracking-wide mt-1">{m.label}</p>
        </div>
      ))}
    </div>
  );
}
