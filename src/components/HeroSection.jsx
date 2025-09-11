import React, { useState, useRef, useEffect } from "react";
import "../cssFiles/heroSection.css";
import { motion } from "framer-motion";
import { FaPlay, FaChevronLeft, FaChevronRight, FaShieldAlt, FaRegClock, FaChartLine, FaQuestionCircle, FaChalkboardTeacher } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prevZoneW, setPrevZoneW] = useState(44); // dinamik genişlik (px)
  const [nextZoneW, setNextZoneW] = useState(44);
  const videoRef = useRef(null);
  const swiperRef = useRef(null);

    useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // video tıklama
   const handleVideoClick = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };
  
  // aktif slayta göre sağ/sol “zone” genişliklerini hesapla
  const updateZones = (swiper) => {
    if (!swiper) return;
    const total = Math.max(
      (swiper.slides?.length || 0) - (swiper.loopedSlides || 0) * 2,
      1
    );
    const i = swiper.realIndex ?? swiper.activeIndex ?? 0;
    const denom = Math.max(total - 1, 1);

    const progress = denom === 0 ? 0 : i / denom;           // 0 → 1
    const remaining = 1 - progress;                         // 1 → 0

    // min 44px, max 144px (istersen çarpanları değiştir)
    const wLeft  = 44 + Math.round(100 * progress);
    const wRight = 44 + Math.round(100 * remaining);

    setPrevZoneW(wLeft);
    setNextZoneW(wRight);
  };


  // Slayt değişince video slaytından çıkıyorsak pause
 const handleSlideChange = () => {
    updateZones(swiperRef.current);

    // video slaytından çıktıysan durdur
    const v = videoRef.current;
    const s = swiperRef.current;
    if (!v || !s) return;
    const isVideo = (s.realIndex ?? 0) === 0; // ilk slayt video
    if (!isVideo && !v.paused) { v.pause(); setIsPlaying(false); }
  };

  // soldaki ana içerik
  const leftContent = (
    <motion.div
      className="hero-content"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9 }}
    >
      <h1 className="hero-title">
        YKS ve LGS'de Başarıya Giden Yol <br />
        <span className="highlight">Sözderece Koçluk</span>
      </h1>
      <p className="hero-subtext">
        Online koçluk ve özel ders sistemi ile disiplinli çalışma, motivasyon desteği,
        bireysel programlama,soru çözümleri, konu anlatımları ve veli bilgilendirmesi bir arada. <br />
        Net artışı için doğru yerdesiniz.
      </p>

      <div className="hero-buttons">
        <a href="/paket-detay" className="hero-btn primary" aria-label="Hemen Başla">
          Hemen Koçluk Sürecini Başlat
        </a>
        <a href="/ogretmenler" className="hero-btn secondary" aria-label="Özel Ders Öğretmenleri">
          Özel Ders Al
        </a>
      </div>

      {/* Güven satırı */}
      <ul className="hero-trust">
        <li><FaShieldAlt /><span>Kişiye Özel Programlar</span></li>
        <li><FaRegClock /><span>7/24 Koç Desteği</span></li>
        <li><FaChartLine /><span>Kanıtlı Net Artışı</span></li>
        <li><FaQuestionCircle /><span>Soru Çözümleri</span></li>
        <li><FaChalkboardTeacher /><span>Konu Anlatımları</span></li>
      </ul>
    </motion.div>
  );

  // masaüstü: sağda slider
  const desktopSlider = (
    <div className="hero-media" style={{ position: "relative" }}>
      {/* SOL genişleyen zone */}
      <div className="edge-zone edge-zone--left" style={{ width: prevZoneW }}>
        <button className="swiper-prev slider-icon-button left" aria-label="Önceki">
          <FaChevronLeft size={18} />
        </button>
      </div>

      {/* SAĞ genişleyen zone */}
      <div className="edge-zone edge-zone--right" style={{ width: nextZoneW }}>
        <button className="swiper-next slider-icon-button" aria-label="Sonraki">
          <FaChevronRight size={18} />
        </button>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{ prevEl: ".swiper-prev", nextEl: ".swiper-next" }}
        onSwiper={(swiper) => { swiperRef.current = swiper; updateZones(swiper); }}
        onSlideChange={handleSlideChange}
        onResize={() => updateZones(swiperRef.current)}
        spaceBetween={40}
        slidesPerView={1}
        loop
        className="w-full"
        style={{ maxWidth: 520 }}
      >
        {/* 1: Video */}
        <SwiperSlide>
          <div className="video-wrapper" onClick={handleVideoClick}>
            {!isPlaying && (
              <>
                <img
                  src="/images/placeHolder.webp"
                  alt="Tanıtım görüntüsü"
                  className="video-thumbnail"
                  loading="eager"
                  decoding="async"
                  width="360"
                  height="640"
                />
                <button className="play-overlay" aria-label="Videoyu oynat">
                  <FaPlay size={28} className="play-icon" />
                </button>
              </>
            )}
            <video
              ref={videoRef}
              src="/videos/webSite1.mp4"
              muted
              playsInline
              preload="metadata"
              className="hero-video"
              poster="/images/placeHolder.webp"
              style={!isPlaying ? { display: "none" } : { display: "block" }}
            />
          </div>
        </SwiperSlide>

        {/* 2: Görseller */}
        <SwiperSlide>
          <div className="hero-images-grid">
            <img src="/images/paketlerImage1.webp" alt="Program örneği" className="hero-img-grid" loading="lazy" decoding="async" />
            <img src="/images/paketlerImage2.webp" alt="İletişim ekranları" className="hero-img-grid" loading="lazy" decoding="async" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );

  // mobil: başlık + dotlu slider
  const mobileSlides = (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      loop
      className="mobile-hero-slider"
      modules={[Pagination]}
      pagination={{ clickable: true }}
    >
      <SwiperSlide>
        <div className="mobile-slide">
          <h1 className="hero-title">
            YKS ve LGS'de Başarıya Giden Yol <br />
            <span className="highlight">Sözderece Koçluk</span>
          </h1>
          <p className="hero-subtext">
            Online koçluk sistemi ile disiplinli çalışma, motivasyon desteği, bireysel programlama ve veli bilgilendirmesi bir arada. <br />
            Net artışı için doğru yerdesiniz.
          </p>
          <div className="hero-buttons">
            <a href="/paket-detay" className="hero-btn primary">Koçluk Sürecini Başlat</a>
            <a href="/ogretmenler" className="hero-btn secondary">Hemen Özel Ders Al</a>
          </div>

          <ul className="hero-trust hero-trust--mobile">
            <li><FaShieldAlt /><span>Kişiye özel program</span></li>
            <li><FaRegClock /><span>7/24 koç desteği</span></li>
            <li><FaChartLine /><span>Net artışı</span></li>
          </ul>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="mobile-slide">
          <a
            href="https://www.instagram.com/reel/DMnkm__gwRK/?utm_source=ig_web_copy_link&igsh=cjIwd2FqM3o2NHA3"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-instagram-link"
          >
            <img
              src="/images/placeHolder.webp"
              alt="Instagram videosunu izlemek için"
              className="hero-instagram-thumbnail"
              loading="lazy"
              decoding="async"
            />
            <span className="watch-on-instagram">Instagram’da İzle</span>
          </a>
        </div>
      </SwiperSlide>
    </Swiper>
  );

  return (
    <section className="hero-section">
      {/* Masaüstü */}
      <div className="desktop-hero" style={{ display: isMobile ? "none" : "flex", width: "100%" }}>
        {leftContent}
        {desktopSlider}
      </div>

      {/* Mobil */}
      <div className="mobile-hero-slider" style={{ display: isMobile ? "block" : "none", width: "100%" }}>
        {mobileSlides}
      </div>
    </section>
  );
}
