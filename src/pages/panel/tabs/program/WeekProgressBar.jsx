// Haftalık çizelgedeki tikler arttıkça dolan, oyunlaştırılmış bir seviye
// barı — tek tek sayılara bakmak yerine tek bakışta "ne kadar doldu"
// hissini veriyor. %100'e ulaşınca renk yeşile döner ve kutlama rozeti çıkar
// (ses efekti WeeklyProgramSection.jsx'te, ilk kez %100'e ulaşıldığı anda).
export default function WeekProgressBar({ percentage }) {
  const pct = Math.max(0, Math.min(100, percentage || 0));
  const isComplete = pct >= 100;

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-fredoka font-bold text-page-navy text-sm">
          {isComplete ? "Hafta tamamlandı! 🎉" : "Haftalık İlerleme"}
        </p>
        <span
          className="font-fredoka font-bold text-sm tabular-nums"
          style={{ color: isComplete ? "#059669" : "var(--color-brand)" }}
        >
          %{Math.round(pct)}
        </span>
      </div>
      <div className="h-4 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(pct > 0 ? 4 : 0, pct)}%`,
            background: isComplete
              ? "linear-gradient(90deg, #059669, #10b981)"
              : "linear-gradient(90deg, var(--color-dark), var(--color-brand))",
          }}
        />
      </div>
    </div>
  );
}
