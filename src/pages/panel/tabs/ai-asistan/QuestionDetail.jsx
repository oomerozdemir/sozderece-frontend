import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import axios from "../../../../utils/axios";
import QuestionResult from "./QuestionResult";
import { fmtDateTime } from "./aiAsistanHelpers";

// Geçmişten tıklanan bir sorunun tam görünümü — QuestionResult'ı reuse eder,
// follow-up akışı burada da aynı şekilde çalışır (soru zaten COMPLETED ise).
export default function QuestionDetail({ question: initial, onBack }) {
  const [question, setQuestion] = useState(initial);
  const [followupLoading, setFollowupLoading] = useState(false);

  const handleFollowup = async (type, stepIndex) => {
    setFollowupLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/v1/ogrenci/me/ai-question/${question.id}/followup`,
        { type, stepIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`/api/v1/ogrenci/me/ai-question/${question.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setQuestion(res.data.question);
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleUnderstanding = async (status) => {
    const token = localStorage.getItem("token");
    const res = await axios.patch(
      `/api/v1/ogrenci/me/ai-question/${question.id}/understanding`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setQuestion((prev) => ({ ...prev, ...res.data.question }));
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 font-nunito font-bold text-xs text-[#64748b] hover:text-page-navy">
        <FaArrowLeft size={11} /> Geçmişe Dön
      </button>
      {question.imageUrl && (
        <img src={question.imageUrl} alt="Soru" className="w-full max-w-xs mx-auto rounded-2xl border border-[#f1f5f9] block" />
      )}
      <p className="font-nunito text-xs text-[#94a3b8] text-center">{fmtDateTime(question.createdAt)}</p>
      <QuestionResult question={question} onFollowup={handleFollowup} followupLoading={followupLoading} onUnderstanding={handleUnderstanding} />
    </div>
  );
}
