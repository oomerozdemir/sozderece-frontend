import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SHOW_OGRETMEN } from "../config/features";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

const Footer = () => {
  return (
    <motion.footer
      className="bg-[#0D0A2E] text-white pt-14 px-5 pb-6 font-nunito"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-4 gap-10 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1 mb-12">

          {/* Marka Sütunu */}
          <div className="col-span-1">
            <span className="font-fredoka text-[#D8FF4F] text-2xl tracking-wide block mb-3">
              SÖZDERECE
            </span>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Günlük takip. Dinamik program. Gerçek sonuç.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/sozderece/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-[#D8FF4F]/20 hover:text-[#D8FF4F] transition-all"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-[#25D366]/20 hover:text-[#25D366] transition-all"
              >
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          {/* Hizmetler */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Hizmetler</h4>
            <ul className="space-y-2.5">
              <li><Link to="/deneme-kampi" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">YKS Koçluğu</Link></li>
              <li><Link to="/lgs-hazirlik" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">LGS Koçluğu</Link></li>
              <li><Link to="/paket-detay" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Paketler</Link></li>
              {SHOW_OGRETMEN && <li><Link to="/ogretmenler" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Özel Ders</Link></li>}
              <li><Link to="/blog" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Kurumsal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/hakkimizda" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Hakkımızda</Link></li>
              <li><Link to="/ekibimiz" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Ekibimiz</Link></li>
              <li><Link to="/ucretsiz-on-gorusme" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">İletişim</Link></li>
              <li><Link to="/sss" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/basvuru" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Koç Başvurusu</Link></li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Yasal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/mesafeli-hizmet-sozlesmesi" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Hizmet Sözleşmesi</Link></li>
              <li><Link to="/iade-ve-cayma-politikasi" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">İade Politikası</Link></li>
              <li><Link to="/gizlilik-politikasi-kvkk" className="text-white/50 text-sm no-underline hover:text-[#D8FF4F] transition-colors">Gizlilik & KVKK</Link></li>
            </ul>
          </div>
        </div>

        {/* CTA Bandı */}
        <div className="border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 bg-white/3">
          <div>
            <p className="font-nunito font-black text-white text-base mb-0.5">Hâlâ kararsız mısın?</p>
            <p className="text-white/50 text-sm">Ücretsiz keşif görüşmesi — 15 dakika, sana özel değerlendirme.</p>
          </div>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-sm py-3 px-7 rounded-full no-underline whitespace-nowrap transition-all hover:bg-white hover:scale-105 shadow-[0_4px_20px_rgba(216,255,79,0.2)]"
          >
            DM'ye SİSTEM Yaz →
          </a>
        </div>

        {/* Alt Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/8">
          <p className="text-white/30 text-xs">© 2026 Sözderece Koçluk — Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <a href="https://www.instagram.com/sozderece/" target="_blank" rel="noreferrer" className="no-underline text-white/30 hover:text-[#D8FF4F] transition-colors">@sozderece</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
