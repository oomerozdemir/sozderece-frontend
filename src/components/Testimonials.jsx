import React from "react";
import { motion } from "framer-motion";
import "../cssFiles/Testimonials.css";

const testimonials = [
  {
    name: "Ayşe K.",
    text: "Bu eğitim sayesinde sınavlarımda büyük başarı elde ettim. Kesinlikle tavsiye ederim!",
    title: "Üniversite Öğrencisi",
  },
  {
    name: "Mehmet B.",
    text: "Etkili koçluk sistemi ve profesyonel rehberlik sayesinde hedefime ulaştım.",
    title: "TYT-Hedefli Öğrenci",
  },
  {
    name: "Zeynep D.",
    text: "Kariyer yolculuğumda yanımda oldular. Gerçekten çok şey öğrendim.",
    title: "Mezun Adayı",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-title">Bizi Tercih Edenler</h2>
        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <p className="testimonial-text">“{item.text}”</p>
              <div>
                <h4 className="testimonial-name">{item.name}</h4>
                <p className="testimonial-title">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
