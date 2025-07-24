import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import "../cssFiles/index.css";

// Lazy-load bileşenler
const HeroSection = lazy(() => import("../components/HeroSection"));
const PricingSection = lazy(() => import("../components/PricingSection"));
const Navbar = lazy(() => import("../components/navbar"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
const FaqSection = lazy(() => import("../components/FaqSection"));
const Footer = lazy(() => import("../components/Footer"));
const TopBar = lazy(() => import("../components/TopBar"));
const WhatsappButton = lazy(() => import("../components/WhatsappButton"));
const HomeCoachSlider = lazy(() => import("../components/HomeCoachSlider"));

export default function HomePage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    fetch("https://formspree.io/f/your_form_id", {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
      },
    })
      .then(() => {
        alert("Mesajınız gönderildi!");
        form.reset();
      })
      .catch(() => {
        alert("Gönderilirken bir hata oluştu.");
      });
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <TopBar />
        <Navbar />
        <HeroSection />

        <HomeCoachSlider />
        <PricingSection />
        <WhyChooseUs />
        <FaqSection />

        {/* === İLETİŞİM === */}
        <section className="contact-section">
          <h2 className="section-title">Bize Ulaşın</h2>
          <p className="section-description">
            Sorularınız, önerileriniz veya kayıt için bize ulaşabilirsiniz.
          </p>

          <div className="contact-grid">
            {/* Sol */}
            <div className="contact-info">
              <p>
                <strong>Telefon:</strong> +90 531 254 6701
              </p>
              <p>
                <strong>E-posta:</strong> iletisim@sozderecekocluk.com
              </p>
              <p>
                <strong>Adres:</strong> İstanbul, Türkiye
              </p>
              <a
                href="https://wa.me/905312546701"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-button"
              >
                WhatsApp ile İletişime Geç
              </a>
            </div>

            {/* Sağ (Form) */}
            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Adınız Soyadınız" required />
              <input type="email" name="email" placeholder="E-posta Adresiniz" required />
              <textarea name="message" placeholder="Mesajınız..." rows="5" required></textarea>
              <button type="submit">Gönder</button>
            </form>
          </div>
        </section>

        <Footer />
        <WhatsappButton />
      </Suspense>
    </motion.div>
  );
}
