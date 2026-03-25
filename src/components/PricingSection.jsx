import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

import CountdownPricingBanner from "./CountdownPricingBanner";
import { isPromoActive, formatPromoEndDate, isExamPriceActive, getExamPrice, getExamDaysLeft, getExamDailyCost, getExamSavings } from "../utils/promoUtils";

// --- YARDIMCI BİLEŞENLER ---

function FeatureItem({ label, included }) {
  return (
    <li className={`flex items-start gap-[10px] text-[0.95rem] mb-3 leading-[1.4] ${included ? "text-[#444]" : "text-[#bbb] line-through"}`}>
      <span className={`min-w-[20px] h-5 flex items-center justify-center text-[0.8rem] mt-0.5 ${included ? "text-[#27ae60]" : "text-[#ccc]"}`}>
        {included ? <FaCheck /> : <FaTimes />}
      </span>
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

const colClassMap = {
  1: "[grid-template-columns:minmax(300px,500px)] justify-center",
  2: "grid-cols-2 max-w-[800px] mx-auto",
  3: "grid-cols-3 max-[1024px]:grid-cols-2",
  4: "grid-cols-4 max-[1024px]:grid-cols-2",
};

const BADGE_COLORS = {
  green:  "bg-[#dcfce7] text-[#166534]",
  blue:   "bg-[#dbeafe] text-[#1e40af]",
  orange: "bg-[#fef3c7] text-[#92400e]",
  red:    "bg-[#fee2e2] text-[#991b1b]",
};

export default function PricingSection() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [packages, setPackages] = useState([]);
  const [activePlans, setActivePlans] = useState({});

  // Ekran boyutunu dinle
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Paketleri API'den çek
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPackages(data.packages);
      })
      .catch((err) => console.error("Paketler yüklenemedi:", err));
  }, []);

  // Kart Oluşturma Fonksiyonu
  const renderCard = (p) => {
    const icon = iconForType(p.type);
    const badge = badgeForType(p.type);
    const isPopular = p.type === "coaching_only";
    const features = Array.isArray(p.features) ? p.features : [];
    const plans = Array.isArray(p.plans) ? p.plans : [];
    const hasPlanTabs = plans.length > 1;
    const activePlanIdx = activePlans[p.slug] ?? 0;
    const activePlan = hasPlanTabs ? plans[activePlanIdx] : null;

    let displayPrice, strikethroughPrice, badgeText, badgeStyle, durationText, planBadge, planBadgeStyle;

    if (activePlan) {
      // Plan sekmesi aktifse plan verilerini kullan
      displayPrice = activePlan.priceText || "";
      durationText = activePlan.durationText || "";
      strikethroughPrice = activePlan.oldPriceText || null;
      badgeText = null;
      badgeStyle = "";
      planBadge = activePlan.badge || null;
      planBadgeStyle = BADGE_COLORS[activePlan.badgeColor] || BADGE_COLORS.green;
    } else {
      durationText = "";
      planBadge = null;
      planBadgeStyle = "";
      const examActive = isExamPriceActive(p);
      const promoActive = !examActive && isPromoActive(p);

      if (examActive) {
        const examPrice = getExamPrice(p);
        const daysLeft = getExamDaysLeft(p);
        const rate = p.examDiscountRate ?? 5;
        displayPrice = `${examPrice}₺`;
        strikethroughPrice = p.priceText || `${p.price}₺`;
        badgeText = `Sınava ${daysLeft} gün kaldı — %${rate} indirimli`;
        badgeStyle = "bg-[#dbeafe] text-[#1e40af]";
      } else if (promoActive) {
        displayPrice = `${p.promoPrice}₺`;
        strikethroughPrice = p.priceText || `${p.price}₺`;
        badgeText = p.promoLabel || `${formatPromoEndDate(p.promoEndDate)} tarihine kadar`;
        badgeStyle = "bg-[#fef3c7] text-[#92400e]";
      } else {
        displayPrice = p.priceText || `${p.price}₺`;
        strikethroughPrice = p.oldPriceText;
        badgeText = null;
        badgeStyle = "";
      }
    }

    const cardCls = [
      "bg-white rounded-[20px] py-[30px] px-[25px] relative flex flex-col h-full",
      "transition-all shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden group",
      "lg:hover:-translate-y-[10px] lg:hover:shadow-[0_20px_40px_rgba(15,42,74,0.15)] lg:hover:border-[#f39c12]",
      isPopular
        ? "border-2 border-[#0f2a4a] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[6px] before:bg-[#0f2a4a]"
        : "border border-[#eaeaea]",
    ].join(" ");

    return (
      <div className={cardCls}>
        {badge && (
          <div className="absolute top-5 right-5 bg-[#f39c12] text-white py-[6px] px-3 text-[0.75rem] rounded-[20px] font-bold uppercase tracking-[0.5px] z-10">
            {badge}
          </div>
        )}

        <div className="text-center mb-[15px]">
          <div className="w-[60px] h-[60px] bg-[#f0f4f8] text-[#0f2a4a] rounded-full flex items-center justify-center text-[1.5rem] mx-auto mb-[15px] transition-all group-hover:bg-[#0f2a4a] group-hover:text-white">
            {icon}
          </div>
          <h3 className="text-[1.2rem] font-bold text-[#333] mb-[15px] min-h-[50px] flex items-center justify-center">{p.name}</h3>

          {/* Süre sekmeleri */}
          {hasPlanTabs && (
            <div className="flex bg-[#f1f5f9] rounded-full p-1 mb-4 mx-2">
              {plans.map((plan, i) => (
                <button
                  key={i}
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
                    activePlanIdx === i
                      ? "bg-white shadow text-[#0f2a4a]"
                      : "text-[#64748b] hover:text-[#0f2a4a]"
                  }`}
                  onClick={() => setActivePlans((prev) => ({ ...prev, [p.slug]: i }))}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center mb-[15px]">
            {/* Plan rozeti (seçili plana ait) */}
            {planBadge && (
              <span className={`mb-2 inline-block text-[0.72rem] font-bold px-3 py-1 rounded-full ${planBadgeStyle}`}>
                {planBadge}
              </span>
            )}
            {strikethroughPrice && <span className="line-through text-[#999] text-base">{strikethroughPrice}</span>}
            <div className="flex items-baseline gap-1">
              <span className="text-[#0f2a4a] text-[1.6rem] font-extrabold">{displayPrice}</span>
              {durationText && <span className="text-[#64748b] text-sm font-semibold">{durationText}</span>}
            </div>
            {badgeText && (
              <span className={`mt-1.5 inline-block text-[0.72rem] font-bold px-3 py-1 rounded-full ${badgeStyle}`}>
                {badgeText}
              </span>
            )}
            {!activePlan && isExamPriceActive(p) && (() => {

              const dailyCost = getExamDailyCost(p);
              const savings = getExamSavings(p);
              return (
                <>
                  {dailyCost && (
                    <p className="text-[0.72rem] text-[#64748b] mt-1">
                      Günlük sadece <strong>{dailyCost}₺</strong> ile
                    </p>
                  )}
                  {savings && (
                    <span className="mt-1 inline-block bg-[#dcfce7] text-[#166534] text-[0.72rem] font-bold px-3 py-0.5 rounded-full">
                      {savings}₺ tasarruf
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          {p.subtitle && <p className="text-[0.9rem] text-[#666] leading-[1.5] mb-0 min-h-[60px]">{p.subtitle}</p>}
        </div>

        <div className="h-px bg-[#eee] my-5 w-full"></div>

        {features.length > 0 && (
          <ul className="list-none p-0 m-0 mb-[30px] flex-grow">
            {features.map((f, i) => (
              <FeatureItem key={i} label={f.label} included={!!f.included} />
            ))}
          </ul>
        )}

        <div className="mt-auto">
          {p.ctaHref && (
            <button
              className="block w-full text-center bg-[#f39c12] text-white py-[14px] rounded-[10px] font-bold border-0 cursor-pointer text-base transition hover:bg-[#d35400] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(243,156,18,0.3)]"
              onClick={() => {
                const href = activePlan?.ctaHref || p.ctaHref;
                const withPlan = hasPlanTabs ? `${href}${href.includes("?") ? "&" : "?"}plan=${activePlanIdx}` : href;
                navigate(withPlan);
              }}
            >
              {activePlan?.ctaLabel || p.ctaLabel || "Detayları İncele"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const n = Math.min(packages.length, 4);
  const gridClass = `grid gap-[30px] max-w-[1200px] mx-auto ${colClassMap[n] || colClassMap[4]}`;

  if (packages.length === 0) return null;

  return (
    <div className="bg-[#f8f9fa] py-[60px] px-5 relative" id="paketler">
      <div className="text-center max-w-[800px] mx-auto mb-[50px]">
        <h2 className="text-[2.2rem] font-extrabold text-[#0f2a4a] mb-[15px] max-[768px]:text-[1.8rem] max-[480px]:text-[1.4rem]">Hedefine Uygun Planı Seç</h2>
        <p className="text-[1.1rem] text-[#666] leading-[1.6] max-[480px]:text-[0.95rem]">
          İster sadece özel ders, ister tam kapsamlı koçluk. Başarıya giden yolda sana en uygun paketi belirle.
        </p>
      </div>

      {/* --- GERİ SAYIM BANNER --- */}
      <div className="px-5 max-[768px]:px-[10px]">
        <CountdownPricingBanner />
      </div>

      {/* --- PAKETLER ALANI --- */}
      <div className="max-[768px]:px-[10px]">
        {isMobile ? (
          // MOBİL İÇİN SWIPER (SLIDER)
          <div className="relative px-[5px]">
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
              initialSlide={Math.min(1, packages.length - 1)}
              className="pricing-swiper"
            >
              {packages.map((p) => (
                <SwiperSlide key={p.slug}>
                  {renderCard(p)}
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Özel Ok Butonları */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#0f2a4a] shadow-[0_4px_10px_rgba(0,0,0,0.15)] z-10 cursor-pointer border border-[#eee] transition active:bg-[#f39c12] active:text-white active:scale-90 swiper-button-prev-custom">
              <FaArrowLeft />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#0f2a4a] shadow-[0_4px_10px_rgba(0,0,0,0.15)] z-10 cursor-pointer border border-[#eee] transition active:bg-[#f39c12] active:text-white active:scale-90 swiper-button-next-custom">
              <FaArrowRight />
            </div>
          </div>
        ) : (
          // MASAÜSTÜ İÇİN GRID
          <div className={gridClass}>
            {packages.map((p) => (
              <div key={p.slug}>
                {renderCard(p)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
