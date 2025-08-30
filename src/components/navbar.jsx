import { useEffect, useState, useRef } from "react";
import "../cssFiles/navbar.css";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileMissing, setProfileMissing] = useState(0);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const calcMissing = (u) => {
    if (!u) return 0;
    let m = 0;
    if (!u.phone) m++;
    if (!u.grade) m++;
    if (["9", "10", "11", "12", "Mezun"].includes(u.grade) && !u.track) m++;
    return m;
  };

  const syncUser = () => {
    const userStr = localStorage.getItem("user");
    let parsed = null;
    if (userStr) { try { parsed = JSON.parse(userStr); } catch (_) {} }
    setUsername(parsed ? parsed.name : null);
    setUserRole(parsed ? String(parsed.role || "").toLowerCase() : null);

    let missing = Number(localStorage.getItem("profileMissing"));
    if (!Number.isFinite(missing)) {
      missing = calcMissing(parsed);
      localStorage.setItem("profileMissing", String(missing));
    }
    setProfileMissing(missing);
  };

  useEffect(() => {
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  // dışa tıklama → kullanıcı menüsünü kapa
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // route değişince mobil menüyü kapa
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  // body scroll lock + ESC kapama
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    const onEsc = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  // scroll gölgesi
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try { await axios.post("/api/auth/logout", { forgetDevice: false }); } catch {}
    finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profileMissing");
      setDropdownOpen(false);
      setUsername(null);
      setUserRole(null);
      setProfileMissing(0);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <motion.div className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
        <motion.nav
          className="navbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="navbar-inner">
            <div className="navbar-left-group">
              <div className="navbar-logo">
                <a href="/">
                  <img src="/images/hero-logo.webp" alt="Sözderece Koçluk" className="navbar-logo-img" />
                </a>
              </div>

              <button
                className="hamburger"
                type="button"
                aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                onClick={() => setMenuOpen((s) => !s)}
              >
                {menuOpen ? <FaTimes /> : <FaBars />}
              </button>

              <ul id="site-menu" className={`navbar-menu ${menuOpen ? "active" : ""}`}>
                <li><NavLink to="/" end>Ana Sayfa</NavLink></li>

                <li className="dropdown-parent">
                  <span className="dropdown-toggle">
                    Hakkımızda <span className="dropdown-arrow">▼</span>
                  </span>
                  <ul className="dropdown-content">
                    <li><NavLink to="/Hakkimizda">Hakkımızda</NavLink></li>
                    <li><NavLink to="/ucretsiz-on-gorusme">İletişim</NavLink></li>
                    <li><NavLink to="/sss">S.S.S</NavLink></li>
                  </ul>
                </li>

                <li><NavLink to="/ekibimiz">Ekibimiz</NavLink></li>
                <li><NavLink to="/paket-detay">Koçluk Al!</NavLink></li>
                <li><NavLink to="/blog">Blog</NavLink></li>
              </ul>
            </div>

            <div className="navbar-right-section">
              <Link to="/sepet" className="notif-cart-badge" aria-label="Sepet">
                <FaShoppingCart size={22} color="#000" />
              </Link>

              <div className="login-button" ref={dropdownRef}>
                {username ? (
                  <div className="user-menu">
                    <button
                      type="button"
                      className="navbar-username"
                      onClick={() => setDropdownOpen((s) => !s)}
                      aria-expanded={dropdownOpen}
                    >
                      {username}
                      {profileMissing > 0 && <span className="profile-missing-badge">{profileMissing}</span>}
                    </button>

                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <Link to="/account" className="dropdown-account-link">
                          Hesabım
                          {profileMissing > 0 && (
                            <span className="profile-missing-badge profile-missing-badge--inline">{profileMissing}</span>
                          )}
                        </Link>
                        {userRole === "student" && <Link to="/student/dashboard">Öğrenci Paneli</Link>}
                        {userRole === "coach" && <Link to="/coach/dashboard">Koç Paneli</Link>}
                        {userRole === "admin" && <Link to="/admin">Admin Paneli</Link>}
                        {userRole === "teacher" && <Link to="/ogretmen/panel/profil">Öğretmen Paneli</Link>}
                        <Link to="/orders">Siparişlerim</Link>
                        <button onClick={handleLogout}>Çıkış Yap</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login">GİRİŞ YAP</Link>
                )}
              </div>
            </div>
          </div>
        </motion.nav>
      </motion.div>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  );
};

export default Navbar;
