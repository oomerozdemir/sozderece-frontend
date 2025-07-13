import React from "react";
import "../cssFiles/infoSection.css";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import Lottie from "lottie-react";
import studyAnimation from "../assets/lookingman.json";


export default function InfoSection() {
  return (
    <motion.div
      className="info-section"
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.div
  className="info-left"
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
  className="info-right"
  initial={{ opacity: 0, x: 100 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  viewport={{ once: true }}
>
        <h2>Sözderece Koçluk Nedir?</h2>
        <p>
          Sözderece Koçluk, öğrencilere özel hedef belirleme, planlama ve
          motivasyon desteği sağlayan yenilikçi bir eğitim koçluğu sistemidir.
        </p>
        <ul>
          <li>🎯 Hedefine uygun çalışma stratejisi oluştur</li>
          <li>📈 Haftalık takip ve koçluk desteği al</li>
          <li>💡 Analiz odaklı gelişim planı ve geri bildirim</li>
          <li>🧠 Sınav kaygısına karşı çözüm odaklı yaklaşım</li>
          <li>✅ Güçlü bir topluluk duygusu ile yalnız hissetmeme desteği</li>
          <li>🎯 İstenilen derste alanında uzman hocalardan haftalık özel ders imkanı</li>


        </ul>
        <p className="info-summary">
  Sınav sürecinde yalnız değilsin. Hemen iletişime geç, birlikte yol alalım.
</p>
        <div className="info-buttons">
        <a
            href="https://wa.me/905312546701"
            className="info-button whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            >
            <FaWhatsapp />
            WhatsApp ile İletişim
         </a>
          <a href="/hakkimizda" className="info-button more-info">
            Daha Fazla Bilgi
          </a>
        </div>
        </motion.div>
        
        </motion.div>
  );
}
