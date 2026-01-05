import React, { useState, useEffect, useCallback } from "react";
import "../cssFiles/heroSection.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaChevronLeft, FaTimes } from "react-icons/fa";

// Değişen metinler listesi
const DYNAMIC_TEXTS = [
  "Kişiye Özel Detaylı Programlar ve Günlük Takip",
  "Ücretsiz Ön Görüşme Fırsatı",
  "3 Günlük Ücretsiz Deneme Hakkı",
];

// Kayan şeritteki resimler
const MARQUEE_IMAGES = [
  "/images/geridonus.png",
  "/images/memnuniyet1.png",
  "/images/memnuniyet2.png",
  "/images/memnuniyet3.png",
  "/images/ogrencilerinCalismalari.jpg",
  "/images/ornekProgram.png", 
  "/images/ornekProgram2.png",
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null); // Açık olan resmin index'i (null ise kapalı)

  // Metinleri 3.5 saniyede bir değiştir
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DYNAMIC_TEXTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Modal fonksiyonları
  const closeModal = () => setSelectedIndex(null);

  const showNext = useCallback((e) => {
    if(e) e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % MARQUEE_IMAGES.length);
  }, []);

  const showPrev = useCallback((e) => {
    if(e) e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + MARQUEE_IMAGES.length) % MARQUEE_IMAGES.length);
  }, []);

  // Klavye kontrolü (Sağ/Sol ok tuşları)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  return (
    <section className="hero-section-modern">
      <div className="hero-container">
        
        {/* --- ÜST KISIM: METİN & BUTONLAR --- */}
        <div className="hero-text-area">
          <h1 className="static-title">Sözderece Koçluk İle</h1>
          
          <div className="dynamic-text-wrapper">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="dynamic-title"
              >
                {DYNAMIC_TEXTS[index]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="hero-description">
            Sınav sürecinde kaybolma! Derece öğrencisi koçlarımızla tanış, 
            seviye analizi ve sana özel programla netlerini zirveye taşı.
          </p>

          <div className="hero-actions">
            <a href="/ucretsiz-on-gorusme" className="btn-primary">
              Ücretsiz Ön Görüşme Al <FaChevronRight />
            </a>
            <a href="/paket-detay" className="btn-secondary">
              Paketleri İncele
            </a>
          </div>
        </div>
      </div>


      <div style={{ textAlign: 'center', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
  <small>👇 Örnek çalışmaları detaylı incelemek için görsellere tıklayınız 👇</small>
</div>
      {/* --- ALT KISIM: SONSUZ KAYAN ŞERİT (MARQUEE) --- */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {/* Resim setini 2 kez render ediyoruz (Sonsuz döngü için) */}
          {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((src, i) => {
             // Orijinal index'i bulmak için mod alıyoruz
             const originalIndex = i % MARQUEE_IMAGES.length;
             return (
              <div 
                key={i} 
                className="marquee-item" 
                onClick={() => setSelectedIndex(originalIndex)} 
              >
                <img src={src} alt={`Referans ${i}`} loading="lazy" />
                <div className="zoom-hint">🔍 İncele</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SLIDER MODAL (LIGHTBOX) --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            {/* Sol Ok */}
            <button className="modal-nav-btn prev-btn" onClick={showPrev}>
              <FaChevronLeft />
            </button>

            <motion.div 
              className="image-modal-content slider-content"
              onClick={(e) => e.stopPropagation()} // İçeriğe tıklayınca kapanmasın
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
              
              <motion.img 
                key={selectedIndex} // Key değişince animasyon tetiklenir
                src={MARQUEE_IMAGES[selectedIndex]} 
                alt="Büyütülmüş Görsel" 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Mobil için alt sayaç */}
              <div className="modal-counter">
                {selectedIndex + 1} / {MARQUEE_IMAGES.length}
              </div>
            </motion.div>

            {/* Sağ Ok */}
            <button className="modal-nav-btn next-btn" onClick={showNext}>
              <FaChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}