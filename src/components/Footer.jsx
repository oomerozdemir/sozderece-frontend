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
          {/* public/ altında barınıyor varsayımıyla kök yoldan verelim */}
          <img src="/images/hero-logo.webp" alt="Sözderece Koçluk" className="footer-logo" />
          <div className="social-icons">
            <a href="https://www.instagram.com/sozderece/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.linkedin.com/company/s%C3%B6zderece-ko%C3%A7luk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
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
              <li><Link to="/hakkimizda">Hakkımızda</Link></li>
              <li><Link to="/ekibimiz">Ekibimiz</Link></li>
              <li><Link to="/sss">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/mesafeli-hizmet-sozlesmesi">Mesafeli Hizmet Sözleşmesi</Link></li>
              <li><Link to="/iade-ve-cayma-politikasi">İade ve Cayma Politikası</Link></li>
              <li><Link to="/gizlilik-politikasi-kvkk">Gizlilik ve KVKK</Link></li>
            </ul>
          </div>

          <div>
            <h4>Kategoriler</h4>
            <ul>
              {/* Paket listesi sayfanız varsa /paketler; yoksa öne çıkan paket slug'larına bağlayın */}
              <li><Link to="/paket-detay">Paketler</Link></li>
              <li><Link to="/blog">Sözderece Blog</Link></li>
              {/* örnek hedefler: isterseniz spesifik paket slug'larına linkleyin */}
              {/* <li><Link to="/paket/ozel-ders-paketi">Özel Ders Paketi</Link></li> */}
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
