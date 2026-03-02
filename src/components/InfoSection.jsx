import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import Lottie from "lottie-react";
import studyAnimation from "../assets/lookingman.json";


export default function InfoSection() {
  return (
    <motion.div
      className="flex flex-wrap justify-center items-center gap-10 py-[60px] px-5 text-black rounded-2xl max-w-[1200px] mx-10 mt-auto mb-auto max-[768px]:flex-col max-[768px]:text-center"
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.div
        className="flex-1 flex justify-center max-[768px]:flex-none max-[768px]:w-full"
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Lottie
          animationData={studyAnimation}
          loop={true}
          style={{ width: "100%", maxWidth: "500px", height: "auto" }}
        />
      </motion.div>
      <motion.div
        className="flex-1 text-left max-[768px]:flex-none max-[768px]:w-full"
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <h2 className="text-[2.5rem] mb-5 font-bold text-[rgb(2,20,80)] max-[768px]:text-[1.6rem]">Sözderece Koçluk Nedir?</h2>
        <p className="text-[1.4rem] mb-5 max-[768px]:text-base">
          Sözderece Koçluk, öğrencilere özel hedef belirleme, planlama ve
          motivasyon desteği sağlayan yenilikçi bir eğitim koçluğu sistemidir.
        </p>
        <ul className="text-[1.1rem] list-none ml-5 mb-5 max-[768px]:text-base">
          <li className="bg-white border-l-4 border-[rgb(11,57,184)] py-2.5 px-4 mb-2.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[0.95rem] leading-[1.5] transition-colors duration-300 hover:bg-[#fd9002]">🎯 Hedefine uygun çalışma stratejisi oluştur</li>
          <li className="bg-white border-l-4 border-[rgb(11,57,184)] py-2.5 px-4 mb-2.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[0.95rem] leading-[1.5] transition-colors duration-300 hover:bg-[#fd9002]">📈 Haftalık takip ve koçluk desteği al</li>
          <li className="bg-white border-l-4 border-[rgb(11,57,184)] py-2.5 px-4 mb-2.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[0.95rem] leading-[1.5] transition-colors duration-300 hover:bg-[#fd9002]">💡 Analiz odaklı gelişim planı ve geri bildirim</li>
          <li className="bg-white border-l-4 border-[rgb(11,57,184)] py-2.5 px-4 mb-2.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[0.95rem] leading-[1.5] transition-colors duration-300 hover:bg-[#fd9002]">🧠 Sınav kaygısına karşı çözüm odaklı yaklaşım</li>
          <li className="bg-white border-l-4 border-[rgb(11,57,184)] py-2.5 px-4 mb-2.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[0.95rem] leading-[1.5] transition-colors duration-300 hover:bg-[#fd9002]">✅ Güçlü bir topluluk duygusu ile yalnız hissetmeme desteği</li>
        </ul>
        <p className="text-[1.4rem] mb-5 max-[768px]:text-base">
          Sınav sürecinde yalnız değilsin. Hemen iletişime geç, birlikte yol alalım.
        </p>
        <div className="flex flex-wrap gap-[15px] max-[768px]:justify-center">
          <a
            href="https://wa.me/905312546701"
            className="py-2.5 px-5 rounded-lg no-underline font-bold flex items-center gap-2.5 transition-all duration-300 text-[1.2rem] hover:-translate-y-0.5 bg-[#25D366] text-white hover:bg-[#1ebe5d] max-[768px]:justify-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
            WhatsApp ile İletişim
          </a>
          <a
            href="/hakkimizda"
            className="py-2.5 px-5 rounded-lg no-underline font-bold flex items-center gap-2.5 transition-all duration-300 text-[1.2rem] hover:-translate-y-0.5 bg-white text-[#00073a] border border-[rgb(3,2,110)] hover:bg-orange-500 hover:text-white max-[768px]:justify-center"
          >
            Daha Fazla Bilgi
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
