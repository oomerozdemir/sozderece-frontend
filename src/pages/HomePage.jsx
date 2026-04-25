import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Seo from "../components/Seo";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import PricingSection from "../components/PricingSection";

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
    { value: "500+", label: "Öğrenci" },
    { value: "%94", label: "Hedef Başarı" },
    { value: "4.9★", label: "Veli Puanı" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 60% 40%, #3d1a80 0%, #1A0A40 55%, #0d0520 100%)",
      }}
    >
      <style>{`
        @keyframes heroOrbMove { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.06)} 66%{transform:translate(-20px,20px) scale(0.96)} }
        @keyframes heroSparkle { 0%,100%{opacity:0.15;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes heroFloat1  { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(6deg)} }
        @keyframes heroFloat2  { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-8deg)} }
        @keyframes heroFloat3  { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-22px) rotate(4deg)} }
        @keyframes heroShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes heroPulse   { 0%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 0 rgba(255,107,53,0.5)} 70%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 20px rgba(255,107,53,0)} 100%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 0 rgba(255,107,53,0)} }
      `}</style>

      {/* Orb 1 — sağ üst */}
      <div style={{
        position: "absolute", top: -120, right: 80,
        width: 480, height: 480, borderRadius: "50%",
        background: "#4a1da0", filter: "blur(90px)", opacity: 0.35,
        animation: "heroOrbMove 12s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Orb 2 — sol alt */}
      <div style={{
        position: "absolute", bottom: -80, left: 100,
        width: 320, height: 320, borderRadius: "50%",
        background: "#FF6B35", filter: "blur(100px)", opacity: 0.18,
        animation: "heroOrbMove 16s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* Star dots */}
      {[[120,90,5,0],[300,220,4,0.5],[80,400,6,1],[500,60,3,0.8],[420,330,5,1.4],[650,180,4,0.3],[180,560,5,1.8],[760,90,3,0.6]].map(([x,y,s,d],i) => (
        <div key={i} style={{
          position: "absolute", left: x, top: y,
          width: s, height: s, borderRadius: "50%",
          background: "#D8FF4F",
          animation: `heroSparkle ${2+d}s ease-in-out infinite`,
          animationDelay: `${d}s`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div className="max-w-[1200px] mx-auto px-5 pt-20 pb-16 max-[768px]:pt-14 max-[768px]:pb-12 w-full" style={{ position: "relative", zIndex: 1 }}>
        <div className="grid grid-cols-[1fr_auto] gap-16 items-center max-[960px]:grid-cols-1">

          {/* Sol — metin */}
          <div>
            {/* Pill badge */}
            <motion.div {...fadeUp} className="mb-7">
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(216,255,79,0.12)",
                border: "1px solid rgba(216,255,79,0.3)",
                borderRadius: 999, padding: "7px 16px",
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#D8FF4F", display: "inline-block",
                  animation: "heroSparkle 1.5s ease-in-out infinite",
                }} />
                <span className="font-fredoka text-[#D8FF4F] text-sm font-semibold tracking-[0.1em] uppercase">
                  LGS & YKS Koçluğu
                </span>
              </span>
            </motion.div>

            {/* H1 with shimmer word */}
            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="font-fredoka text-[72px] max-[900px]:text-[52px] max-[640px]:text-[42px] max-[400px]:text-[34px] leading-[1.05] text-white mb-6"
              style={{ letterSpacing: "-0.5px", maxWidth: 640 }}
            >
              Sınavda değil,{" "}
              <span style={{
                background: "linear-gradient(90deg, #D8FF4F, #ffffff, #D8FF4F)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "heroShimmer 3s linear infinite",
              }}>başarıda</span>{" "}
              ol.
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="font-nunito font-bold text-white/65 text-[19px] max-[640px]:text-base leading-relaxed mb-10"
              style={{ maxWidth: 520 }}
            >
              Kişiye özel koçluk, haftalık takip ve deneme analizleriyle LGS & YKS'ye hazırlan. Sistematik, stressiz, sonuç odaklı.
            </motion.p>

            {/* CTA row */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.24 }}
              className="flex flex-wrap gap-4 mb-14"
            >
              <a
                href={WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-white font-fredoka font-bold text-[18px] px-9 py-4 rounded-full no-underline transition-transform hover:scale-105"
                style={{
                  background: "#FF6B35",
                  animation: "heroPulse 2.5s ease-out infinite",
                  letterSpacing: "0.3px",
                }}
              >
                Ücretsiz Tanışma Görüşmesi
              </a>
              <a
                href="#nasil-calisir"
                className="inline-flex items-center gap-2 text-white font-fredoka font-semibold text-[16px] px-7 py-4 rounded-full no-underline transition-all hover:bg-white/10"
                style={{ border: "1.5px solid rgba(255,255,255,0.25)" }}
              >
                Nasıl Çalışır?
              </a>
            </motion.div>

            {/* Trust stats */}
            <div className="flex gap-8">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                >
                  <div className="font-fredoka font-bold text-[#D8FF4F] text-[28px] leading-none">{s.value}</div>
                  <div className="font-nunito font-bold text-white/50 text-[13px] mt-1 tracking-wide">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sağ — floating kartlar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 max-[960px]:hidden"
          >
            <div className="relative" style={{ width: 390, height: 480 }}>

              {/* Glow ring */}
              <div style={{
                position: "absolute", top: 80, left: 10,
                width: 380, height: 380, borderRadius: "50%",
                background: "#4a1da0", filter: "blur(80px)", opacity: 0.28,
                animation: "heroOrbMove 10s ease-in-out infinite",
                pointerEvents: "none",
              }} />

              {/* Ana kart — haftalık plan */}
              <div style={{
                position: "absolute", top: 90, left: 40,
                width: 320,
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 28, padding: "32px 28px",
                animation: "heroFloat1 5s ease-in-out infinite",
                boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              }}>
                <div className="font-fredoka font-bold text-[#D8FF4F] text-sm tracking-[0.12em] uppercase mb-4">
                  Bu Haftanın Planı
                </div>
                {[
                  { text: "Mat: Türevler — 2 ders", done: true },
                  { text: "Fizik: Elektrik — 1 ders", done: true },
                  { text: "Deneme Analizi — Cuma", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3.5">
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: item.done ? "#D8FF4F" : "rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.done && (
                        <svg width="11" height="11" viewBox="0 0 12 12">
                          <polyline points="2 6 5 9 10 3" fill="none" stroke="#0D0A2E" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="font-nunito font-bold text-sm" style={{ color: item.done ? "#fff" : "rgba(255,255,255,0.45)" }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Turuncu rozet — net artışı */}
              <div style={{
                position: "absolute", top: 20, left: 0,
                background: "#FF6B35", borderRadius: 20, padding: "16px 22px",
                animation: "heroFloat2 4s ease-in-out infinite",
                boxShadow: "0 12px 30px rgba(255,107,53,0.5)",
              }}>
                <div className="font-fredoka font-bold text-white text-[28px] leading-none">+47</div>
                <div className="font-nunito font-bold text-white/80 text-xs mt-0.5">Net artışı</div>
              </div>

              {/* Sarı rozet — koç */}
              <div style={{
                position: "absolute", bottom: 55, right: 0,
                background: "rgba(216,255,79,0.96)", borderRadius: 18, padding: "14px 20px",
                animation: "heroFloat3 6s ease-in-out infinite",
                boxShadow: "0 10px 24px rgba(216,255,79,0.35)",
              }}>
                <div className="font-fredoka font-bold text-[#0D0A2E] text-[15px] leading-snug">Koçunla bugün</div>
                <div className="font-fredoka font-bold text-[#0D0A2E] text-[15px]">görüş 🎯</div>
              </div>

            </div>
          </motion.div>
        </div>
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
    desc: "Sabah planını, akşam özetini alıyorsun. Plato döneminde bile bir gün bile boşa gitmiyor.",
  },
  {
    icon: "📊",
    title: "Anlık Deneme Analizi",
    desc: "Her deneme sonrası 24 saat içinde program yeniden yapılandırılıyor. Aynı hatayı bir daha yapmazsın.",
  },
  {
    icon: "👨‍👩‍👦",
    title: "Veli Dahil Süreç",
    desc: "'Ders çalış' demek zorunda kalmıyorsunuz. Kötü polis olmayı biz üstleniyoruz — haftalık rapor, aylık görüşme.",
  },
  {
    icon: "🎯",
    title: "Koç Uyum Garantisi",
    desc: "Koçunu beğenmezsen değiştiriyoruz. Memnuniyetin bizim önceliğimiz.",
  },
  {
    icon: "🔄",
    title: "Dinamik Program",
    desc: "Sabit PDF değil, her denemeden sonra güncellenen canlı program. Strateji durgun kalmaz, sen de kalmıyorsun.",
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

function WhyDifferentSection() {
  return (
    <section className="bg-white py-20 px-5">
      <div className="max-w-[1100px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            Neden Sözderece
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Diğerleri ne yapıyor, biz ne yapıyoruz?
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-4 max-w-[500px] mx-auto">
            Dershane konu anlatır. Koçun görevi evdeki boşluğu kapatmak — her gün, somut olarak.
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
              className="bg-[#f8fafc] border border-gray-100 rounded-2xl p-6 hover:border-[#7340C8]/30 hover:bg-white hover:shadow-[0_4px_16px_rgba(115,64,200,0.08)] transition-all"
            >
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="font-nunito font-black text-[#0D0A2E] text-base mb-2.5">{c.title}</h3>
              <p className="font-nunito text-[#64748b] text-sm leading-relaxed">{c.desc}</p>
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
    title: "Görüşme Talep Et",
    desc: "Formu doldur ya da WhatsApp'tan yaz. 15 dakika içinde dönüyoruz — hiçbir taahhüt yok.",
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
      className="bg-[#f8fafc] py-20 px-5 overflow-hidden relative"
    >
      <div className="max-w-[1100px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            Süreç
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Nasıl Çalışır?
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-4 max-w-[460px] mx-auto">
            İlk adım 15 dakika. Geri kalanı biz hallederiz.
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
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#7340C8]/30 hover:shadow-[0_4px_16px_rgba(115,64,200,0.08)] transition-all h-full">
                <div className="w-12 h-12 rounded-full bg-[#D8FF4F] flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(216,255,79,0.35)]">
                  <span className="font-fredoka text-[#0D0A2E] text-lg">{s.num}</span>
                </div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-nunito font-black text-[#0D0A2E] text-base mb-2">{s.title}</h3>
                <p className="font-nunito text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-8 -right-4 z-10 text-[#1C1B8A]/30 text-3xl font-black max-[900px]:hidden select-none">
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
            className="inline-flex items-center gap-2 border-2 border-[#0D0A2E]/15 text-[#0D0A2E]/70 font-nunito font-bold text-sm px-8 py-4 rounded-full no-underline hover:border-[#0D0A2E]/40 hover:bg-[#0D0A2E]/5 transition-all"
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
    badge: "+17 NET · 1. AY",
    badgeColor: "bg-[#FF6B35]",
    avatar: "Ş",
    avatarBg: "bg-[#1C1B8A]",
    year: "TYT-AYT 2024",
    before: "65 NET",
    after: "82 NET",
  },
  {
    quote:
      "Her akşam kavga ediyorduk. 3 ay sonra ben artık 'ders çalış' demiyorum. Koçu hallediyor, kızım kendi sorumluluğunu almaya başladı.",
    name: "Serpil H.",
    role: "VELİ",
    badge: "LGS 2025",
    badgeColor: "bg-[#7340C8]",
    avatar: "S",
    avatarBg: "bg-[#7340C8]",
    year: "8. Sınıf Velisi",
    before: null,
    after: null,
  },
  {
    quote:
      "4 aydır TYT'de 78 net alıyordum. Deneme analizine odaklanınca 6 haftada 96'ya çıktı. Yöntem her şeymiş.",
    name: "Ege K.",
    role: "ÖĞRENCİ",
    badge: "+18 NET",
    badgeColor: "bg-[#D8FF4F] text-[#0D0A2E]",
    avatar: "E",
    avatarBg: "bg-[#FF6B35]",
    year: "TYT 2025",
    before: "78 NET",
    after: "96 NET",
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
    <section className="bg-white py-20 px-5 overflow-hidden relative">
      <span className="absolute left-[4%] top-[8%] font-fredoka text-[200px] text-[#1C1B8A] opacity-[0.04] select-none pointer-events-none leading-none">
        "
      </span>

      <div className="max-w-[760px] mx-auto relative">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            Başarı Hikayeleri
          </span>
          <h2 className="font-fredoka text-[42px] max-[640px]:text-[32px] text-[#0D0A2E] leading-tight">
            Gerçek öğrenciler, gerçek sonuçlar
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="bg-[#f8fafc] border border-gray-100 rounded-3xl p-8 relative overflow-hidden mb-8 shadow-[0_4px_24px_rgba(115,64,200,0.08)]"
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
            {t.before && t.after && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 bg-[#f1f0f8] rounded-xl px-4 py-2.5 text-center">
                  <div className="font-nunito text-[#0D0A2E]/40 text-[10px] uppercase tracking-wide mb-0.5">Önce</div>
                  <div className="font-fredoka text-[#0D0A2E] text-lg">{t.before}</div>
                </div>
                <div className="text-[#D8FF4F] text-xl font-black bg-[#1C1B8A] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">→</div>
                <div className="flex-1 bg-[#D8FF4F] rounded-xl px-4 py-2.5 text-center">
                  <div className="font-nunito text-[#0D0A2E]/60 text-[10px] uppercase tracking-wide mb-0.5">Sonra</div>
                  <div className="font-fredoka text-[#0D0A2E] text-lg font-black">{t.after}</div>
                </div>
              </div>
            )}
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
                i === current ? "bg-[#1C1B8A] w-6" : "bg-[#1C1B8A]/20 w-2.5"
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-nunito text-[#64748b] text-sm mb-4">
            Sıradaki başarı hikayesi senin olabilir.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-sm px-8 py-4 rounded-full no-underline hover:bg-white transition-all shadow-[0_6px_24px_rgba(216,255,79,0.25)] hover:scale-105"
          >
            Ücretsiz Görüşme Başlat →
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

function Cell({ val, highlight }) {
  if (val === true) return <span className={`font-nunito font-black text-lg ${highlight ? "text-[#D8FF4F]" : "text-[#1C1B8A]"}`}>✓</span>;
  if (val === false) return <span className="text-gray-300 font-nunito font-black text-lg">✗</span>;
  return <span className="text-[#FF6B35] font-nunito font-bold text-sm">{val}</span>;
}

function ComparisonSection() {
  return (
    <section className="bg-[#f8fafc] py-20 px-5">
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
          className="overflow-x-auto rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        >
          <table className="w-full min-w-[540px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 px-5 font-nunito font-black text-sm text-white/50 uppercase tracking-wide bg-[#0D0A2E] border-b border-white/10 w-[40%]">
                  Özellik
                </th>
                <th className="text-center py-4 px-4 font-nunito font-black text-sm text-white/50 uppercase tracking-wide bg-[#0D0A2E] border-b border-white/10">
                  Dershane
                </th>
                <th className="text-center py-4 px-4 font-nunito font-black text-sm text-white/50 uppercase tracking-wide bg-[#0D0A2E] border-b border-white/10">
                  Başka Koçluk
                </th>
                <th className="text-center py-4 px-4 font-nunito font-black text-sm text-[#0D0A2E] uppercase tracking-wide bg-[#D8FF4F] border-b border-[#D8FF4F]/80">
                  Sözderece ✦
                </th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                  <td className="py-3.5 px-5 font-nunito font-bold text-sm text-[#475569] border-b border-gray-100">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-4 text-center border-b border-gray-100">
                    <Cell val={row.dershane} highlight={false} />
                  </td>
                  <td className="py-3.5 px-4 text-center border-b border-gray-100">
                    <Cell val={row.other} highlight={false} />
                  </td>
                  <td className="py-3.5 px-4 text-center border-b border-[#1C1B8A]/10 bg-[#1C1B8A]/5">
                    <Cell val={row.sozderece} highlight={true} />
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
            className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-sm px-8 py-4 rounded-full no-underline hover:bg-white transition-all shadow-[0_6px_20px_rgba(216,255,79,0.25)] hover:scale-105"
          >
            Ücretsiz Görüşme Başlat →
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
    <section className="bg-white py-20 px-5">
      <div className="max-w-[800px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="inline-block font-nunito font-black text-xs text-[#7340C8] uppercase tracking-widest mb-3">
            SSS
          </span>
          <h2 className="font-fredoka text-[48px] max-[640px]:text-[36px] text-[#0D0A2E] leading-tight">
            Sıkça Sorulan Sorular
          </h2>
          <p className="font-nunito text-[#94a3b8] text-sm mt-3">
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
                      ? "border-[#7340C8]/40 shadow-[0_0_0_3px_rgba(115,64,200,0.06)] bg-[#f5f3ff]"
                      : "border-gray-100 bg-[#f8fafc] hover:border-[#7340C8]/30 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${
                      isOpen ? "bg-[#7340C8]" : "bg-transparent"
                    }`}
                  />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className={`font-nunito font-black text-base transition-colors duration-200 ${
                          isOpen ? "text-[#7340C8]" : "text-[#0D0A2E]"
                        }`}
                      >
                        {faq.q}
                      </h3>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-black transition-all duration-300 ${
                          isOpen
                            ? "bg-[#7340C8] text-white rotate-45"
                            : "bg-gray-100 text-[#64748b] rotate-0"
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
                      <p className="font-nunito text-[#64748b] text-sm leading-relaxed">
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
          <p className="font-nunito text-[#94a3b8] text-sm mb-4">
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
          <p className="font-nunito text-[#94a3b8] text-xs mt-6">
            YKS ve LGS hakkında resmi bilgi için{" "}
            <a href="https://www.osym.gov.tr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#64748b] transition-colors">ÖSYM</a>
            {" "}ve{" "}
            <a href="https://www.meb.gov.tr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#64748b] transition-colors">MEB</a>
            {" "}resmi sitelerini ziyaret edebilirsiniz.
          </p>
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
    <section className="bg-gradient-to-br from-[#1C1B8A] to-[#0D0A2E] py-16 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#7340C8]/20 to-transparent pointer-events-none" />
      <div className="max-w-[700px] mx-auto text-center relative">
        <motion.div {...fadeUp}>
          <div className="text-5xl mb-5">🎯</div>
          <h2 className="font-fredoka text-[40px] max-[640px]:text-[32px] text-white mb-4 leading-tight">
            Bir görüşme her şeyi netleştirir.
          </h2>
          <p className="font-nunito text-white/50 text-base mb-8 max-w-[460px] mx-auto">
            15 dakika, sana özel değerlendirme. Taahhüt yok, baskı yok.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#D8FF4F] text-[#0D0A2E] font-nunito font-black text-base px-10 py-5 rounded-full no-underline hover:bg-white transition-all shadow-[0_8px_30px_rgba(216,255,79,0.25)] hover:scale-105"
          >
            Ücretsiz Görüşme Başlat →
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
            Ücretsiz Görüşme Başlat →
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
      <PricingSection />
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
