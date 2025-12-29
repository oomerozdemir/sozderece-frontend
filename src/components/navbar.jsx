import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../cssFiles/navbar.css";
// useCart hook'unu default import olarak çağırdık (Süslü parantez yok)
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

        {/* SAĞ: BUTONLAR (Masaüstü) */}
        <div className="navbar-right">
          
          {/* MASAÜSTÜ SEPETİ (Mobilde Gizlenecek CSS ile) */}
          <Link to="/sepetim" className="cart-icon-btn desktop-only" aria-label="Sepet">
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>

          {/* MASAÜSTÜ USER DROPDOWN (Mobilde Gizlenecek) */}
          <div className="desktop-only">
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
              <Link to="/giris-yap" className="login-link">
                Giriş Yap
              </Link>
            )}
          </div>

          <Link to="/paket-detay" className="cta-button desktop-only">
            Koçluk Al
          </Link>

          {/* MOBİL MENÜ İKONU (Sadece Mobilde Görünür) */}
          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ (OVERLAY) */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-links">
            
           {/* MOBİL SEPET (Buraya Taşıdık) */}
           <Link to="/sepetim" onClick={() => setIsMobileMenuOpen(false)} className="mobile-cart-link">
             <FaShoppingCart /> Sepetim ({cartItemCount})
           </Link>

           <hr />

           {centerLinks.map((link, index) => (
              <Link key={index} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </Link>
           ))}
           
           <hr />
           
           {authState.isLoggedIn ? (
             <>
               <div className="mobile-user-info">Merhaba, {authState.name}</div>
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
             <>
              <Link to="/giris-yap" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</Link>
              <Link to="/paket-detay" onClick={() => setIsMobileMenuOpen(false)} className="mobile-cta">Koçluk Al</Link>
             </>
           )}
        </div>
      </div>
    </nav>
  );
}