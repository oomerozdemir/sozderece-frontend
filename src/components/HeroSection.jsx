import React, { useState, useRef, useEffect } from "react";
import "../cssFiles/heroSection.css";
import { motion } from "framer-motion";
import { FaPlay, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Video tıklama kontrolü
  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Soldaki ana içerik
  const leftContent = (
    <motion.div
      className="hero-content"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="hero-title">
        YKS ve LGS'de Başarıya Giden Yol <br />
        <span className="highlight">Sözderece Koçluk</span>
      </h1>
      <p className="hero-subtext">
        Online koçluk sistemi ile disiplinli çalışma, motivasyon desteği,
        bireysel programlama ve veli bilgilendirmesi bir arada. <br />
        Net artışı için doğru yerdesiniz.
      </p>
      <div className="hero-buttons">
        <a href="/paket-detay" className="hero-btn primary">Hemen Başla</a>
        <a href="/ucretsiz-on-gorusme" className="hero-btn secondary">Ücretsiz Ön Görüşme</a>
      </div>
    </motion.div>
  );

  // Masaüstünde sağda slider + navigation ikonları
  const desktopSlider = (
    <div className="hero-media" style={{ position: "relative" }}>
      <button className="swiper-prev slider-icon-button left" aria-label="Önceki">
        <FaChevronLeft size={18} />
      </button>
      <button className="swiper-next slider-icon-button" aria-label="Sonraki">
        <FaChevronRight size={18} />
      </button>
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".swiper-next",
          prevEl: ".swiper-prev"
        }}
        spaceBetween={40}
        slidesPerView={1}
        loop
        className="w-full"
        style={{ maxWidth: 480 }}
      >
        {/* Slide 1: Video */}
        <SwiperSlide>
  <div className="video-wrapper" onClick={handleVideoClick} style={{ cursor: "pointer" }}>
    {!isPlaying && (
      <>
        {/* THUMBNAIL */}
        <img
          src="/images/placeHolder.webp"
          alt="Tanıtım Videosu"
          className="video-thumbnail"
        />
        <div className="play-overlay">
          <FaPlay size={28} className="play-icon" />
        </div>
      </>
    )}
    <video
      ref={videoRef}
      src="/videos/webSite1.mp4"
      muted
      playsInline
      className="hero-video"
      poster="/images/placeHolder.webp" // fallback için de poster eklendi
      style={!isPlaying ? { display: "none" } : { display: "block" }}
    />
  </div>
</SwiperSlide>
        {/* Slide 2: Görseller */}
        <SwiperSlide>
          <div className="hero-images-grid">
            <img src="/images/paketlerImage1.webp" alt="Koçluk Süreci" className="hero-img-grid" />
            <img src="/images/paketlerImage2.webp" alt="Program Görseli" className="hero-img-grid" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );

  // Mobilde sadece dot/pagination ile swipe!
  const mobileSlides = (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      loop
      className="mobile-hero-slider"
      modules={[Pagination]}
      pagination={{ clickable: true }}
    >
      {/* 1. Slide: Başlık ve butonlar */}
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
            <a href="/paket-detay" className="hero-btn primary">Hemen Başla</a>
            <a href="/ucretsiz-on-gorusme" className="hero-btn secondary">Ücretsiz Ön Görüşme</a>
          </div>
       
        </div>
      </SwiperSlide>
      {/* 2. Slide: Video veya Instagram Link */}
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
              alt="Instagram videosunu izlemek için tıklayın"
              className="hero-instagram-thumbnail"
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
