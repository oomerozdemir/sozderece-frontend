import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaChevronLeft, FaTimes } from "react-icons/fa";

const DYNAMIC_TEXTS = [
  "Sana Özel Detaylı Programlar ve Günlük Takip",
  "Ön Görüşme Fırsatı",
  "Derece Öğrencisi Koçlarla Birebir Çalışma",
  "Seviye Analizi ve Hedef Belirleme",
  "YKS ve LGS'de Netlerini Zirveye Taşı",
];

const CATEGORIES = [
  {
    label: "Geri Dönüşler",
    items: [
      { src: "/images/geridonus.png", alt: "Sözderece Koçluk Öğrenci Geri Dönüşleri" },
      { src: "/images/memnuniyet1.png", alt: "YKS ve LGS Koçluk Veli Memnuniyeti" },
      { src: "/images/memnuniyet2.png", alt: "Online Koçluk Başarı Mesajları" },
      { src: "/images/memnuniyet3.png", alt: "Öğrenci Koçluğu Tavsiyeleri" },
    ],
  },
  {
    label: "Program Örnekleri",
    items: [
      { src: "/images/ornekProgram.png", alt: "Sana Özel YKS Ders Çalışma Programı Örneği" },
      { src: "/images/ornekProgram2.png", alt: "Haftalık LGS Ders Programı Taslağı" },
    ],
  },
  {
    label: "Çalışma Masaları",
    items: [
      { src: "/images/ogrencilerinCalismalari.jpg", alt: "YKS Derece Öğrencilerinin Çalışma Masası" },
    ],
  },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DYNAMIC_TEXTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const closeModal = () => setSelectedIndex(null);

  const currentItems = CATEGORIES[activeTab].items;

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % currentItems.length);
  }, [currentItems.length]);

  const showPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + currentItems.length) % currentItems.length);
  }, [currentItems.length]);

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

      {/* HERO METIN */}
      <div className="max-w-[1000px] mx-auto px-5 text-center flex flex-col justify-center items-center z-10 max-[1100px]:px-[30px]">
        <div>
          <h1 className="text-[2rem] font-semibold text-[#100481] mb-[5px] tracking-[1px] uppercase max-[1100px]:text-[1.6rem] max-[1100px]:mb-[10px] max-[480px]:text-[1.2rem]">
            Sözderece Koçluk İle
          </h1>

          <div className="h-[60px] flex items-center justify-center mb-[10px] max-[1100px]:h-auto max-[1100px]:min-h-[70px] max-[1100px]:mb-[15px] max-[768px]:h-auto max-[768px]:min-h-[60px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[2.5rem] font-extrabold bg-gradient-to-tr from-[#100481] to-[#ff9203] bg-clip-text text-transparent m-0 leading-[1.1] max-[1100px]:text-[2.2rem] max-[1100px]:leading-[1.2] max-[768px]:text-[1.8rem] max-[480px]:text-[1.3rem] max-[480px]:leading-[1.3]"
              >
                {DYNAMIC_TEXTS[index]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-[1.1rem] text-[#666] max-w-[600px] mx-auto mb-[25px] leading-[1.5] max-[480px]:text-[0.95rem] max-[480px]:mb-4 max-[480px]:px-2">
            YKS ve LGS sürecinde kaybolma! Derece öğrencisi koçlarımızla tanış,
            seviye analizi ve sana özel programlarla netlerini zirveye taşı.
          </p>

          <div className="flex gap-5 justify-center flex-wrap max-[480px]:gap-3">
            <a
              href="/ucretsiz-on-gorusme"
              className="bg-[#f39c12] text-white py-4 px-8 text-[1.1rem] font-bold rounded-[50px] no-underline flex items-center gap-[10px] transition shadow-[0_10px_20px_rgba(243,156,18,0.3)] hover:-translate-y-[3px] hover:shadow-[0_15px_30px_rgba(243,156,18,0.4)] max-[768px]:w-full max-[768px]:justify-center"
            >
              Ön Görüşme Al <FaChevronRight />
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

      {/* --- GALERİ BÖLÜMÜ --- */}
      <div className="w-full bg-white border-t border-[#eee] mt-5 px-5 md:px-10">

        {/* AÇMA/KAPAMA BUTONU */}
        <button
          onClick={() => setGalleryOpen((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 py-5 text-[#0f2a4a] font-semibold text-sm cursor-pointer bg-transparent border-0 hover:text-[#100481] transition-colors"
        >
          Örnek Çalışmalarımız
          <motion.span
            animate={{ rotate: galleryOpen ? 90 : 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <FaChevronRight />
          </motion.span>
        </button>

        {/* KATEGORİLİ GALERİ */}
        <AnimatePresence initial={false}>
          {galleryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-8">
                {/* SEKMELER */}
                <div className="flex justify-center gap-3 mb-7 flex-wrap">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveTab(i); setSelectedIndex(null); }}
                      className={`py-2 px-6 rounded-full font-semibold text-sm transition-all border-2 cursor-pointer ${
                        activeTab === i
                          ? "bg-[#100481] text-white border-[#100481] shadow-[0_4px_12px_rgba(16,4,129,0.25)]"
                          : "bg-white text-[#0f2a4a] border-[#0f2a4a] hover:bg-[#0f2a4a] hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* RESİMLER */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    className="max-w-[1100px] mx-auto"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* MOBİL: 1 veya 2 sütunlu grid */}
                    <div className="grid grid-cols-2 gap-3 md:hidden max-[360px]:grid-cols-1">
                      {currentItems.map((item, i) => (
                        <motion.div
                          key={i}
                          className="rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] cursor-pointer active:scale-95 transition-transform"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, delay: i * 0.06 }}
                          onClick={() => setSelectedIndex(i)}
                        >
                          <img src={item.src} alt={item.alt} loading="lazy" className="w-full h-auto block" />
                        </motion.div>
                      ))}
                    </div>

                    {/* MASAÜSTÜ: grid */}
                    <div
                      className="hidden md:grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${Math.min(currentItems.length, 4)}, minmax(0, 1fr))` }}
                    >
                      {currentItems.map((item, i) => (
                        <motion.div
                          key={i}
                          className="rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.1)] cursor-zoom-in bg-[#f8f9fa] flex items-center justify-center h-[300px]"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.08 }}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          onClick={() => setSelectedIndex(i)}
                        >
                          <img src={item.src} alt={item.alt} loading="lazy" className="w-full h-full object-contain" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="absolute top-1/2 -translate-y-1/2 left-[30px] bg-white/[0.15] border border-white/20 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.5rem] cursor-pointer z-[2001] transition hover:bg-white/40 hover:scale-110 max-[768px]:w-11 max-[768px]:h-11 max-[768px]:text-[1.2rem] max-[768px]:bg-black/50 max-[768px]:left-[10px]"
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
                src={currentItems[selectedIndex].src}
                alt={currentItems[selectedIndex].alt}
                className="w-full h-auto max-h-[85vh] block object-contain max-[768px]:max-h-[70vh]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute bottom-[10px] bg-black/60 text-white py-[5px] px-3 rounded-[20px] text-[0.9rem] font-medium pointer-events-none">
                {selectedIndex + 1} / {currentItems.length}
              </div>
            </motion.div>

            <button
              className="absolute top-1/2 -translate-y-1/2 right-[30px] bg-white/[0.15] border border-white/20 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.5rem] cursor-pointer z-[2001] transition hover:bg-white/40 hover:scale-110 max-[768px]:w-11 max-[768px]:h-11 max-[768px]:text-[1.2rem] max-[768px]:bg-black/50 max-[768px]:right-[10px]"
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
