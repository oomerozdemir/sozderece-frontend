import React, { useState } from "react";
import "../cssFiles/FaqSection.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import coachImage from "../assets/manager.svg";

const faqs = [
  {
    question: "Koçluk hizmeti kimler için uygundur?",
    answer: "Sözderece koçluk sistemi, sınav sürecinde yolunu kaybetmek istemeyen tüm LGS ve YKS (TYT–AYT) öğrencileri için uygundur.Hem yeni başlayan hem de düzenini oturtmakta zorlanan öğrenciler faydalanabilir.",
  },
  {
    question: "Görüşmeler nasıl gerçekleşiyor?",
    answer: "Tüm birebir görüşmelerimiz Zoom veya Google Meet üzerinden online olarak gerçekleşir.Görüşme sırasında öğrenci ve koç birlikte haftalık program hazırlar, hedefler belirlenir, motivasyon desteği sağlanır.",
  },
  {
    question: "Veli bilgilendirmesi yapılıyor mu?",
    answer: "Evet, 15 günde bir veliyle birebir görüşme yapılır.Öğrencinin gelişimi, motivasyonu ve ihtiyaçları detaylı olarak paylaşılır.Koç–öğrenci–veli üçgeninde şeffaf ve güvenli bir iletişim kurulur.",
  },

  {
    question:  "Programlar hazır mı veriliyor, kişiye özel mi hazırlanıyor?",
    answer: "Tüm programlar öğrenciyle birlikte, bireysel ihtiyaçlara göre hazırlanır.Hiçbir plan otomatik ya da hazır değildir.",
  },
  {
    question: "Motivasyon desteği nasıl sağlanıyor?",
    answer:   "Koçlar öğrencilerle sadece ders değil, duygu bazlı iletişim de kurar.Motivasyon eksikliğinde yönlendirici olur, öğrenciyi “başarabilirim” inancına geri getirir.",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};


export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    
    <motion.section
  className="faq-section"
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
>
  
      <h2 className="faq-title">Sıkça Sorulan Sorular</h2>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <motion.div
          key={index}
          className={`faq-item ${activeIndex === index ? "active" : ""}`}
          onClick={() => toggleFAQ(index)}
          variants={itemVariants}
        >
            <motion.div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              whileTap={{ scale: 0.98 }}
            >
              <span>  {item.question}</span>
              <motion.div
              animate={{ rotate: activeIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeIndex === index ? (
                <FaChevronUp className="icon" />
              ) : (
                <FaChevronDown className="icon" />
              )}
            </motion.div>
            
            </motion.div>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
            
          </motion.div>
          
        ))}
      </div>
      <motion.img
        src={coachImage}
        alt="Koç"
        className="faq-coach"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </motion.section>
    
  );
}
