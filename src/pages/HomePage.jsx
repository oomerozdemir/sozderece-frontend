import React, { lazy } from "react";
import { motion } from "framer-motion";
import "../cssFiles/index.css";
import { Helmet } from "react-helmet";



// Lazy-load bileşenler
const HeroSection = lazy(() => import("../components/HeroSection"));
const PricingSection = lazy(() => import("../components/PricingSection"));
const Navbar = lazy(() => import("../components/navbar"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
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
    <>
    <Helmet>
  <title>Ana Sayfa | Sözderece Koçluk</title>
  <meta
    name="description"
    content="LGS ve YKS öğrencilerine özel birebir online koçluk sistemi. Disiplinli çalışma, motivasyon, program takibi ve veli bilgilendirmesi ile başarıya ulaşın."
  />
  <meta property="og:title" content="Sözderece Koçluk | LGS & YKS Online Koçluk" />
  <meta
    property="og:description"
    content="LGS ve YKS'ye hazırlanan öğrencilere online koçluk desteği.Hemen YKS-LGS koçluk sistemimizi inceleyi,formu doldurun ve hayalinizdeki üniversite için süreci başlatın!"
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sozderecekocluk.com/" />
  <meta property="og:image" content="https://sozderecekocluk.com/images/hero-logo.png" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://sozderecekocluk.com/" />
</Helmet>

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

        <HomeCoachSlider />
        <PricingSection />
        <WhyChooseUs />

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
    </motion.div>
    </>
  );
}
