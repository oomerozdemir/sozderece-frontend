import React, { Suspense, lazy } from "react"; // Suspense eklendi
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Link eklendi
import "../cssFiles/index.css";
import DiscountPopup from "../components/DiscountPopup";
import Seo from "../components/Seo";

// --- KRİTİK DEĞİŞİKLİK 1: İlk görünen bileşenleri NORMAL import yapıyoruz (Hız için) ---
import HeroSection from "../components/HeroSection";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";

// --- Alt kısımları Lazy Load yapabiliriz (Performans için) ---
const PricingSection = lazy(() => import("../components/PricingSection"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
const Footer = lazy(() => import("../components/Footer"));
const WhatsappButton = lazy(() => import("../components/WhatsappButton"));
const HomeCoachSlider = lazy(() => import("../components/HomeCoachSlider"));
const Testimonials = lazy(() => import("../components/Testimonials"));
// const FeaturedTeachers = lazy(() => import("../components/featuredTeacher"));

// Yükleniyor animasyonu (Lazy bileşenler yüklenene kadar görünür)
const LoadingSpinner = () => <div style={{ padding: 50, textAlign: "center" }}>Yükleniyor...</div>;

export default function HomePage() {
  return (
    <>
      {/* KRİTİK DEĞİŞİKLİK 2: SEO Bilgilerini Tek Bileşene Topladık.
        Manuel Helmet etiketlerini sildik.
      */}
      <Seo 
        title="YKS & LGS Online Öğrenci Koçluğu" 
        description="Türkiye'nin en kapsamlı online koçluk platformu. Derece öğrencisi koçlar ile YKS ve LGS'ye disiplinli hazırlanın."
        canonical="/"
      />

      <motion.div
        className="page"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        {/* İlk görünenler direkt render edilir */}
        <TopBar />
        <Navbar />
        <DiscountPopup />
        <HeroSection />

        {/* Lazy bileşenler Suspense içine alınmalı */}
        <Suspense fallback={<LoadingSpinner />}>
          <PricingSection />
          <Testimonials />
          <HomeCoachSlider />
          <WhyChooseUs />
        </Suspense>

        {/* === İLETİŞİM BÖLÜMÜ === 
            Form yerine doğrudan ana başvuru sayfasına yönlendirme (Call to Action)
            daha yüksek dönüşüm sağlar. 
        */}
        <section className="contact-section" style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 className="section-title">Hemen Başlayalım mı?</h2>
          <p className="section-description" style={{marginBottom: '30px'}}>
            Aklındaki soruları gidermek ve sisteme dahil olmak için bize ulaş.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
             {/* WhatsApp Butonu */}
             <a
                href="https://wa.me/905312546701"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-button"
                style={{ display: 'inline-block', textDecoration: 'none'}}
              >
                WhatsApp Hattı
              </a>
              
              {/* Form Sayfasına Yönlendirme */}
              <Link to="/ucretsiz-on-gorusme" className="submit-btn" style={{
                  display: 'inline-block', 
                  textDecoration: 'none', 
                  backgroundColor: '#0f2a4a', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '8px',
                  fontWeight: 'bold'
              }}>
                Ücretsiz Görüşme
              </Link>
          </div>
        </section>

        <Suspense fallback={null}>
          <Footer />
          <WhatsappButton />
        </Suspense>
      </motion.div>
    </>
  );
}