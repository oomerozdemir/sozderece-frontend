import React, { useState, useEffect, useCallback } from "react";
import "../cssFiles/heroSection.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaChevronLeft, FaTimes } from "react-icons/fa";

// Değişen metinler
const DYNAMIC_TEXTS = [
  "Kişiye Özel Detaylı Programlar ve Günlük Takip",
  "Ücretsiz Ön Görüşme Fırsatı",
  "3 Günlük Ücretsiz Deneme Hakkı",
];

// SEO İÇİN GÜNCELLEME: Resim yolları ve açıklamaları
const MARQUEE_ITEMS = [
  { src: "/images/geridonus.png", alt: "Sözderece Koçluk Öğrenci Geri Dönüşleri" },
  { src: "/images/memnuniyet1.png", alt: "YKS ve LGS Koçluk Veli Memnuniyeti" },
  { src: "/images/memnuniyet2.png", alt: "Online Koçluk Başarı Mesajları" },
  { src: "/images/memnuniyet3.png", alt: "Öğrenci Koçluğu Tavsiyeleri" },
  { src: "/images/ogrencilerinCalismalari.jpg", alt: "YKS Derece Öğrencilerinin Çalışma Masası" },
  { src: "/images/ornekProgram.png", alt: "Kişiye Özel YKS Ders Çalışma Programı Örneği" },
  { src: "/images/ornekProgram2.png", alt: "Haftalık LGS Ders Programı Taslağı" },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DYNAMIC_TEXTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const closeModal = () => setSelectedIndex(null);

  const showNext = useCallback((e) => {
    if(e) e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % MARQUEE_ITEMS.length);
  }, []);

  const showPrev = useCallback((e) => {
    if(e) e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + MARQUEE_ITEMS.length) % MARQUEE_ITEMS.length);
  }, []);

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
        <div className="hero-text-area">
          {/* SEO İÇİN KRİTİK: H1 Etiketi */}
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
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => {
             const originalIndex = i % MARQUEE_ITEMS.length;
             return (
              <div 
                key={i} 
                className="marquee-item" 
                onClick={() => setSelectedIndex(originalIndex)} 
              >
                {/* SEO: Alt etiketleri eklendi */}
                <img src={item.src} alt={item.alt} loading="lazy" />
                <div className="zoom-hint">🔍 İncele</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SLIDER MODAL --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button className="modal-nav-btn prev-btn" onClick={showPrev}><FaChevronLeft /></button>
            
            <motion.div 
              className="image-modal-content slider-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="modal-close-btn" onClick={closeModal}><FaTimes /></button>
              <motion.img 
                key={selectedIndex}
                src={MARQUEE_ITEMS[selectedIndex].src} 
                alt={MARQUEE_ITEMS[selectedIndex].alt}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="modal-counter">{selectedIndex + 1} / {MARQUEE_ITEMS.length}</div>
            </motion.div>

            <button className="modal-nav-btn next-btn" onClick={showNext}><FaChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}