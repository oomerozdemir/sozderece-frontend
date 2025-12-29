import "../cssFiles/index.css"; 
// Eğer ayrı bir CSS dosyası kullanmıyorsanız index.css içinde stilleri tanımlayacağız.
import {
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaWhatsapp
} from "react-icons/fa";

function TopBar() {
  return (
    <div className="top-bar" role="banner">
      <div className="container top-bar-container">
        
        {/* SOL: İletişim Bilgileri */}
        <div className="top-bar-left">
          <a href="mailto:iletisim@sozderecekocluk.com" className="tb-item">
            <FaEnvelope className="icon" />
            <span>iletisim@sozderecekocluk.com</span>
          </a>
          <a href="tel:+905312546701" className="tb-item">
            <FaPhone className="icon" />
            <span>+90 531 254 67 01</span>
          </a>
        </div>

        {/* SAĞ: Sosyal Medya */}
        <div className="top-bar-right">
          <div className="social-icons">
            <a
              href="https://www.instagram.com/sozderece/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/@sozderece.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
            <a
              href="https://www.youtube.com/@sozderecekoclukk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;