import "../cssFiles/Footer.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="footer-container">
        {/* Sol Logo ve Sosyal İkonlar */}
        <div className="footer-left">
          <img src="../images/hero-logo.png" alt="Logo" className="footer-logo" />
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Link Kolonları */}
        <div className="footer-columns">
          <div>
            <h4>Kurumsal</h4>
            <ul>
              <li><Link to="/ucretsiz-on-gorusme">İletişim</Link></li>
              <li><a href="/hakkimizda">Hakkimizda</a></li>
              <li><Link to="/mesafeli-hizmet-sozlesmesi">Mesafeli Hizmet Sözleşmesi</Link></li>
              <li><Link to="/iade-ve-cayma-politikasi">İade ve Cayma Politikası</Link></li>
              <li><Link to="/gizlilik-politikasi-kvkk">Gizlilik ve KVKK</Link></li>
            </ul>
          </div>

          <div>
            <h4>Kategoriler</h4>
            <ul>
              <li><a href="/package-detail">YKS 2026</a></li>
              <li><a href="/package-detail">LGS 2026</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alt metin */}
      <div className="footer-bottom">
        © 2025 Sözderece Koçluk Her Hakkı Saklıdır.
      </div>
    </motion.footer>
  );
};

export default Footer;
