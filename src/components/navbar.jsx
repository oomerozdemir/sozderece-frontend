import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SHOW_OGRETMEN } from "../config/features";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTachometerAlt,
  FaCog,
  FaInstagram,
} from "react-icons/fa";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

const DEFAULT_NAV_LINKS = [
  { name: "YKS Koçluğu", path: "/deneme-kampi" },
  { name: "LGS Koçluğu", path: "/lgs-hazirlik" },
  { name: "Nasıl Çalışır?", path: "/#nasil-calisir" },
  { name: "Paketler", path: "/paket-detay" },
  ...(SHOW_OGRETMEN ? [{ name: "Özel Ders", path: "/ogretmenler" }] : []),
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);

  const [authState, setAuthState] = useState({ isLoggedIn: false, name: "", role: "" });
  const navigate = useNavigate();
  const { cart } = useCart() || { cart: [] };
  const cartCount = cart ? cart.length : 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthState({
        isLoggedIn: true,
        name: localStorage.getItem("userName") || "Kullanıcı",
        role: (localStorage.getItem("userRole") || "").toLowerCase(),
      });
    }
  }, []);

  useEffect(() => {
    axios.get("/api/settings/navbar")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setNavLinks(
            res.data.map((item) => ({
              name: item.name,
              path: item.path,
              isExternal: item.isExternal,
              openInNew: item.openInNew,
            }))
          );
        }
      })
      .catch(() => {}); // fallback: DEFAULT_NAV_LINKS kalır
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getDashboardPath = () => {
    const r = authState.role;
    if (r === "admin") return "/admin";
    if (r === "teacher" || r === "ogretmen") return "/ogretmen/panel/profil";
    if (r === "student" || r === "ogrenci") return "/student/dashboard";
    return "/hesabim";
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthState({ isLoggedIn: false, name: "", role: "" });
    navigate("/");
    window.location.reload();
  };


  return (
    <nav
      className={`w-full h-16 sticky top-0 z-[1000] flex items-center justify-center transition-all duration-300 max-[960px]:h-14 ${
        scrolled
          ? "bg-[rgba(13,10,46,0.97)] backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.35)]"
          : "bg-[rgba(13,10,46,0.92)] backdrop-blur-sm"
      }`}
    >
      <div className="w-[92%] max-w-[1200px] flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="no-underline flex items-center gap-2">
          <span className="font-fredoka text-[#D8FF4F] text-2xl max-[960px]:text-xl tracking-wide select-none">
            SÖZDERECE
          </span>
        </Link>

        {/* MERKEZ LİNKLER — masaüstü */}
        <div className="flex gap-8 max-[960px]:hidden">
          {navLinks.map((link, i) =>
            link.isExternal ? (
              <a
                key={i}
                href={link.path}
                target={link.openInNew ? "_blank" : undefined}
                rel={link.openInNew ? "noreferrer" : undefined}
                className="no-underline text-white/80 font-nunito font-bold text-[0.92rem] transition-colors hover:text-[#D8FF4F]"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={i}
                to={link.path}
                className="no-underline text-white/80 font-nunito font-bold text-[0.92rem] transition-colors hover:text-[#D8FF4F]"
              >
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* SAĞ BUTONLAR — masaüstü */}
        <div className="flex items-center gap-4 max-[960px]:hidden">
          {/* Sepet */}
          <Link to="/sepet" className="text-white/70 text-lg relative hover:text-[#D8FF4F] transition-colors" aria-label="Sepet">
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF6B35] text-white text-[0.65rem] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Kullanıcı */}
          {authState.isLoggedIn ? (
            <div
              className="relative flex items-center"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="bg-transparent border-0 text-white/80 font-nunito font-bold cursor-pointer flex items-center gap-1.5 text-sm hover:text-[#D8FF4F] transition-colors">
                <FaUser className="text-xs" />
                <span className="max-w-[90px] truncate">{authState.name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#1C1B8A] border border-white/10 w-[200px] rounded-xl shadow-2xl py-2 flex flex-col z-[1001] animate-slide-down">
                  <Link to={getDashboardPath()} className="flex items-center gap-2.5 py-2.5 px-4 no-underline text-white/80 text-sm font-nunito font-bold hover:bg-white/10 hover:text-[#D8FF4F] transition-colors">
                    <FaTachometerAlt className="text-xs" /> Panelim
                  </Link>
                  <Link to="/hesabim" className="flex items-center gap-2.5 py-2.5 px-4 no-underline text-white/80 text-sm font-nunito font-bold hover:bg-white/10 hover:text-[#D8FF4F] transition-colors">
                    <FaCog className="text-xs" /> Hesabım
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 py-2.5 px-4 text-[#FF6B35] text-sm font-nunito font-bold bg-transparent border-0 border-t border-white/10 mt-1 w-full text-left cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <FaSignOutAlt className="text-xs" /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/giris-yap" className="no-underline text-white/70 font-nunito font-bold text-sm hover:text-[#D8FF4F] transition-colors">
              Giriş Yap
            </Link>
          )}

          {/* Ana CTA */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-sm py-2.5 px-5 rounded-full no-underline transition-all hover:bg-white hover:scale-105 shadow-[0_4px_14px_rgba(216,255,79,0.3)]"
          >
            Ücretsiz Görüşme →
          </a>
        </div>

        {/* MOBİL HAMBURGER */}
        <div
          className="hidden max-[960px]:flex items-center gap-3"
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-xs py-2 px-4 rounded-full no-underline"
          >
            SİSTEM
          </a>
          <button
            className="bg-transparent border-0 text-white text-xl cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MOBİL MENÜ */}
      <div
        className={`fixed top-14 left-0 w-full h-[calc(100vh-56px)] bg-[#0D0A2E] z-[999] transition-transform duration-300 ease-in-out overflow-y-auto border-t border-white/10 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 gap-1">
          {navLinks.map((link, i) =>
            link.isExternal ? (
              <a
                key={i}
                href={link.path}
                target={link.openInNew ? "_blank" : undefined}
                rel={link.openInNew ? "noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
                className="no-underline text-white/80 font-nunito font-bold text-base py-3.5 border-b border-white/8 hover:text-[#D8FF4F] transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={i}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="no-underline text-white/80 font-nunito font-bold text-base py-3.5 border-b border-white/8 hover:text-[#D8FF4F] transition-colors"
              >
                {link.name}
              </Link>
            )
          )}

          <div className="my-4 border-t border-white/10" />

          {/* Sepet mobil */}
          <Link
            to="/sepet"
            onClick={() => setMenuOpen(false)}
            className="no-underline text-white/70 font-nunito font-bold text-base py-3 flex items-center gap-2 hover:text-[#D8FF4F] transition-colors"
          >
            <FaShoppingCart /> Sepetim {cartCount > 0 && `(${cartCount})`}
          </Link>

          {authState.isLoggedIn ? (
            <>
              <div className="text-white/50 text-sm font-nunito py-2">Merhaba, {authState.name}</div>
              <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)} className="no-underline text-white/80 font-nunito font-bold text-base py-3 flex items-center gap-2 hover:text-[#D8FF4F] transition-colors">
                <FaTachometerAlt /> Panelim
              </Link>
              <Link to="/hesabim" onClick={() => setMenuOpen(false)} className="no-underline text-white/80 font-nunito font-bold text-base py-3 flex items-center gap-2 hover:text-[#D8FF4F] transition-colors">
                <FaCog /> Hesabım
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="bg-transparent border-0 text-[#FF6B35] font-nunito font-bold text-base py-3 flex items-center gap-2 cursor-pointer w-full text-left"
              >
                <FaSignOutAlt /> Çıkış Yap
              </button>
            </>
          ) : (
            <Link
              to="/giris-yap"
              onClick={() => setMenuOpen(false)}
              className="no-underline text-white/80 font-nunito font-bold text-base py-3 hover:text-[#D8FF4F] transition-colors"
            >
              Giriş Yap
            </Link>
          )}

          <div className="mt-6">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-base py-4 rounded-2xl text-center no-underline shadow-[0_4px_20px_rgba(216,255,79,0.25)]"
            >
              DM'ye SİSTEM Yaz →
            </a>
            <a
              href="https://www.instagram.com/sozderece/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-white/50 font-nunito text-sm no-underline hover:text-[#D8FF4F] transition-colors"
            >
              <FaInstagram /> @sozderece
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
