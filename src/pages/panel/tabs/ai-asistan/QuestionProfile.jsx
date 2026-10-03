import { useEffect, useState } from "react";
import axios from "../../../../utils/axios";
import { LEARNING_SIGNAL_LABELS } from "./aiAsistanHelpers";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const SIGNAL_CHIP_CLS = {
  NEEDS_PRACTICE: "bg-[#f8fafc] text-[#64748b]",
  IMPROVING: "bg-brand-light text-brand",
  VERIFIED_ONCE: "bg-brand-light text-brand",
};

// "Soru Profilim" — tamamen utils/aiQuestionInsights.js'teki deterministic
// aggregation'dan (AI çağrısı yok). Yargılayıcı dil kullanılmaz (plan madde
// 21): "zayıf olduğun konu" değil "üzerinde çalıştığın konu". Hiç soru
// sorulmamışsa (totalQuestions=0) hiçbir şey render etmez — yeni kullanıcıya
// boş/gereksiz bir kart gösterilmez.
export default function QuestionProfile() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/ai-question/insights", { headers: authHeaders() })
      .then((res) => setInsights(res.data))
      .catch(() => {});
  }, []);

  if (!insights || !insights.totalQuestions) return null;

  const { topTopics, learningSignals, verificationSummary } = insights;

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
      <p className="font-fredoka font-bold text-page-navy text-sm">Soru Profilim</p>
      <p className="font-nunito text-[11px] text-[#94a3b8] mb-3">Son 30 günde en çok soru sorduğun konular</p>

      {topTopics.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {topTopics.slice(0, 5).map((t, i) => (
            <div key={i} className="flex items-center justify-between text-sm font-nunito">
              <span className="text-[#334155]">{t.subject} · {t.topic}</span>
              <span className="font-bold text-page-navy tabular-nums">{t.count}</span>
            </div>
          ))}
        </div>
      )}

      {learningSignals.length > 0 && (
        <div className="mb-4">
          <p className="font-nunito text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide mb-2">Üzerinde çalıştığın konular</p>
          <div className="flex flex-wrap gap-1.5">
            {learningSignals.slice(0, 6).map((s, i) => (
              <span
                key={i}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${SIGNAL_CHIP_CLS[s.state] || SIGNAL_CHIP_CLS.NEEDS_PRACTICE}`}
                title={LEARNING_SIGNAL_LABELS[s.state]}
              >
                {s.topic} — {s.skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {verificationSummary.total > 0 && (
        <p className="font-nunito text-xs text-[#64748b]">
          Son doğrulamalar: <strong className="text-page-navy">{verificationSummary.correct} doğru</strong>
          {verificationSummary.incorrect > 0 && (
            <> · <strong className="text-page-navy">{verificationSummary.incorrect} tekrar gerekiyor</strong></>
          )}
        </p>
      )}
    </div>
  );
}
