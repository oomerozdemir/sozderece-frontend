import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Warp } from "@paper-design/shaders-react";
import { FaWhatsapp, FaChartLine, FaUsers, FaHandshake, FaSyncAlt, FaChartBar, FaCheckCircle } from "react-icons/fa";
import Seo from "../components/Seo";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import PricingSection from "../components/PricingSection";
import HeroSection from "../components/HeroSection";
import DiscountPopup from "../components/DiscountPopup";

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
// Her kartın shader rengi, kartın orijinal accent tonuyla aynı aile
// (lime/turuncu/mor) — WebGL sırt planı marka paletinden kopmuyor.
const shaderLime = {
  proportion: 0.32, softness: 0.85, distortion: 0.16, swirl: 0.65, swirlIterations: 9,
  shape: "dots", shapeScale: 0.1,
  colors: ["hsl(70,90%,32%)", "hsl(80,100%,60%)", "hsl(60,85%,38%)", "hsl(85,100%,72%)"],
};
const shaderLime2 = {
  proportion: 0.4, softness: 1.05, distortion: 0.2, swirl: 0.85, swirlIterations: 13,
  shape: "checks", shapeScale: 0.085,
  colors: ["hsl(75,95%,30%)", "hsl(88,100%,58%)", "hsl(65,85%,36%)", "hsl(90,100%,70%)"],
};
const shaderOrange = {
  proportion: 0.38, softness: 1.0, distortion: 0.19, swirl: 0.8, swirlIterations: 11,
  shape: "checks", shapeScale: 0.09,
  colors: ["hsl(14,100%,38%)", "hsl(30,100%,58%)", "hsl(8,90%,42%)", "hsl(36,100%,70%)"],
};
const shaderOrange2 = {
  proportion: 0.34, softness: 0.9, distortion: 0.15, swirl: 0.7, swirlIterations: 8,
  shape: "dots", shapeScale: 0.12,
  colors: ["hsl(18,100%,36%)", "hsl(34,100%,60%)", "hsl(12,90%,40%)", "hsl(40,100%,72%)"],
};
const shaderPurple = {
  proportion: 0.36, softness: 0.95, distortion: 0.17, swirl: 0.75, swirlIterations: 10,
  shape: "dots", shapeScale: 0.11,
  colors: ["hsl(255,90%,32%)", "hsl(272,100%,64%)", "hsl(246,85%,38%)", "hsl(266,100%,74%)"],
};
const shaderPurple2 = {
  proportion: 0.44, softness: 1.1, distortion: 0.21, swirl: 0.9, swirlIterations: 14,
  shape: "checks", shapeScale: 0.1,
  colors: ["hsl(250,90%,34%)", "hsl(268,100%,66%)", "hsl(258,85%,40%)", "hsl(262,100%,76%)"],
};

const whyCards = [
  {
    icon: <FaWhatsapp />,
    title: "Gün Boyu Ulaşılabilir Koç",
    desc: "Sabit haftada bir görüşmeyle sınırlı değiliz. Günün her saatinde arayabilir, görüntülü konuşabilir, yazabilirsin — koçun gerçekten cevap verir.",
    accent: "#D8FF4F",
    shader: shaderLime,
  },
  {
    icon: <FaChartLine />,
    title: "Anlık Deneme Analizi",
    desc: "Her deneme sonrası 24 saat içinde program yeniden yapılandırılıyor. Aynı hatayı bir daha yapmazsın.",
    accent: "#FF6B35",
    shader: shaderOrange,
  },
  {
    icon: <FaUsers />,
    title: "Veli Dahil Süreç",
    desc: "'Ders çalış' demek zorunda kalmıyorsunuz. Kötü polis olmayı biz üstleniyoruz: haftalık rapor, aylık görüşme.",
    accent: "#a78bfa",
    shader: shaderPurple,
  },
  {
    icon: <FaHandshake />,
    title: "Koç Uyum Garantisi",
    desc: "Koçunu beğenmezsen değiştiriyoruz. Memnuniyetin bizim önceliğimiz.",
    accent: "#D8FF4F",
    shader: shaderLime2,
  },
  {
    icon: <FaSyncAlt />,
    title: "Dinamik Program",
    desc: "Sabit PDF değil, her denemeden sonra güncellenen canlı program. Strateji durgun kalmaz, sen de kalmıyorsun.",
    accent: "#FF6B35",
    shader: shaderOrange2,
  },
  {
    icon: <FaChartBar />,
    title: "Ölçülebilir Sonuçlar",
    desc: "Ortalama +17.5 net artışı ilk ayda. Boş vaat değil, gerçek hikayeler ve gerçek rakamlar.",
    accent: "#a78bfa",
    shader: shaderPurple2,
  },
];

const steps = [
  {
    num: "01",
    title: "Görüşme Talep Et",
    desc: "Formu doldur ya da WhatsApp'tan yaz. 15 dakika içinde dönüyoruz, hiçbir taahhüt yok.",
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
    stars: 5,
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
    stars: 4,
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
    stars: 5,
  },
];

const compRows = [
  { feature: "Koça ulaşım", dershane: false, other: "haftada 1 görüşme", sozderece: "gün boyu ara/yaz" },
  { feature: "Günlük takip", dershane: false, other: false, sozderece: true },
  { feature: "Deneme analizi", dershane: false, other: "bazen", sozderece: true },
  { feature: "Dinamik program", dershane: false, other: false, sozderece: true },
  { feature: "WhatsApp iletişim", dershane: false, other: "sınırlı saatte", sozderece: true },
  { feature: "Veli bilgilendirmesi", dershane: false, other: false, sozderece: true },
  { feature: "Bire bir kişiselleştirme", dershane: false, other: "haftalık", sozderece: "günlük" },
];

const faqs = [
  {
    q: "İptal ve iade hakkı var mı?",
    a: "Evet. Hizmet başlamadan önce tam iade yapılır. Hizmet başladıktan sonra 14 gün içinde iptal talebinde bulunabilirsiniz. Detaylar için iade politikamıza göz atın.",
  },
  {
    q: "Koç değişikliği yapabilir miyim?",
    a: "Evet, herhangi bir anda koçunuzu değiştirebilirsiniz. Memnuniyetiniz bizim önceliğimiz. Yeni koçla tanışma görüşmesi tamamen ücretsizdir.",
  },
  {
    q: "Haftada kaç kez görüşüyoruz?",
    a: "Sabit, tek bir haftalık görüşmeyle sınırlı değiliz. Günün her saatinde arayabilir, görüntülü görüşebilir ve yazabilirsiniz. Bize geçen öğrencilerin en çok söylediği şey şu oluyor: eski koçluklarında haftada bir görüşüp bir daha ulaşamadıkları. Bizde koç gerçekten cevap verir.",
  },
  {
    q: "Belirli bir görüşme günüm/saatim mi var?",
    a: "Hayır, sizi tek bir güne sıkıştırmıyoruz. İhtiyaç duyduğunuz an arayabilir ya da yazabilirsiniz — koçunuz günün her saatinde ulaşılabilir.",
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
    a: "Hayır. Gerektiğinde 10 dakika sürebilir, gerektiğinde yarım saat. Kısıtlı bir 'haftalık görüşme penceresi'ne sıkışmıyoruz, ihtiyaca göre konuşuyoruz.",
  },
  {
    q: "LGS için veli ne kadar dahil oluyor?",
    a: "Haftalık gelişim raporu ve aylık veli görüşmesi yapıyoruz. Çocuğunuzla olan ilişkiyi korumak bizim işimiz, 'kötü polis' olmayı biz üstleniyoruz.",
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
    a: "Bize gelen öğrencilerin en çok anlattığı şey şu: eski koçluğunda haftada bir görüntülü görüşüp o hafta bir daha koçuna ulaşamamak. Bizde koç gün boyu ulaşılabilir — arayabilir, görüntülü görüşebilir, yazabilirsin. Buna ek olarak günlük takip, her deneme sonrası anlık analiz, dinamik program güncellemesi ve haftalık veli raporunu bir arada sunan çok az koçluk var.",
  },
];

// ══════════════════════════════════════════════
// NEDEN FARKLI — Dark, glassmorphism grid
// ══════════════════════════════════════════════
function WhyDifferentSection() {
  return (
    <section className="relative overflow-hidden py-24 px-5 bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(216,255,79,0.08) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1200px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="mb-14">
          <div
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            NEDEN SÖZDERECE
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(40px, 4.5vw, 64px)", letterSpacing: -1, maxWidth: 720 }}
          >
            <span className="text-page-dark">Diğerleri ne yapıyor, </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #1C1B8A" }}>biz ne yapıyoruz?</span>
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-5 max-w-[500px]">
            Dershane konu anlatır. Koçun görevi evdeki boşluğu kapatmak, her gün ve somut olarak.
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
              className="group relative rounded-[24px] overflow-hidden h-80 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0">
                <Warp
                  style={{ width: "100%", height: "100%" }}
                  scale={1}
                  rotation={0}
                  speed={0.8}
                  {...c.shader}
                />
              </div>

              <div
                className="relative z-10 h-full flex flex-col p-6"
                style={{ background: "rgba(10,8,30,0.74)" }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4 text-white"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  {c.icon}
                </div>
                <h3 className="font-fredoka font-bold text-white text-lg mb-2">{c.title}</h3>
                <p className="font-nunito text-white/70 text-sm leading-relaxed flex-grow">{c.desc}</p>
                <div
                  className="inline-flex items-center gap-1.5 mt-4 font-fredoka font-bold text-[11px] px-2.5 py-1 rounded-full self-start"
                  style={{ background: "rgba(255,255,255,0.1)", color: c.accent }}
                >
                  <FaCheckCircle size={10} /> dahil
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/paket-detay"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-page-dark text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#D8FF4F", boxShadow: "0 8px 28px rgba(216,255,79,0.3)" }}
          >
            Paketleri İncele →
          </Link>
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
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            SÜREÇ
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-page-dark">İlk adım </span>
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
                <h3 className="font-fredoka font-bold text-page-dark text-base mb-2">{s.title}</h3>
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
// Rozet/renk ailesi (koyu zemindeki parlak tonlar yerine, beyaz zeminde
// okunaklı pastel bg + koyu metin ikilisi — PackageDetail'deki BADGE_COLORS
// deseniyle aynı mantık).
const testimonialBadgeStyle = (badgeColor) => {
  if (badgeColor === "#D8FF4F") return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
  if (badgeColor === "#7340C8") return { bg: "#ede9fe", text: "#6d28d9", border: "#ddd6fe" };
  return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
};

function TestimonialsColumn({ items, duration, className }) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-5"
      >
        {[0, 1].map((dup) => (
          <React.Fragment key={dup}>
            {items.map((t, i) => {
              const badge = testimonialBadgeStyle(t.badgeColor);
              return (
                <div
                  key={`${dup}-${i}`}
                  className="rounded-[24px] p-6 w-[300px] flex-shrink-0 bg-white border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                >
                  <div
                    className="inline-block font-fredoka font-bold text-[11px] px-3 py-1 rounded-full mb-4"
                    style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}
                  >
                    {t.badge}
                  </div>

                  <p className="font-nunito text-[#475569] text-sm leading-relaxed mb-4">"{t.quote}"</p>

                  {t.before && t.after && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 rounded-xl px-3 py-2 text-center bg-[#f8fafc]">
                        <div className="font-fredoka font-bold text-[#94a3b8] text-[9px] uppercase tracking-wide">Önce</div>
                        <div className="font-fredoka font-bold text-page-dark text-base">{t.before}</div>
                      </div>
                      <span className="text-page-navy text-xs">→</span>
                      <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: "#f0fdf4" }}>
                        <div className="font-fredoka font-bold text-[#166534]/60 text-[9px] uppercase tracking-wide">Sonra</div>
                        <div className="font-fredoka font-bold text-[#166534] text-base">{t.after}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-4 border-t border-[#f1f5f9]">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-fredoka font-bold text-sm flex-shrink-0"
                      style={{ background: t.avatarBg }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-fredoka font-bold text-page-dark text-sm m-0">{t.name}</p>
                      <p className="font-nunito text-[#94a3b8] text-[11px] m-0 flex items-center gap-1.5">
                        <span>{t.role} · {t.year}</span>
                        <span style={{ color: badge.text, letterSpacing: 1 }}>
                          {"★".repeat(t.stars || 5)}
                          <span style={{ color: "#e2e8f0" }}>{"★".repeat(5 - (t.stars || 5))}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

function TestimonialsSection() {
  const col1 = testimonials;
  const col2 = [testimonials[1], testimonials[2], testimonials[0]];
  const col3 = [testimonials[2], testimonials[0], testimonials[1]];

  return (
    <section className="relative overflow-hidden py-24 px-5 bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(216,255,79,0.08) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1100px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="text-center mb-12">
          <div
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            BAŞARI HİKAYELERİ
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-page-dark">Gerçek öğrenciler, </span>
            <span style={{ color: "transparent", WebkitTextStroke: "2.5px #1C1B8A" }}>gerçek sonuçlar.</span>
          </h2>
        </motion.div>

        <div
          className="flex justify-center gap-5 mb-10 max-h-[560px] overflow-hidden"
          style={{ maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}
        >
          <TestimonialsColumn items={col1} duration={22} />
          <TestimonialsColumn items={col2} duration={28} className="hidden md:block" />
          <TestimonialsColumn items={col3} duration={25} className="hidden lg:block" />
        </div>

        <div className="text-center">
          <p className="font-nunito text-[#64748b] text-sm mb-4">
            Sıradaki başarı hikayesi senin olabilir.
          </p>
          <Link
            to="/ucretsiz-on-gorusme"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-page-dark text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#D8FF4F", boxShadow: "0 8px 28px rgba(216,255,79,0.25)" }}
          >
            Yol Haritanızı Çizelim →
          </Link>
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
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            KARŞILAŞTIRMA
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-page-dark">Her koçluk </span>
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
                  className="text-center py-5 px-4 font-fredoka font-bold text-sm uppercase text-page-dark"
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
          <Link
            to="/paket-detay"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-page-dark text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "#D8FF4F", boxShadow: "0 6px 20px rgba(216,255,79,0.3)" }}
          >
            Fiyatları Gör →
          </Link>
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
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            SSS
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4vw, 56px)", letterSpacing: -1 }}
          >
            <span className="text-page-dark">Aklındaki </span>
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
            className="inline-flex items-center gap-2 font-fredoka font-bold text-lime text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
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
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-6"
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
          <Link
            to="/ucretsiz-on-gorusme"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-white text-[18px] px-10 py-5 rounded-full no-underline transition-transform hover:scale-105"
            style={{
              background: "#FF6B35",
              animation: "ctaPulse 2.5s ease-out infinite",
              letterSpacing: "0.3px",
            }}
          >
            Ön Analiz Randevusu Oluştur →
          </Link>
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
          <Link
            to="/ucretsiz-on-gorusme"
            className="block w-full font-fredoka font-bold text-page-dark text-base py-4 rounded-2xl text-center no-underline shadow-[0_-4px_24px_rgba(216,255,79,0.3)]"
            style={{ background: "#D8FF4F" }}
          >
            Ücretsiz Ön Görüşme Ayarla →
          </Link>
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
        title="YKS & LGS Online Öğrenci Koçluğu"
        description="Günlük takip, dinamik program ve veli raporuyla YKS ve LGS sınavlarına hazırlanın. Sözderece Koçluk ile her gün yanındayız."
        canonical="/"
      />

      <Navbar />
      <DiscountPopup />
      <HeroSection />
      <PricingSection />
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
