import { useEffect, useState } from "react";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const EVALUATION_META = {
  CORRECT: { label: "Doğru", bg: "var(--color-brand-light)", color: "var(--color-brand)" },
  PARTIAL: { label: "Kısmen doğru", bg: "#fff7ed", color: "#c2410c" },
  INCORRECT: { label: "Tekrar deneyelim", bg: "#fef3c7", color: "var(--color-warning)" },
};

// "Benzer soru çözmek istiyorum" akışı (plan madde 4) — orijinal sorunun
// kopyası olmayan kısa bir pratik sorusu üretir, backend Claude ile
// değerlendirir. Resmi bir ölçme-değerlendirme skoru değildir, yalnızca
// ürün-içi öğrenme sinyali — beklenen cevap (expectedAnswerJson) hiçbir
// zaman backend'den bu bileşene gönderilmez (R5), burada da gösterilmez.
export default function VerificationQuestion({ questionId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .post(`/api/v1/ogrenci/me/ai-question/${questionId}/verification/generate`, {}, { headers: authHeaders() })
      .then((res) => setVerification(res.data.verification))
      .catch((err) => setError(err?.response?.data?.message || "Pratik sorusu üretilemedi, lütfen tekrar dene."))
      .finally(() => setLoading(false));
  }, [questionId]);

  const handleSubmit = async () => {
    if (!answer.trim() || !verification) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `/api/v1/ogrenci/me/ai-question/${questionId}/verification/${verification.id}/answer`,
        { studentAnswer: answer.trim() },
        { headers: authHeaders() }
      );
      setVerification(res.data.verification);
    } catch (err) {
      setError(err?.response?.data?.message || "Cevap gönderilemedi, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-fredoka font-bold text-page-navy text-sm">Pratik Sorusu</p>
        {onClose && (
          <button onClick={onClose} className="font-nunito font-bold text-xs text-[#94a3b8] hover:text-[#64748b]">
            Kapat
          </button>
        )}
      </div>

      {loading && <p className="font-nunito text-xs text-[#94a3b8]">Hazırlanıyor…</p>}
      {error && <p className="font-nunito text-xs font-bold text-[#dc2626]">{error}</p>}

      {verification && (
        <>
          <p className="font-nunito text-sm text-[#334155] leading-relaxed">{verification.promptText}</p>

          {verification.evaluationStatus ? (
            <div className="rounded-xl p-3.5" style={{ background: EVALUATION_META[verification.evaluationStatus]?.bg }}>
              <p className="font-nunito font-bold text-xs mb-1" style={{ color: EVALUATION_META[verification.evaluationStatus]?.color }}>
                {EVALUATION_META[verification.evaluationStatus]?.label}
              </p>
              {verification.feedback && <p className="font-nunito text-sm text-[#334155] leading-relaxed">{verification.feedback}</p>}
            </div>
          ) : (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Cevabını buraya yaz…"
                className="w-full rounded-xl border border-[#e2e8f0] p-3 text-sm font-nunito outline-none focus:border-brand transition-colors resize-none"
              />
              <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting} disabled={!answer.trim()}>
                Cevabı Gönder
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
