import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Seo from "../components/Seo";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { isPromoActive, formatPromoEndDate, isExamPriceActive, getExamPrice, getExamDaysLeft } from "../utils/promoUtils";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" },
};


// ══════════════════════════════════════════════
// 1. HERO
// ══════════════════════════════════════════════
function HeroSection() {
  const stats = [
    { value: "+150", label: "Başarılı Öğrenci" },
    { value: "4.9/5", label: "Memnuniyet" },
    { value: "7/24", label: "Koç Erişimi" },
  ];

  return (
    <section className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-[#0D0A2E] via-[#1C1B8A]/60 to-[#0D0A2E] overflow-hidden">
      <style>{`
        @keyframes floatBlob1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(40px, -30px) scale(1.08); }
          50%  { transform: translate(20px, 50px) scale(0.95); }
          75%  { transform: translate(-30px, 20px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(-50px, 40px) scale(1.1); }
          60%  { transform: translate(30px, -20px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          20%  { transform: translate(25px, 35px) scale(1.06); }
          55%  { transform: translate(-40px, -15px) scale(0.96); }
          80%  { transform: translate(15px, -40px) scale(1.04); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob4 {
          0%   { transform: translate(0px, 0px) scale(1); }
          35%  { transform: translate(-20px, -50px) scale(1.07); }
          70%  { transform: translate(45px, 25px) scale(0.94); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob5 {
          0%   { transform: translate(0px, 0px) scale(1); }
          40%  { transform: translate(35px, -35px) scale(1.09); }
          75%  { transform: translate(-25px, 45px) scale(0.97); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Animated blobs */}
      <div style={{
        position: "absolute", top: "-100px", left: "-120px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "#7340C8", opacity: 0.13, filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0, willChange: "transform",
        animationName: "floatBlob1", animationDuration: "24s",
        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        animationDelay: "0s",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", right: "-80px",
        width: "420px", height: "420px", borderRadius: "50%",
        background: "#1C1B8A", opacity: 0.18, filter: "blur(70px)",
        pointerEvents: "none", zIndex: 0, willChange: "transform",
        animationName: "floatBlob2", animationDuration: "30s",
        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        animationDelay: "-7s",
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "6%",
        width: "300px", height: "300px", borderRadius: "50%",
        background: "#D8FF4F", opacity: 0.07, filter: "blur(90px)",
        pointerEvents: "none", zIndex: 0, willChange: "transform",
        animationName: "floatBlob3", animationDuration: "22s",
        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        animationDelay: "-4s",
      }} />
      <div style={{
        position: "absolute", top: "20%", left: "35%",
        width: "360px", height: "360px", borderRadius: "50%",
        background: "#FF6B35", opacity: 0.06, filter: "blur(100px)",
        pointerEvents: "none", zIndex: 0, willChange: "transform",
        animationName: "floatBlob4", animationDuration: "28s",
        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        animationDelay: "-12s",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "15%",
        width: "240px", height: "240px", borderRadius: "50%",
        background: "#7340C8", opacity: 0.09, filter: "blur(65px)",
        pointerEvents: "none", zIndex: 0, willChange: "transform",
        animationName: "floatBlob5", animationDuration: "18s",
        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        animationDelay: "-9s",
      }} />

      <div className="max-w-[1100px] mx-auto px-5 py-24 max-[768px]:py-16 w-full" style={{ position: "relative", zIndex: 1 }}>
        <div className="grid grid-cols-[1fr_auto] gap-12 items-center max-[900px]:grid-cols-1">

          {/* Sol — metin */}
          <div>
            <motion.div {...fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-[#FF6B35] text-white font-nunito font-black text-xs px-5 py-2 rounded-full uppercase tracking-widest">
                YKS · LGS · 2025
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="font-fredoka text-[68px] max-[900px]:text-[52px] max-[640px]:text-[40px] max-[400px]:text-[34px] leading-[1.1] text-white mb-5 max-w-[700px]"
            >
              Sana Özel<br />
              <span className="text-[#D8FF4F]">Bire Bir Koçluk</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.18 }}
              className="font-nunito text-white/65 text-lg max-[640px]:text-base leading-relaxed max-w-[520px] mb-10"
            >
              Alanında uzman koçlar, günlük WhatsApp takibi ve deneme analizi
              ile sınav hedefine güvenle ulaş.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.24 }}
              className="flex flex-wrap gap-3 mb-14"
            >
              <a
                href={WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-base px-8 py-4 rounded-full no-underline transition-all hover:bg-white hover:scale-105 shadow-[0_8px_30px_rgba(216,255,79,0.3)]"
              >
                Ücretsiz Tanıtım Görüşmesi →
              </a>
              <a
                href="#nasil-calisir"
                className="inline-flex items-center gap-2 border-2 border-white/25 text-white font-nunito font-bold text-base px-8 py-4 rounded-full no-underline transition-all hover:border-white/60 hover:bg-white/5"
              >
                Nasıl Çalışır?
              </a>
            </motion.div>

            <div className="grid grid-cols-3 gap-4 max-w-[520px] max-[640px]:grid-cols-3 max-[400px]:grid-cols-1 max-[400px]:max-w-full">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="bg-white/6 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm"
                >
                  <div className="font-fredoka text-[#D8FF4F] text-2xl mb-0.5">{s.value}</div>
                  <div className="font-nunito text-white/50 text-xs">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sağ — floating badge kartı */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 max-[900px]:hidden"
          >
            <div className="relative w-[300px] h-[340px]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1C1B8A]/60 to-[#7340C8]/30 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-7">
                <div className="text-6xl">🎓</div>
                <div className="text-center">
                  <div className="font-fredoka text-white text-2xl mb-1">Sözderece Koçluk</div>
                  <div className="font-nunito text-white/50 text-sm">Günlük takip · Gerçek sonuç</div>
                </div>
                <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-nunito text-white/60 text-xs">Ortalama net artışı</span>
                    <span className="font-fredoka text-[#D8FF4F] text-sm">+17.5</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-[#D8FF4F] h-2 rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <div>
                  <div className="font-nunito font-black text-[#0D0A2E] text-xs">Kişisel Plan</div>
                  <div className="font-nunito text-[#7340C8] text-[10px]">Her gün güncellenir</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#D8FF4F] rounded-2xl shadow-xl px-4 py-3 text-center">
                <div className="font-fredoka text-[#0D0A2E] text-2xl leading-none">150+</div>
                <div className="font-nunito text-[#0D0A2E]/60 text-[10px]">Öğrenci</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 2. HİZMET + PAKETLERİ — Exam Toggle
// ══════════════════════════════════════════════
function ServiceCardsSection() {
  const [tab, setTab] = useState("yks");
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setPackages(data.packages); })
      .catch(() => {});
  }, []);

  const yksPackages = packages.filter((p) => p.type === "yks");
  const lgsPackages = packages.filter((p) => p.type === "lgs");
  const visible = tab === "yks" ? yksPackages : lgsPackages;

  return (
    <section id="paketler" className="bg-[#0D0A2E] py-20 px-5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#7340C8] opacity-[0.06] blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative">
        <motion.div {...fadeUp} className="text-center mb-10">
          <span className="inline-block font-nunito font-black text-xs text-[#D8FF4F] uppercase tracking-widest mb-3">
            Paketlerimiz
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-white leading-tight">
            Hangi sınava hazırlanıyorsun?
          </h2>
          <p className="font-nunito text-white/50 text-base mt-3 max-w-[480px] mx-auto">
            İster YKS, ister LGS. Her programa özel fiyatlandırma ve özellikler.
          </p>
        </motion.div>

        {/* Tab Toggle */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="flex justify-center mb-12">
          <div className="inline-flex bg-white/8 border border-white/10 rounded-full p-1 gap-1">
            {[
              { key: "yks", label: "YKS", icon: "🎓" },
              { key: "lgs", label: "LGS", icon: "📚" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`font-nunito font-black text-sm px-8 py-3 rounded-full transition-all flex items-center gap-2 ${
                  tab === t.key
                    ? "bg-[#D8FF4F] text-[#0D0A2E] shadow-[0_4px_12px_rgba(216,255,79,0.3)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Paket Kartları */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {visible.length === 0 ? (
              <PlaceholderCard examType={tab} />
            ) : (
              <div className={`grid gap-6 ${
                visible.length === 1
                  ? "max-w-[420px] mx-auto"
                  : visible.length === 2
                    ? "grid-cols-2 max-w-[800px] mx-auto max-[640px]:grid-cols-1"
                    : "grid-cols-3 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1"
              }`}>
                {visible.map((pkg, i) => (
                  <PackagePricingCard
                    key={pkg.slug}
                    pkg={pkg}
                    featured={i === 0 && visible.length > 1}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="text-center mt-10">
          <Link
            to="/paket-detay"
            className="font-nunito text-white/40 text-sm hover:text-white/70 transition-colors no-underline"
          >
            Tüm paketleri karşılaştır →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 3. NEDEN FARKLI?
// ══════════════════════════════════════════════
const whyCards = [
  {
    icon: "📲",
    title: "Günlük WhatsApp Takibi",
    desc: "Sabah planını, akşam özetini alıyorsun. Koçun her gün seninle. Bir gün bile kaybolmuyorsun.",
  },
  {
    icon: "📊",
    title: "Anlık Deneme Analizi",
    desc: "Her deneme sonrası zayıf konular güncelleniyor. PDF değil, sana özel canlı bir program.",
  },
  {
    icon: "👨‍👩‍👦",
    title: "Veli Dahil Süreç",
    desc: "'Ders çalış' kavgası bitiyor. Haftalık rapor ve aylık veli görüşmesiyle süreci biz yönetiyoruz.",
  },
  {
    icon: "🎯",
    title: "Koç Uyum Garantisi",
    desc: "Koçunu beğenmezsen değiştiriyoruz. Memnuniyetin bizim önceliğimiz.",
  },
  {
    icon: "🔄",
    title: "Dinamik Program",
    desc: "Sonuçlara göre program güncelleniyor. Statik plan değil, senin gelişimine uyan esnek sistem.",
  },
  {
    icon: "📈",
    title: "Ölçülebilir Sonuçlar",
    desc: "Ortalama +17.5 net artışı ilk ayda. Boş vaat değil — gerçek hikayeler, gerçek rakamlar.",
  },
];

// ══════════════════════════════════════════════
// ERKEN KAYIT KAMPANYA BANNER
// ══════════════════════════════════════════════
function EarlyRegistrationBanner() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/settings/early-registration`)
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  if (!settings?.enabled) return null;

  const daysLeft = settings.endDate
    ? Math.ceil((new Date(settings.endDate) - new Date()) / 86400000)
    : null;

  if (daysLeft !== null && daysLeft <= 0) return null;

  return (
    <motion.section
      {...fadeUp}
      className="bg-[#D8FF4F] py-14 px-5 relative overflow-hidden"
    >
      <div className="absolute top-[-60px] right-[-40px] w-[260px] h-[260px] rounded-full bg-[#0D0A2E] opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-30px] w-[200px] h-[200px] rounded-full bg-[#1C1B8A] opacity-[0.06] pointer-events-none" />

      <div className="max-w-[900px] mx-auto relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Sol — metin */}
          <div className="text-center lg:text-left">
            {settings.badge && (
              <span className="inline-block bg-[#0D0A2E] text-[#D8FF4F] font-nunito font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
                {settings.badge}
              </span>
            )}
            <h2 className="font-fredoka text-[40px] max-[640px]:text-[30px] text-[#0D0A2E] leading-tight mb-3">
              {settings.title || "Erken Kayıt Fırsatını Kaçırma!"}
            </h2>
            <p className="font-nunito text-[#0D0A2E]/65 text-base max-w-[500px]">
              {settings.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 justify-center lg:justify-start">
              {settings.discountText && (
                <span className="bg-[#0D0A2E] text-[#D8FF4F] font-nunito font-black text-sm px-5 py-2 rounded-full">
                  {settings.discountText}
                </span>
              )}
              {daysLeft !== null && (
                <span className="bg-white/60 text-[#0D0A2E] font-nunito font-black text-sm px-5 py-2 rounded-full">
                  ⏳ {daysLeft} gün kaldı
                </span>
              )}
              {settings.note && (
                <span className="font-nunito text-[#0D0A2E]/60 text-sm">{settings.note}</span>
              )}
            </div>
          </div>

          {/* Sağ — CTA */}
          <div className="flex-shrink-0">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0D0A2E] text-[#D8FF4F] font-nunito font-black text-base px-9 py-4 rounded-full no-underline hover:bg-[#1C1B8A] transition-all shadow-[0_8px_30px_rgba(13,10,46,0.2)] hover:scale-105 whitespace-nowrap"
            >
              {settings.ctaText || "Hemen Kaydol →"}
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ══════════════════════════════════════════════
// HOME PRİCİNG SECTİON — YKS / LGS Paketler
// ══════════════════════════════════════════════
function PriceDisplay({ pkg }) {
  const examActive = isExamPriceActive(pkg);
  const promoActive = !examActive && isPromoActive(pkg);

  if (examActive) {
    const price = getExamPrice(pkg);
    const days = getExamDaysLeft(pkg);
    const rate = pkg.examDiscountRate ?? 5;
    return (
      <div className="text-center">
        <div className="font-nunito text-white/40 text-sm line-through">
          {pkg.priceText || `${pkg.price}₺`}
        </div>
        <div className="font-fredoka text-[#D8FF4F] text-4xl">{price}₺</div>
        <span className="inline-block mt-1 bg-[#dbeafe]/20 text-[#93c5fd] font-nunito font-bold text-xs px-3 py-1 rounded-full">
          Sınava {days} gün — %{rate} indirimli
        </span>
      </div>
    );
  }

  if (promoActive) {
    return (
      <div className="text-center">
        <div className="font-nunito text-white/40 text-sm line-through">
          {pkg.priceText || `${pkg.price}₺`}
        </div>
        <div className="font-fredoka text-[#D8FF4F] text-4xl">{pkg.promoPrice}₺</div>
        <span className="inline-block mt-1 bg-[#D8FF4F]/15 text-[#D8FF4F] font-nunito font-bold text-xs px-3 py-1 rounded-full">
          {pkg.promoLabel || `${formatPromoEndDate(pkg.promoEndDate)} tarihine kadar`}
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      {pkg.oldPriceText && (
        <div className="font-nunito text-white/40 text-sm line-through">{pkg.oldPriceText}</div>
      )}
      <div className="font-fredoka text-[#D8FF4F] text-4xl">
        {pkg.priceText || `${pkg.price}₺`}
      </div>
    </div>
  );
}

function PackagePricingCard({ pkg, featured }) {
  const features = Array.isArray(pkg.features) ? pkg.features : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`relative flex flex-col rounded-3xl overflow-hidden transition-all ${
        featured
          ? "bg-white border-2 border-[#D8FF4F] shadow-[0_0_40px_rgba(216,255,79,0.15)]"
          : "bg-white/6 border border-white/12 hover:border-white/25"
      }`}
    >
      {featured && (
        <div className="bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-xs text-center py-2 uppercase tracking-widest">
          👍 En Popüler
        </div>
      )}

      <div className="p-7 flex flex-col flex-grow">
        {/* Başlık */}
        <div className="mb-5">
          <h3 className={`font-fredoka text-2xl mb-1 ${featured ? "text-[#0D0A2E]" : "text-white"}`}>
            {pkg.name}
          </h3>
          {pkg.subtitle && (
            <p className={`font-nunito text-sm leading-relaxed ${featured ? "text-[#0D0A2E]/55" : "text-white/50"}`}>
              {pkg.subtitle}
            </p>
          )}
        </div>

        {/* Fiyat */}
        <div className={`py-5 border-t border-b mb-5 ${featured ? "border-[#0D0A2E]/10" : "border-white/10"}`}>
          {featured ? (
            <div className="text-center">
              {pkg.oldPriceText && (
                <div className="font-nunito text-[#0D0A2E]/40 text-sm line-through">{pkg.oldPriceText}</div>
              )}
              {isPromoActive(pkg) && (
                <div className="font-nunito text-[#0D0A2E]/40 text-sm line-through">
                  {pkg.priceText || `${pkg.price}₺`}
                </div>
              )}
              <div className="font-fredoka text-[#1C1B8A] text-4xl">
                {isPromoActive(pkg) ? `${pkg.promoPrice}₺` : (isExamPriceActive(pkg) ? `${getExamPrice(pkg)}₺` : (pkg.priceText || `${pkg.price}₺`))}
              </div>
              {isPromoActive(pkg) && (
                <span className="inline-block mt-1 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-xs px-3 py-1 rounded-full">
                  {pkg.promoLabel || `${formatPromoEndDate(pkg.promoEndDate)} tarihine kadar`}
                </span>
              )}
            </div>
          ) : (
            <PriceDisplay pkg={pkg} />
          )}
        </div>

        {/* Özellikler */}
        {features.length > 0 && (
          <ul className="space-y-2.5 mb-7 flex-grow">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className={`flex-shrink-0 font-black text-base mt-0.5 ${f.included ? (featured ? "text-[#1C1B8A]" : "text-[#D8FF4F]") : "text-white/20"}`}>
                  {f.included ? "✓" : "✗"}
                </span>
                <span className={`font-nunito text-sm leading-relaxed ${f.included ? (featured ? "text-[#0D0A2E]/70" : "text-white/65") : (featured ? "text-[#0D0A2E]/25 line-through" : "text-white/25 line-through")}`}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-2.5">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className={`block w-full text-center font-nunito font-black text-sm py-3.5 rounded-full no-underline transition-all hover:scale-105 ${
              featured
                ? "bg-[#1C1B8A] text-white hover:bg-[#0D0A2E] shadow-[0_6px_20px_rgba(28,27,138,0.25)]"
                : "bg-[#D8FF4F] text-[#0D0A2E] hover:bg-white shadow-[0_6px_20px_rgba(216,255,79,0.2)]"
            }`}
          >
            Hemen Başla →
          </a>
          <Link
            to={`/paket-detay?slug=${pkg.slug}`}
            className={`block w-full text-center font-nunito font-bold text-sm py-3 rounded-full no-underline transition-all border ${
              featured
                ? "border-[#0D0A2E]/20 text-[#0D0A2E]/60 hover:border-[#0D0A2E]/50 hover:text-[#0D0A2E]"
                : "border-white/15 text-white/50 hover:border-white/40 hover:text-white"
            }`}
          >
            Detayları İncele
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function PlaceholderCard({ examType }) {
  return (
    <div className="rounded-3xl bg-white/4 border border-dashed border-white/15 p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
      <div className="text-4xl">{examType === "yks" ? "🎓" : "📚"}</div>
      <p className="font-nunito text-white/40 text-sm max-w-[240px]">
        {examType === "yks" ? "YKS" : "LGS"} paketleri yakında eklenecek.
      </p>
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-sm px-6 py-3 rounded-full no-underline hover:bg-white transition-all"
      >
        Bilgi Al →
      </a>
    </div>
  );
}

function WhyDifferentSection() {
  return (
    <section className="bg-white py-20 px-5">
      <div className="max-w-[1100px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            Neden Sözderece
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Neden Farklıyız?
          </h2>
          <p className="font-nunito text-[#0D0A2E]/50 text-base mt-4 max-w-[500px] mx-auto">
            Pek çok koçluk var, ama hepsi günlük takip, analiz ve veli iletişimini bir arada sunmuyor.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1">
          {whyCards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="bg-[#f8f7ff] border border-[#e8e6f5] rounded-2xl p-6 hover:border-[#7340C8]/30 hover:shadow-[0_8px_30px_rgba(115,64,200,0.1)] transition-all"
            >
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="font-nunito font-black text-[#0D0A2E] text-base mb-2.5">{c.title}</h3>
              <p className="font-nunito text-[#0D0A2E]/55 text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 4. NASIL ÇALIŞIR? — Steps
// ══════════════════════════════════════════════
const steps = [
  {
    num: "01",
    title: "DM'ye SİSTEM Yaz",
    desc: "Instagram veya WhatsApp'ta 'SİSTEM' yaz. Sana 15 dakika içinde dönüyoruz.",
    icon: "💬",
  },
  {
    num: "02",
    title: "Ücretsiz Keşif Görüşmesi",
    desc: "15 dakikada nerede olduğunu, nereye gitmek istediğini anlıyoruz. Sana özel ön değerlendirme.",
    icon: "🎯",
  },
  {
    num: "03",
    title: "Koçun Belirleniyor",
    desc: "Sınav türüne ve hedefe en uygun koç seçiliyor. Deneme analizi yapılıyor, program hazırlanıyor.",
    icon: "🤝",
  },
  {
    num: "04",
    title: "Programın Başlar",
    desc: "İlk günden itibaren günlük plan, WhatsApp takibi ve haftalık görüşmelerle yola çıkıyorsun.",
    icon: "🚀",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="nasil-calisir"
      className="bg-[#0D0A2E] py-20 px-5 overflow-hidden relative"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7340C8] opacity-[0.07] blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block font-nunito font-black text-xs text-[#D8FF4F] uppercase tracking-widest mb-3">
            Süreç
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-white leading-tight">
            Nasıl Çalışır?
          </h2>
          <p className="font-nunito text-white/50 text-base mt-4 max-w-[460px] mx-auto">
            Başlamak çok kolay — ücretsiz görüşme hiçbir şeyi taahhüt ettirmiyor.
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-5 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all h-full">
                <div className="w-12 h-12 rounded-full bg-[#D8FF4F] flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(216,255,79,0.35)]">
                  <span className="font-fredoka text-[#0D0A2E] text-lg">{s.num}</span>
                </div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-nunito font-black text-white text-base mb-2">{s.title}</h3>
                <p className="font-nunito text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-6 -right-3 z-10 text-[#D8FF4F]/30 text-2xl max-[900px]:hidden">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.instagram.com/sozderece/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-nunito font-bold text-sm px-8 py-4 rounded-full no-underline hover:border-white/50 hover:bg-white/5 transition-all"
          >
            @sozderece'ye git →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 5. TESTİMONYALS CAROUSEL
// ══════════════════════════════════════════════
const testimonials = [
  {
    quote:
      "Koçluk başlamadan önce ne yapacağımı bilmiyordum. İlk hafta planımı gördüğümde 'bu mümkün mü?' dedim. Birinci ayın sonunda netlerim fırladı.",
    name: "Şevval",
    role: "ÖĞRENCİ",
    badge: "82.25 NET · 1. AY",
    badgeColor: "bg-[#FF6B35]",
    avatar: "Ş",
    avatarBg: "bg-[#1C1B8A]",
    year: "TYT-AYT 2024",
  },
  {
    quote:
      "Oğlum artık kendi isteğiyle masaya oturuyor. Kavga bitti çünkü 'kötü polis' rolünü koçu devraldı. Ben sadece haftalık raporu okuyorum.",
    name: "Kemal S.",
    role: "VELİ",
    badge: "LGS 2024",
    badgeColor: "bg-[#7340C8]",
    avatar: "K",
    avatarBg: "bg-[#7340C8]",
    year: "LGS Velisi 2024",
  },
  {
    quote:
      "Plan yapmayı hiç sevmezdim. Ama koçum sayesinde artık sabah kalktığımda ne yapacağımı biliyorum. Bu özgüven inanılmaz bir değişim.",
    name: "Elif T.",
    role: "ÖĞRENCİ",
    badge: "+22 NET",
    badgeColor: "bg-[#D8FF4F] text-[#0D0A2E]",
    avatar: "E",
    avatarBg: "bg-[#FF6B35]",
    year: "YKS 2025",
  },
];

function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[current];

  return (
    <section className="bg-[#1C1B8A] py-20 px-5 overflow-hidden relative">
      <div className="absolute top-[-60px] right-[-40px] w-[300px] h-[300px] rounded-full bg-[#D8FF4F] opacity-[0.05] blur-3xl pointer-events-none" />
      <span className="absolute left-[4%] top-[8%] font-fredoka text-[200px] text-white opacity-[0.03] select-none pointer-events-none leading-none">
        "
      </span>

      <div className="max-w-[760px] mx-auto relative">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="inline-block font-nunito font-black text-xs text-[#D8FF4F] uppercase tracking-widest mb-3">
            Başarı Hikayeleri
          </span>
          <h2 className="font-fredoka text-[42px] max-[640px]:text-[32px] text-white leading-tight">
            Öğrencilerimiz ne diyor?
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl p-8 relative overflow-hidden mb-8"
          >
            <div
              className={`absolute top-6 right-6 ${t.badgeColor} font-nunito font-black text-xs px-4 py-1.5 rounded-full`}
            >
              {t.badge}
            </div>
            <div className="text-[64px] text-[#1C1B8A]/8 font-fredoka mb-2 leading-none">
              "
            </div>
            <blockquote className="font-nunito text-[#0D0A2E]/75 text-base leading-relaxed italic mb-6">
              "{t.quote}"
            </blockquote>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-white font-fredoka text-base flex-shrink-0`}
              >
                {t.avatar}
              </div>
              <div>
                <p className="font-nunito font-black text-[#0D0A2E] text-sm m-0">
                  {t.name}
                </p>
                <p className="font-nunito text-[#0D0A2E]/40 text-xs m-0">
                  {t.role} · {t.year} ★★★★★
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-[#D8FF4F] w-6" : "bg-white/30 w-2.5"
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-nunito text-white/50 text-sm mb-4">
            Sıradaki başarı hikayesi senin olabilir.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-sm px-8 py-4 rounded-full no-underline hover:bg-white transition-all shadow-[0_6px_24px_rgba(216,255,79,0.25)] hover:scale-105"
          >
            DM'ye SİSTEM yaz →
          </a>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 6. KARŞILAŞTIRMA TABLOSU
// ══════════════════════════════════════════════
const compRows = [
  { feature: "Günlük takip", dershane: false, other: false, sozderece: true },
  { feature: "Deneme analizi", dershane: false, other: "bazen", sozderece: true },
  { feature: "Dinamik program", dershane: false, other: false, sozderece: true },
  { feature: "WhatsApp iletişim", dershane: false, other: "sınırlı", sozderece: true },
  { feature: "Veli bilgilendirmesi", dershane: false, other: false, sozderece: true },
  { feature: "Bire bir kişiselleştirme", dershane: false, other: "haftalık", sozderece: "günlük" },
];

function Cell({ val }) {
  if (val === true) return <span className="text-[#22c55e] font-nunito font-black text-lg">✓</span>;
  if (val === false) return <span className="text-[#ef4444] font-nunito font-black text-lg">✗</span>;
  return <span className="text-[#FF6B35] font-nunito font-bold text-sm">{val}</span>;
}

function ComparisonSection() {
  return (
    <section className="bg-[#f8f7ff] py-20 px-5">
      <div className="max-w-[900px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            Karşılaştırma
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Her koçluk aynı değil.
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="overflow-x-auto rounded-2xl shadow-[0_4px_24px_rgba(28,27,138,0.10)]"
        >
          <table className="w-full min-w-[540px] border-collapse bg-white">
            <thead>
              <tr>
                <th className="text-left py-4 px-5 font-nunito font-black text-sm text-[#0D0A2E]/40 uppercase tracking-wide bg-white border-b border-[#f1f0f8] w-[40%]">
                  Özellik
                </th>
                <th className="text-center py-4 px-4 font-nunito font-black text-sm text-[#0D0A2E]/40 uppercase tracking-wide bg-white border-b border-[#f1f0f8]">
                  Dershane
                </th>
                <th className="text-center py-4 px-4 font-nunito font-black text-sm text-[#0D0A2E]/40 uppercase tracking-wide bg-white border-b border-[#f1f0f8]">
                  Başka Koçluk
                </th>
                <th className="text-center py-4 px-4 font-nunito font-black text-sm text-[#0D0A2E] uppercase tracking-wide bg-[#D8FF4F] border-b border-[#D8FF4F]/60">
                  Sözderece ✦
                </th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                  <td className="py-3.5 px-5 font-nunito font-bold text-sm text-[#0D0A2E]/70 border-b border-[#f1f0f8]">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-4 text-center border-b border-[#f1f0f8]">
                    <Cell val={row.dershane} />
                  </td>
                  <td className="py-3.5 px-4 text-center border-b border-[#f1f0f8]">
                    <Cell val={row.other} />
                  </td>
                  <td className="py-3.5 px-4 text-center border-b border-[#D8FF4F]/30 bg-[#D8FF4F]/5">
                    <Cell val={row.sozderece} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="text-center mt-8"
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#1C1B8A] text-white font-nunito font-black text-sm px-8 py-4 rounded-full no-underline hover:bg-[#0D0A2E] transition-all shadow-[0_6px_20px_rgba(28,27,138,0.2)] hover:-translate-y-0.5"
          >
            Sözderece sistemini dene →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 7. SSS — Kapsamlı Accordion
// ══════════════════════════════════════════════
const faqs = [
  {
    q: "İptal ve iade hakkı var mı?",
    a: "Evet. Hizmet başlamadan önce tam iade yapılır. Hizmet başladıktan sonra 7 gün içinde iptal talebinde bulunabilirsiniz. Detaylar için iade politikamıza göz atın.",
  },
  {
    q: "Koç değişikliği yapabilir miyim?",
    a: "Evet, herhangi bir anda koçunuzu değiştirebilirsiniz. Memnuniyetiniz bizim önceliğimiz. Yeni koçla tanışma görüşmesi tamamen ücretsizdir.",
  },
  {
    q: "Haftada kaç kez görüşüyoruz?",
    a: "Her gün WhatsApp üzerinden iletişimdeyiz. Bunun yanı sıra haftada bir kez 30-60 dakikalık online görüşme yapıyoruz. Acil durumlarda her zaman ulaşabilirsiniz.",
  },
  {
    q: "Görüşme günümü değiştirebilir miyim?",
    a: "Evet, koçunuzla birlikte uygun yeni gün ve saat belirliyorsunuz. Ders programınız değişirse görüşme gününüz de kolayca değişebilir.",
  },
  {
    q: "Satın aldım, şimdi ne olacak?",
    a: "Ödemenizi aldıktan sonra 24 saat içinde sizi arayacağız. Koç ataması yapılıp tanışma görüşmesi planlanacak. İlk günden itibaren günlük program başlıyor.",
  },
  {
    q: "Paket otomatik yenileniyor mu?",
    a: "Hayır, otomatik yenileme yok. Devam etmek istediğinizde bize bildirmeniz yeterli. Sizi hiçbir şeye zorlamıyoruz.",
  },
  {
    q: "Dershaneye de gidiyorum, ikisi birlikte yürür mü?",
    a: "Evet, tam olarak bunun için varız. Dershane konu anlatıyor, biz evdeki uygulamayı ve günlük çalışmayı yönetiyoruz. Asıl fark bu noktada açılıyor.",
  },
  {
    q: "Görüşmelerde süre sınırı var mı?",
    a: "Haftalık görüşmeler ortalama 30-60 dakika sürer. Konuya göre uzayabilir. Acil sorular için WhatsApp her zaman açık.",
  },
  {
    q: "LGS için veli ne kadar dahil oluyor?",
    a: "Haftalık gelişim raporu ve aylık veli görüşmesi yapıyoruz. Çocuğunuzla olan ilişkiyi korumak bizim işimiz — biz 'kötü polis' olmayı üstleniyoruz.",
  },
  {
    q: "8. sınıfa başladım, geç mi kaldım?",
    a: "Kesinlikle hayır. Yıl boyunca, hatta son 3 ayda başlayan öğrencilerimiz de ciddi gelişim gösterdi. Önemli olan doğru planlama ve düzenli çalışma.",
  },
  {
    q: "Kaç öğrenciyle çalışıyorsunuz?",
    a: "Kontenjanlarımızı kasıtlı olarak sınırlı tutuyoruz. Çünkü her öğrenci gerçekten bire bir ilgi hak ediyor. Kontenjanlar dolduğunda yeni öğrenci almıyoruz.",
  },
  {
    q: "Sizi diğer koçluklardan ayıran ne?",
    a: "Günlük WhatsApp takibi, her deneme sonrası anlık analiz, dinamik program güncellemesi ve haftalık veli raporunu bir arada sunan çok az koçluk var. Biz sistemi bu şekilde kuruyoruz.",
  },
];

function FaqSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-gradient-to-br from-[#f8f7ff] to-[#f0f0fa] py-20 px-5">
      <div className="max-w-[800px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            SSS
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Sıkça Sorulan Sorular
          </h2>
          <p className="font-nunito text-[#0D0A2E]/50 text-sm mt-3">
            Cevabını bulamazsan bize ulaş, hemen dönüyoruz.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25) }}
              >
                <div
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ${
                    isOpen
                      ? "border-[#1C1B8A] shadow-[0_0_0_3px_rgba(28,27,138,0.06)] bg-white"
                      : "border-[#e4e2f4] bg-white hover:border-[#7340C8]/40 hover:shadow-[0_4px_16px_rgba(115,64,200,0.08)]"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${
                      isOpen ? "bg-[#D8FF4F]" : "bg-transparent"
                    }`}
                  />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className={`font-nunito font-black text-base transition-colors duration-200 ${
                          isOpen ? "text-[#1C1B8A]" : "text-[#0D0A2E]"
                        }`}
                      >
                        {faq.q}
                      </h3>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-black transition-all duration-300 ${
                          isOpen
                            ? "bg-[#D8FF4F] text-[#0D0A2E] rotate-45"
                            : "bg-[#f1f0f8] text-[#7340C8] rotate-0"
                        }`}
                      >
                        +
                      </div>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-[400ms] ${
                        isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="font-nunito text-[#0D0A2E]/60 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="text-center mt-10"
        >
          <p className="font-nunito text-[#0D0A2E]/50 text-sm mb-4">
            Cevabın burada yok mu?
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#1C1B8A] text-white font-nunito font-black text-sm px-8 py-4 rounded-full no-underline hover:bg-[#0D0A2E] transition-all shadow-[0_6px_20px_rgba(28,27,138,0.2)]"
          >
            Bize Ulaşın →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 8. İLETİŞİM CTA
// ══════════════════════════════════════════════
function ContactCtaSection() {
  return (
    <section className="bg-[#0D0A2E] py-16 px-5 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7340C8]/10 to-transparent pointer-events-none" />
      <div className="max-w-[700px] mx-auto text-center relative">
        <motion.div {...fadeUp}>
          <div className="text-5xl mb-5">👋</div>
          <h2 className="font-fredoka text-[40px] max-[640px]:text-[32px] text-white mb-4 leading-tight">
            Uzman Ekibimize Ulaşın
          </h2>
          <p className="font-nunito text-white/50 text-base mb-8 max-w-[460px] mx-auto">
            Aklınızdaki tüm sorular için danışmanlarımız hazır. Ücretsiz keşif
            görüşmesi — hiçbir taahhüt yok.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-base px-10 py-5 rounded-full no-underline hover:bg-white transition-all shadow-[0_8px_30px_rgba(216,255,79,0.25)] hover:scale-105"
          >
            Bize Ulaşın →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// 9. STICKY MOBİL CTA
// ══════════════════════════════════════════════
function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[900] px-4 pb-4 hidden max-[960px]:block"
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-base py-4 rounded-2xl text-center no-underline shadow-[0_-4px_24px_rgba(216,255,79,0.3)]"
          >
            Ücretsiz Görüşme Al →
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════
// ANA SAYFA
// ══════════════════════════════════════════════
export default function HomePage() {
  return (
    <div className="font-nunito">
      <Seo
        title="YKS & LGS Online Öğrenci Koçluğu | Sözderece"
        description="Günlük takip, dinamik program ve veli raporuyla YKS ve LGS sınavlarına hazırlanın. Sözderece Koçluk ile her gün yanındayız."
        canonical="/"
      />

      <Navbar />
      <HeroSection />
      <ServiceCardsSection />
      <EarlyRegistrationBanner />
      <WhyDifferentSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <ComparisonSection />
      <FaqSection />
      <ContactCtaSection />
      <Footer />
      <StickyMobileCta />
    </div>
  );
}
