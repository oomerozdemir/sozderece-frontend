import "../cssFiles/index.css";
import {
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

function TopBar() {
  return (
    <div className="top-bar" role="banner">
      <div className="container">
        <div className="top-bar-left">
          <span className="tb-item tb-email">
            <FaEnvelope className="icon" />
            <a href="mailto:iletisim@sozderecekocluk.com">
              iletisim@sozderecekocluk.com
            </a>
          </span>
          <span className="tb-item tb-phone">
            <FaPhone className="icon" />
            <a href="tel:+905312546701">+90 531 254 67 01</a>
          </span>
        </div>

        <div className="top-bar-right">
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
  );
}

export default TopBar;
