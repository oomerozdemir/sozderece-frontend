import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import Seo from "../components/Seo";
import { Helmet } from "react-helmet";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaHeadset,
  FaCreditCard,
  FaChevronDown,
  FaChevronUp,
  FaUndo
} from "react-icons/fa";

import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import { isPromoActive, formatPromoEndDate, isExamPriceActive, getExamPrice, getExamDaysLeft, getExamDailyCost, getExamSavings } from "../utils/promoUtils";

const BADGE_COLORS = {
  green:  "bg-[#dcfce7] text-[#166534]",
  blue:   "bg-[#dbeafe] text-[#1e40af]",
  orange: "bg-[#fef3c7] text-[#92400e]",
  red:    "bg-[#fee2e2] text-[#991b1b]",
};

// Fiyat geçerlilik tarihi (Dinamik - 1 yıl sonrası)
const getPriceValidUntil = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
};

const defaultSlug = "yks-kocluk-paketi";

const PackageDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const querySlug = new URLSearchParams(location.search).get("slug");

  const [packages, setPackages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(querySlug || defaultSlug);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activePlanIdx, setActivePlanIdx] = useState(0);

  useEffect(() => {
    axios.get("/api/packages")
      .then((r) => {
        if (r.data.success) setPackages(r.data.packages);
      })
      .catch((err) => console.error("Paketler yüklenemedi:", err));
  }, []);

  useEffect(() => {
    if (querySlug) {
      setSelectedSlug(querySlug);
    } else {
      const newUrl = `${location.pathname}?slug=${defaultSlug}`;
      window.history.replaceState(null, "", newUrl);
      setSelectedSlug(defaultSlug);
    }
    setActivePlanIdx(0);
  }, [querySlug, location.pathname]);

  const pkgMap = Object.fromEntries(packages.map((p) => [p.slug, p]));
  const selected = pkgMap[selectedSlug] || pkgMap[defaultSlug] || packages[0];

  if (!selected) return null;

  const isSpecialTutoring = selected.type === "tutoring_only" || selected.slug === "ozel-ders-paketi";

  const plans = Array.isArray(selected.plans) ? selected.plans : [];
  const hasPlanTabs = plans.length > 1;
  const activePlan = hasPlanTabs ? plans[activePlanIdx] : null;

  const handleContinue = () => {
    if (isSpecialTutoring) {
      navigate("/ogretmenler");
    } else {
      const href = activePlan?.ctaHref || `/hemen-basla?slug=${encodeURIComponent(selected.slug)}`;
      const withPlan = hasPlanTabs ? `${href}${href.includes("?") ? "&" : "?"}plan=${activePlanIdx}` : href;
      navigate(withPlan);
    }
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const features = (Array.isArray(selected.features) ? selected.features : []).map((f) =>
    typeof f === "string" ? { label: f, included: true } : f
  );

  const defaultFaq = [
    { title: "Ödeme güvenli mi?", content: "Evet, tüm ödemeler Paytr altyapısı ile korunmaktadır." },
    { title: "İade politikanız nedir?", content: "Koçluk programınız size verildikten sonraki ilk 5 gün içerisinde koşulsuz iade hakkınız vardır." }
  ];
  const faqList = [...defaultFaq];

  const examActive = !activePlan && isExamPriceActive(selected);
  const promoActive = !activePlan && !examActive && isPromoActive(selected);

  let displayPrice, strikethroughPrice, priceBadgeText, priceBadgeStyle, durationText, planBadge, planBadgeStyle;
  if (activePlan) {
    displayPrice = activePlan.priceText || "";
    durationText = activePlan.durationText || "";
    strikethroughPrice = activePlan.oldPriceText || null;
    priceBadgeText = null;
    priceBadgeStyle = "";
    planBadge = activePlan.badge || null;
    planBadgeStyle = BADGE_COLORS[activePlan.badgeColor] || BADGE_COLORS.green;
  } else if (examActive) {
    const examPrice = getExamPrice(selected);
    const daysLeft = getExamDaysLeft(selected);
    const rate = selected.examDiscountRate ?? 5;
    displayPrice = `${examPrice}₺`;
    durationText = "";
    strikethroughPrice = selected.priceText || `${selected.price}₺`;
    priceBadgeText = `Sınava ${daysLeft} gün kaldı — %${rate} indirimli`;
    priceBadgeStyle = "bg-[#dbeafe] text-[#1e40af]";
    planBadge = null;
    planBadgeStyle = "";
  } else if (promoActive) {
    displayPrice = `${selected.promoPrice}₺`;
    durationText = "";
    strikethroughPrice = selected.priceText || `${selected.price}₺`;
    priceBadgeText = selected.promoLabel || `${formatPromoEndDate(selected.promoEndDate)} tarihine kadar`;
    priceBadgeStyle = "bg-[#fef3c7] text-[#92400e]";
    planBadge = null;
    planBadgeStyle = "";
  } else {
    displayPrice = selected.priceText || `${selected.price}₺`;
    durationText = "";
    strikethroughPrice = null;
    priceBadgeText = null;
    priceBadgeStyle = "";
    planBadge = null;
    planBadgeStyle = "";
  }

  const numericPrice = examActive
    ? String(getExamPrice(selected) || "0")
    : promoActive
      ? String(selected.promoPrice || "0")
      : (selected.priceText
          ? selected.priceText.replace(/[^0-9.]/g, "")
          : String(selected.price || "0"));

  const siteUrl = "https://sozderecekocluk.com";
  const canonicalUrl = `${siteUrl}/paket-detay?slug=${selected.slug}`;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": selected.name,
    "image": [`${siteUrl}/images/hero-logo.webp`, `${siteUrl}/images/paketlerImage1.webp`],
    "description": selected.subtitle || "Sözderece Koçluk YKS hazırlık paketi.",
    "brand": { "@type": "Brand", "name": "Sözderece Koçluk" },
    "sku": selected.slug,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "TRY",
      "price": numericPrice,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Sözderece" },
      "priceValidUntil": getPriceValidUntil(),
    }
  };

  return (
    <>
      <Seo
        title={selected.name}
        description={selected.subtitle}
        canonical={`/paket-detay?slug=${selected.slug}`}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="bg-[#f8fafc] py-16 max-[768px]:py-10 min-h-[80vh]">
        <div className="max-w-[880px] mx-auto px-5">

          {/* Başlık */}
          <div className="text-center mb-8">
            {isSpecialTutoring && (
              <span className="inline-block bg-[#ede8fa] text-page-navy font-fredoka font-bold py-1.5 px-4 rounded-full text-xs mb-4 tracking-wide uppercase">
                Özel Ders
              </span>
            )}
            <h1 className="font-fredoka font-bold text-page-navy text-[2.4rem] max-[768px]:text-[1.8rem] mb-3 leading-[1.1]">
              {selected.name}
            </h1>
            <p className="font-nunito text-[#64748b] text-lg max-[768px]:text-base leading-relaxed max-w-[560px] mx-auto">
              {selected.subtitle}
            </p>
          </div>

          {/* Süre sekmeleri */}
          {hasPlanTabs && (
            <div className="flex bg-white border border-[#e5e7eb] rounded-full p-1.5 mb-6 max-w-[340px] mx-auto">
              {plans.map((plan, i) => (
                <button
                  key={i}
                  type="button"
                  className={`flex-1 py-2 text-sm font-fredoka font-bold rounded-full transition-all ${
                    activePlanIdx === i
                      ? "bg-page-navy text-white"
                      : "text-[#64748b] hover:text-page-navy"
                  }`}
                  onClick={() => setActivePlanIdx(i)}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          )}

          {/* Paket seçici (birden fazla paket varsa) */}
          {packages.length > 1 && (
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 mb-6 max-w-[420px] mx-auto">
              <label className="block font-nunito font-bold text-xs text-[#64748b] mb-2 uppercase tracking-wide">Paket Seçenekleri</label>
              <select
                value={selectedSlug}
                onChange={(e) => {
                  setSelectedSlug(e.target.value);
                  navigate(`?slug=${e.target.value}`, { replace: true });
                }}
                className="w-full py-3 px-3.5 border border-[#e5e7eb] rounded-xl text-base bg-white cursor-pointer outline-none transition-all focus:border-page-navy"
              >
                {packages.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fiyat + Özellikler — bento ikili */}
          <div className="grid grid-cols-2 gap-5 mb-6 max-[640px]:grid-cols-1">

            {/* Fiyat kartı (koyu, PricingSection Hücre 1 ile aynı dil) */}
            <div
              className="rounded-[28px] relative overflow-hidden flex flex-col"
              style={{ background: "#1C1B8A", padding: "36px 32px", boxShadow: "0 16px 40px rgba(28,27,138,0.25)" }}
            >
              <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: "#4a1da0", filter: "blur(60px)", opacity: 0.5, top: -60, right: -40 }} />

              <div className="relative">
                {planBadge && (
                  <span className={`inline-block text-xs font-fredoka font-bold px-3 py-1.5 rounded-full mb-3 ${planBadgeStyle}`}>
                    {planBadge}
                  </span>
                )}
                {strikethroughPrice && (
                  <div className="font-nunito font-bold text-sm mb-1" style={{ color: "rgba(216,255,79,0.45)", textDecoration: "line-through" }}>
                    {strikethroughPrice}
                  </div>
                )}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-fredoka font-bold text-lime leading-none" style={{ fontSize: "clamp(40px,5vw,52px)", letterSpacing: -1 }}>
                    {displayPrice}
                  </span>
                  {durationText && (
                    <span className="font-nunito font-bold text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{durationText}</span>
                  )}
                </div>
                {priceBadgeText && (
                  <span className={`inline-block text-xs font-fredoka font-bold px-3 py-1.5 rounded-full mt-2 ${priceBadgeStyle}`}>
                    {priceBadgeText}
                  </span>
                )}
                {examActive && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {getExamDailyCost(selected) && (
                      <span className="font-nunito text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Günlük sadece <strong className="text-white">{getExamDailyCost(selected)}₺</strong> ile
                      </span>
                    )}
                    {getExamSavings(selected) && (
                      <span className="inline-block bg-[#dcfce7] text-[#166534] text-[11px] font-fredoka font-bold px-2.5 py-0.5 rounded-full">
                        {getExamSavings(selected)}₺ tasarruf
                      </span>
                    )}
                  </div>
                )}
                <p className="font-nunito text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Tüm vergiler dahildir.</p>
              </div>

              <button
                className="block w-full text-center font-fredoka font-bold text-base rounded-full mt-6 relative transition-transform hover:scale-[1.02]"
                style={{ background: "#D8FF4F", color: "#1C1B8A", padding: "16px", boxShadow: "0 6px 18px rgba(216,255,79,0.3)" }}
                onClick={handleContinue}
              >
                {isSpecialTutoring ? "Öğretmenleri İncele" : (activePlan?.ctaLabel || "Hemen Başla →")}
              </button>
            </div>

            {/* Özellikler kartı (açık lila, PricingSection Hücre 2 ile aynı dil) */}
            <div className="rounded-[28px]" style={{ background: "#f4f2fa", padding: "32px 28px" }}>
              <div className="font-fredoka font-bold text-page-navy text-base mb-4" style={{ letterSpacing: 0.3 }}>
                Pakete Dahil…
              </div>
              <ul className="list-none flex flex-col gap-2.5">
                {features.map((f, i) => (
                  <li
                    key={i}
                    className="inline-flex items-start gap-2 rounded-xl font-nunito font-bold text-[13px] leading-snug"
                    style={{
                      background: f.included ? (i % 2 === 0 ? "#ede8fa" : "#fff0ea") : "#f1f5f9",
                      color: f.included ? (i % 2 === 0 ? "#1C1B8A" : "#FF6B35") : "#94a3b8",
                      padding: "10px 14px",
                      textDecoration: f.included ? "none" : "line-through",
                    }}
                  >
                    {f.included
                      ? <FaCheckCircle className="flex-shrink-0 mt-0.5" style={{ opacity: 0.8 }} />
                      : <FaTimesCircle className="flex-shrink-0 mt-0.5" style={{ opacity: 0.5 }} />
                    }
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Güven şeridi */}
          <div className="bg-white border border-[#f1f5f9] rounded-2xl p-5 mb-6">
            <div className="flex justify-center gap-2.5 flex-wrap mb-5">
              <span className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#475569] font-nunito font-bold text-xs px-3.5 py-2 rounded-full">
                <FaShieldAlt className="text-page-navy" /> %100 Güvenli Ödeme
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#475569] font-nunito font-bold text-xs px-3.5 py-2 rounded-full">
                <FaHeadset className="text-page-navy" /> 7/24 Destek
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#475569] font-nunito font-bold text-xs px-3.5 py-2 rounded-full">
                <FaCreditCard className="text-page-navy" /> Taksit İmkanı
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#ecfdf5] text-[#065f46] font-nunito font-bold text-xs px-3.5 py-2 rounded-full">
                <FaUndo /> 14 Gün İade Garantisi
              </span>
            </div>
            <div className="flex justify-center gap-4 opacity-70 pt-4 border-t border-[#f1f5f9]">
              <img src="/images/kare-logo-mastercard.webp" alt="Mastercard" width="40" height="25" loading="lazy" className="h-6 object-contain grayscale hover:grayscale-0 transition-all" />
              <img src="/images/kare-logo-visa.webp" alt="Visa" width="40" height="25" loading="lazy" className="h-6 object-contain grayscale hover:grayscale-0 transition-all" />
              <img src="/images/kare-logo-troy.webp" alt="Troy" width="40" height="25" loading="lazy" className="h-6 object-contain grayscale hover:grayscale-0 transition-all" />
              <img src="/images/kare-logo-paytr.webp" alt="PayTR" width="40" height="25" loading="lazy" className="h-6 object-contain grayscale hover:grayscale-0 transition-all" />
            </div>
          </div>

          {/* SSS + kapanış CTA */}
          <div className="bg-white border border-[#f1f5f9] rounded-2xl p-6 max-[768px]:p-4">
            <h3 className="font-fredoka font-bold text-page-navy text-xl mb-6 text-center">Sıkça Sorulan Sorular</h3>
            {faqList.map((item, idx) => (
              <div key={idx} className="border border-[#f1f5f9] rounded-xl mb-3 overflow-hidden">
                <button
                  className="w-full flex justify-between items-center py-4 px-4 bg-white border-0 font-nunito font-bold text-[#334155] cursor-pointer text-left text-sm transition-colors hover:bg-[#fafafa]"
                  onClick={() => toggleAccordion(idx)}
                >
                  {item.title}
                  {activeIndex === idx ? <FaChevronUp className="text-page-navy flex-shrink-0" /> : <FaChevronDown className="text-[#94a3b8] flex-shrink-0" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 bg-[#f8fafc] ${activeIndex === idx ? "max-h-[200px] py-4 px-4 text-[#64748b] text-sm leading-relaxed border-t border-[#f1f5f9]" : "max-h-0"}`}>
                  <p>{item.content}</p>
                </div>
              </div>
            ))}

            <div className="text-center mt-8 pt-6 border-t border-[#f1f5f9]">
              <p className="font-nunito text-[#64748b] text-sm mb-4">İkna oldun mu? Yerini hemen ayırt.</p>
              <button
                className="inline-flex items-center gap-2 font-fredoka font-bold text-base rounded-full transition-transform hover:scale-[1.02]"
                style={{ background: "#D8FF4F", color: "#1C1B8A", padding: "14px 32px", boxShadow: "0 6px 18px rgba(216,255,79,0.3)" }}
                onClick={handleContinue}
              >
                {isSpecialTutoring ? "Öğretmenleri İncele" : "Hemen Başla →"}
              </button>
            </div>
          </div>

        </div>
      </div>

      <Testimonials />
      <Footer />
    </>
  );
};

export default PackageDetail;
