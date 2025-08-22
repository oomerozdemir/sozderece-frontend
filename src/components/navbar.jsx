import { useEffect, useState, useRef } from "react";
import "../cssFiles/navbar.css";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileMissing, setProfileMissing] = useState(0);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // email zorunlu değil; phone/grade/(gerekirse)track sayılır
  const calcMissing = (u) => {
    if (!u) return 0;
    let m = 0;
    if (!u.phone) m++;
    if (!u.grade) m++;
    if (["9", "10", "11", "12", "Mezun"].includes(u.grade) && !u.track) m++;
    return m;
  };

  useEffect(() => {
    const syncUser = () => {
      const userStr = localStorage.getItem("user");
      let parsed = null;
      if (userStr) {
        try { parsed = JSON.parse(userStr); } catch (_) {}
      }

      if (parsed) {
        setUsername(parsed.name);
        setUserRole(parsed.role);
      } else {
        setUsername(null);
        setUserRole(null);
      }

      // 1) localStorage’den okumaya çalış
      let missing = Number(localStorage.getItem("profileMissing"));
      // 2) yoksa/NaN ise user’dan hesapla ve kaydet
      if (!Number.isFinite(missing)) {
        missing = calcMissing(parsed);
        localStorage.setItem("profileMissing", String(missing));
      }
      setProfileMissing(missing);
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  // kullanıcı menüsü dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <motion.div className="navbar-wrapper">
        <motion.nav
          className="navbar"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="navbar-inner">
            <div className="navbar-left-group">
              <div className="navbar-logo">
                <a href="/">
                  <img
                    src="/images/hero-logo.webp"
                    alt="Sözderece Koçluk"
                    className="navbar-logo-img"
                  />
                </a>
              </div>

              {menuOpen ? (
                <FaTimes onClick={() => setMenuOpen(false)} className="hamburger" />
              ) : (
                <FaBars onClick={() => setMenuOpen(true)} className="hamburger" />
              )}

              <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
                <li>
                  <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                    Ana Sayfa
                  </NavLink>
                </li>

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

                <li>
                  <NavLink to="/ekibimiz" className={({ isActive }) => (isActive ? "active" : "")}>
                    Ekibimiz
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/paket-detay" className={({ isActive }) => (isActive ? "active" : "")}>
                    Koçluk Al!
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/blog" className={({ isActive }) => (isActive ? "active" : "")}>
                    Blog
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="navbar-right-section">
              <Link to="/sepet" className="notif-cart-badge">
                <FaShoppingCart size={22} color="#000" />
              </Link>

              <div className="login-button" ref={dropdownRef}>
                {username ? (
                  <div className="user-menu">
                    <span
                      className="navbar-username"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      {username}
                      {profileMissing > 0 && (
                        <span className="profile-missing-badge">{profileMissing}</span>
                      )}
                    </span>

                   {dropdownOpen && (
  <div className="dropdown-menu">
    <Link to="/account" className="dropdown-account-link">
      Hesabım
      {profileMissing > 0 && (
        <span className="profile-missing-badge profile-missing-badge--inline">
          {profileMissing}
        </span>
      )}
    </Link>
    {userRole === "student" && <Link to="/student/dashboard">Öğrenci Paneli</Link>}
    {userRole === "coach" && <Link to="/coach/dashboard">Koç Paneli</Link>}
    {userRole === "admin" && <Link to="/admin">Admin Paneli</Link>}
    <Link to="/orders">Siparişlerim</Link>
    <button onClick={() => {
      localStorage.clear();
      navigate("/login");
    }}>
      Çıkış Yap
    </button>
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

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>}
    </>
  );
};

export default Navbar;
