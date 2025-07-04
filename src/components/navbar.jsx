import { useEffect, useState, useRef } from "react";
import "../cssFiles/navbar.css";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cart } = useCart();

  useEffect(() => {
    const handleUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUsername(parsed.name);
        setUserRole(parsed.role);
      } else {
        setUsername(null);
        setUserRole(null);
      }
    };

    handleUser();
    window.addEventListener("storage", handleUser);
    return () => window.removeEventListener("storage", handleUser);
  }, []);

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="navbar-logo">
          <a href="/">
            {"SÖZDERECE".split("").map((char, index) => (
              <span
                key={index}
                className="logo-letter"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {char}
              </span>
            ))}
          </a>
        </div>

        {/* Hamburger Menü */}
        {menuOpen ? (
  <FaTimes onClick={() => setMenuOpen(false)} className="hamburger" />
) : (
  <FaBars onClick={() => setMenuOpen(true)} className="hamburger" />
)}

   <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
  <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>ANA SAYFA</NavLink></li>
  <li><NavLink to="/hakkimizda" className={({ isActive }) => isActive ? "active" : ""}>HAKKIMIZDA</NavLink></li>
  <li><a href="#">HİZMETLERİMİZ</a></li>
  <li><NavLink to="/coach-detail" className={({ isActive }) => isActive ? "active" : ""}>EKİBİMİZ</NavLink></li>
  <li><NavLink to="/package-detail" className={({ isActive }) => isActive ? "active" : ""}>KOÇLUK AL!</NavLink></li>
  <li><a href="#">İLETİŞİM</a></li>
</ul>


        <div className="navbar-right-section">
          {/* Sepet */}
          <Link to="/cart" className="notif-cart-badge">
            <FaShoppingCart size={22} color="#000" />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </Link>

          {/* Kullanıcı */}
          <div className="login-button" ref={dropdownRef}>
            {username ? (
              <div className="user-menu">
                <span className="navbar-username" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {username}
                </span>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/account">Hesabım</Link>
                    {userRole === "student" && <Link to="/student/dashboard">Öğrenci Paneli</Link>}
                    {userRole === "coach" && <Link to="/coach/dashboard">Koç Paneli</Link>}
                    {userRole === "admin" && <Link to="/admin">Admin Paneli</Link>}
                    <Link to="/contact">Destek</Link>
                    <Link to="/orders">Siparişlerim</Link>
                    <button onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}>Çıkış Yap</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">GİRİŞ YAP</Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Menü açıkken arka planı karart */}
      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>}
    </>
  );
};

export default Navbar;
