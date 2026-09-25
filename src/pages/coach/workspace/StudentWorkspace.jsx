import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import useStudentContext from "./useStudentContext";
import StreakBadge from "../../panel/StreakBadge";
import OverviewTab from "./OverviewTab";
import ProgramTab from "./ProgramTab";
import ExamsTab from "./ExamsTab";
import TrackingTab from "./TrackingTab";
import NotesTab from "./NotesTab";

const TABS = [
  { key: "overview", label: "Genel Bakış" },
  { key: "program", label: "Program" },
  { key: "exams", label: "Denemeler" },
  { key: "tracking", label: "Takip" },
  { key: "notes", label: "Notlar" },
];

// Koç öğrenci çalışma alanı — /coach/students/:studentId. Eski
// StudentPanelEditor.jsx modalının (silindi) yerini alan tam sayfa yapı
// (bkz. plan: "Koç Paneli UX Refactor"). CoachDashboard.jsx'in "Öğrenciye
// Git" CTA'sı buraya yönlendiriyor.
export default function StudentWorkspace() {
  const navigate = useNavigate();
  const { student, loading, notFound } = useStudentContext();
  const [tab, setTab] = useState("overview");
  const [programDirty, setProgramDirty] = useState(false);

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

  const goBackToList = () => guardNavigation(() => navigate("/coach/dashboard"));
  const switchTab = (key) => guardNavigation(() => setTab(key));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <p className="text-sm text-[#94a3b8]">Yükleniyor…</p>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc] px-5 text-center">
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
    <div className="min-h-screen bg-[#f8fafc]">
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

      <div className="max-w-5xl mx-auto px-5 py-6">
        {tab === "overview" && <OverviewTab student={student} />}
        {tab === "program" && <ProgramTab student={student} onDirtyChange={setProgramDirty} />}
        {tab === "exams" && <ExamsTab student={student} />}
        {tab === "tracking" && <TrackingTab student={student} />}
        {tab === "notes" && <NotesTab student={student} />}
      </div>
    </div>
  );
}
