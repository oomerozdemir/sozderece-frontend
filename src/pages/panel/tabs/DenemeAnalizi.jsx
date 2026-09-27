import { useCallback, useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { FaPlus, FaExclamationTriangle, FaBolt, FaPen, FaClipboardList } from "react-icons/fa";
import Button from "../../../components/ui/Button";
import NewExamChoiceModal from "./deneme/NewExamChoiceModal";
import ExamSetupForm from "./deneme/ExamSetupForm";
import ActiveExamTimer from "./deneme/ActiveExamTimer";
import ExamResultForm from "./deneme/ExamResultForm";
import ExamSelfAnalysis from "./deneme/ExamSelfAnalysis";
import ExamSummary from "./deneme/ExamSummary";
import ManualExamForm from "./deneme/ManualExamForm";
import ExamDashboard from "./deneme/ExamDashboard";
import ExamHistoryList from "./deneme/ExamHistoryList";
import ExamDetail from "./deneme/ExamDetail";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Bir denemenin status'üne göre hangi akış adımının gösterileceğini belirler
// — hem mount'ta (yarım kalmış deneme resume) hem her PATCH sonrası (bir
// sonraki adıma geçiş) aynı fonksiyon kullanılır.
function viewForStatus(status) {
  if (status === "IN_PROGRESS") return "timer";
  if (status === "RESULT_PENDING") return "results";
  if (status === "ANALYSIS_PENDING") return "analysis";
  return "summary";
}

// Deneme Merkezi kabuğu — eski salt-okunur "Deneme Analizim" ekranının
// yerine geçer. Öğrenci kendi denemesini başlatabilir/zamanlayabilir/
// sonucunu girebilir/analiz edebilir; koç tarafı (ExamsTab.jsx) bu veriyi
// ayrıca salt okunur gösterir, o taraf değişmedi.
export default function DenemeAnalizi({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [insights, setInsights] = useState([]);
  const [student, setStudent] = useState(null);
  const [view, setView] = useState("dashboard");
  const [activeExam, setActiveExam] = useState(null);
  const [detailExam, setDetailExam] = useState(null);
  const [showChoice, setShowChoice] = useState(false);
  const [starting, setStarting] = useState(false);

  const loadAll = useCallback(() => {
    setLoading(true);
    return Promise.all([
      axios.get("/api/v1/ogrenci/me", { headers: authHeaders() }).then((res) => res.data).catch(() => null),
      axios.get("/api/v1/ogrenci/me/exam-results", { headers: authHeaders() }).then((res) => res.data?.results || []),
      axios.get("/api/v1/ogrenci/me/exam-results/active", { headers: authHeaders() }).then((res) => res.data?.exam || null).catch(() => null),
      axios.get("/api/v1/ogrenci/me/insights", { headers: authHeaders() }).then((res) => res.data?.insights || []).catch(() => []),
    ]).then(([me, r, active, ins]) => {
      setStudent(me);
      setResults(r);
      setInsights(ins);
      if (active) {
        setActiveExam(active);
        setView(viewForStatus(active.status));
      } else {
        setActiveExam(null);
        setView("dashboard");
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refetchResults = () => {
    axios.get("/api/v1/ogrenci/me/exam-results", { headers: authHeaders() }).then((res) => setResults(res.data?.results || []));
  };

  const handleChooseLive = () => {
    setShowChoice(false);
    setView("setup");
  };
  const handleChooseManual = () => {
    setShowChoice(false);
    setView("manual");
  };

  const handleSetupSubmit = async (payload) => {
    setStarting(true);
    try {
      const res = await axios.post("/api/v1/ogrenci/me/exam-results/live/start", payload, { headers: authHeaders() });
      const exam = res.data.exam;
      setActiveExam(exam);
      setView(viewForStatus(exam.status));
    } finally {
      setStarting(false);
    }
  };

  const handleTimerFinished = (exam) => {
    setActiveExam(exam);
    setView(viewForStatus(exam.status));
  };

  const handleResultsSubmitted = (exam) => {
    setActiveExam(exam);
    setView(viewForStatus(exam.status));
  };

  const handleAnalysisSubmitted = (exam) => {
    setActiveExam(exam);
    setView(viewForStatus(exam.status));
    refetchResults();
  };

  const handleManualSubmitted = (exam) => {
    setActiveExam(exam);
    setView(viewForStatus(exam.status));
    refetchResults();
  };

  const handleSummaryDone = () => {
    setActiveExam(null);
    setView("dashboard");
    refetchResults();
  };

  const handleSelectHistory = (exam) => {
    setDetailExam(exam);
    setView("detail");
  };

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  if (view === "setup") {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#f1f5f9] p-6">
        <p className="font-fredoka font-bold text-page-navy text-base mb-4">Deneme Öncesi</p>
        <ExamSetupForm student={student} defaultExamType="TYT" onSubmit={handleSetupSubmit} onCancel={() => setView("dashboard")} submitting={starting} />
      </div>
    );
  }

  if (view === "timer" && activeExam) {
    return (
      <div className="max-w-lg mx-auto">
        <ActiveExamTimer exam={activeExam} onFinished={handleTimerFinished} />
      </div>
    );
  }

  if (view === "results" && activeExam) {
    return (
      <div className="max-w-lg mx-auto">
        <ExamResultForm exam={activeExam} student={student} onSubmitted={handleResultsSubmitted} />
      </div>
    );
  }

  if (view === "analysis" && activeExam) {
    return (
      <div className="max-w-lg mx-auto">
        <ExamSelfAnalysis exam={activeExam} onSubmitted={handleAnalysisSubmitted} />
      </div>
    );
  }

  if (view === "summary" && activeExam) {
    return (
      <div className="max-w-lg mx-auto">
        <ExamSummary exam={activeExam} allResults={results} onDone={handleSummaryDone} />
      </div>
    );
  }

  if (view === "manual") {
    return (
      <div className="max-w-lg mx-auto">
        <ManualExamForm student={student} onSubmitted={handleManualSubmitted} onCancel={() => setView("dashboard")} />
      </div>
    );
  }

  if (view === "detail" && detailExam) {
    return <ExamDetail exam={detailExam} onBack={() => { setView("dashboard"); setDetailExam(null); }} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-fredoka font-bold text-page-navy text-lg">Deneme Merkezi</p>
        <Button variant="primary" onClick={() => setShowChoice(true)}>
          <FaPlus size={11} className="mr-1.5 inline" /> Yeni Deneme
        </Button>
      </div>

      {insights.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
          <p className="flex items-center gap-2 font-fredoka font-bold text-amber-700 text-sm mb-3">
            <FaExclamationTriangle size={13} /> Akıllı Deneme Analizi — Tekrar Eden Hatalar
          </p>
          <div className="flex flex-col gap-2">
            {insights.map((ins) => (
              <div key={ins.topicId} className="flex items-center justify-between gap-3 bg-amber-50 rounded-xl px-4 py-3 flex-wrap">
                <p className="font-nunito text-sm text-[#334155]">
                  Son <strong>{ins.checkedExams}</strong> denemenin <strong>{ins.count}</strong> tanesinde{" "}
                  <strong className="text-amber-800">{ins.subject} — {ins.topicName}</strong> konusunda hata var.
                </p>
              </div>
            ))}
          </div>
          <p className="font-nunito text-[11px] text-[#94a3b8] mt-3">Koçun bu konuları programına ekleyebilir.</p>
        </div>
      )}

      {results.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <FaClipboardList className="mx-auto mb-3 text-[#cbd5e1]" size={28} />
          <p className="font-nunito text-sm text-[#94a3b8] mb-4">Henüz bir denemen yok. İlk denemeni başlat, kendi gelişimini takip etmeye başla.</p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowChoice(true)}><FaBolt size={10} className="mr-1.5 inline" /> Deneme Başlat</Button>
            <Button variant="ghost" size="sm" onClick={() => setView("manual")}><FaPen size={10} className="mr-1.5 inline" /> Geçmiş Deneme Ekle</Button>
          </div>
        </div>
      ) : (
        <>
          <ExamDashboard results={results} />
          <ExamHistoryList results={results} onSelect={handleSelectHistory} />
        </>
      )}

      <button
        onClick={() => onNavigate && onNavigate("konular")}
        className="font-nunito font-bold text-sm text-page-navy text-left hover:underline"
      >
        Konu Ağacımı Aç →
      </button>

      {showChoice && (
        <NewExamChoiceModal onClose={() => setShowChoice(false)} onChooseLive={handleChooseLive} onChooseManual={handleChooseManual} />
      )}
    </div>
  );
}
