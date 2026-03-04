import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SHOW_OGRETMEN } from "../config/features";
import useCart from "../hooks/useCart";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTachometerAlt,
  FaCog
} from "react-icons/fa";

const mobileLinkCls = "flex items-center justify-center gap-[10px] py-[15px] text-[1.1rem] text-[#0f2a4a] no-underline border-b border-[#f0f0f0] text-center";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    name: "",
    role: ""
  });

  const navigate = useNavigate();

  // Güvenli sepet erişimi
  const { cart } = useCart() || { cart: [] };
  const cartItemCount = cart ? cart.length : 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");

    if (token) {
      setAuthState({
        isLoggedIn: true,
        name: storedName || "Kullanıcı",
        role: storedRole ? storedRole.toLowerCase() : ""
      });
    } else {
      setAuthState({ isLoggedIn: false, name: "", role: "" });
    }
  }, []);

  const getDashboardPath = () => {
    const role = authState.role;
    if (role === "admin") return "/admin";
    if (role === "teacher" || role === "ogretmen") return "/ogretmen/panel/profil";
    if (role === "student" || role === "ogrenci") return "/student/dashboard";
    return "/hesabim";
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthState({ isLoggedIn: false, name: "", role: "" });
    navigate("/");
    window.location.reload();
  };

  const centerLinks = [
    { name: "Koçluk Paketleri", path: "/paket-detay" },
    ...(SHOW_OGRETMEN ? [{ name: "Özel Ders", path: "/ogretmenler" }] : []),
  ];

  return (
    <nav className="w-full h-20 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] sticky top-0 z-[1000] flex items-center justify-center">
      <div className="w-[90%] max-w-[1200px] flex justify-between items-center">

        {/* SOL: LOGO */}
        <Link to="/">
          <img src="/images/hero-logo.webp" alt="Sözderece Koçluk" className="h-[50px] w-auto object-contain" />
        </Link>

        {/* ORTA: LİNKLER (Masaüstü) */}
        <div className="flex gap-10 max-[960px]:!hidden">
          {centerLinks.map((link, index) => (
            <Link key={index} to={link.path} className="no-underline text-[#0f2a4a] font-semibold text-[1.05rem] relative transition hover:text-[#f39c12]">
              {link.name}
            </Link>
          ))}
        </div>

        {/* SAĞ: BUTONLAR */}
        <div className="flex items-center gap-5">

          {/* MASAÜSTÜ SEPETİ */}
          <Link to="/sepet" className="text-[#0f2a4a] text-[1.2rem] relative flex items-center no-underline max-[960px]:!hidden" aria-label="Sepet">
            <FaShoppingCart />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#e74c3c] text-white text-[0.7rem] w-4 h-4 rounded-full flex justify-center items-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* MASAÜSTÜ USER DROPDOWN */}
          <div className="max-[960px]:!hidden">
            {authState.isLoggedIn ? (
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="bg-transparent border-0 text-[#0f2a4a] font-semibold cursor-pointer flex items-center gap-2 text-base py-[10px]">
                  <FaUser />
                  <span className="max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{authState.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 bg-white w-[200px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] rounded-lg border border-[#f0f0f0] py-[10px] flex flex-col z-[1001] animate-fade-in">
                    <Link to={getDashboardPath()} className="flex items-center gap-[10px] py-3 px-5 no-underline text-[#333] text-[0.95rem] transition hover:bg-[#f8f9fa] hover:text-[#f39c12]">
                      <FaTachometerAlt /> Panelim
                    </Link>
                    <Link to="/hesabim" className="flex items-center gap-[10px] py-3 px-5 no-underline text-[#333] text-[0.95rem] transition hover:bg-[#f8f9fa] hover:text-[#f39c12]">
                      <FaCog /> Hesabım
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-[10px] py-3 px-5 text-[#e74c3c] text-[0.95rem] transition bg-transparent border-0 border-t border-[#eee] mt-[5px] w-full text-left cursor-pointer hover:bg-[#f8f9fa]"
                    >
                      <FaSignOutAlt /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/giris-yap" className="no-underline text-[#0f2a4a] font-semibold text-base transition hover:opacity-70">
                Giriş Yap
              </Link>
            )}
          </div>

          <Link
            to="/paket-detay"
            className="bg-[#100481] text-white py-[10px] px-6 rounded-[5px] no-underline font-bold text-base transition shadow-[0_4px_6px_rgba(16,4,129,0.2)] hover:bg-[#d35400] hover:-translate-y-0.5 max-[960px]:!hidden"
          >
            Koçluk Al
          </Link>

          {/* MOBİL MENÜ İKONU */}
          <div
            className="hidden max-[960px]:block text-[#0f2a4a] text-[1.5rem] cursor-pointer z-[1002]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ (OVERLAY) */}
      <div className={`block fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-white z-[999] transition-transform duration-300 ease-in-out border-t border-[#eee] overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col p-5">

          {/* MOBİL SEPET */}
          <Link to="/sepetim" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileLinkCls} font-bold !text-[#e67e22]`}>
            <FaShoppingCart /> Sepetim ({cartItemCount})
          </Link>

          <hr />

          {centerLinks.map((link, index) => (
            <Link key={index} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkCls}>
              {link.name}
            </Link>
          ))}

          <hr />

          {authState.isLoggedIn ? (
            <>
              <div className="text-center font-bold text-[#555] mb-[10px] pt-[10px]">Merhaba, {authState.name}</div>
              <Link to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkCls}>
                <FaTachometerAlt /> Panelim
              </Link>
              <Link to="/hesabim" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkCls}>
                <FaCog /> Hesabım
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="bg-transparent border-0 text-[#e74c3c] text-[1.1rem] py-[15px] cursor-pointer border-b border-[#f0f0f0] text-center w-full flex items-center justify-center gap-[10px]"
              >
                <FaSignOutAlt /> Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/giris-yap" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkCls}>Giriş Yap</Link>
              <Link to="/paket-detay" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileLinkCls} bg-[#100481] !text-white rounded-lg mt-[15px] !border-0`}>Koçluk Al</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
