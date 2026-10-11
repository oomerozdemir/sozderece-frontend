import { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import axios from "../../../../utils/axios";
import UsageIndicator from "./UsageIndicator";
import UploadEmptyState from "./UploadEmptyState";
import AiAssistantLockedState from "./AiAssistantLockedState";
import SolvingLoadingState from "./SolvingLoadingState";
import QuestionResult from "./QuestionResult";
import QuestionHistoryList from "./QuestionHistoryList";
import QuestionDetail from "./QuestionDetail";
import QuotaReachedState from "./QuotaReachedState";
import QuestionProfile from "./QuestionProfile";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// AI Soru Asistanı kabuğu — DenemeAnalizi.jsx ile aynı orkestrasyon rolü.
// view: "upload" (varsayılan, usage+history altta) | "solving" | "result" | "detail"
//
// Paket bazlı erişim: `student` StudentPanel.jsx'ten gelir (ilk mount'ta
// null olabilir — bu, "henüz bilinmiyor" anlamına gelir ve upload UI'ını
// göstermeden önce skeleton'da bekletir, prematüre "açık" görünüp sonra
// kilitlenmesin diye). `accessRevoked`, bir AI aksiyonu sırasında backend'den
// 403 AI_ASSISTANT_PACKAGE_REQUIRED dönerse (paket oturum ortasında düştüyse)
// `student` prop'u henüz güncellenmemiş olsa bile anında kilitli görünüme
// geçmek için yerel bir override — StudentPanel zaten tab-enter'da /me'yi
// tazeler, ama açık sekmedeyken gerçek zamanlı buradan yakalanır.
export default function AiAsistan({ student }) {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("upload");
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [detailQuestion, setDetailQuestion] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);
  const [accessRevoked, setAccessRevoked] = useState(false);

  const entitled = !accessRevoked && !!student?.entitlements?.aiQuestionAssistant?.enabled;
  const handleAccessRevoked = () => setAccessRevoked(true);

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

  // Paket yeniden açılırsa (tab-enter refetch, admin upgrade sonrası) yerel
  // override'ı temizle — taze veri her zaman kazanır.
  useEffect(() => {
    if (student?.entitlements?.aiQuestionAssistant?.enabled) setAccessRevoked(false);
  }, [student?.entitlements?.aiQuestionAssistant?.enabled]);

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
      if (err?.response?.data?.code === "AI_ASSISTANT_PACKAGE_REQUIRED") {
        handleAccessRevoked();
        setView("upload");
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
    } catch (err) {
      if (err?.response?.data?.code === "AI_ASSISTANT_PACKAGE_REQUIRED") {
        handleAccessRevoked();
      }
      throw err;
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

  // `!student`: StudentPanel.jsx'teki /me isteği henüz dönmedi — paket
  // hakkı bilinmeden upload UI'ını bir an gösterip sonra kilitlemeyelim.
  if (loading || !student) {
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
          aiActionsEnabled={entitled}
          onAccessRevoked={handleAccessRevoked}
        />
      )}

      {view === "detail" && detailQuestion && (
        <QuestionDetail
          question={detailQuestion}
          onBack={() => { setView("upload"); setDetailQuestion(null); }}
          aiActionsEnabled={entitled}
          onAccessRevoked={handleAccessRevoked}
        />
      )}

      {view === "upload" && (
        <>
          {entitled ? <UploadEmptyState onUpload={handleUpload} error={uploadError} /> : <AiAssistantLockedState />}
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
