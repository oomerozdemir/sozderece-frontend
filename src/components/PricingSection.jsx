import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import CountdownPricingBanner from "./CountdownPricingBanner";
import {
  isPromoActive,
  formatPromoEndDate,
  isExamPriceActive,
  getExamPrice,
  getExamDaysLeft,
} from "../utils/promoUtils";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

const STATIC_FEATURES = [
  'Hızlı Net Getiren "Banko Konu" Odaklı Planlama',
  'Takıldığın An Ulaşabileceğin Birebir WhatsApp İletişimi',
  'Veliyi "Hadi Ders Çalış" Yükünden Kurtaran Düzenli Raporlama',
  'Evdeki Sınav Kavgalarını Bitiren Profesyonel Takip Sistemi',
  'Yanlışlarını Doğruya Çeviren Haftalık Branş Denemesi Analizleri',
  'Sıfırdan Başlayanlara Özel "Masaya Oturma Disiplini" Rutinleri',
];

function PriceDisplay({ pkg }) {
  if (!pkg) {
    return (
      <div className="font-fredoka font-bold text-[#D8FF4F] text-[52px] leading-none">
        Görüşme al →
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
        <div className="font-nunito font-bold text-sm mb-1" style={{ color: "rgba(216,255,79,0.45)", textDecoration: "line-through" }}>
          {pkg.priceText || `${pkg.price}₺`}
        </div>
        <div className="flex items-start gap-1">
          <span className="font-fredoka font-bold text-[22px] mt-3" style={{ color: "rgba(216,255,79,0.75)" }}>₺</span>
          <span className="font-fredoka font-bold text-[#D8FF4F] leading-none" style={{ fontSize: "clamp(60px,6vw,80px)", letterSpacing: -3 }}>{price}</span>
        </div>
        <span className="inline-block mt-2 font-nunito font-bold text-[12px] px-3 py-1 rounded-full text-[#D8FF4F]" style={{ background: "rgba(216,255,79,0.15)" }}>
          Sınava {days} gün — indirimli
        </span>
      </div>
    );
  }

  if (promoActive) {
    return (
      <div>
        <div className="font-nunito font-bold text-sm mb-1" style={{ color: "rgba(216,255,79,0.45)", textDecoration: "line-through" }}>
          {pkg.priceText || `${pkg.price}₺`}
        </div>
        <div className="flex items-start gap-1">
          <span className="font-fredoka font-bold text-[22px] mt-3" style={{ color: "rgba(216,255,79,0.75)" }}>₺</span>
          <span className="font-fredoka font-bold text-[#D8FF4F] leading-none" style={{ fontSize: "clamp(60px,6vw,80px)", letterSpacing: -3 }}>{pkg.promoPrice}</span>
        </div>
        <span className="inline-block mt-2 font-nunito font-bold text-[12px] px-3 py-1 rounded-full text-[#D8FF4F]" style={{ background: "rgba(216,255,79,0.15)" }}>
          {pkg.promoLabel || `${formatPromoEndDate(pkg.promoEndDate)} tarihine kadar`}
        </span>
      </div>
    );
  }

  const priceStr = pkg.priceText || `${pkg.price}₺`;
  const priceNum = priceStr.replace(/₺/g, "").trim();
  return (
    <div>
      {pkg.oldPriceText && (
        <div className="font-nunito font-bold text-sm mb-1" style={{ color: "rgba(216,255,79,0.45)", textDecoration: "line-through" }}>
          {pkg.oldPriceText}
        </div>
      )}
      <div className="flex items-start gap-1">
        <span className="font-fredoka font-bold text-[22px] mt-3" style={{ color: "rgba(216,255,79,0.75)" }}>₺</span>
        <span className="font-fredoka font-bold text-[#D8FF4F] leading-none" style={{ fontSize: "clamp(60px,6vw,80px)", letterSpacing: -3 }}>{priceNum}</span>
      </div>
    </div>
  );
}

const popIn = {
  initial: { opacity: 0, scale: 0.84 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
};

export default function PricingSection() {
  const [tab, setTab] = useState("yks");
  const [packages, setPackages] = useState([]);
  const [earlyReg, setEarlyReg] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setPackages(data.packages); })
      .catch(() => {});
    fetch(`${process.env.REACT_APP_API_URL}/api/settings/early-registration`)
      .then((r) => r.json())
      .then((data) => { if (data.enabled) setEarlyReg(data); })
      .catch(() => {});
  }, []);

  const yksPackages = packages.filter((p) => p.type !== "lgs");
  const lgsPackages = packages.filter((p) => p.type !== "yks");
  const visible = tab === "lgs" ? lgsPackages : yksPackages;
  const primary = visible[0] || null;

  const earlyDaysLeft = earlyReg?.endDate
    ? Math.max(0, Math.ceil((new Date(earlyReg.endDate) - new Date()) / 86400000))
    : null;

  const features =
    primary?.features && primary.features.filter((f) => f.included).length >= 3
      ? primary.features.filter((f) => f.included).map((f) => f.label).slice(0, 6)
      : STATIC_FEATURES;

  return (
    <section id="paketler" className="relative overflow-hidden bg-white">
      <style>{`
        @keyframes pricingFloat1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(5deg)} }
        @keyframes pricingFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(-6deg)} }

        .bento-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 20px;
        }
        .bento-c1 { grid-column: 1; grid-row: 1; }
        .bento-c2 { grid-column: 2; grid-row: 1 / 3; }
        .bento-c3 { grid-column: 3; grid-row: 1; }
        .bento-c4 { grid-column: 1; grid-row: 2; }
        .bento-c5 { grid-column: 3; grid-row: 2; }

        @media (max-width: 960px) {
          .bento-grid { grid-template-columns: 1fr 1fr; grid-template-rows: unset; }
          .bento-c1, .bento-c2, .bento-c3, .bento-c4, .bento-c5 {
            grid-column: auto; grid-row: auto;
          }
          .bento-c2 { grid-column: 1 / -1; }
        }
        @media (max-width: 580px) {
          .bento-grid { grid-template-columns: 1fr; }
          .bento-c2 { grid-column: auto; }
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
        {/* 3 kolonlu başlık */}
        <div className="pricing-header flex items-start justify-between mb-14 gap-8">

          {/* Sol — başlık */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>
              PAKETLERİMİZ
            </div>
            <h2 className="font-fredoka font-bold m-0 leading-[0.95]" style={{ letterSpacing: -1, fontSize: "clamp(40px, 4.5vw, 64px)" }}>
              <span className="block text-[#1C1B8A]">Kişisel</span>
              <span className="block" style={{ color: "transparent", WebkitTextStroke: "2.5px #FF6B35" }}>Program.</span>
            </h2>
          </motion.div>

          {/* Orta — sekme seçici */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="self-center"
          >
            <div className="flex gap-1 rounded-full p-1.5" style={{ background: "#f4f2fa" }}>
              {[
                { key: "yks", label: "🎓 YKS" },
                { key: "lgs", label: "📚 LGS" },
                ...(earlyReg ? [{ key: "erken", label: "⚡ Erken Kayıt" }] : []),
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="font-fredoka font-bold text-[17px] px-7 py-3 rounded-full border-none cursor-pointer transition-all duration-200"
                  style={{
                    background:
                      tab === t.key
                        ? t.key === "erken" ? "#D8FF4F" : "#1C1B8A"
                        : "transparent",
                    color:
                      tab === t.key
                        ? t.key === "erken" ? "#0D0A2E" : "#D8FF4F"
                        : "#6B6B8A",
                    boxShadow:
                      tab === t.key
                        ? t.key === "erken"
                          ? "0 4px 14px rgba(216,255,79,0.4)"
                          : "0 4px 14px rgba(28,27,138,0.3)"
                        : "none",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
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
              <span className="text-[#FF6B35]">ilk görüşmede</span>{" "}
              belirleniyor.
            </p>
          </motion.div>
        </div>

        {/* Geri sayım banner */}
        <CountdownPricingBanner />

        {/* Bento grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bento-grid">

              {/* Hücre 1 — Fiyat (koyu mor) */}
              <motion.div
                {...popIn}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bento-c1"
              >
                <div
                  className="rounded-[28px] relative overflow-hidden flex flex-col h-full"
                  style={{ background: "#1C1B8A", padding: "44px 40px", boxShadow: "0 16px 40px rgba(28,27,138,0.25)", minHeight: 260 }}
                >
                  <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: "#4a1da0", filter: "blur(60px)", opacity: 0.5, top: -60, right: -40 }} />
                  <div className="font-fredoka font-semibold text-[#D8FF4F] text-[13px] uppercase relative mb-3" style={{ letterSpacing: 3 }}>
                    {tab === "yks" ? "YKS" : "LGS"} Koçluk Paketi
                  </div>
                  <div className="relative">
                    <PriceDisplay pkg={primary} />
                  </div>
                  <div className="font-nunito font-bold text-sm mt-2 relative" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {primary?.subtitle || "4 Haftalık Program"}
                  </div>
                  <div className="mt-3 relative">
                    <span className="font-fredoka font-semibold text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", letterSpacing: 0.5 }}>
                      Kredi kartına taksit imkânı
                    </span>
                  </div>
                  <Link
                    to={primary ? `/pre-auth?slug=${encodeURIComponent(primary.slug)}` : "/paket-detay"}
                    className="block text-center no-underline font-fredoka font-bold text-base rounded-full mt-5 relative transition-transform hover:scale-105"
                    style={{
                      background: "#D8FF4F",
                      color: "#1C1B8A",
                      padding: "14px",
                      boxShadow: "0 6px 18px rgba(216,255,79,0.3)",
                    }}
                  >
                    Paketi Satın Al →
                  </Link>
                </div>
              </motion.div>

              {/* Hücre 2 — Özellik pill'leri (çift satır) */}
              <motion.div
                {...popIn}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="bento-c2"
              >
                <div className="rounded-[28px] h-full" style={{ background: "#f4f2fa", padding: "36px 32px" }}>
                  <div className="font-fredoka font-bold text-[#1C1B8A] text-base mb-5" style={{ letterSpacing: 0.3 }}>
                    Pakete Dahil…
                  </div>
                  <div className="flex flex-col gap-3">
                    {features.map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div
                          className="inline-flex items-center gap-2 rounded-full font-nunito font-bold text-[13px] leading-snug"
                          style={{
                            background: i % 2 === 0 ? "#ede8fa" : "#fff0ea",
                            color: i % 2 === 0 ? "#1C1B8A" : "#FF6B35",
                            padding: "10px 18px",
                          }}
                        >
                          <span style={{ opacity: 0.7 }}>✓</span>
                          {f}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Hücre 3 — CTA (turuncu) */}
              <motion.div
                {...popIn}
                transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bento-c3"
              >
                <div
                  className="rounded-[28px] flex flex-col justify-between relative overflow-hidden h-full"
                  style={{ background: "#FF6B35", padding: "40px 32px", boxShadow: "0 16px 40px rgba(255,107,53,0.35)", minHeight: 260 }}
                >
                  <div className="absolute rounded-full pointer-events-none" style={{ width: 180, height: 180, background: "rgba(255,255,255,0.1)", bottom: -60, right: -60 }} />
                  <div>
                    <div className="font-fredoka font-bold text-white text-[28px] leading-[1.2] mb-3">
                      Ücretsiz<br />Tanışma<br />Görüşmesi
                    </div>
                    <div className="font-nunito font-bold text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                      İlk görüşme tamamen ücretsiz. Kota dolmadan yerini al.
                    </div>
                  </div>
                  <a
                    href="/ucretsiz-on-gorusme"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center no-underline font-fredoka font-bold text-lg rounded-full mt-7 transition-transform hover:scale-105"
                    style={{
                      background: "#ffffff",
                      color: "#FF6B35",
                      padding: "16px",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                      animation: "pricingFloat2 3s ease-in-out infinite",
                    }}
                  >
                    Hemen Başla →
                  </a>
                </div>
              </motion.div>

              {/* Hücre 4 — Erken kayıt (sarı) */}
              <motion.div
                {...popIn}
                transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bento-c4"
              >
                <div className="rounded-[28px] flex flex-col justify-center gap-2 h-full" style={{ background: "#D8FF4F", padding: "28px 32px" }}>
                  <div className="text-[36px] leading-none">⚡</div>
                  <div className="font-fredoka font-bold text-[#1C1B8A] text-xl leading-snug">
                    {tab === "erken" && earlyReg
                      ? (earlyReg.title || "Erken Kayıt Avantajı")
                      : "Erken Kayıt Avantajı"}
                  </div>
                  {tab === "erken" && earlyReg?.discountText && (
                    <div className="font-fredoka font-bold text-[#0D0A2E] text-2xl leading-none">
                      {earlyReg.discountText}
                    </div>
                  )}
                  <div className="font-nunito font-bold text-sm" style={{ color: "rgba(28,27,138,0.65)" }}>
                    {tab === "erken" && earlyReg
                      ? (earlyReg.subtitle || "Kontenjan dolmadan yerinizi ayırtın")
                      : "Kontenjan dolmadan yerinizi ayırtın"}
                  </div>
                  {tab === "erken" && earlyDaysLeft !== null && (
                    <div className="font-fredoka font-bold text-sm" style={{ color: "rgba(28,27,138,0.5)" }}>
                      ⏰ {earlyDaysLeft} gün kaldı
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Hücre 5 — Karşılaştır (mor pastel) */}
              <motion.div
                {...popIn}
                transition={{ duration: 0.5, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="bento-c5"
              >
                <Link to="/paket-detay" className="no-underline block h-full">
                  <div className="rounded-[28px] flex items-center justify-between h-full transition-opacity hover:opacity-80" style={{ background: "#ede8fa", padding: "28px 32px" }}>
                    <div>
                      <div className="font-fredoka font-bold text-[#1C1B8A] text-lg">Tüm paketleri</div>
                      <div className="font-fredoka font-bold text-[#1C1B8A] text-lg">karşılaştır</div>
                    </div>
                    <div
                      className="flex items-center justify-center flex-shrink-0 rounded-full"
                      style={{ width: 44, height: 44, background: "#1C1B8A", animation: "pricingFloat1 3s ease-in-out infinite" }}
                    >
                      <span className="text-[#D8FF4F] text-xl">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
