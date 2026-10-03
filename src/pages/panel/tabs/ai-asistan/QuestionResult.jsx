import { useState } from "react";
import { FaLightbulb, FaListOl, FaCheckCircle, FaStar, FaQuestionCircle, FaExclamationTriangle } from "react-icons/fa";
import Button from "../../../../components/ui/Button";
import VerificationQuestion from "./VerificationQuestion";
import { FOLLOWUP_TYPE_LABELS } from "./aiAsistanHelpers";

const NON_SOLVED_MESSAGES = {
  MULTIPLE_QUESTIONS: "Bu fotoğrafta birden fazla soru görünüyor. Lütfen tek bir soru içeren bir fotoğraf yükle.",
  UNREADABLE: "Fotoğrafı net bir şekilde okuyamadım. Daha net, parlaksız bir fotoğraf çekip tekrar dener misin?",
  NOT_A_QUESTION: "Bu görselde bir soru bulamadım. Lütfen çözmek istediğin sorunun fotoğrafını yükle.",
  INVALID_IMAGE: "Bu dosya türünü okuyamadım. Lütfen PNG, JPEG ya da WEBP bir görsel yükle.",
  ERROR: "Soru işlenirken bir sorun oluştu. Lütfen tekrar dene.",
};

// Hem "az önce çözüldü" (AiAsistan.jsx'in upload sonrası) hem "geçmişten
// açıldı" (QuestionDetail.jsx) akışında kullanılan paylaşılan sonuç görünümü.
export default function QuestionResult({ question, onFollowup, followupLoading, onReset, onUnderstanding }) {
  const [globalError, setGlobalError] = useState("");
  const [understandingPending, setUnderstandingPending] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  if (question.status !== "COMPLETED") {
    return (
      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center mx-auto mb-4" style={{ color: "var(--color-warning)" }}>
          <FaExclamationTriangle size={20} />
        </div>
        <p className="font-nunito text-sm text-[#334155] leading-relaxed mb-5">
          {NON_SOLVED_MESSAGES[question.status] || NON_SOLVED_MESSAGES.ERROR}
        </p>
        {onReset && <Button variant="primary" onClick={onReset}>Yeni Fotoğraf Yükle</Button>}
      </div>
    );
  }

  const steps = Array.isArray(question.steps) ? question.steps : [];
  const followups = Array.isArray(question.followups) ? question.followups : [];
  const completedFollowups = followups.filter((f) => f.status === "COMPLETED");
  const atFollowupLimit = followups.filter((f) => f.status === "COMPLETED" || f.status === "PROCESSING").length >= 3;

  const triggerFollowup = async (type, stepIndex) => {
    setGlobalError("");
    try {
      await onFollowup(type, stepIndex);
    } catch (err) {
      setGlobalError(err?.response?.data?.message || "Bir şeyler ters gitti, tekrar dene.");
    }
  };

  // "Bu soruyu şimdi anladın mı?" — Evet/Biraz daha anlat/Benzer soru (plan
  // madde 3). "Biraz daha anlat" mevcut EXPLAIN_SIMPLER follow-up'ını aynen
  // tetikler (mantık tekrarlanmıyor); "Benzer soru" VerificationQuestion'ı açar.
  const handleUnderstanding = async (status) => {
    if (!onUnderstanding) return;
    setGlobalError("");
    setUnderstandingPending(true);
    try {
      await onUnderstanding(status);
      if (status === "NEEDS_MORE_HELP") await triggerFollowup("EXPLAIN_SIMPLER");
      if (status === "REQUESTED_PRACTICE") setShowVerification(true);
    } catch (err) {
      setGlobalError(err?.response?.data?.message || "Bir şeyler ters gitti, tekrar dene.");
    } finally {
      setUnderstandingPending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-5">
      <div>
        <p className="font-nunito font-bold text-xs text-brand uppercase" style={{ letterSpacing: 1.5 }}>
          {[question.subject, question.topic].filter(Boolean).join(" • ") || "Soru"}
        </p>
        {question.questionSummary && <p className="font-nunito text-sm text-[#64748b] mt-1">{question.questionSummary}</p>}
      </div>

      {question.concept && (
        <div>
          <p className="flex items-center gap-1.5 font-fredoka font-bold text-page-navy text-sm mb-1.5">
            <FaLightbulb size={13} className="text-brand" /> Önce mantığını anlayalım
          </p>
          <p className="font-nunito text-sm text-[#334155] leading-relaxed">{question.concept}</p>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 font-fredoka font-bold text-page-navy text-sm mb-2">
            <FaListOl size={13} className="text-brand" /> Birlikte çözelim
          </p>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-light text-brand font-nunito font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-nunito text-sm text-[#334155] leading-relaxed">{step}</p>
                  <button
                    onClick={() => triggerFollowup("EXPLAIN_STEP", i)}
                    disabled={followupLoading || atFollowupLimit}
                    className="font-nunito font-bold text-[11px] text-brand hover:underline mt-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Bu adımı açıkla →
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(question.answer || question.option) && (
        <div className="bg-brand-light/40 rounded-xl p-4">
          <p className="flex items-center gap-1.5 font-fredoka font-bold text-page-navy text-sm mb-1">
            <FaCheckCircle size={13} className="text-brand" /> Cevap
          </p>
          <p className="font-nunito font-bold text-sm text-page-navy">
            {question.option && <span>{question.option}) </span>}
            {question.answer}
          </p>
        </div>
      )}

      {question.tip && (
        <div>
          <p className="flex items-center gap-1.5 font-fredoka font-bold text-page-navy text-sm mb-1.5">
            <FaStar size={13} className="text-brand" /> Benzer sorularda dikkat et
          </p>
          <p className="font-nunito text-sm text-[#334155] leading-relaxed">{question.tip}</p>
        </div>
      )}

      {completedFollowups.length > 0 && (
        <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
          {completedFollowups.map((f) => (
            <div key={f.id} className="bg-[#f8fafc] rounded-xl p-3.5">
              <p className="font-nunito font-bold text-[11px] text-[#94a3b8] mb-1">
                <FaQuestionCircle size={10} className="inline mr-1" />
                {FOLLOWUP_TYPE_LABELS[f.type] || f.type}
              </p>
              <p className="font-nunito text-sm text-[#334155] leading-relaxed">{f.responseText}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => triggerFollowup("EXPLAIN_SIMPLER")} disabled={followupLoading || atFollowupLimit}>
          Daha basit anlat
        </Button>
        <Button variant="outline" size="sm" onClick={() => triggerFollowup("SIMILAR_EXAMPLE")} disabled={followupLoading || atFollowupLimit}>
          Benzer bir örnek göster
        </Button>
      </div>
      {atFollowupLimit && <p className="font-nunito text-[11px] text-[#94a3b8]">Bu soru için follow-up hakkın doldu.</p>}
      {globalError && <p className="font-nunito text-xs font-bold text-[#dc2626]">{globalError}</p>}

      {onUnderstanding && (
        <div className="pt-4 border-t border-[#f1f5f9] space-y-2.5">
          <p className="font-fredoka font-bold text-page-navy text-sm">Bu soruyu şimdi anladın mı?</p>
          {question.understandingStatus ? (
            <p className="font-nunito text-xs text-[#94a3b8]">Geri bildirimin için teşekkürler.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleUnderstanding("SELF_REPORTED_UNDERSTOOD")} disabled={understandingPending}>
                Evet, anladım
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUnderstanding("NEEDS_MORE_HELP")} disabled={understandingPending || atFollowupLimit}>
                Biraz daha anlat
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUnderstanding("REQUESTED_PRACTICE")} disabled={understandingPending}>
                Benzer soru çözmek istiyorum
              </Button>
            </div>
          )}
          {showVerification && <VerificationQuestion questionId={question.id} onClose={() => setShowVerification(false)} />}
        </div>
      )}

      {onReset && (
        <div className="pt-3 border-t border-[#f1f5f9]">
          <Button variant="primary" fullWidth onClick={onReset}>Yeni Soru Yükle</Button>
        </div>
      )}
    </div>
  );
}
