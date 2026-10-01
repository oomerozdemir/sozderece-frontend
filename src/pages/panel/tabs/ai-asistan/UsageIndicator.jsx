// "Bugünkü kullanım 3 / 10" — yalnızca başarıyla çözülmüş (solved) soru
// sayısını gösterir, backend'in dahili attempt/reservation sayaçlarını hiç
// yansıtmaz (D4).
export default function UsageIndicator({ usage }) {
  if (!usage) return null;
  const percent = usage.dailyLimit > 0 ? Math.min(100, Math.round((usage.usedToday / usage.dailyLimit) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-nunito font-bold text-xs text-[#475569]">
          Bugünkü kullanım <span className="text-page-navy">{usage.usedToday} / {usage.dailyLimit}</span>
        </p>
        {usage.remaining === 0 && (
          <span className="font-nunito font-bold text-[11px] text-[#dc2626]">Hakkın doldu</span>
        )}
      </div>
      <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(4, percent)}%` }} />
      </div>
    </div>
  );
}
