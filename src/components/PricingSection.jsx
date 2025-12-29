import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../cssFiles/PricingSection.css";

// İkonlar
import {
  FaUserCheck,
  FaChalkboardTeacher,
  FaHeadset,
  FaBookOpen,
  FaCheck,
  FaTimes,
  FaCalendarCheck,
  FaChartLine,
  FaUsers,
  FaArrowLeft,  
  FaArrowRight 
} from "react-icons/fa";

// Swiper (Slider)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Veri
import { PACKAGES, PACKAGES_ORDER } from "../hooks/packages.js";

// --- YARDIMCI BİLEŞENLER ---

function FeatureItem({ label, included }) {
  return (
    <li className={`feat ${included ? "on" : "off"}`}>
      <span className="tick">{included ? <FaCheck /> : <FaTimes />}</span>
      <span>{label}</span>
    </li>
  );
}

const iconForType = (type) => {
  switch (type) {
    case "tutoring_only": return <FaBookOpen />;
    case "hybrid_light": return <FaChalkboardTeacher />;
    case "coaching_only": return <FaUserCheck />;
    case "coaching_plus_tutoring": return <FaHeadset />;
    default: return <FaUserCheck />;
  }
};

const badgeForType = (type) => {
  switch (type) {
    case "tutoring_only": return "Esnek Plan";
    case "hybrid_light": return "Popüler";
    case "coaching_only": return "Tam Kapsam";
    case "coaching_plus_tutoring": return "VIP Paket";
    default: return "";
  }
};

export default function PricingSection() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu dinle
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Görüntülenecek paketleri filtrele
  const visiblePackages = PACKAGES_ORDER.filter(
    (slug) => PACKAGES[slug] && !PACKAGES[slug].hidden
  ).map((key) => PACKAGES[key]);

  // Kart Oluşturma Fonksiyonu
  const renderCard = (p) => {
    const icon = iconForType(p.type);
    const badge = badgeForType(p.type);
    const isPopular = p.type === "coaching_only"; 

    return (
      <div className={`pricing-card ${isPopular ? "popular-card" : ""}`}>
        {badge && <div className="badge">{badge}</div>}

        <div className="pricing-head">
          <div className="icon-wrapper">{icon}</div>
          <h3 className="pricing-name">{p.title}</h3>
          
          <div className="price-area">
            {p.oldPriceText && <span className="old-price">{p.oldPriceText}</span>}
            <span className="new-price">{p.priceText}</span>
          </div>
          
          {p.subtitle && <p className="pricing-desc">{p.subtitle}</p>}
        </div>

        <div className="divider"></div>

        {Array.isArray(p.features) && (
          <ul className="pricing-features">
            {p.features.map((f, i) => (
              <FeatureItem key={i} label={f.label} included={!!f.included} />
            ))}
          </ul>
        )}

        <div className="card-footer">
          {p.cta?.href && (
            <button className="pricing-cta" onClick={() => navigate(p.cta.href)}>
              {p.cta.label || "Detayları İncele"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pricing-section" id="paketler">
      <div className="pricing-header">
        <h2 className="pricing-section-title">Hedefine Uygun Planı Seç</h2>
        <p className="pricing-section-subtitle">
          İster sadece özel ders, ister tam kapsamlı koçluk. Başarıya giden yolda sana en uygun paketi belirle.
        </p>
      </div>

      {/* --- PAKETLER ALANI --- */}
      <div className="packages-container">
        {isMobile ? (
          // MOBİL İÇİN SWIPER (SLIDER)
          <div className="swiper-container-wrapper">
            <Swiper
              modules={[Pagination, Navigation]}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              spaceBetween={20}
              slidesPerView={1} 
              centeredSlides={true}
              initialSlide={2} // <--- ÖNEMLİ: 2500 TL'lik paket (3. sıra, index 2) varsayılan açılır
              className="pricing-swiper"
            >
              {visiblePackages.map((p) => (
                <SwiperSlide key={p.slug}>
                  {renderCard(p)}
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Özel Ok Butonları */}
            <div className="swiper-button-prev-custom"><FaArrowLeft /></div>
            <div className="swiper-button-next-custom"><FaArrowRight /></div>
          </div>
        ) : (
          // MASAÜSTÜ İÇİN GRID
          <div className={`pricing-grid col-${visiblePackages.length}`}>
            {visiblePackages.map((p) => (
              <div key={p.slug} className="grid-item">
                {renderCard(p)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}