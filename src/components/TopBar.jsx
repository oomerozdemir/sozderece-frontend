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
    <div className="top-bar">
      <div className="container">
        <div className="top-bar-left">
          <span>
            <FaEnvelope /> iletisim@sozderecekocluk.com
          </span>
          <span>
            <FaPhone />{" "}
            <a href="https://wa.me/905312546701">+90 531 254 67 01</a>
          </span>
        </div>
        <div className="top-bar-right">
          <a
            href="https://www.instagram.com/sozderece/"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.tiktok.com/@sozderece.com"
            target="_blank"
            rel="noreferrer"
          >
            <FaTiktok />
          </a>
          <a
            href="https://www.youtube.com/@sozderecekoclukk"
            target="_blank"
            rel="noreferrer"
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
