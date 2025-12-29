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
  FaClipboardList,
  FaUsers,
  FaSmile,
  FaStar
} from "react-icons/fa";

// Swiper (Slider)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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

// Avantajlar Listesi
const benefitItems = [
  {
    title: "Koçluk Görüşmeleri",
    icon: <FaChalkboardTeacher />,
    points: ["Birebir takip sistemi", "Planlama & geri bildirim", "Motivasyon desteği"],
  },
  {
    title: "Kişiye Özel Planlama",
    icon: <FaCalendarCheck />,
    points: ["Haftalık/derslik program", "Analizlere göre güncelleme"],
  },
  {
    title: "Deneme Analizi",
    icon: <FaChartLine />,
    points: ["Net-zaman takibi", "Gelişim grafikleri", "Net artışı stratejisi"],
  },
  {
    title: "Veliyle Etkileşim",
    icon: <FaUsers />,
    points: ["Düzenli geri bildirim", "Veli–koç iletişim ağı"],
  },
];

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

  // Kart Oluşturma Fonksiyonu (Tekrarı önlemek için)
  const renderCard = (p) => {
    const icon = iconForType(p.type);
    const badge = badgeForType(p.type);
    const isPopular = p.type === "coaching_only"; // Örnek vurgulama

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
        <h2 className="section-title">Hedefine Uygun Planı Seç</h2>
        <p className="section-subtitle">
          İster sadece özel ders, ister tam kapsamlı koçluk. Başarıya giden yolda sana en uygun paketi belirle.
        </p>
      </div>

      {/* --- PAKETLER ALANI --- */}
      <div className="packages-container">
        {isMobile ? (
          // MOBİL İÇİN SWIPER (SLIDER)
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, dynamicBullets: true }}
            spaceBetween={20}
            slidesPerView={1.15} // Yanlardan biraz gözüksün
            centeredSlides={true}
            className="pricing-swiper"
          >
            {visiblePackages.map((p) => (
              <SwiperSlide key={p.slug}>
                {renderCard(p)}
              </SwiperSlide>
            ))}
          </Swiper>
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