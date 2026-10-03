import { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import axios from "../../../../utils/axios";
import UsageIndicator from "./UsageIndicator";
import UploadEmptyState from "./UploadEmptyState";
import SolvingLoadingState from "./SolvingLoadingState";
import QuestionResult from "./QuestionResult";
import QuestionHistoryList from "./QuestionHistoryList";
import QuestionDetail from "./QuestionDetail";
import QuotaReachedState from "./QuotaReachedState";
import QuestionProfile from "./QuestionProfile";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// AI Soru Asistanı kabuğu — DenemeAnalizi.jsx ile aynı orkestrasyon rolü.
// view: "upload" (varsayılan, usage+history altta) | "solving" | "result" | "detail"
export default function AiAsistan() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("upload");
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [detailQuestion, setDetailQuestion] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);

  const loadAll = () => {
    setLoading(true);
    return Promise.all([
      axios.get("/api/v1/ogrenci/me/ai-question/usage", { headers: authHeaders() }).then((res) => res.data),
      axios.get("/api/v1/ogrenci/me/ai-question/history", { headers: authHeaders() }).then((res) => res.data?.questions || []),
    ])
      .then(([usageRes, history]) => {
        setUsage(usageRes);
        setQuestions(history);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleUpload = async (file) => {
    setUploadError("");
    setView("solving");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post("/api/v1/ogrenci/me/ai-question", formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      setUsage(res.data.usage);
      setActiveQuestion(res.data.question);
      setView("result");
      // Geçmişi arka planda tazele — çözüm ekranı anında görünsün diye beklemiyoruz.
      axios.get("/api/v1/ogrenci/me/ai-question/history", { headers: authHeaders() }).then((r) => setQuestions(r.data?.questions || []));
    } catch (err) {
      if (err?.response?.status === 429) {
        setUsage(err.response.data?.usage || usage);
        setView("quota");
        return;
      }
      setUploadError(err?.response?.data?.message || "Soru işlenemedi, lütfen tekrar dene.");
      setView("upload");
    }
  };

  const handleFollowup = async (type, stepIndex) => {
    setFollowupLoading(true);
    try {
      await axios.post(
        `/api/v1/ogrenci/me/ai-question/${activeQuestion.id}/followup`,
        { type, stepIndex },
        { headers: authHeaders() }
      );
      const res = await axios.get(`/api/v1/ogrenci/me/ai-question/${activeQuestion.id}`, { headers: authHeaders() });
      setActiveQuestion(res.data.question);
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleUnderstanding = async (status) => {
    const res = await axios.patch(
      `/api/v1/ogrenci/me/ai-question/${activeQuestion.id}/understanding`,
      { status },
      { headers: authHeaders() }
    );
    // Yalnızca skaler alanlar döner (followups/verifications relation'ları
    // dahil değil) — mevcut state'in üzerine merge edilir, ilişkiler kaybolmaz.
    setActiveQuestion((prev) => ({ ...prev, ...res.data.question }));
  };

  const handleReset = () => {
    setActiveQuestion(null);
    setUploadError("");
    setView(usage && usage.remaining <= 0 ? "quota" : "upload");
  };

  const handleSelectHistory = (q) => {
    setDetailQuestion(q);
    setView("detail");
  };

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center gap-2.5">
        <FaRobot className="text-brand" size={20} />
        <p className="font-fredoka font-bold text-page-navy text-lg">AI Soru Asistanı</p>
      </div>

      <UsageIndicator usage={usage} />

      {view === "solving" && <SolvingLoadingState />}

      {view === "quota" && <QuotaReachedState />}

      {view === "result" && activeQuestion && (
        <QuestionResult
          question={activeQuestion}
          onFollowup={handleFollowup}
          followupLoading={followupLoading}
          onReset={handleReset}
          onUnderstanding={handleUnderstanding}
        />
      )}

      {view === "detail" && detailQuestion && (
        <QuestionDetail question={detailQuestion} onBack={() => { setView("upload"); setDetailQuestion(null); }} />
      )}

      {view === "upload" && (
        <>
          <UploadEmptyState onUpload={handleUpload} error={uploadError} />
          <QuestionProfile />
          <div>
            <p className="font-fredoka font-bold text-page-navy text-sm mb-3">Geçmişim</p>
            <QuestionHistoryList questions={questions} onSelect={handleSelectHistory} />
          </div>
        </>
      )}
    </div>
  );
}
