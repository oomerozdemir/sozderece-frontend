import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaChartPie, FaUsers, FaUserGraduate, FaLifeRing, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

const NAV = [
  { key: "overview", label: "Genel Bakış", icon: FaChartPie, to: "/head-coach/dashboard" },
  { key: "coaches", label: "Koçlarım", icon: FaUsers, to: "/head-coach/coaches" },
  { key: "students", label: "Öğrenciler", icon: FaUserGraduate, to: "/head-coach/students" },
];

// Ana Koç paneli app-shell'i — CoachDashboard.jsx'in sol menü/üst bar
// deseninin birebir aynısı (plan: "admin gibi ağır/kurumsal görünmesin").
// V1 kapsam sadeleştirmesi gereği 3 sade nav öğesi: Genel Bakış/Koçlarım/
// Öğrenciler — ayrı "Atamalar"/"Takip" sayfası yok.
export default function HeadCoachLayout({ active, title, subtitle, children }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cream md:h-screen md:overflow-hidden flex flex-col md:flex-row font-nunito">
      <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 h-screen sticky top-0 bg-page-navy">
        <div className="px-6 py-7 flex items-center gap-2.5 flex-shrink-0">
          <img src="/images/logo-bee.png" alt="" aria-hidden="true" className="w-9 h-9 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-fredoka font-bold text-white text-base leading-tight truncate">Sözderece</p>
            <p className="text-white/40 text-[10px] font-nunito font-bold uppercase truncate" style={{ letterSpacing: 1.5 }}>
              Ana Koç Paneli
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          {NAV.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className="relative flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl no-underline transition-colors"
                style={isActive ? { background: "rgba(255,255,255,0.09)", color: "#ffffff" } : { color: "rgba(255,255,255,0.55)" }}
              >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand-on-dark" />}
                <Icon size={15} style={{ color: isActive ? "var(--color-brand-on-dark)" : "inherit", flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/10 flex flex-col gap-1 flex-shrink-0">
          <a
            href="https://wa.me/905312546701"
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

      <div className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#ece9f7] px-4 md:px-9 py-3.5 md:py-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-fredoka font-bold text-page-navy text-lg md:text-xl truncate">{title}</h1>
            {subtitle && <p className="font-nunito text-[#8b87a6] text-xs mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menü"
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-page-navy bg-[#f1f0fa]"
          >
            <FaBars size={15} />
          </button>
        </header>

        <main className="px-4 md:px-9 py-5 md:py-7 max-w-[1400px] mx-auto">{children}</main>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-[24px] px-4 pt-4 pb-2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="font-fredoka font-bold text-page-navy text-base">Menü</p>
              <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b]" aria-label="Kapat">
                <FaTimes size={13} />
              </button>
            </div>
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 mb-2 no-underline"
                  style={isActive ? { background: "var(--color-brand-light)", color: "var(--color-brand)" } : { background: "#f8fafc", color: "#334155" }}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="font-nunito font-bold text-sm">{item.label}</span>
                </Link>
              );
            })}
            <a
              href="https://wa.me/905312546701"
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
    </div>
  );
}
