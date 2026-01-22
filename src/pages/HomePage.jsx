import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../cssFiles/index.css"; 

import DiscountPopup from "../components/DiscountPopup";
import Seo from "../components/Seo";

// --- İLK GÖRÜNENLER (Hızlı Yükleme İçin Normal Import) ---
import HeroSection from "../components/HeroSection";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";

// --- LAZY LOAD (Performans İçin) ---
const PricingSection = lazy(() => import("../components/PricingSection"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
const Footer = lazy(() => import("../components/Footer"));
const WhatsappButton = lazy(() => import("../components/WhatsappButton"));
const HomeCoachSlider = lazy(() => import("../components/HomeCoachSlider"));
const Testimonials = lazy(() => import("../components/Testimonials"));

const LoadingSpinner = () => (
  <div style={{ padding: "100px 0", textAlign: "center", width: "100%" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Yükleniyor...</span>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <>
    
      <Seo 
        title="YKS & LGS Online Öğrenci Koçluğu" 
        description="Türkiye'nin en kapsamlı online koçluk platformu. Derece öğrencisi koçlar ile YKS ve LGS'ye disiplinli hazırlanın."
        canonical="/"
      />

      <motion.div
        className="page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* İlk Render (Critical Rendering Path) */}
        <TopBar />
        <Navbar />
        <DiscountPopup />
        <HeroSection />

        {/* Lazy Components (Suspense Wrapper) */}
        <Suspense fallback={<LoadingSpinner />}>
          
        

          {/* 2. Güven İnşası: Neden Biz? */}
          <WhyChooseUs />

          {/* 3. Sosyal Kanıt: Koçlarımızı Görsünler */}
          <HomeCoachSlider />

          {/* 4. Karar Aşaması: Fiyatlar */}
          <PricingSection />

          {/* 5. Son İkna: Öğrenci Yorumları */}
          <Testimonials />

          {/* === İLETİŞİM / CTA BÖLÜMÜ === 
              Inline style'lar temizlendi, class yapısına çevrildi.
          */}
          <section className="home-cta-section">
            <div className="container">
              <h2 className="home-section-title">Hemen Başlayalım mı?</h2>
              <p className="home-section-description">
                Aklındaki soruları gidermek ve sisteme dahil olmak için bize ulaş.
              </p>

              <div className="cta-buttons-wrapper">
                {/* WhatsApp Butonu */}
                <a
                  href="https://wa.me/905312546701"
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-button-static"
                >
                  <i className="fa-brands fa-whatsapp"></i> WhatsApp Hattı
                </a>
                
            
                <Link to="/ucretsiz-on-gorusme" className="cta-submit-btn">
                  Ücretsiz Görüşme Talep Et
                </Link>
              </div>
            </div>
          </section>

          <Footer />
          <WhatsappButton />
        </Suspense>
      </motion.div>
    </>
  );
}