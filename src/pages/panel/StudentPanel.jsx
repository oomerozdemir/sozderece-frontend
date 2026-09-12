import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import Navbar from "../../components/navbar";
import {
  FaHome, FaCalendarWeek, FaChartLine, FaBookOpen, FaBullhorn, FaUserTie, FaBoxOpen,
} from "react-icons/fa";
import GenelBakis from "./tabs/GenelBakis";
import HaftalikProgram from "./tabs/HaftalikProgram";
import DenemeAnalizi from "./tabs/DenemeAnalizi";
import Kaynaklarim from "./tabs/Kaynaklarim";
import Gundem from "./tabs/Gundem";
import Kocum from "./tabs/Kocum";
import Siparislerim from "./tabs/Siparislerim";

// Yeni öğrenci paneli — Faz 1 kabuğu. Sadece User.panelBetaAccess=true olan
// öğrencilere gösteriliyor (bkz. ../StudentDashboard.jsx seçicisi).
const TABS = [
  { key: "genel", label: "Genel Bakış", icon: FaHome, Component: GenelBakis },
  { key: "program", label: "Haftalık Programım", icon: FaCalendarWeek, Component: HaftalikProgram },
  { key: "deneme", label: "Deneme Analizim", icon: FaChartLine, Component: DenemeAnalizi },
  { key: "kaynaklar", label: "Kaynaklarım", icon: FaBookOpen, Component: Kaynaklarim },
  { key: "gundem", label: "Gündem", icon: FaBullhorn, Component: Gundem },
  { key: "kocum", label: "Koçum", icon: FaUserTie, Component: Kocum },
  { key: "siparisler", label: "Siparişlerim", icon: FaBoxOpen, Component: Siparislerim },
];

export default function StudentPanel() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("genel");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/v1/ogrenci/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStudent(res.data))
      .catch(() => {});
  }, []);

  const active = TABS.find((t) => t.key === tab) || TABS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-5 py-10 max-[768px]:py-6">
        <div className="mb-7">
          <h1 className="font-fredoka font-bold text-page-navy text-2xl max-[640px]:text-xl">
            Merhaba, {student?.name || "Öğrenci"} 👋
          </h1>
          <p className="font-nunito text-[#64748b] text-sm mt-1">
            Programını, denemelerini ve kaynaklarını tek yerden takip et.
          </p>
        </div>

        <div className="grid grid-cols-[240px_1fr] gap-6 max-[860px]:grid-cols-1 items-start">
          {/* Sol menü */}
          <nav className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-2.5 flex flex-col gap-1 max-[860px]:flex-row max-[860px]:overflow-x-auto max-[860px]:gap-2">
            {TABS.map((t) => {
              const isActive = t.key === tab;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-2.5 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl transition-colors text-left whitespace-nowrap flex-shrink-0"
                  style={
                    isActive
                      ? { background: "#1C1B8A", color: "#D8FF4F" }
                      : { background: "transparent", color: "#475569" }
                  }
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* İçerik */}
          <div className="min-w-0">
            <ActiveComponent student={student} />
          </div>
        </div>
      </div>
    </div>
  );
}
