import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "../../../utils/axios";
import useStudentContext from "./useStudentContext";
import { PanelAccessProvider } from "./PanelAccessContext";
import StreakBadge from "../../panel/StreakBadge";
import CoachTour from "../tour/CoachTour";
import OverviewTab from "./OverviewTab";
import ProgramTab from "./ProgramTab";
import ExamsTab from "./ExamsTab";
import TrackingTab from "./TrackingTab";
import ResourcesTab from "./ResourcesTab";
import NotesTab from "./NotesTab";

const TABS = [
  { key: "overview", label: "Genel Bakış" },
  { key: "program", label: "Program" },
  { key: "exams", label: "Denemeler" },
  { key: "tracking", label: "Takip" },
  { key: "resources", label: "Kaynaklar" },
  { key: "notes", label: "Notlar" },
];

// Koç öğrenci çalışma alanı — /coach/students/:studentId. Eski
// StudentPanelEditor.jsx modalının (silindi) yerini alan tam sayfa yapı
// (bkz. plan: "Koç Paneli UX Refactor"). CoachDashboard.jsx'in "Öğrenciye
// Git" CTA'sı buraya yönlendiriyor.
//
// Ana Koç (head_coach) için BİREBİR AYNI component /head-coach/students/:id
// altında da render edilir (App.jsx) — tek fark bu prop'lar: hangi API
// prefix'i kullanılacağı ve hangi WRITE aksiyonların görünür olacağı (bkz.
// implementasyon planı K6/K9 — deneme sonucu girme/SOS çözme/kaynak
// yönetimi/AI program-görseli V1'de head_coach'a kapalı).
export default function StudentWorkspace({
  apiPrefix = "coach",
  backTo = "/coach/dashboard",
  canAddExamResult = true,
  canManageResources = true,
  canImportProgramImage = true,
}) {
  const navigate = useNavigate();
  const { student, loading, notFound } = useStudentContext(apiPrefix);
  const [tab, setTab] = useState("overview");
  const [programDirty, setProgramDirty] = useState(false);

  // Koç Paneli Turu SADECE coach için var (head_coach kendi ayrı turunu
  // isteyebilir ama bu V1 kapsamında değil, bkz. plan). "Öğrenciye Git"ten
  // router state'le geldiyse useStudentContext hiç fetch YAPMIYOR (yukarıda) —
  // bu yüzden koçun KENDİ tur aşaması için küçük, ayrı bir fetch gerekiyor
  // (ör. öğrenci günler sonra atanınca, tur hiç çalışmadan doğrudan bu
  // sayfaya gelindiğinde devam edebilmesi için — bkz. plan K6).
  const [coachTourCompletedVersion, setCoachTourCompletedVersion] = useState(undefined);
  useEffect(() => {
    if (apiPrefix !== "coach") return;
    const token = localStorage.getItem("token");
    axios
      .get("/api/coach/my-students", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCoachTourCompletedVersion(res.data?.coachTourCompletedVersion ?? null))
      .catch(() => setCoachTourCompletedVersion(null));
  }, [apiPrefix]);

  // Kaydedilmemiş değişiklik koruması (plan §11): Program sekmesi dirty iken
  // başka bir sekmeye ya da öğrenci listesine geçilmek istenirse onay istenir.
  const guardNavigation = (proceed) => {
    if (programDirty) {
      const ok = window.confirm("Kaydedilmemiş değişiklikler var, devam edersen kaybolacak. Devam edilsin mi?");
      if (!ok) return;
      setProgramDirty(false);
    }
    proceed();
  };

  const goBackToList = () => guardNavigation(() => navigate(backTo));
  const switchTab = (key) => guardNavigation(() => setTab(key));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-sm text-[#94a3b8]">Yükleniyor…</p>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream px-5 text-center">
        <p className="text-sm font-bold text-[#475569]">Bu öğrenci bulunamadı ya da artık sizin öğrenciniz değil.</p>
        <button
          onClick={() => navigate("/coach/dashboard")}
          className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-brand-navy"
        >
          Listeye Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-10 bg-white border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3 px-5 py-3.5 max-w-5xl mx-auto">
          <button
            onClick={goBackToList}
            className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-page-navy flex-shrink-0"
          >
            <FaArrowLeft size={11} /> Listeye Dön
          </button>
          <span className="text-[#e2e8f0] flex-shrink-0">|</span>
          <p className="font-fredoka font-bold text-page-navy text-base truncate">{student.name}</p>
          {(student.strugglingToday || student.partialToday) && (
            <span
              className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={
                student.strugglingToday
                  ? { background: "#fef2f2", color: "#dc2626" }
                  : { background: "#fff7ed", color: "#c2410c" }
              }
            >
              {student.strugglingToday ? "😓 Bugün Zorlandı" : "⏳ Yarıda Kaldı"}
            </span>
          )}
          {student.streak?.current > 0 && <StreakBadge current={student.streak.current} compact />}
        </div>
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto max-w-5xl mx-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${
                tab === t.key ? "bg-brand-navy text-white" : "bg-[#f1f5f9] text-[#64748b]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <PanelAccessProvider value={{ apiPrefix, backTo, canAddExamResult, canManageResources, canImportProgramImage }}>
        <div className="max-w-5xl mx-auto px-5 py-6">
          {tab === "overview" && <div data-tour="student-overview"><OverviewTab student={student} /></div>}
          {tab === "program" && <div data-tour="student-program"><ProgramTab student={student} onDirtyChange={setProgramDirty} /></div>}
          {tab === "exams" && <div data-tour="student-exams"><ExamsTab student={student} /></div>}
          {tab === "tracking" && <div data-tour="student-tracking"><TrackingTab student={student} /></div>}
          {tab === "resources" && <div data-tour="student-resources"><ResourcesTab student={student} /></div>}
          {tab === "notes" && <div data-tour="student-notes"><NotesTab student={student} /></div>}
        </div>
      </PanelAccessProvider>

      {apiPrefix === "coach" && coachTourCompletedVersion !== undefined && (
        <CoachTour
          page="workspace"
          hasStudents
          tab={tab}
          setTab={setTab}
          coachTourCompletedVersion={coachTourCompletedVersion}
          onPersistStage={async (stage) => {
            try {
              const token = localStorage.getItem("token");
              await axios.patch("/api/coach/me/tour-completed", { stage }, { headers: { Authorization: `Bearer ${token}` } });
            } catch {
              // ağ hatası sayfayı bloklamaz
            }
          }}
        />
      )}
    </div>
  );
}
