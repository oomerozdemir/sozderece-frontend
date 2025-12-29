import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFiles/navbar.css";
// DİKKAT: useCart hook'unu parantezsiz (default import) çağırıyoruz.
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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    name: "",
    role: "" 
  });

  const navigate = useNavigate();
  
  // Sepet hatasını önlemek için güvenli erişim
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
        // HATA DÜZELTİLDİ: || "student" kaldırıldı. Rol yoksa boş kalsın.
        role: storedRole ? storedRole.toLowerCase() : "" 
      });
    } else {
      setAuthState({ isLoggedIn: false, name: "", role: "" });
    }
  }, []);

  const getDashboardPath = () => {
    const role = authState.role; 
    // Rol kontrolü (Backend'den gelen role göre burayı düzenle)
    if (role === "admin") return "/admin";
    if (role === "teacher" || role === "ogretmen") return "/ogretmen/panel/profil";
    if (role === "student" || role === "ogrenci") return "/student/dashboard";
    
    return "/hesabim"; // Varsayılan
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthState({ isLoggedIn: false, name: "", role: "" });
    navigate("/");
    window.location.reload(); 
  };

  const centerLinks = [
    { name: "Koçluk Paketleri", path: "/paket-detay" },
    { name: "Özel Ders", path: "/ogretmenler" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/images/hero-logo.webp" alt="Sözderece Koçluk" />
        </Link>

        <div className="navbar-center">
          {centerLinks.map((link, index) => (
            <Link key={index} to={link.path} className="nav-link">{link.name}</Link>
          ))}
        </div>

        <div className="navbar-right">
          <Link to="/sepet" className="cart-icon-btn">
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>

          {authState.isLoggedIn ? (
            <div 
              className="user-dropdown-wrapper"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="user-btn">
                <FaUser /> <span className="user-name-span">{authState.name}</span>
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to={getDashboardPath()} className="dropdown-item">
                    <FaTachometerAlt /> Panelim
                  </Link>
                  <Link to="/hesabim" className="dropdown-item">
                    <FaCog /> Hesabım
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <FaSignOutAlt /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/giris-yap" className="login-link">Giriş Yap</Link>
          )}

          <Link to="/paket-detay" className="cta-button">Koçluk Al</Link>

          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
      {/* Mobil Menü Kodları Buraya Gelecek (Aynı) */}
    </nav>
  );
}