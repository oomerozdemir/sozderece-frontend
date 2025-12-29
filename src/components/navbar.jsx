import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFiles/navbar.css";
import useCart from "../hooks/useCart";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { cart } = useCart();

  // Sepet Sayısı
  const cartItemCount = cart ? cart.length : 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    if (token) {
      setIsAuthenticated(true);
      setUserName(storedName || "Öğrenci");
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    navigate("/");
    window.location.reload();
  };

  // SADELEŞTİRİLMİŞ LİNKLER
  const centerLinks = [
    { name: "Koçluk Paketleri", path: "/paket-detay" },
    { name: "Özel Ders", path: "/ogretmenler" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* SOL: LOGO */}
        <Link to="/" className="navbar-logo">
          <img src="/images/hero-logo.webp" alt="Sözderece Koçluk" />
        </Link>

        {/* ORTA: LİNKLER (Masaüstü) */}
        <div className="navbar-center">
          {centerLinks.map((link, index) => (
            <Link key={index} to={link.path} className="nav-link">
              {link.name}
            </Link>
          ))}
        </div>

        {/* SAĞ: GİRİŞ / SEPET / KOÇLUK AL */}
        <div className="navbar-right">
          
          {/* Sepet İkonu */}
          <Link to="/sepet" className="cart-icon-btn" aria-label="Sepet">
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-dropdown">
              <button className="user-btn">
                <FaUser /> <span className="user-name-span">{userName}</span>
              </button>
              <div className="dropdown-menu">
                 {/* Rol kontrolü yapılabilir, basitleştirildi */}
                <Link to="/hesabim">Hesabım</Link>
                <button onClick={handleLogout}>Çıkış Yap</button>
              </div>
            </div>
          ) : (
            <Link to="/giris-yap" className="login-link">
              Giriş Yap
            </Link>
          )}

          {/* TURUNCU CTA BUTONU */}
          <Link to="/paket-detay" className="cta-button">
            Koçluk Al
          </Link>

          {/* Mobil Menü Butonu */}
          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ (Açılır Kısım) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-links">
             {centerLinks.map((link, index) => (
                <Link key={index} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
             ))}
             <hr />
             {!isAuthenticated && (
                <Link to="/giris-yap" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}