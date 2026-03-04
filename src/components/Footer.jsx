import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SHOW_OGRETMEN } from "../config/features";

const Footer = () => {
  return (
    <motion.footer
      className="bg-gradient-to-b from-[#00073a] to-[#100481] text-white pt-10 px-5 pb-5 font-poppins"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-wrap justify-center items-start gap-10 max-w-[1200px] mx-auto text-left max-[768px]:flex-col max-[768px]:items-center max-[768px]:text-center">
        {/* Sol Logo ve Sosyal İkonlar */}
        <div className="flex flex-col items-center text-center">
          <img src="/images/hero-logo.webp" alt="Sözderece Koçluk" className="w-[150px] mb-5 max-[768px]:w-[100px]" />
          <div className="flex justify-center gap-4 mt-2">
            <a href="https://www.instagram.com/sozderece/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[25px] text-white transition-colors hover:text-orange-400">
              <FaInstagram />
            </a>
            <a href="https://www.linkedin.com/company/s%C3%B6zderece-ko%C3%A7luk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[25px] text-white transition-colors hover:text-orange-400">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Link Kolonları */}
        <div className="flex flex-row gap-[60px] justify-center flex-wrap text-left max-[768px]:flex-col max-[768px]:gap-10 max-[768px]:text-center">
          <div>
            <h4 className="mb-3 border-b-2 border-[#eb8a0b] inline-block pb-1 text-white text-[1.2rem]">Kurumsal</h4>
            <ul className="list-none p-0 m-0">
              <li><Link to="/ucretsiz-on-gorusme" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">İletişim</Link></li>
              <li><Link to="/hakkimizda" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Hakkımızda</Link></li>
              <li><Link to="/ekibimiz" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Ekibimiz</Link></li>
              <li><Link to="/sss" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/mesafeli-hizmet-sozlesmesi" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Mesafeli Hizmet Sözleşmesi</Link></li>
              <li><Link to="/iade-ve-cayma-politikasi" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">İade ve Cayma Politikası</Link></li>
              <li><Link to="/gizlilik-politikasi-kvkk" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Gizlilik ve KVKK</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 border-b-2 border-[#eb8a0b] inline-block pb-1 text-white text-[1.2rem]">Kategoriler</h4>
            <ul className="list-none p-0 m-0">
              <li><Link to="/paket-detay" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Paketler</Link></li>
              {SHOW_OGRETMEN && <li><Link to="/ogretmenler" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Özel Ders</Link></li>}
              <li><Link to="/blog" className="cursor-pointer text-gray-300 no-underline transition-colors text-[1.1rem] hover:text-orange-400">Sözderece Blog</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alt metin */}
      <div className="text-center mt-10 text-[0.9rem] border-t border-[rgba(240,113,9,0.781)] pt-4 text-gray-300">
        © 2026 Sözderece Koçluk Her Hakkı Saklıdır.
      </div>
    </motion.footer>
  );
};

export default Footer;
