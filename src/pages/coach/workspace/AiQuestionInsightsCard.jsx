const SIGNAL_LABELS = {
  NEEDS_PRACTICE: "Pratik gerektiriyor",
  IMPROVING: "Gelişim gösteriyor",
  VERIFIED_ONCE: "Doğrulandı",
};

const SIGNAL_COLORS = {
  NEEDS_PRACTICE: { bg: "#f8fafc", color: "#64748b" },
  IMPROVING: { bg: "var(--color-brand-light)", color: "var(--color-brand)" },
  VERIFIED_ONCE: { bg: "var(--color-brand-light)", color: "var(--color-brand)" },
};

// "AI Soru Asistanı İçgörüleri" — tamamen deterministic aggregation'dan
// (utils/aiQuestionInsights.js#buildQuestionInsights, öğrenci ekranıyla aynı
// tek fonksiyon). İçgörü (learningSignals, sayıma dayalı tahmin) ile gerçek
// doğrulama sonucu (verificationSummary, gözlemlenmiş) aynı ağırlıkta
// sunulmaz — plan madde 21.
export default function AiQuestionInsightsCard({ insights, loading }) {
  if (loading) {
    return <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>;
  }
  if (!insights || !insights.totalQuestions) {
    return (
      <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#f1f5f9]">
        <p className="text-xs font-black text-[#0f172a] mb-1">AI Soru Asistanı İçgörüleri</p>
        <p className="text-xs text-[#94a3b8]">Son 30 günde AI Soru Asistanı'na yüklenmiş bir soru yok.</p>
      </div>
    );
  }

  const { totalQuestions, topTopics, topSkills, learningSignals, verificationSummary } = insights;

  return (
    <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#f1f5f9] space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-[#0f172a]">AI Soru Asistanı İçgörüleri</p>
        <span className="text-[11px] font-bold text-[#64748b]">Son 30 gün · Toplam {totalQuestions} soru</span>
      </div>

      {topTopics.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">En çok yardım istediği konular</p>
          <div className="space-y-1">
            {topTopics.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-[#334155]">
                <span>{i + 1}. {t.subject} — {t.topic}</span>
                <span className="font-bold tabular-nums">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topSkills.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">En çok tekrar eden beceriler</p>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.slice(0, 6).map((s, i) => (
              <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-[#e2e8f0] text-[#475569]">
                {s.skill} — {s.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {learningSignals.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Öğrenme sinyalleri</p>
          <div className="space-y-1">
            {learningSignals.slice(0, 6).map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#334155]">{s.subject} / {s.topic} — {s.skill} <span className="text-[#94a3b8]">({s.occurrenceCount} soru)</span></span>
                <span
                  className="flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={SIGNAL_COLORS[s.state] || SIGNAL_COLORS.NEEDS_PRACTICE}
                >
                  {SIGNAL_LABELS[s.state] || s.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {verificationSummary.total > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Son doğrulamalar</p>
          <p className="text-xs text-[#334155]">
            <strong className="text-[#059669]">{verificationSummary.correct} doğru</strong>
            {verificationSummary.incorrect > 0 && <> · <strong className="text-[#dc2626]">{verificationSummary.incorrect} yanlış</strong></>}
            {verificationSummary.partial > 0 && <> · <strong className="text-amber-600">{verificationSummary.partial} kısmi</strong></>}
          </p>
        </div>
      )}
    </div>
  );
}
