import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import CountdownPricingBanner from "./CountdownPricingBanner";
import {
  isPromoActive,
  formatPromoEndDate,
  isExamPriceActive,
  getExamPrice,
  getExamDaysLeft,
  getExamDailyCost,
  getExamSavings,
} from "../utils/promoUtils";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

// ─────────────────────────────────────────
// Fiyat gösterimi
// ─────────────────────────────────────────
function PriceBlock({ p, activePlan }) {
  if (activePlan) {
    return (
      <div className="text-center">
        {activePlan.oldPriceText && (
          <div className="font-nunito text-[#94a3b8] text-sm line-through mb-0.5">
            {activePlan.oldPriceText}
          </div>
        )}
        {activePlan.badge && (
          <span className="inline-block mb-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">
            {activePlan.badge}
          </span>
        )}
        <div className="font-fredoka text-[#1C1B8A] text-4xl leading-none">
          {activePlan.priceText || "—"}
        </div>
        {activePlan.durationText && (
          <div className="font-nunito text-[#94a3b8] text-xs mt-1">{activePlan.durationText}</div>
        )}
      </div>
    );
  }

  const examActive = isExamPriceActive(p);
  const promoActive = !examActive && isPromoActive(p);

  if (examActive) {
    const price = getExamPrice(p);
    const days = getExamDaysLeft(p);
    const rate = p.examDiscountRate ?? 5;
    const dailyCost = getExamDailyCost(p);
    const savings = getExamSavings(p);
    return (
      <div className="text-center">
        <div className="font-nunito text-[#94a3b8] text-sm line-through mb-0.5">
          {p.priceText || `${p.price}₺`}
        </div>
        <div className="font-fredoka text-[#1C1B8A] text-4xl leading-none">{price}₺</div>
        <span className="inline-block mt-1.5 bg-[#dbeafe] text-[#1e40af] font-nunito font-bold text-[11px] px-3 py-1 rounded-full">
          Sınava {days} gün — %{rate} indirimli
        </span>
        {dailyCost && (
          <p className="font-nunito text-[#94a3b8] text-[11px] mt-1">
            Günlük <strong>{dailyCost}₺</strong>
          </p>
        )}
        {savings && (
          <span className="inline-block mt-1 bg-[#dcfce7] text-[#166534] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {savings}₺ tasarruf
          </span>
        )}
      </div>
    );
  }

  if (promoActive) {
    return (
      <div className="text-center">
        <div className="font-nunito text-[#94a3b8] text-sm line-through mb-0.5">
          {p.priceText || `${p.price}₺`}
        </div>
        <div className="font-fredoka text-[#1C1B8A] text-4xl leading-none">{p.promoPrice}₺</div>
        <span className="inline-block mt-1.5 bg-[#fef9c3] text-[#854d0e] font-nunito font-bold text-[11px] px-3 py-1 rounded-full">
          {p.promoLabel || `${formatPromoEndDate(p.promoEndDate)} tarihine kadar`}
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      {p.oldPriceText && (
        <div className="font-nunito text-[#94a3b8] text-sm line-through mb-0.5">{p.oldPriceText}</div>
      )}
      <div className="font-fredoka text-[#1C1B8A] text-4xl leading-none">
        {p.priceText || `${p.price}₺`}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Paket kartı
// ─────────────────────────────────────────
function PackageCard({ p, navigate }) {
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const features = Array.isArray(p.features) ? p.features : [];
  const plans = Array.isArray(p.plans) ? p.plans : [];
  const hasPlanTabs = plans.length > 1;
  const activePlan = hasPlanTabs ? plans[activePlanIdx] : null;
  const isPopular = p.type === "coaching_only";

  return (
    <div
      className={`relative bg-white flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 ${
        isPopular
          ? "border-2 border-[#1C1B8A] shadow-[0_8px_32px_rgba(28,27,138,0.15)]"
          : "border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:border-[#1C1B8A]/30 hover:shadow-[0_8px_32px_rgba(28,27,138,0.1)]"
      }`}
    >
      {/* Popüler şerit */}
      {isPopular && (
        <div className="bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-xs text-center py-2 uppercase tracking-widest">
          ⭐ En Popüler
        </div>
      )}

      <div className="p-7 flex flex-col flex-grow">
        {/* İsim + alt başlık */}
        <div className="mb-6">
          <h3 className="font-fredoka text-[#0D0A2E] text-2xl mb-1 leading-tight">{p.name}</h3>
          {p.subtitle && (
            <p className="font-nunito text-[#64748b] text-sm leading-relaxed">{p.subtitle}</p>
          )}
        </div>

        {/* Süre sekmeleri */}
        {hasPlanTabs && (
          <div className="flex bg-[#f1f5f9] rounded-xl p-1 mb-5 gap-1">
            {plans.map((plan, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActivePlanIdx(i)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activePlanIdx === i
                    ? "bg-[#1C1B8A] text-white shadow-sm"
                    : "text-[#64748b] hover:text-[#0D0A2E]"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
        )}

        {/* Fiyat */}
        <div className={`py-5 border-t border-b mb-5 ${isPopular ? "border-[#1C1B8A]/10" : "border-gray-100"}`}>
          <PriceBlock p={p} activePlan={activePlan} />
        </div>

        {/* Özellikler */}
        {features.length > 0 && (
          <ul className="space-y-2.5 mb-7 flex-grow">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className={`flex-shrink-0 font-black text-base mt-0.5 ${
                    f.included ? "text-[#1C1B8A]" : "text-gray-200"
                  }`}
                >
                  {f.included ? "✓" : "✗"}
                </span>
                <span
                  className={`font-nunito text-sm leading-relaxed ${
                    f.included ? "text-[#0D0A2E]/70" : "text-gray-300 line-through"
                  }`}
                >
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA butonları */}
        <div className="mt-auto flex flex-col gap-2.5">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className={`block w-full text-center font-nunito font-black text-sm py-3.5 rounded-full no-underline transition-all hover:scale-[1.02] ${
              isPopular
                ? "bg-[#D8FF4F] text-[#0D0A2E] shadow-[0_4px_16px_rgba(216,255,79,0.3)] hover:bg-white"
                : "bg-[#1C1B8A] text-white shadow-[0_4px_16px_rgba(28,27,138,0.2)] hover:bg-[#0D0A2E]"
            }`}
          >
            Hemen Başla →
          </a>
          {p.ctaHref && (
            <button
              onClick={() => {
                const href = activePlan?.ctaHref || p.ctaHref;
                const withPlan = hasPlanTabs
                  ? `${href}${href.includes("?") ? "&" : "?"}plan=${activePlanIdx}`
                  : href;
                navigate(withPlan);
              }}
              className={`w-full text-center font-nunito font-bold text-sm py-3 rounded-full transition-all border ${
                isPopular
                  ? "border-[#1C1B8A]/20 text-[#1C1B8A] hover:border-[#1C1B8A]/50 hover:bg-[#f0f4ff]"
                  : "border-gray-200 text-[#64748b] hover:border-gray-400 hover:text-[#0D0A2E]"
              }`}
            >
              Detayları İncele
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Boş sekme kartı
// ─────────────────────────────────────────
function EmptyCard({ examType }) {
  return (
    <div className="max-w-[520px] mx-auto bg-[#f8fafc] border border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-5 min-h-[280px]">
      <div className="text-5xl">{examType === "yks" ? "🎓" : "📚"}</div>
      <div>
        <h3 className="font-fredoka text-[#0D0A2E] text-2xl mb-2">
          {examType === "yks" ? "YKS programı için görüşme talep et." : "LGS programı için görüşme talep et."}
        </h3>
        <p className="font-nunito text-[#64748b] text-sm max-w-[300px] mx-auto">
          İlk görüşmede sana özel ön değerlendirme yapılıyor.
        </p>
      </div>
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 bg-[#1C1B8A] text-white font-nunito font-black text-sm px-8 py-4 rounded-full no-underline hover:bg-[#0D0A2E] transition-all shadow-[0_6px_20px_rgba(28,27,138,0.2)] hover:scale-105"
      >
        Görüşme Talep Et →
      </a>
    </div>
  );
}

// ─────────────────────────────────────────
// Ana bileşen
// ─────────────────────────────────────────
export default function PricingSection() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("yks");
  const [packages, setPackages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setPackages(data.packages); })
      .catch(() => {});
  }, []);

  const yksPackages = packages.filter((p) => p.type !== "lgs");
  const lgsPackages = packages.filter((p) => p.type !== "yks");
  const visible = tab === "yks" ? yksPackages : lgsPackages;

  const gridCls = {
    0: "",
    1: "max-w-[420px] mx-auto",
    2: "grid grid-cols-2 max-w-[820px] mx-auto max-[640px]:grid-cols-1",
    3: "grid grid-cols-3 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1",
    4: "grid grid-cols-4 max-[1024px]:grid-cols-2 max-[580px]:grid-cols-1",
  }[Math.min(visible.length, 4)] || "grid grid-cols-3 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1";

  return (
    <section id="paketler" className="bg-[#f8fafc] py-20 px-5">
      <div className="max-w-[1200px] mx-auto">

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            Paketlerimiz
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Sınava göre kişisel program
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-3 max-w-[480px] mx-auto">
            Her öğrencinin ihtiyacı farklı. Sana özel program ilk görüşmede belirleniyor.
          </p>
        </motion.div>

        {/* Geri sayım banner */}
        <CountdownPricingBanner />

        {/* ── YKS / LGS Sekme ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-2 gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            {[
              { key: "yks", emoji: "🎓", label: "YKS", sub: "Üniversite Sınavı" },
              { key: "lgs", emoji: "📚", label: "LGS", sub: "Lise Sınavı" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-4 px-8 py-4 rounded-xl font-nunito transition-all duration-200 max-[480px]:px-5 max-[480px]:py-3 ${
                  tab === t.key
                    ? "bg-[#1C1B8A] text-white shadow-[0_4px_16px_rgba(28,27,138,0.35)]"
                    : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0D0A2E]"
                }`}
              >
                <span className="text-3xl max-[480px]:text-2xl leading-none">{t.emoji}</span>
                <div className="text-left">
                  <div className="font-black text-lg max-[480px]:text-base leading-tight">{t.label}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${tab === t.key ? "text-white/60" : "text-[#94a3b8]"}`}>
                    {t.sub}
                  </div>
                </div>
                {tab === t.key && (
                  <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1C1B8A] rotate-45 rounded-sm" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Paket kartları ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {visible.length === 0 ? (
              <EmptyCard examType={tab} />
            ) : isMobile ? (
              <div className="relative px-1">
                <Swiper
                  modules={[Pagination, Navigation]}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  spaceBetween={16}
                  slidesPerView={1.08}
                  centeredSlides={true}
                  initialSlide={Math.min(1, visible.length - 1)}
                  className="pricing-swiper pb-10"
                >
                  {visible.map((p) => (
                    <SwiperSlide key={p.slug} className="h-auto">
                      <PackageCard p={p} navigate={navigate} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className={`gap-6 ${gridCls}`}>
                {visible.map((p, i) => (
                  <PackageCard key={p.slug} p={p} navigate={navigate} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Alt link */}
        {visible.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center mt-10"
          >
            <Link
              to="/paket-detay"
              className="font-nunito text-[#64748b] text-sm hover:text-[#1C1B8A] transition-colors no-underline"
            >
              Tüm paketleri karşılaştır →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
