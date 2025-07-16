import React from "react";
import { motion } from "framer-motion";
import "../cssFiles/index.css";
import HeroSection from "../components/HeroSection";
// import InfoSection from "../components/InfoSection";
// import TeacherSlider from "../components/TeacherSlider";
import PricingSection from "../components/PricingSection";
import Navbar from "../components/navbar";
import WhyChooseUs from "../components/WhyChooseUs";
// import Testimonials from "../components/Testimonials";
import FaqSection from "../components/FaqSection";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import WhatsappButton from "../components/WhatsappButton";
import HomeCoachSlider from "../components/HomeCoachSlider";

export default function HomePage() {
  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      
    <TopBar />
    <Navbar />
      <HeroSection />
      {/*<InfoSection /> */}
      <HomeCoachSlider />

      {/*<TeacherSlider /> */}
      <PricingSection />
      <WhyChooseUs />
      {/* <Testimonials /> */}
      <FaqSection />
          {/* === İLETİŞİM CTA (Butonlar) === */}
      <section className="contact-section">
  <h2 className="section-title">Bize Ulaşın</h2>
  <p className="section-description">Sorularınız, önerileriniz veya kayıt için bize ulaşabilirsiniz.</p>

  <div className="contact-grid">
    {/* Left - Info */}
    <div className="contact-info">
      <p><strong>Telefon:</strong> +90 531 254 6701</p>
      <p><strong>E-posta:</strong> iletisim@sozderecekocluk.com</p>
      <p><strong>Adres:</strong> İstanbul, Türkiye</p>
      <a href="https://wa.me/905312546701" target="_blank" rel="noreferrer" className="whatsapp-button">
        WhatsApp ile İletişime Geç
      </a>
    </div>

    {/* Right - Form */}
    <form className="contact-form">
      <input type="text" placeholder="Adınız Soyadınız" required />
      <input type="email" placeholder="E-posta Adresiniz" required />
      <textarea placeholder="Mesajınız..." rows="5" required></textarea>
      <button type="submit">Gönder</button>
    </form>
  </div>
</section>


      <Footer />
      <WhatsappButton />
      
    </motion.div>
  );
}