import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import "../cssFiles/index.css"; 

import DiscountPopup from "../components/DiscountPopup";
import Seo from "../components/Seo";

// --- STATİK IMPORTLAR (SEO için kritik olanlar) ---
import HeroSection from "../components/HeroSection";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer"; // Footer artık hemen yükleniyor (Dış link hatası çözümü)

// --- LAZY LOAD ---
const PricingSection = lazy(() => import("../components/PricingSection"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
const WhatsappButton = lazy(() => import("../components/WhatsappButton"));
const HomeCoachSlider = lazy(() => import("../components/HomeCoachSlider"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const FaqSection = lazy(() => import("../components/FaqSection")); // FAQ Bölümü (Kelime sayısı çözümü)

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
      {/* SEO Ayarları */}
      <Seo 
        title="YKS & LGS Online Öğrenci Koçluğu" 
        description="Sözderece Koçluk ile YKS ve LGS sınavlarına hazırlanın. Kişiye özel ders programı, deneme analizi ve öğrenci koçluğu sistemimizle başarıyı yakalayın."
        canonical="/"
      />

      <DiscountPopup />
      <TopBar />
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* İçerik Bileşenleri */}
      <Suspense fallback={<LoadingSpinner />}>
        <WhyChooseUs />
        <HomeCoachSlider />
        <PricingSection />
        <Testimonials />
        
        {/* Low Word Count hatasını çözmek için S.S.S. bölümünü ekledik */}
        <FaqSection />
      </Suspense>

      {/* İLETİŞİM / CTA BÖLÜMÜ */}
      <section className="home-cta-section">
        <div className="container">
          <h2 className="home-section-title">Hemen Başlayalım mı?</h2>
          <p className="home-section-description">
            Aklındaki soruları gidermek ve sisteme dahil olmak için bize ulaş.
          </p>

          <div className="cta-buttons-wrapper">
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

      {/* Footer */}
      <Footer />
      
      {/* Yüzen Whatsapp Butonu */}
      <Suspense fallback={null}>
        <WhatsappButton />
      </Suspense>
    </>
  );
}