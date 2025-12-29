import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFiles/navbar.css";
// useCart hook'unu parantezsiz (default import) olarak çağırdık
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
  
  // Kullanıcı Durumu
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    name: "",
    role: "" // Varsayılan olarak boş bırakıyoruz
  });

  const navigate = useNavigate();
  
  // Sepet verisini güvenli çekelim
  const { cart } = useCart() || { cart: [] };
  const cartItemCount = cart ? cart.length : 0;

  // Sayfa yüklendiğinde Auth kontrolü
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole"); 

    if (token) {
      setAuthState({
        isLoggedIn: true,
        name: storedName || "Kullanıcı",
        // ÖNEMLİ DÜZELTME: || "student" kısmını kaldırdık. 
        // Eğer rol yoksa boş kalsın ki yanlış panele gitmesin.
        role: storedRole ? storedRole.toLowerCase() : "" 
      });
    } else {
      setAuthState({ isLoggedIn: false, name: "", role: "" });
    }
  }, []);

  // Rol bazlı panel yolu belirleme
  const getDashboardPath = () => {
    // Rolü küçük harfe çevirip kontrol ediyoruz (admin, Admin, ADMIN fark etmez)
    const role = authState.role; 

    if (role === "admin") return "/admin";
    if (role === "teacher" || role === "ogretmen") return "/ogretmen/panel/profil";
    if (role === "student" || role === "ogrenci") return "/student/dashboard";
    
    // Rol tanımsızsa veya farklıysa varsayılan hesap sayfasına git
    return "/hesabim";
  };

  const handleLogout = () => {
    localStorage.clear(); // Tüm verileri temizle
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

        {/* SAĞ: SEPET / USER / BUTON */}
        <div className="navbar-right">
          
          {/* Sepet İkonu */}
          <Link to="/sepetim" className="cart-icon-btn" aria-label="Sepet">
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>

          {/* GİRİŞ DURUMUNA GÖRE İÇERİK */}
          {authState.isLoggedIn ? (
            <div 
              className="user-dropdown-wrapper"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="user-btn">
                <FaUser /> 
                <span className="user-name-span">{authState.name}</span>
              </button>
              
              {/* Dropdown Menü */}
              {dropdownOpen && (
                <div className="dropdown-menu">
                  {/* Dinamik Panel Linki */}
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
            <Link to="/giris-yap" className="login-link">
              Giriş Yap
            </Link>
          )}

          <Link to="/paket-detay" className="cta-button">
            Koçluk Al
          </Link>

          {/* Mobil Menü İkonu */}
          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-links">
             {centerLinks.map((link, index) => (
                <Link key={index} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
             ))}
             
             <hr />
             
             {authState.isLoggedIn ? (
               <>
                 <Link to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
                   <FaTachometerAlt /> Panelim
                 </Link>
                 <Link to="/hesabim" onClick={() => setIsMobileMenuOpen(false)}>
                   <FaCog /> Hesabım
                 </Link>
                 <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mobile-logout">
                   <FaSignOutAlt /> Çıkış Yap
                 </button>
               </>
             ) : (
                <Link to="/giris-yap" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}