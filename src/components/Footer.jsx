import "../cssFiles/Footer.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";



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
              <li><a href="#">İletişim</a></li>
              <li><a href="/hakkimizda">Hakkimizda</a></li>
              <li><a href="#">Mesafeli Satış Sözleşmesi</a></li>
              <li><a href="#">Teslimat ve İade</a></li>
            </ul>
          </div>

          <div>
            <h4>Kategoriler</h4>
            <ul>
              <li><a href="#">YKS 2026</a></li>
              <li><a href="#">LGS 2026</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alt metin */}
      <div className="footer-bottom">
        © 2025 SözDerece Koçluk – Kullanım Koşulları – Gizlilik – Aydınlatma Metni
      </div>
    </motion.footer>
  );
};

export default Footer;
