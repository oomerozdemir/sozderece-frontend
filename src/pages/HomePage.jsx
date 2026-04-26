import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Seo from "../components/Seo";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import PricingSection from "../components/PricingSection";
import HeroSection from "../components/HeroSection";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" },
};

// ══════════════════════════════════════════════
// DATA — değiştirilmedi
// ══════════════════════════════════════════════
const whyCards = [
  {
    icon: "📲",
    title: "Günlük WhatsApp Takibi",
    desc: "Sabah planını, akşam özetini alıyorsun. Plato döneminde bile bir gün bile boşa gitmiyor.",
    accent: "#D8FF4F",
    accentBg: "rgba(216,255,79,0.1)",
    border: "rgba(216,255,79,0.22)",
  },
  {
    icon: "📊",
    title: "Anlık Deneme Analizi",
    desc: "Her deneme sonrası 24 saat içinde program yeniden yapılandırılıyor. Aynı hatayı bir daha yapmazsın.",
    accent: "#FF6B35",
    accentBg: "rgba(255,107,53,0.1)",
    border: "rgba(255,107,53,0.22)",
  },
  {
    icon: "👨‍👩‍👦",
    title: "Veli Dahil Süreç",
    desc: "'Ders çalış' demek zorunda kalmıyorsunuz. Kötü polis olmayı biz üstleniyoruz — haftalık rapor, aylık görüşme.",
    accent: "#a78bfa",
    accentBg: "rgba(115,64,200,0.12)",
    border: "rgba(115,64,200,0.25)",
  },
  {
    icon: "🎯",
    title: "Koç Uyum Garantisi",
    desc: "Koçunu beğenmezsen değiştiriyoruz. Memnuniyetin bizim önceliğimiz.",
    accent: "#D8FF4F",
    accentBg: "rgba(216,255,79,0.1)",
    border: "rgba(216,255,79,0.22)",
  },
  {
    icon: "🔄",
    title: "Dinamik Program",
    desc: "Sabit PDF değil, her denemeden sonra güncellenen canlı program. Strateji durgun kalmaz, sen de kalmıyorsun.",
    accent: "#FF6B35",
    accentBg: "rgba(255,107,53,0.1)",
    border: "rgba(255,107,53,0.22)",
  },
  {
    icon: "📈",
    title: "Ölçülebilir Sonuçlar",
    desc: "Ortalama +17.5 net artışı ilk ayda. Boş vaat değil — gerçek hikayeler, gerçek rakamlar.",
    accent: "#a78bfa",
    accentBg: "rgba(115,64,200,0.12)",
    border: "rgba(115,64,200,0.25)",
  },
];

const steps = [
  {
    num: "01",
    title: "Görüşme Talep Et",
    desc: "Formu doldur ya da WhatsApp'tan yaz. 15 dakika içinde dönüyoruz — hiçbir taahhüt yok.",
    icon: "💬",
    circleColor: "#D8FF4F",
    circleText: "#0D0A2E",
  },
  {
    num: "02",
    title: "Ücretsiz Keşif Görüşmesi",
    desc: "15 dakikada nerede olduğunu, nereye gitmek istediğini anlıyoruz. Sana özel ön değerlendirme.",
    icon: "🎯",
    circleColor: "#7340C8",
    circleText: "#ffffff",
  },
  {
    num: "03",
    title: "Koçun Belirleniyor",
    desc: "Sınav türüne ve hedefe en uygun koç seçiliyor. Deneme analizi yapılıyor, program hazırlanıyor.",
    icon: "🤝",
    circleColor: "#FF6B35",
    circleText: "#ffffff",
  },
  {
    num: "04",
    title: "Programın Başlar",
    desc: "İlk günden itibaren günlük plan, WhatsApp takibi ve haftalık görüşmelerle yola çıkıyorsun.",
    icon: "🚀",
    circleColor: "#1C1B8A",
    circleText: "#D8FF4F",
  },
];

const testimonials = [
  {
    quote:
      "Koçluk başlamadan önce ne yapacağımı bilmiyordum. İlk hafta planımı gördüğümde 'bu mümkün mü?' dedim. Birinci ayın sonunda netlerim fırladı.",
    name: "Şevval",
    role: "ÖĞRENCİ",
    badge: "+17 NET · 1. AY",
    badgeColor: "#FF6B35",
    avatar: "Ş",
    avatarBg: "#1C1B8A",
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
    badgeColor: "#7340C8",
    avatar: "S",
    avatarBg: "#7340C8",
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
    badgeColor: "#D8FF4F",
    avatar: "E",
    avatarBg: "#FF6B35",
    year: "TYT 2025",
    before: "78 NET",
    after: "96 NET",
  },
];

const compRows = [
  { feature: "Günlük takip", dershane: false, other: false, sozderece: true },
  { feature: "Deneme analizi", dershane: false, other: "bazen", sozderece: true },
  { feature: "Dinamik program", dershane: false, other: false, sozderece: true },
  { feature: "WhatsApp iletişim", dershane: false, other: "sınırlı", sozderece: true },
  { feature: "Veli bilgilendirmesi", dershane: false, other: false, sozderece: true },
  { feature: "Bire bir kişiselleştirme", dershane: false, other: "haftalık", sozderece: "günlük" },
];

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
    <motion.section {...fadeUp} className="bg-[#D8FF4F] py-14 px-5 relative overflow-hidden">
      <div className="absolute top-[-60px] right-[-40px] w-[260px] h-[260px] rounded-full bg-[#0D0A2E] opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-30px] w-[200px] h-[200px] rounded-full bg-[#1C1B8A] opacity-[0.06] pointer-events-none" />

      <div className="max-w-[900px] mx-auto relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            {settings.badge && (
              <span
                className="inline-block bg-[#0D0A2E] text-[#D8FF4F] font-fredoka font-bold text-xs px-4 py-1.5 rounded-full uppercase mb-4"
                style={{ letterSpacing: 3 }}
              >
                {settings.badge}
              </span>
            )}
            <h2
              className="font-fredoka font-bold m-0 text-[#0D0A2E] leading-[0.95]"
              style={{ fontSize: "clamp(32px, 3.5vw, 44px)", letterSpacing: -1 }}
            >
              {settings.title || "Erken Kayıt Fırsatını Kaçırma!"}
            </h2>
            <p className="font-nunito text-[#0D0A2E]/65 text-base mt-3 max-w-[500px]">
              {settings.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4 justify-center lg:justify-start">
              {settings.discountText && (
                <span className="bg-[#0D0A2E] text-[#D8FF4F] font-fredoka font-bold text-sm px-5 py-2 rounded-full">
                  {settings.discountText}
                </span>
              )}
              {daysLeft !== null && (
                <span className="bg-white/60 text-[#0D0A2E] font-fredoka font-bold text-sm px-5 py-2 rounded-full">
                  ⏳ {daysLeft} gün kaldı
                </span>
              )}
              {settings.note && (
                <span className="font-nunito text-[#0D0A2E]/60 text-sm">{settings.note}</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0D0A2E] text-[#D8FF4F] font-fredoka font-bold text-base px-9 py-4 rounded-full no-underline hover:bg-[#1C1B8A] transition-all shadow-[0_8px_30px_rgba(13,10,46,0.2)] hover:scale-105 whitespace-nowrap"
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
// NEDEN FARKLI — Dark, glassmorphism grid
// ══════════════════════════════════════════════
function WhyDifferentSection() {
  return (
    <section
      className="relative overflow-hidden py-24 px-5"
      style={{ background: "linear-gradient(160deg, #0D0A2E 0%, #1a0d3d 100%)" }}
    >
      <style>{`
        @keyframes whyOrb { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,20px)} }
      `}</style>
      <div style={{
        position: "absolute", top: -120, right: -100, width: 500, height: 500,
        borderRadius: "50%", background: "#4a1da0", filter: "blur(120px)", opacity: 0.22,
        animation: "whyOrb 14s ease-in-out infinite", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60, width: 300, height: 300,
        borderRadius: "50%", background: "#FF6B35", filter: "blur(100px)", opacity: 0.1,
        pointerEvents: "none",
      }} />

      <div className="max-w-[1200px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="mb-14">
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            NEDEN SÖZDERECE
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(40px, 4.5vw, 64px)", letterSpacing: -1, maxWidth: 720 }}
          >
            <span className="text-white">Diğerleri ne yapıyor, </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #D8FF4F" }}>biz ne yapıyoruz?</span>
          </h2>
          <p className="font-nunito text-white/50 text-base mt-5 max-w-[500px]">
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
              className="rounded-[24px] p-6"
              style={{
                background: c.accentBg,
                border: `1px solid ${c.border}`,
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {c.icon}
              </div>
              <h3 className="font-fredoka font-bold text-white text-lg mb-2">{c.title}</h3>
              <p className="font-nunito text-white/55 text-sm leading-relaxed">{c.desc}</p>
              <div
                className="inline-block mt-4 font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", color: c.accent }}
              >
                ✓ dahil
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-[#0D0A2E] text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#D8FF4F", boxShadow: "0 8px 28px rgba(216,255,79,0.3)" }}
          >
            Ücretsiz Görüşme Al →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// NASIL ÇALIŞIR — Light, gradient bağlantı çizgisi
// ══════════════════════════════════════════════
function HowItWorksSection() {
  return (
    <section
      id="nasil-calisir"
      className="bg-white py-24 px-5 overflow-hidden relative"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(216,255,79,0.07) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1100px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="text-center mb-16">
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            SÜREÇ
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-[#0D0A2E]">İlk adım </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #1C1B8A" }}>15 dakika.</span>
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-4 max-w-[460px] mx-auto">
            Geri kalanı biz hallederiz.
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-5 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1 relative">
          {/* Gradient bağlantı çizgisi */}
          <div
            className="absolute max-[900px]:hidden"
            style={{
              top: 22, left: "12.5%", right: "12.5%", height: 2,
              background: "linear-gradient(to right, #D8FF4F, #7340C8, #FF6B35, #1C1B8A)",
              opacity: 0.35, zIndex: 0,
            }}
          />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative"
              style={{ zIndex: 1 }}
            >
              <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(115,64,200,0.12)] transition-all h-full">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-5 font-fredoka font-bold text-base flex-shrink-0"
                  style={{
                    background: s.circleColor,
                    color: s.circleText,
                    boxShadow: `0 4px 14px ${s.circleColor}55`,
                  }}
                >
                  {s.num}
                </div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-fredoka font-bold text-[#0D0A2E] text-base mb-2">{s.title}</h3>
                <p className="font-nunito text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.25 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.instagram.com/sozderece/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-sm px-8 py-4 rounded-full no-underline transition-all hover:scale-105"
            style={{
              border: "1.5px solid rgba(28,27,138,0.2)",
              color: "#1C1B8A",
              background: "transparent",
            }}
          >
            @sozderece'ye git →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// TESTİMONYALS — Dark, glassmorphism kart
// ══════════════════════════════════════════════
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
    <section
      className="relative overflow-hidden py-24 px-5"
      style={{ background: "linear-gradient(160deg, #130B35 0%, #0D0A2E 100%)" }}
    >
      <div style={{
        position: "absolute", top: -80, left: -80, width: 400, height: 400,
        borderRadius: "50%", background: "#4a1da0", filter: "blur(100px)", opacity: 0.2,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, right: -40, width: 300, height: 300,
        borderRadius: "50%", background: "#FF6B35", filter: "blur(100px)", opacity: 0.1,
        pointerEvents: "none",
      }} />

      <div className="max-w-[720px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="text-center mb-12">
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            BAŞARI HİKAYELERİ
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-white">Gerçek öğrenciler, </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #D8FF4F" }}>gerçek sonuçlar.</span>
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] p-8 mb-8 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Badge */}
            <div
              className="absolute top-6 right-6 font-fredoka font-bold text-xs px-4 py-1.5 rounded-full"
              style={{
                background: t.badgeColor === "#D8FF4F"
                  ? "rgba(216,255,79,0.15)"
                  : `${t.badgeColor}22`,
                border: `1px solid ${t.badgeColor}44`,
                color: t.badgeColor === "#D8FF4F" ? "#D8FF4F" : t.badgeColor === "#7340C8" ? "#a78bfa" : "#FF9A7A",
              }}
            >
              {t.badge}
            </div>

            <div className="font-fredoka text-[56px] leading-none mb-2" style={{ color: "rgba(255,255,255,0.08)" }}>
              "
            </div>
            <blockquote className="font-nunito font-bold text-white/75 text-base leading-relaxed mb-6">
              "{t.quote}"
            </blockquote>

            {t.before && t.after && (
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex-1 rounded-2xl px-4 py-3 text-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="font-fredoka font-bold text-white/35 text-[10px] uppercase tracking-wide mb-1">Önce</div>
                  <div className="font-fredoka font-bold text-white text-xl">{t.before}</div>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-fredoka font-bold text-[#0D0A2E]"
                  style={{ background: "#D8FF4F" }}
                >
                  →
                </div>
                <div
                  className="flex-1 rounded-2xl px-4 py-3 text-center"
                  style={{ background: "rgba(216,255,79,0.12)", border: "1px solid rgba(216,255,79,0.25)" }}
                >
                  <div className="font-fredoka font-bold text-[#D8FF4F]/60 text-[10px] uppercase tracking-wide mb-1">Sonra</div>
                  <div className="font-fredoka font-bold text-[#D8FF4F] text-xl">{t.after}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-fredoka font-bold text-base flex-shrink-0"
                style={{ background: t.avatarBg }}
              >
                {t.avatar}
              </div>
              <div>
                <p className="font-fredoka font-bold text-white text-sm m-0">{t.name}</p>
                <p className="font-nunito text-white/40 text-xs m-0">{t.role} · {t.year} ★★★★★</p>
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
              className="h-2.5 rounded-full transition-all duration-300 border-none cursor-pointer"
              style={{
                width: i === current ? 24 : 10,
                background: i === current ? "#D8FF4F" : "rgba(216,255,79,0.2)",
              }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-nunito text-white/40 text-sm mb-4">
            Sıradaki başarı hikayesi senin olabilir.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-[#0D0A2E] text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#D8FF4F", boxShadow: "0 8px 28px rgba(216,255,79,0.25)" }}
          >
            Ücretsiz Görüşme Başlat →
          </a>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// KARŞILAŞTIRMA — Light, premium tablo
// ══════════════════════════════════════════════
function Cell({ val, highlight }) {
  if (val === true)
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full font-fredoka font-bold text-sm"
        style={
          highlight
            ? { background: "#D8FF4F", color: "#0D0A2E" }
            : { background: "#f1f0f8", color: "#1C1B8A" }
        }
      >
        ✓
      </span>
    );
  if (val === false)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full font-fredoka font-bold text-sm" style={{ background: "#f4f4f4", color: "#cbd5e1" }}>
        ✗
      </span>
    );
  return (
    <span
      className="font-fredoka font-bold text-sm px-2.5 py-1 rounded-full"
      style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35" }}
    >
      {val}
    </span>
  );
}

function ComparisonSection() {
  return (
    <section className="py-24 px-5" style={{ background: "#f4f2fa" }}>
      <div className="max-w-[900px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            KARŞILAŞTIRMA
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-[#0D0A2E]">Her koçluk </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #FF6B35" }}>aynı değil.</span>
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="overflow-x-auto rounded-[24px] shadow-[0_8px_40px_rgba(28,27,138,0.1)]"
          style={{ border: "1px solid rgba(28,27,138,0.08)" }}
        >
          <table className="w-full min-w-[540px] border-collapse">
            <thead>
              <tr>
                <th
                  className="text-left py-5 px-6 font-fredoka font-bold text-sm uppercase text-white/40"
                  style={{ background: "#0D0A2E", letterSpacing: 2, width: "40%" }}
                >
                  Özellik
                </th>
                <th
                  className="text-center py-5 px-4 font-fredoka font-bold text-sm uppercase text-white/40"
                  style={{ background: "#0D0A2E", letterSpacing: 2 }}
                >
                  Dershane
                </th>
                <th
                  className="text-center py-5 px-4 font-fredoka font-bold text-sm uppercase text-white/40"
                  style={{ background: "#0D0A2E", letterSpacing: 2 }}
                >
                  Başka Koçluk
                </th>
                <th
                  className="text-center py-5 px-4 font-fredoka font-bold text-sm uppercase text-[#0D0A2E]"
                  style={{ background: "#D8FF4F", letterSpacing: 2 }}
                >
                  Sözderece ✦
                </th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#faf9ff" }}>
                  <td className="py-4 px-6 font-nunito font-bold text-sm text-[#475569]" style={{ borderBottom: "1px solid rgba(28,27,138,0.06)" }}>
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center" style={{ borderBottom: "1px solid rgba(28,27,138,0.06)" }}>
                    <Cell val={row.dershane} highlight={false} />
                  </td>
                  <td className="py-4 px-4 text-center" style={{ borderBottom: "1px solid rgba(28,27,138,0.06)" }}>
                    <Cell val={row.other} highlight={false} />
                  </td>
                  <td className="py-4 px-4 text-center" style={{ borderBottom: "1px solid rgba(216,255,79,0.2)", background: "rgba(28,27,138,0.03)" }}>
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
            className="inline-flex items-center gap-2 font-fredoka font-bold text-[#0D0A2E] text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#D8FF4F", boxShadow: "0 6px 20px rgba(216,255,79,0.3)" }}
          >
            Ücretsiz Görüşme Başlat →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// SSS — Light, tutarlı accordion
// ══════════════════════════════════════════════
function FaqSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-white py-24 px-5">
      <div className="max-w-[800px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            SSS
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-[#0D0A2E]">Aklındaki </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #7340C8" }}>sorular.</span>
          </h2>
          <p className="font-nunito text-[#94a3b8] text-sm mt-4">
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
                  className="relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300"
                  style={{
                    border: isOpen ? "1px solid rgba(115,64,200,0.35)" : "1px solid rgba(28,27,138,0.08)",
                    background: isOpen ? "#f5f3ff" : "#faf9ff",
                    boxShadow: isOpen ? "0 0 0 3px rgba(115,64,200,0.06)" : "none",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px] transition-all duration-300"
                    style={{ background: isOpen ? "#7340C8" : "transparent" }}
                  />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className="font-fredoka font-bold text-base transition-colors duration-200 m-0"
                        style={{ color: isOpen ? "#7340C8" : "#0D0A2E" }}
                      >
                        {faq.q}
                      </h3>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-fredoka font-bold text-lg transition-all duration-300"
                        style={{
                          background: isOpen ? "#7340C8" : "rgba(28,27,138,0.07)",
                          color: isOpen ? "#D8FF4F" : "#94a3b8",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        +
                      </div>
                    </div>
                    <div
                      className="overflow-hidden transition-all duration-[400ms]"
                      style={{
                        maxHeight: isOpen ? 384 : 0,
                        opacity: isOpen ? 1 : 0,
                        marginTop: isOpen ? 12 : 0,
                      }}
                    >
                      <p className="font-nunito text-[#64748b] text-sm leading-relaxed m-0">
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
            className="inline-flex items-center gap-2 font-fredoka font-bold text-[#D8FF4F] text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#1C1B8A", boxShadow: "0 6px 20px rgba(28,27,138,0.25)" }}
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
// İLETİŞİM CTA — Dark, Hero orb stili
// ══════════════════════════════════════════════
function ContactCtaSection() {
  return (
    <section
      className="relative overflow-hidden py-24 px-5"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 60%, #3d1a80 0%, #1A0A40 55%, #0d0520 100%)" }}
    >
      <style>{`
        @keyframes ctaShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ctaPulse { 0%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 0 rgba(255,107,53,0.5)} 70%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 20px rgba(255,107,53,0)} 100%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 0 rgba(255,107,53,0)} }
      `}</style>

      <div style={{
        position: "absolute", top: -100, right: -80, width: 480, height: 480,
        borderRadius: "50%", background: "#4a1da0", filter: "blur(100px)", opacity: 0.3,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60, width: 320, height: 320,
        borderRadius: "50%", background: "#FF6B35", filter: "blur(100px)", opacity: 0.15,
        pointerEvents: "none",
      }} />

      <div className="max-w-[680px] mx-auto text-center relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp}>
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-6"
            style={{ letterSpacing: 4 }}
          >
            BAŞLA
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95] text-white mb-6"
            style={{ fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: -1 }}
          >
            Bir görüşme{" "}
            <span style={{
              background: "linear-gradient(90deg, #D8FF4F, #ffffff, #D8FF4F)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "ctaShimmer 3s linear infinite",
            }}>
              her şeyi
            </span>{" "}
            netleştirir.
          </h2>
          <p className="font-nunito font-bold text-white/50 text-base mb-10 max-w-[440px] mx-auto">
            15 dakika, sana özel değerlendirme. Taahhüt yok, baskı yok.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-white text-[18px] px-10 py-5 rounded-full no-underline transition-transform hover:scale-105"
            style={{
              background: "#FF6B35",
              animation: "ctaPulse 2.5s ease-out infinite",
              letterSpacing: "0.3px",
            }}
          >
            Ücretsiz Görüşme Başlat →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// STICKY MOBİL CTA — değiştirilmedi
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
            className="block w-full font-fredoka font-bold text-[#0D0A2E] text-base py-4 rounded-2xl text-center no-underline shadow-[0_-4px_24px_rgba(216,255,79,0.3)]"
            style={{ background: "#D8FF4F" }}
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
