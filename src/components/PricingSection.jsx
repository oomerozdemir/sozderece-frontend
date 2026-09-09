import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import axios from "../utils/axios";
import CountdownPricingBanner from "./CountdownPricingBanner";
import { toYouTubeEmbed } from "../utils/youtube";
import {
  isPromoActive,
  formatPromoEndDate,
  isExamPriceActive,
  getExamPrice,
  getExamDaysLeft,
} from "../utils/promoUtils";

const STATIC_FEATURES = [
  'Hızlı Net Getiren "Banko Konu" Odaklı Planlama',
  'Takıldığın An Ulaşabileceğin Birebir WhatsApp İletişimi',
  'Veliyi "Hadi Ders Çalış" Yükünden Kurtaran Düzenli Raporlama',
  'Evdeki Sınav Kavgalarını Bitiren Profesyonel Takip Sistemi',
  'Yanlışlarını Doğruya Çeviren Haftalık Branş Denemesi Analizleri',
  'Sıfırdan Başlayanlara Özel "Masaya Oturma Disiplini" Rutinleri',
];

const PLAN_BADGE_COLORS = {
  green: { bg: "#dcfce7", text: "#166534" },
  blue: { bg: "#dbeafe", text: "#1d4ed8" },
  orange: { bg: "#ffedd5", text: "#c2410c" },
  red: { bg: "#fee2e2", text: "#b91c1c" },
};

const FEATURES_VISIBLE = 6;

function OldPrice({ text }) {
  if (!text) return null;
  return (
    <div className="font-nunito font-bold text-sm mb-1 text-[#94a3b8]" style={{ textDecoration: "line-through" }}>
      {text}
    </div>
  );
}

function Amount({ amount, duration }) {
  return (
    <div>
      <div className="flex items-start gap-1">
        <span className="font-fredoka font-bold text-[18px] mt-2" style={{ color: "rgba(28,27,138,0.55)" }}>₺</span>
        <span className="font-fredoka font-bold text-page-navy leading-none" style={{ fontSize: "clamp(36px,3.4vw,44px)", letterSpacing: -1.5 }}>
          {amount}
        </span>
      </div>
      {duration && <div className="font-nunito font-bold text-xs mt-1 text-[#94a3b8]">{duration}</div>}
    </div>
  );
}

function PriceDisplay({ pkg, activePlan }) {
  if (!pkg) return null;

  if (activePlan) {
    const priceStr = (activePlan.priceText || `${activePlan.price}₺`).replace(/₺/g, "").trim();
    return (
      <div>
        <OldPrice text={activePlan.oldPriceText} />
        <Amount amount={priceStr} duration={activePlan.durationText} />
      </div>
    );
  }

  const examActive = isExamPriceActive(pkg);
  const promoActive = !examActive && isPromoActive(pkg);

  if (examActive) {
    const price = getExamPrice(pkg);
    const days = getExamDaysLeft(pkg);
    return (
      <div>
        <OldPrice text={pkg.priceText || `${pkg.price}₺`} />
        <Amount amount={price} />
        <span className="inline-block mt-2 font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
          Sınava {days} gün, indirimli
        </span>
      </div>
    );
  }

  if (promoActive) {
    return (
      <div>
        <OldPrice text={pkg.priceText || `${pkg.price}₺`} />
        <Amount amount={pkg.promoPrice} />
        <span className="inline-block mt-2 font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full" style={{ background: "#ffedd5", color: "#c2410c" }}>
          {pkg.promoLabel || `${formatPromoEndDate(pkg.promoEndDate)} tarihine kadar`}
        </span>
      </div>
    );
  }

  const priceStr = pkg.priceText || `${pkg.price}₺`;
  const priceNum = priceStr.replace(/₺/g, "").trim();
  return (
    <div>
      <OldPrice text={pkg.oldPriceText} />
      <Amount amount={priceNum} />
    </div>
  );
}

function PackageCard({ pkg, index }) {
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const plans = Array.isArray(pkg.plans) ? pkg.plans : [];
  const hasPlanTabs = plans.length > 1;
  const activePlan = hasPlanTabs ? plans[activePlanIdx] : null;
  const planBadgeStyle = activePlan?.badge ? (PLAN_BADGE_COLORS[activePlan.badgeColor] || PLAN_BADGE_COLORS.green) : null;

  const allFeatures =
    pkg.features && pkg.features.filter((f) => f.included).length >= 3
      ? pkg.features.filter((f) => f.included).map((f) => f.label)
      : STATIC_FEATURES;
  const shownFeatures = expanded ? allFeatures : allFeatures.slice(0, FEATURES_VISIBLE);
  const remaining = allFeatures.length - FEATURES_VISIBLE;

  const ctaLabel = activePlan?.ctaLabel || pkg.ctaLabel || "Paketi Satın Al →";
  const ctaHref =
    activePlan?.ctaHref ||
    pkg.ctaHref ||
    (hasPlanTabs
      ? `/hemen-basla?slug=${encodeURIComponent(pkg.slug)}&plan=${activePlanIdx}`
      : `/hemen-basla?slug=${encodeURIComponent(pkg.slug)}`);

  const videoEmbedUrl = pkg.videoUrl ? toYouTubeEmbed(pkg.videoUrl) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-full rounded-[28px] bg-white"
      style={{ border: "1px solid #ECEAF5", boxShadow: "0 10px 30px rgba(28,27,138,0.08)", padding: "32px 28px" }}
    >
      {pkg.badge && (
        <span
          className="absolute -top-3 right-7 font-fredoka font-bold text-[12px] px-3 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: "#1C1B8A", color: "#D8FF4F", boxShadow: "0 4px 12px rgba(28,27,138,0.3)" }}
        >
          {pkg.badge}
        </span>
      )}

      <h3 className="font-fredoka font-bold text-page-navy text-xl leading-snug mb-4 pr-2">{pkg.name}</h3>

      {hasPlanTabs && (
        <div className="flex gap-1 rounded-full p-1 mb-4" style={{ background: "#F4F2FA" }}>
          {plans.map((plan, i) => (
            <button
              key={i}
              onClick={() => setActivePlanIdx(i)}
              className="flex-1 font-fredoka font-bold text-[12px] px-3 py-2 rounded-full border-none cursor-pointer transition-all duration-200"
              style={{
                background: activePlanIdx === i ? "#fff" : "transparent",
                color: activePlanIdx === i ? "#1C1B8A" : "#8B87A6",
                boxShadow: activePlanIdx === i ? "0 2px 8px rgba(28,27,138,0.12)" : "none",
              }}
            >
              {plan.label}
            </button>
          ))}
        </div>
      )}

      <PriceDisplay pkg={pkg} activePlan={activePlan} />

      {planBadgeStyle && (
        <span
          className="inline-block self-start mt-2 font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full"
          style={{ background: planBadgeStyle.bg, color: planBadgeStyle.text }}
        >
          {activePlan.badge}
        </span>
      )}

      {pkg.subtitle && (
        <div className="font-nunito text-[#64748b] text-sm leading-relaxed mt-3 mb-5">{pkg.subtitle}</div>
      )}

      <div className="flex flex-col gap-2.5 mb-2" style={{ marginTop: pkg.subtitle ? 0 : 20 }}>
        {shownFeatures.map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span
              className="flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold mt-0.5"
              style={{ width: 18, height: 18, background: "#ede8fa", color: "#1C1B8A" }}
            >
              ✓
            </span>
            <span className="font-nunito font-semibold text-[13px] text-[#334155] leading-snug">{f}</span>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="self-start font-nunito font-bold text-[12px] text-accent-orange hover:underline mb-2 mt-1"
        >
          {expanded ? "Daha az göster" : `+${remaining} özellik daha`}
        </button>
      )}

      <div className="flex-1" />

      <Link
        to={ctaHref}
        className="block text-center no-underline font-fredoka font-bold text-[15px] rounded-full mt-5 transition-transform hover:scale-105"
        style={{ background: "#1C1B8A", color: "#D8FF4F", padding: "14px" }}
      >
        {ctaLabel}
      </Link>
      <Link
        to={`/paket-detay?slug=${encodeURIComponent(pkg.slug)}`}
        className="block text-center no-underline font-nunito font-bold text-[13px] text-[#8B87A6] hover:text-page-navy mt-3 transition-colors"
      >
        Paketi İncele
      </Link>

      {videoEmbedUrl && (
        <div className="rounded-2xl overflow-hidden mt-5" style={{ border: "1px solid #ECEAF5" }}>
          <div className="aspect-video">
            <iframe
              src={videoEmbedUrl}
              title={`${pkg.name} Tanıtımı`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 0, display: "block" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function PricingSection() {
  const [tab, setTab] = useState("yks");
  const [packages, setPackages] = useState([]);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    // Tek URL kaynağı: paylaşılan axios instance (bkz. utils/axios.js) —
    // önceden burada process.env.REACT_APP_API_URL ile ham fetch kullanılıyordu,
    // repo'da bu env var'ı tanımlayan bir .env olmadığından yerel geliştirmede
    // sessizce başarısız oluyordu.
    axios.get("/api/packages")
      .then((r) => { if (r.data.success) setPackages(r.data.packages); })
      .catch(() => {});
    axios.get("/api/settings/pricing-video")
      .then((r) => setVideo(r.data))
      .catch(() => {});
  }, []);

  const activeVideo = video?.[tab === "lgs" ? "lgs" : "yks"];
  const videoEmbedUrl = activeVideo?.enabled && activeVideo?.videoUrl ? toYouTubeEmbed(activeVideo.videoUrl) : null;

  const yksPackages = packages.filter((p) => p.type !== "lgs");
  const lgsPackages = packages.filter((p) => p.type !== "yks");
  const visible = tab === "lgs" ? lgsPackages : yksPackages;

  return (
    <section id="paketler" className="relative overflow-hidden bg-white">
      <style>{`
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 400px));
          justify-content: center;
          gap: 24px;
          align-items: stretch;
        }
        @media (max-width: 580px) {
          .pricing-header { flex-direction: column !important; gap: 24px !important; }
          .pricing-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* Sol dikey şerit */}
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: "linear-gradient(to bottom, #1C1B8A, #FF6B35)", zIndex: 1 }} />

      {/* Sağ üst dekoratif blok */}
      <div className="absolute top-0 right-0" style={{ width: 340, height: 340, background: "#ede8fa", borderRadius: "0 0 0 100%", opacity: 0.6, zIndex: 0 }} />

      {/* Sol alt dekoratif daire */}
      <div className="absolute" style={{ bottom: 0, left: 60, width: 200, height: 200, background: "#fff0ea", borderRadius: "50%", opacity: 0.6, zIndex: 0 }} />

      <div
        className="mx-auto py-20 relative pricing-section-pad"
        style={{ maxWidth: 1280, paddingLeft: 60, paddingRight: 60, zIndex: 2 }}
      >
        {/* Başlık */}
        <div className="pricing-header flex items-start justify-between mb-10 gap-8">

          {/* Sol — başlık */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>
              PAKETLERİMİZ
            </div>
            <h2 className="font-fredoka font-bold m-0 leading-[0.95]" style={{ letterSpacing: -1, fontSize: "clamp(40px, 4.5vw, 64px)" }}>
              <span className="block text-page-navy">Kişisel</span>
              <span className="block" style={{ color: "transparent", WebkitTextStroke: "2.5px #FF6B35" }}>Program.</span>
            </h2>
          </motion.div>

          {/* Sağ — açıklama */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="self-center"
          >
            <p className="font-nunito font-bold text-[#64748b] text-base leading-relaxed m-0" style={{ maxWidth: 280 }}>
              Her öğrencinin ihtiyacı farklı. Sana özel program{" "}
              <span className="text-accent-orange">ilk görüşmede</span>{" "}
              belirleniyor.
            </p>
          </motion.div>
        </div>

        {/* Geri sayım banner */}
        <CountdownPricingBanner />

        {/* Sekme seçici — paketlerin tam üstünde */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="flex gap-1 rounded-full p-1.5" style={{ background: "#f4f2fa" }}>
            {[
              { key: "yks", label: "YKS" },
              { key: "lgs", label: "LGS" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="font-fredoka font-bold text-[17px] px-7 py-3 rounded-full border-none cursor-pointer transition-all duration-200"
                style={{
                  background: tab === t.key ? "#1C1B8A" : "transparent",
                  color: tab === t.key ? "#D8FF4F" : "#6B6B8A",
                  boxShadow: tab === t.key ? "0 4px 14px rgba(28,27,138,0.3)" : "none",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Paket kartları — sekmedeki her paket için ayrı kart, yeni paket eklendikçe otomatik çoğalır */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {visible.length > 0 ? (
              <div className="pkg-grid">
                {visible.map((pkg, i) => (
                  <PackageCard key={pkg.slug} pkg={pkg} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 font-nunito font-bold text-[#94a3b8]">
                Bu kategoride şu an vitrine açık paket yok.
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tanıtım videosu (sekme geneli) */}
        {videoEmbedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex justify-center mt-14"
          >
            <div className="w-full" style={{ maxWidth: 760 }}>
              <div
                className="relative rounded-[28px] overflow-hidden"
                style={{
                  boxShadow: "0 20px 50px rgba(28,27,138,0.2)",
                  border: "6px solid #1C1B8A",
                }}
              >
                <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: "#D8FF4F", filter: "blur(70px)", opacity: 0.35, top: -60, left: -40, zIndex: 0 }} />
                <div className="aspect-video relative" style={{ zIndex: 1 }}>
                  <iframe
                    src={videoEmbedUrl}
                    title="Program Tanıtımı"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 0, display: "block" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
