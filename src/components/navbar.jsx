import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SHOW_OGRETMEN } from "../config/features";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";
import { scrollToId } from "../utils/scrollToId";
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

const DEFAULT_NAV_LINKS = [
  { name: "YKS Koçluğu", path: "/yks-yolculugu" },
  { name: "LGS Koçluğu", path: "/lgs-hazirlik" },
  { name: "Paketler & Fiyatlar", path: "/#paketler" },
  { name: "Nasıl Çalışır?", path: "/#nasil-calisir" },
  ...(SHOW_OGRETMEN ? [{ name: "Özel Ders", path: "/ogretmenler" }] : []),
];

const isPackagesLink = (l) => /paketler/i.test(l.name);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);

  const [authState, setAuthState] = useState({ isLoggedIn: false, name: "", role: "" });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart() || { cart: [] };
  const cartCount = cart ? cart.length : 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Giriş akışlarının çoğu (OTP, misafir-sonrası, öğretmen vb.) tek bir
    // JSON nesnesi olarak "user" anahtarına yazıyor — sadece klasik
    // e-posta/şifre girişi ayrıca düz "userName"/"userRole" anahtarları
    // yazıyor. İkisini de kontrol ediyoruz, aksi halde çoğu giriş
    // yönteminde isim boş kalıp sabit "Kullanıcı" metnine düşülüyordu.
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {}

    const name = storedUser?.name || localStorage.getItem("userName") || storedUser?.email?.split("@")[0] || "Hesabım";
    const role = (storedUser?.role || localStorage.getItem("userRole") || "").toLowerCase();
    setAuthState({ isLoggedIn: true, name, role });
  }, []);

  // Dropdown'ı dışarı tıklanınca kapat — hover tabanlı (onMouseEnter/Leave)
  // versiyon, buton ile menü arasındaki küçük boşlukta imleç menüden
  // "çıkmış" sayıldığı için menü kendi kendine kapanıyordu.
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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

  // "/#paketler" gibi bağlantılar: ana sayfadaysak sayfayı yeniden yüklemeden
  // kaydır, başka sayfadaysak normal navigasyon (ScrollToTop hash'e kaydırır).
  const handleAnchor = (e, path) => {
    if (!path?.startsWith("/#") || location.pathname !== "/") return;
    e.preventDefault();
    scrollToId(path.slice(2));
  };

  // Mobil menüde "Paketler & Fiyatlar" en üstte ve belirgin.
  const mobileLinks = [...navLinks].sort((a, b) => (isPackagesLink(b) ? 1 : 0) - (isPackagesLink(a) ? 1 : 0));

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
          <span className="font-fredoka text-brand-on-dark text-2xl max-[960px]:text-xl tracking-wide select-none">
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
                className="no-underline text-white/80 font-nunito font-bold text-[0.92rem] transition-colors hover:text-brand-on-dark"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={i}
                to={link.path}
                onClick={(e) => handleAnchor(e, link.path)}
                className="no-underline text-white/80 font-nunito font-bold text-[0.92rem] transition-colors hover:text-brand-on-dark"
              >
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* SAĞ BUTONLAR — masaüstü */}
        <div className="flex items-center gap-4 max-[960px]:hidden">
          {/* Sepet — sadece sepette ürün varsa (satın alma akışı misafir-öncelikli, sepet ana yolculukta yok) */}
          {cartCount > 0 && (
            <Link to="/sepet" className="text-white/70 text-lg relative hover:text-brand-on-dark transition-colors" aria-label="Sepet">
              <FaShoppingCart />
              <span className="absolute -top-2 -right-2 bg-accent-orange text-white text-[0.65rem] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </Link>
          )}

          {/* Kullanıcı */}
          {authState.isLoggedIn ? (
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="bg-transparent border-0 text-white/80 font-nunito font-bold cursor-pointer flex items-center gap-1.5 text-sm hover:text-brand-on-dark transition-colors"
              >
                <FaUser className="text-xs" />
                <span className="max-w-[90px] truncate">{authState.name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-page-navy border border-white/10 w-[200px] rounded-xl shadow-2xl py-2 flex flex-col z-[1001] animate-slide-down">
                  <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 py-2.5 px-4 no-underline text-white/80 text-sm font-nunito font-bold hover:bg-white/10 hover:text-brand-on-dark transition-colors">
                    <FaTachometerAlt className="text-xs" /> Panelim
                  </Link>
                  <Link to="/hesabim" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 py-2.5 px-4 no-underline text-white/80 text-sm font-nunito font-bold hover:bg-white/10 hover:text-brand-on-dark transition-colors">
                    <FaCog className="text-xs" /> Hesabım
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 py-2.5 px-4 text-accent-orange text-sm font-nunito font-bold bg-transparent border-0 border-t border-white/10 mt-1 w-full text-left cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <FaSignOutAlt className="text-xs" /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/giris-yap" className="no-underline text-white/80 font-nunito font-bold text-[0.92rem] hover:text-brand-on-dark transition-colors">
              Öğrenci Girişi
            </Link>
          )}

          {/* Ana CTA */}
          <Link
            to="/ucretsiz-on-gorusme"
            className="bg-lime text-white font-nunito font-black text-sm py-2.5 px-5 rounded-full no-underline transition-all hover:bg-white hover:text-brand hover:scale-105 shadow-[0_4px_14px_rgba(14,124,136,0.35)]"
          >
            Ücretsiz Görüşme Al →
          </Link>
        </div>

        {/* MOBİL HAMBURGER */}
        <div
          className="hidden max-[960px]:flex items-center gap-3"
        >
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
        className={`fixed top-14 left-0 w-full h-[calc(100vh-56px)] bg-page-dark z-[999] transition-transform duration-300 ease-in-out overflow-y-auto border-t border-white/10 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 gap-1">
          {mobileLinks.map((link, i) => {
            const featured = isPackagesLink(link);
            const cls = featured
              ? "no-underline bg-lime text-white font-nunito font-black text-base py-4 px-4 rounded-2xl mb-3 flex items-center justify-between shadow-[0_4px_20px_rgba(14,124,136,0.3)]"
              : "no-underline text-white/80 font-nunito font-bold text-base py-3.5 border-b border-white/10 hover:text-brand-on-dark transition-colors";
            return link.isExternal ? (
              <a
                key={i}
                href={link.path}
                target={link.openInNew ? "_blank" : undefined}
                rel={link.openInNew ? "noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
                className={cls}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={i}
                to={link.path}
                onClick={(e) => { handleAnchor(e, link.path); setMenuOpen(false); }}
                className={cls}
              >
                {link.name}
                {featured && <span aria-hidden>→</span>}
              </Link>
            );
          })}

          <div className="mt-5">
            <Link
              to="/ucretsiz-on-gorusme"
              onClick={() => setMenuOpen(false)}
              className="block w-full border border-brand-on-dark/60 text-brand-on-dark font-nunito font-black text-base py-4 rounded-2xl text-center no-underline"
            >
              Ücretsiz Görüşme Al →
            </Link>
          </div>

          <div className="my-4 border-t border-white/10" />

          {cartCount > 0 && (
            <Link
              to="/sepet"
              onClick={() => setMenuOpen(false)}
              className="no-underline text-white/70 font-nunito font-bold text-base py-3 flex items-center gap-2 hover:text-brand-on-dark transition-colors"
            >
              <FaShoppingCart /> Sepetim ({cartCount})
            </Link>
          )}

          {authState.isLoggedIn ? (
            <>
              <div className="text-white/50 text-sm font-nunito py-2">Merhaba, {authState.name}</div>
              <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)} className="no-underline text-white/80 font-nunito font-bold text-base py-3 flex items-center gap-2 hover:text-brand-on-dark transition-colors">
                <FaTachometerAlt /> Panelim
              </Link>
              <Link to="/hesabim" onClick={() => setMenuOpen(false)} className="no-underline text-white/80 font-nunito font-bold text-base py-3 flex items-center gap-2 hover:text-brand-on-dark transition-colors">
                <FaCog /> Hesabım
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="bg-transparent border-0 text-accent-orange font-nunito font-bold text-base py-3 flex items-center gap-2 cursor-pointer w-full text-left"
              >
                <FaSignOutAlt /> Çıkış Yap
              </button>
            </>
          ) : (
            <Link
              to="/giris-yap"
              onClick={() => setMenuOpen(false)}
              className="no-underline text-white/80 font-nunito font-bold text-base py-3 hover:text-brand-on-dark transition-colors"
            >
              Öğrenci Girişi
            </Link>
          )}

          <a
            href="https://www.instagram.com/sozderece/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 text-white/50 font-nunito text-sm no-underline hover:text-brand-on-dark transition-colors"
          >
            <FaInstagram /> @sozderece
          </a>
        </div>
      </div>
    </nav>
  );
}
