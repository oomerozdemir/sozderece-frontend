import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import {
  FaHome, FaCalendarWeek, FaChartLine, FaBookOpen, FaBullhorn, FaUserTie, FaBoxOpen, FaTree,
  FaLifeRing, FaSignOutAlt, FaEllipsisH, FaTimes, FaWhatsapp,
} from "react-icons/fa";
import GenelBakis from "./tabs/GenelBakis";
import HaftalikProgram from "./tabs/HaftalikProgram";
import DenemeAnalizi from "./tabs/DenemeAnalizi";
import KonuAgaci from "./tabs/KonuAgaci";
import Kaynaklarim from "./tabs/Kaynaklarim";
import Gundem from "./tabs/Gundem";
import Kocum from "./tabs/Kocum";
import Siparislerim from "./tabs/Siparislerim";
import SosButton from "./SosButton";
import CoachNoteBanner from "./CoachNoteBanner";
import StreakBadge from "./StreakBadge";
import CoachAvatar from "./CoachAvatar";

const COACH_WHATSAPP = "905312546701";

// Yeni öğrenci paneli — kendi kabuğu olan, ayrı bir "uygulama" gibi hissettiren
// tam ekran shell (sabit sol menü + üst app-bar). Sitenin Navbar/Footer'ı
// bilinçli olarak burada YOK — öğrenci panele girdiğinde ayrı bir yere geçtiğini
// hissetmeli. Sadece User.panelBetaAccess=true olan öğrencilere gösteriliyor
// (bkz. ../StudentDashboard.jsx seçicisi).
const TABS = [
  { key: "genel", label: "Genel Bakış", icon: FaHome, Component: GenelBakis },
  { key: "program", label: "Bugünüm", icon: FaCalendarWeek, Component: HaftalikProgram },
  { key: "deneme", label: "Deneme Analizim", icon: FaChartLine, Component: DenemeAnalizi },
  { key: "konular", label: "Konu Ağacım", icon: FaTree, Component: KonuAgaci },
  { key: "kaynaklar", label: "Kaynaklarım", icon: FaBookOpen, Component: Kaynaklarim },
  { key: "gundem", label: "Gündem", icon: FaBullhorn, Component: Gundem },
  { key: "kocum", label: "Koçum", icon: FaUserTie, Component: Kocum },
  { key: "siparisler", label: "Siparişlerim", icon: FaBoxOpen, Component: Siparislerim },
];

// Mobil alt sekme çubuğuna sığan öncelikli 4 sekme + "Diğer" sayfası.
const PRIMARY_MOBILE_KEYS = ["genel", "program", "deneme", "kocum"];

export default function StudentPanel() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("genel");
  const [moreOpen, setMoreOpen] = useState(false);
  const [headerStats, setHeaderStats] = useState({ streak: { current: 0, longest: 0 }, daysSinceLastActivity: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("/api/v1/ogrenci/me", { headers }).then((res) => setStudent(res.data)).catch(() => {});
    axios
      .get("/api/v1/ogrenci/me/summary", { headers })
      .then((res) => setHeaderStats({ streak: res.data?.streak || { current: 0, longest: 0 }, daysSinceLastActivity: res.data?.daysSinceLastActivity ?? null }))
      .catch(() => {});
  }, []);

  const active = TABS.find((t) => t.key === tab) || TABS[0];
  const ActiveComponent = active.Component;
  const primaryMobileTabs = TABS.filter((t) => PRIMARY_MOBILE_KEYS.includes(t.key));
  const secondaryMobileTabs = TABS.filter((t) => !PRIMARY_MOBILE_KEYS.includes(t.key));
  const firstName = student?.name?.split(" ")[0] || "Öğrenci";

  const goTab = (key) => {
    setTab(key);
    setMoreOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItemStyle = (isActive) => ({
    background: isActive ? "rgba(255,255,255,0.09)" : "transparent",
    color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
  });

  return (
    <div className="min-h-screen bg-[#F5F4FB] md:h-screen md:overflow-hidden flex flex-col md:flex-row font-nunito">
      {/* ── Sol menü (masaüstü) ── */}
      <aside
        className="hidden md:flex md:flex-col w-64 flex-shrink-0 h-screen sticky top-0"
        style={{ background: "linear-gradient(180deg, #1C1B8A 0%, #14136f 100%)" }}
      >
        <div className="px-6 py-7 flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-fredoka font-bold text-sm flex-shrink-0"
            style={{ background: "#D8FF4F", color: "#1C1B8A" }}
          >
            S
          </div>
          <div className="min-w-0">
            <p className="font-fredoka font-bold text-white text-base leading-tight truncate">Sözderece</p>
            <p className="text-white/40 text-[10px] font-nunito font-bold uppercase truncate" style={{ letterSpacing: 1.5 }}>
              Öğrenci Paneli
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          {TABS.map((t) => {
            const isActive = t.key === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl transition-colors text-left"
                style={navItemStyle(isActive)}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: "#D8FF4F" }} />
                )}
                <Icon size={15} style={{ color: isActive ? "#D8FF4F" : undefined, flexShrink: 0 }} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/10 flex flex-col gap-1 flex-shrink-0">
          <a
            href={`https://wa.me/${COACH_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 no-underline transition-colors"
          >
            <FaLifeRing size={15} /> Yardım
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 text-left transition-colors"
          >
            <FaSignOutAlt size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Ana sütun ── */}
      <div className="flex-1 min-w-0 md:h-screen md:overflow-y-auto pb-[72px] md:pb-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#ece9f7] px-4 md:px-9 py-3.5 md:py-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-fredoka font-bold text-page-navy text-lg md:text-xl truncate">
              Merhaba, {firstName} 👋
            </h1>
            <p className="font-nunito text-[#8b87a6] text-xs mt-0.5 hidden sm:block truncate">
              {active.label} · Programını buradan takip et
            </p>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 flex-shrink-0">
            <StreakBadge current={headerStats.streak.current} compact />
            <a
              href={`https://wa.me/${COACH_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 font-fredoka font-bold text-xs md:text-sm px-4 md:px-5 py-2.5 rounded-full no-underline transition-transform hover:scale-[1.03]"
              style={{ background: "#D8FF4F", color: "#1C1B8A" }}
            >
              <FaWhatsapp size={13} /> Koçuma Yaz
            </a>
            <a
              href={`https://wa.me/${COACH_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Koçuma yaz"
              className="sm:hidden w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#D8FF4F", color: "#1C1B8A" }}
            >
              <FaWhatsapp size={16} />
            </a>
            <CoachAvatar daysSinceLastActivity={headerStats.daysSinceLastActivity} size={40} />
          </div>
        </header>

        <main className="px-4 md:px-9 py-5 md:py-7 max-w-[1200px] mx-auto">
          <CoachNoteBanner />
          <ActiveComponent student={student} onNavigate={setTab} />
        </main>
      </div>

      {/* ── Alt sekme çubuğu (mobil) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#ece9f7] flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {primaryMobileTabs.map((t) => {
          const isActive = t.key === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => goTab(t.key)}
              className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2"
            >
              <Icon size={17} style={{ color: isActive ? "#1C1B8A" : "#a8a4c4" }} />
              <span
                className="font-nunito font-bold text-[9.5px] truncate max-w-full px-0.5"
                style={{ color: isActive ? "#1C1B8A" : "#a8a4c4" }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2"
        >
          <FaEllipsisH size={17} style={{ color: secondaryMobileTabs.some((t) => t.key === tab) ? "#1C1B8A" : "#a8a4c4" }} />
          <span
            className="font-nunito font-bold text-[9.5px]"
            style={{ color: secondaryMobileTabs.some((t) => t.key === tab) ? "#1C1B8A" : "#a8a4c4" }}
          >
            Diğer
          </span>
        </button>
      </nav>

      {/* ── "Diğer" sayfası (mobil bottom sheet) ── */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-[24px] px-4 pt-4 pb-2 animate-[sdSheetUp_0.18s_ease-out]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="font-fredoka font-bold text-page-navy text-base">Diğer</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b]"
                aria-label="Kapat"
              >
                <FaTimes size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {secondaryMobileTabs.map((t) => {
                const isActive = t.key === tab;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => goTab(t.key)}
                    className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left"
                    style={isActive ? { background: "#1C1B8A", color: "#D8FF4F" } : { background: "#f8fafc", color: "#334155" }}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="font-nunito font-bold text-sm truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <a
              href={`https://wa.me/${COACH_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 mb-2 no-underline"
              style={{ background: "#f8fafc", color: "#334155" }}
            >
              <FaLifeRing size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Yardım</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              <FaSignOutAlt size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}

      {!moreOpen && <SosButton studentName={student?.name} />}
    </div>
  );
}
