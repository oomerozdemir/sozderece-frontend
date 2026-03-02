import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaChevronLeft, FaTimes } from "react-icons/fa";

// Değişen metinler
const DYNAMIC_TEXTS = [
  "Sana Özel Detaylı Programlar ve Günlük Takip",
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
  { src: "/images/ornekProgram.png", alt: "Sana Özel YKS Ders Çalışma Programı Örneği" },
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
    <section className="relative bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-5 pb-0 flex flex-col justify-center gap-[15px] overflow-hidden max-[768px]:pt-10">
      <div className="max-w-[1000px] mx-auto px-5 text-center flex flex-col justify-center items-center z-10 max-[1100px]:px-[30px]">
        <div>
          {/* SEO İÇİN KRİTİK: H1 Etiketi */}
          <h1 className="text-[2rem] font-semibold text-[#100481] mb-[5px] tracking-[1px] uppercase max-[1100px]:text-[1.6rem] max-[1100px]:mb-[10px]">
            Sözderece Koçluk İle
          </h1>

          <div className="h-[60px] flex items-center justify-center mb-[10px] max-[1100px]:h-auto max-[1100px]:min-h-[70px] max-[1100px]:mb-[15px] max-[768px]:h-auto max-[768px]:min-h-[80px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[2.5rem] font-extrabold bg-gradient-to-tr from-[#100481] to-[#ff9203] bg-clip-text text-transparent m-0 leading-[1.1] max-[1100px]:text-[2.2rem] max-[1100px]:leading-[1.2] max-[768px]:text-[1.8rem]"
              >
                {DYNAMIC_TEXTS[index]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-[1.1rem] text-[#666] max-w-[600px] mx-auto mb-[25px] leading-[1.5]">
            YKS ve LGS sürecinde kaybolma! Derece öğrencisi koçlarımızla tanış,
            seviye analizi ve sana özel programlarla netlerini zirveye taşı.
          </p>

          <div className="flex gap-5 justify-center flex-wrap">
            <a
              href="/ucretsiz-on-gorusme"
              className="bg-[#f39c12] text-white py-4 px-8 text-[1.1rem] font-bold rounded-[50px] no-underline flex items-center gap-[10px] transition shadow-[0_10px_20px_rgba(243,156,18,0.3)] hover:-translate-y-[3px] hover:shadow-[0_15px_30px_rgba(243,156,18,0.4)] max-[768px]:w-full max-[768px]:justify-center"
            >
              Ücretsiz Ön Görüşme Al <FaChevronRight />
            </a>
            <a
              href="/paket-detay"
              className="bg-white text-[#0f2a4a] border-2 border-[#0f2a4a] py-[14px] px-8 text-[1.1rem] font-bold rounded-[50px] no-underline transition hover:bg-[#0f2a4a] hover:text-white max-[768px]:w-full max-[768px]:justify-center"
            >
              Paketleri İncele
            </a>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
        <small>👇 Örnek çalışmaları detaylı incelemek için görsellere tıklayınız 👇</small>
      </div>

      {/* --- ALT KISIM: SONSUZ KAYAN ŞERİT (MARQUEE) --- */}
      <div className="w-full bg-white py-[15px] border-t border-[#eee] border-b overflow-hidden relative mt-5">
        <div
          className="flex gap-[40px] w-max hover:[animation-play-state:paused]"
          style={{ animation: "scroll 40s linear infinite" }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => {
            const originalIndex = i % MARQUEE_ITEMS.length;
            return (
              <div
                key={i}
                className="w-[360px] h-[220px] rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex-shrink-0 cursor-zoom-in relative transition hover:scale-105 max-[768px]:w-[200px] max-[768px]:h-[100px]"
                onClick={() => setSelectedIndex(originalIndex)}
              >
                {/* SEO: Alt etiketleri eklendi */}
                <img src={item.src} alt={item.alt} loading="lazy" className="w-full h-full object-cover object-top" />
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SLIDER MODAL --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-[rgba(0,0,0,0.85)] z-[2000] flex justify-center items-center p-5 backdrop-blur-[5px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button
              className="absolute top-1/2 -translate-y-1/2 left-[30px] bg-white/[0.15] border border-white/20 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.5rem] cursor-pointer z-[2001] transition hover:bg-white/40 hover:scale-110 max-[768px]:w-10 max-[768px]:h-10 max-[768px]:text-[1.2rem] max-[768px]:bg-black/50 max-[768px]:left-[10px]"
              onClick={showPrev}
            >
              <FaChevronLeft />
            </button>

            <motion.div
              className="relative max-w-[90%] max-h-[90vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[10px] overflow-hidden bg-black flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                className="absolute top-[15px] right-[15px] bg-white/20 border-0 text-white w-10 h-10 rounded-full text-[1.2rem] cursor-pointer flex items-center justify-center transition hover:bg-white/40 z-10"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
              <motion.img
                key={selectedIndex}
                src={MARQUEE_ITEMS[selectedIndex].src}
                alt={MARQUEE_ITEMS[selectedIndex].alt}
                className="w-full h-auto max-h-[85vh] block object-contain max-[768px]:max-h-[70vh]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute bottom-[10px] bg-black/60 text-white py-[5px] px-3 rounded-[20px] text-[0.9rem] font-medium pointer-events-none">
                {selectedIndex + 1} / {MARQUEE_ITEMS.length}
              </div>
            </motion.div>

            <button
              className="absolute top-1/2 -translate-y-1/2 right-[30px] bg-white/[0.15] border border-white/20 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.5rem] cursor-pointer z-[2001] transition hover:bg-white/40 hover:scale-110 max-[768px]:w-10 max-[768px]:h-10 max-[768px]:text-[1.2rem] max-[768px]:bg-black/50 max-[768px]:right-[10px]"
              onClick={showNext}
            >
              <FaChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
