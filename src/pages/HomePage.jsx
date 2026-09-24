import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Warp } from "@paper-design/shaders-react";
import { FaWhatsapp, FaChartLine, FaUsers, FaRoute, FaTasks, FaSyncAlt, FaBoxOpen, FaClipboardList } from "react-icons/fa";
import { scrollToId } from "../utils/scrollToId";
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

// Sayfa içi bölüme yumuşak kaydıran CTA (ana yolculuk: paketlere in).
function ScrollCta({ to, className = "", style, children }) {
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(to);
      }}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}

// ══════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════
// Her kartın shader rengi, kartın orijinal accent tonuyla aynı aile
// (lime/turuncu/mor) — WebGL sırt planı marka paletinden kopmuyor.
// 2026 rebrand: üç shader de aynı turkuaz/lacivert aileden — sadece
// açıklık/doygunluk farklı, marka paletinden kopmuyorlar.
const shaderDark = {
  proportion: 0.36, softness: 0.95, distortion: 0.17, swirl: 0.75, swirlIterations: 10,
  shape: "dots", shapeScale: 0.11,
  colors: ["hsl(202,45%,12%)", "hsl(200,40%,26%)", "hsl(205,50%,17%)", "hsl(198,35%,33%)"],
};
const shaderBrand = {
  proportion: 0.32, softness: 0.85, distortion: 0.16, swirl: 0.65, swirlIterations: 9,
  shape: "dots", shapeScale: 0.1,
  colors: ["hsl(186,80%,22%)", "hsl(188,75%,42%)", "hsl(184,85%,27%)", "hsl(190,70%,50%)"],
};
const shaderBrandHover = {
  proportion: 0.38, softness: 1.0, distortion: 0.19, swirl: 0.8, swirlIterations: 11,
  shape: "checks", shapeScale: 0.09,
  colors: ["hsl(187,80%,18%)", "hsl(185,70%,38%)", "hsl(189,85%,23%)", "hsl(183,60%,46%)"],
};

// Sözderece Rota Sistemi — ana sayfada yalnızca 3 temel adım (mor=Kişisel
// Rota, yeşil=İlerleme Takibi, turuncu=Dinamik Planlama). Deneme analizi, koç
// desteği ve veli bilgilendirmesi küçük destek unsurları olarak altta.
const routeSteps = [
  {
    num: "01",
    icon: <FaRoute />,
    title: "Kişisel Rota",
    desc: "Nereden başlayacağın ve neye öncelik vereceğin netleşir.",
    accent: "var(--color-dark)",
    shader: shaderDark,
  },
  {
    num: "02",
    icon: <FaTasks />,
    title: "İlerleme Takibi",
    desc: "Programın uygulanması ve gelişimin düzenli takip edilir.",
    accent: "var(--color-brand)",
    shader: shaderBrand,
  },
  {
    num: "03",
    icon: <FaSyncAlt />,
    title: "Dinamik Planlama",
    desc: "Sonuçlarına göre çalışma rotan güncellenir.",
    accent: "var(--color-brand-hover)",
    shader: shaderBrandHover,
  },
];

const supportItems = [
  { icon: <FaChartLine />, title: "Deneme Analizi", desc: "Netlerin, eksiklere ve önceliklere dönüşür." },
  { icon: <FaWhatsapp />, title: "Koç Desteği", desc: "Takıldığında koçuna ulaşırsın." },
  { icon: <FaUsers />, title: "Veli Bilgilendirmesi", desc: "Veli süreçte karanlıkta kalmaz." },
];

// "Koçluğa Nasıl Başlarsın?" — gerçek operasyon: satın alma → başlangıç formu →
// koç WhatsApp'tan yazar → program hazırlanıp paylaşılır. Henüz hazır olmayan
// panel özellikleri burada vaat edilmiyor.
const steps = [
  {
    num: "01",
    title: "Paketini Seç",
    desc: "YKS veya LGS için sana uygun paketi incele.",
    icon: <FaBoxOpen />,
    circleColor: "var(--color-brand)",
    circleText: "#ffffff",
  },
  {
    num: "02",
    title: "Seni Tanıyalım",
    desc: "Kayıttan sonra kısa başlangıç formunu doldur.",
    icon: <FaClipboardList />,
    circleColor: "var(--color-dark)",
    circleText: "#ffffff",
  },
  {
    num: "03",
    title: "Koçunla Tanış",
    desc: "Koçun seninle WhatsApp üzerinden iletişime geçsin.",
    icon: <FaWhatsapp />,
    circleColor: "var(--color-brand)",
    circleText: "#ffffff",
  },
  {
    num: "04",
    title: "İlk Rotan Hazırlansın",
    desc: "Kişisel çalışma programın hazırlanır ve koçluk sürecin başlar.",
    icon: <FaRoute />,
    circleColor: "var(--color-dark)",
    circleText: "#ffffff",
  },
];

const testimonials = [
  {
    quote:
      "Koçluk başlamadan önce ne yapacağımı bilmiyordum. İlk hafta planımı gördüğümde 'bu mümkün mü?' dedim. Birinci ayın sonunda netlerim fırladı.",
    name: "Şevval",
    role: "ÖĞRENCİ",
    badge: "+17 NET · 1. AY",
    badgeColor: "var(--color-brand)",
    avatar: "Ş",
    avatarBg: "var(--color-brand)",
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
    badgeColor: "var(--color-dark)",
    avatar: "S",
    avatarBg: "var(--color-dark)",
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
    badgeColor: "var(--color-brand)",
    avatar: "E",
    avatarBg: "var(--color-brand)",
    year: "TYT 2025",
    before: "78 NET",
    after: "96 NET",
    stars: 5,
  },
  {
    quote:
      "Zeynep Hanım öyle iyi ilgilendi ki bir ayda 7. sınıf eksiklerinin çoğunu kapattık. Sekizinci sınıfta çok daha güzelini bekliyoruz.",
    name: "Nermin H.",
    role: "VELİ",
    badge: "LGS 2027",
    badgeColor: "var(--color-dark)",
    avatar: "N",
    avatarBg: "var(--color-dark)",
    year: "7. Sınıf Velisi",
    before: null,
    after: null,
    stars: 5,
  },
  {
    quote: "Koçumdan çok memnunum, bana ders çalışmayı sevdirdi.",
    name: "Nisa",
    role: "ÖĞRENCİ",
    badge: "YKS 2027",
    badgeColor: "var(--color-brand)",
    avatar: "N",
    avatarBg: "var(--color-brand)",
    year: "YKS 2027",
    before: null,
    after: null,
    stars: 5,
  },
  {
    quote:
      "Ders çalışan biri değilim ama beni gerçekten ilerletti. Oldukça verimli ilerliyorum, iyi ki sizsiniz.",
    name: "Eylül",
    role: "ÖĞRENCİ",
    badge: "YKS 2027",
    badgeColor: "var(--color-dark)",
    avatar: "E",
    avatarBg: "var(--color-dark)",
    year: "YKS 2027",
    before: null,
    after: null,
    stars: 5,
  },
  {
    quote:
      "Koçum ve süreçten gerçekten memnunum. İlgi alaka sürekli böyle devam edecekse çok beğendim.",
    name: "Öykü",
    role: "ÖĞRENCİ",
    badge: "YKS 2027",
    badgeColor: "var(--color-brand)",
    avatar: "Ö",
    avatarBg: "var(--color-brand)",
    year: "YKS 2027",
    before: null,
    after: null,
    stars: 5,
  },
];

// Dershane sütunu bilinçli olarak kaldırıldı — dershane doğrudan bir rakip
// değil, farklı bir ihtiyacı karşılıyor (konu anlatımı vs. süreç yönetimi).
// Karşılaştırma artık "kim daha çok özelliğe sahip" değil, "süreç nasıl
// yönetiliyor" sorusuna odaklanıyor; "klasik yaklaşım" sütunu da kesin bir
// iddia değil, genel bir yaklaşım modeli olarak yazıldı.
const compRows = [
  { label: "Çalışma planı", klasik: "Genel / sabit plan", sozderece: "Öğrenciye göre oluşturulan rota" },
  { label: "Uygulama", klasik: "Plan öğrenciye bırakılır", sozderece: "İlerleme düzenli takip edilir" },
  { label: "Plan aksadığında", klasik: "Aynı plana devam", sozderece: "Rota yeniden düzenlenir" },
  { label: "Denemeler", klasik: "Sonuç/net görülür", sozderece: "Analiz edilip plana yansıtılır" },
  { label: "Koç desteği", klasik: "Belirli görüşmeler", sozderece: "Süreç boyunca ulaşılabilir destek" },
  { label: "Veli iletişimi", klasik: "Sürece göre değişir", sozderece: "Düzenli bilgilendirme" },
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
    a: "Sabit, tek bir haftalık görüşmeyle sınırlı değiliz. Günün her saatinde arayabilir, görüntülü görüşebilir ve yazabilirsiniz. Bize geçen öğrencilerin en çok söylediği şey şu oluyor: eski koçluklarında haftada bir görüşüp bir daha ulaşamadıkları. Bizde koç gerçekten cevap verir.",
  },
  {
    q: "Belirli bir görüşme günüm/saatim mi var?",
    a: "Hayır, sizi tek bir güne sıkıştırmıyoruz. İhtiyaç duyduğunuz an arayabilir ya da yazabilirsiniz — koçunuz günün her saatinde ulaşılabilir.",
  },
  {
    q: "Satın aldım, şimdi ne olacak?",
    a: "Ödemenden sonra kısa bir başlangıç formunu dolduruyorsun. Ardından koçun seninle WhatsApp üzerinden iletişime geçiyor, kişisel çalışma programın hazırlanıp seninle paylaşılıyor ve takip WhatsApp üzerinden devam ediyor.",
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
// SÖZDERECE ROTA SİSTEMİ — 3 ana adım + 3 destek unsuru
// ══════════════════════════════════════════════
function WhyDifferentSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-5 bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,124,136,0.08) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1100px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="mb-10 md:mb-12">
          <div
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-4"
            style={{ letterSpacing: 4 }}
          >
            SÖZDERECE ROTA SİSTEMİ
          </div>
          <h2
            className="font-fredoka font-bold m-0 leading-[0.95]"
            style={{ fontSize: "clamp(36px, 4.5vw, 60px)", letterSpacing: -1, maxWidth: 720 }}
          >
            <span className="text-page-dark">Bir Program Verip</span>
            <br />
            <span style={{ color: "var(--color-brand)" }}>Seni Yalnız Bırakmıyoruz.</span>
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-5 max-w-[500px]">
            Çalışma rotanı oluşturuyor, ilerlemeni takip ediyor ve sonuçlarına göre planını sürekli güncelliyoruz.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-5 max-[820px]:grid-cols-1">
          {routeSteps.map((c, i) => (
            <motion.div
              key={c.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative rounded-[24px] overflow-hidden"
            >
              <div className="absolute inset-0">
                <Warp style={{ width: "100%", height: "100%" }} scale={1} rotation={0} speed={0.8} {...c.shader} />
              </div>
              <div
                className="relative z-10 flex flex-col p-6 min-h-[240px] max-[820px]:min-h-[170px]"
                style={{ background: "rgba(10,8,30,0.74)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-fredoka font-bold text-[34px] leading-none" style={{ color: c.accent }}>{c.num}</span>
                  <span
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl text-white"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    {c.icon}
                  </span>
                </div>
                <h3 className="font-fredoka font-bold text-white text-xl mb-2">{c.title}</h3>
                <p className="font-nunito text-white/75 text-[15px] leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="font-fredoka font-bold text-[13px] tracking-[0.06em] mt-6 text-center">
          <span style={{ color: "var(--color-dark)" }}>Kişisel Rota</span>{" "}
          <span style={{ color: "#cbd5e1" }}>→</span>{" "}
          <span style={{ color: "var(--color-brand)" }}>İlerleme Takibi</span>{" "}
          <span style={{ color: "#cbd5e1" }}>→</span>{" "}
          <span style={{ color: "var(--color-brand-hover)" }}>Dinamik Planlama</span>
        </p>

        <motion.div {...fadeUp} className="grid grid-cols-3 gap-3 mt-8 max-[820px]:grid-cols-1">
          {supportItems.map((it) => (
            <div key={it.title} className="flex items-start gap-3 rounded-2xl px-4 py-3.5" style={{ background: "var(--color-brand-light)" }}>
              <span className="text-lg mt-0.5" style={{ color: "var(--color-brand)" }}>{it.icon}</span>
              <div>
                <div className="font-fredoka font-bold text-page-dark text-[15px] leading-tight">{it.title}</div>
                <div className="font-nunito text-[#64748b] text-[13px] leading-snug mt-0.5">{it.desc}</div>
              </div>
            </div>
          ))}
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
      className="bg-white py-16 md:py-24 px-5 overflow-hidden relative"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,124,136,0.07) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1100px] mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div {...fadeUp} className="text-center mb-12 md:mb-16">
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
            <span className="text-page-dark">Koçluğa Nasıl </span>
            <span style={{ color: "var(--color-brand)" }}>Başlarsın?</span>
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-4 max-w-[460px] mx-auto">
            Satın aldıktan sonra seni ne beklediği net: dört adımda koçluk sürecin başlıyor.
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-5 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1 relative">
          {/* Gradient bağlantı çizgisi */}
          <div
            className="absolute max-[900px]:hidden"
            style={{
              top: 22, left: "12.5%", right: "12.5%", height: 2,
              background: "linear-gradient(to right, var(--color-brand), var(--color-dark), var(--color-brand-hover), var(--color-dark))",
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
              <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(14,124,136,0.14)] transition-all h-full max-[580px]:flex max-[580px]:items-start max-[580px]:gap-4 max-[580px]:p-5">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-5 max-[580px]:mb-0 font-fredoka font-bold text-base flex-shrink-0"
                  style={{
                    background: s.circleColor,
                    color: s.circleText,
                    boxShadow: `0 4px 14px ${s.circleColor}55`,
                  }}
                >
                  {s.num}
                </div>
                <div>
                  <div className="text-xl mb-3 max-[580px]:hidden" style={{ color: "var(--color-brand)" }}>{s.icon}</div>
                  <h3 className="font-fredoka font-bold text-page-dark text-base mb-1.5">{s.title}</h3>
                  <p className="font-nunito text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.25 }}
          className="text-center mt-12"
        >
          <ScrollCta
            to="paketler"
            className="inline-flex items-center gap-2 text-white font-fredoka font-bold text-base px-9 py-4 rounded-full no-underline transition-transform hover:scale-105 max-[480px]:w-full max-[480px]:justify-center"
            style={{ background: "var(--color-brand)", boxShadow: "0 8px 28px rgba(14,124,136,0.3)" }}
          >
            Paketleri &amp; Fiyatları Gör →
          </ScrollCta>
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
const testimonialBadgeStyle = () => ({ bg: "var(--color-brand-light)", text: "var(--color-brand)", border: "#C9E9EB" });

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

// Diziyi n kadar sola kaydırır — her sütun aynı yorumları farklı bir
// sırayla gösterip tekdüzeliği kırar (dizi uzunluğu değişse de çalışır).
const rotate = (arr, n) => arr.slice(n % arr.length).concat(arr.slice(0, n % arr.length));

function TestimonialsSection() {
  const col1 = testimonials;
  const col2 = rotate(testimonials, Math.ceil(testimonials.length / 3));
  const col3 = rotate(testimonials, Math.ceil((testimonials.length * 2) / 3));

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-5 bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,124,136,0.08) 0%, transparent 70%)" }}
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
            <span style={{ color: "var(--color-brand)" }}>gerçek sonuçlar.</span>
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
          <ScrollCta
            to="paketler"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-white text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform max-[480px]:w-full max-[480px]:justify-center"
            style={{ background: "var(--color-brand)", boxShadow: "0 8px 28px rgba(14,124,136,0.25)" }}
          >
            Paketleri &amp; Fiyatları Gör →
          </ScrollCta>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// YKS / LGS DETAY SAYFALARINA YÖNLENDİRME
// ══════════════════════════════════════════════
const trackCards = [
  {
    to: "/yks-yolculugu",
    label: "YKS KOÇLUĞU",
    color: "var(--color-dark)",
    title: "YKS'ye hazırlanıyorsan",
    desc: "Ne çalışacağını bilmek, ilerlemeni takip etmek ve rotanı sonuçlarına göre güncellemek isteyen öğrenciler için.",
  },
  {
    to: "/lgs-hazirlik",
    label: "LGS KOÇLUĞU",
    color: "var(--color-brand)",
    title: "LGS'ye hazırlanıyorsan",
    desc: "Öğrencinin çalışma düzenini kuran, velinin de süreçten düzenli haberdar olduğu bir koçluk isteyenler için.",
  },
];

function TrackLinksSection() {
  return (
    <section className="bg-white py-14 md:py-20 px-5">
      <div className="max-w-[900px] mx-auto">
        <motion.div {...fadeUp} className="text-center mb-8">
          <h2 className="font-fredoka font-bold text-page-dark m-0" style={{ fontSize: "clamp(26px, 3vw, 38px)", letterSpacing: -0.5 }}>
            Sana uygun koçluğu ayrıntılı incele
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
          {trackCards.map((c) => (
            <motion.div
              key={c.to}
              {...fadeUp}
              className="rounded-[24px] p-7 flex flex-col"
              style={{ border: "1px solid #ECEAF5", boxShadow: "0 8px 26px rgba(23,37,45,0.08)" }}
            >
              <span className="font-fredoka font-bold text-[11px] uppercase mb-3" style={{ color: c.color, letterSpacing: 2 }}>
                {c.label}
              </span>
              <h3 className="font-fredoka font-bold text-page-dark text-xl mb-2">{c.title}</h3>
              <p className="font-nunito text-[#64748b] text-[15px] leading-relaxed flex-grow mb-5">{c.desc}</p>
              <Link
                to={c.to}
                className="self-start font-fredoka font-bold text-[15px] px-6 py-3 rounded-full no-underline transition-transform hover:scale-105"
                style={{ background: c.color, color: "#FFFFFF" }}
              >
                Paketi İncele →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// KARŞILAŞTIRMA — Light, premium tablo
// ══════════════════════════════════════════════
function ComparisonSection() {
  return (
    <section className="py-16 md:py-24 px-5" style={{ background: "var(--color-brand-light)" }}>
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
            style={{ fontSize: "clamp(34px, 4vw, 52px)", letterSpacing: -1 }}
          >
            <span className="text-page-dark">Bir Program Almakla,</span>
            <br />
            <span style={{ color: "var(--color-brand)" }}>Bir Süreci Yönetmek Aynı Şey Değil.</span>
          </h2>
          <p className="font-nunito text-[#64748b] text-base mt-5 max-w-[560px] mx-auto">
            Sözderece'de amaç yalnızca program hazırlamak değil; rotanı belirlemek, ilerlemeni takip etmek ve gerektiğinde planını güncellemek.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="overflow-x-auto rounded-[24px] shadow-[0_8px_40px_rgba(23,37,45,0.12)]"
          style={{ border: "1px solid rgba(23,37,45,0.1)" }}
        >
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr>
                <th
                  className="text-left py-5 px-6 font-fredoka font-bold text-sm uppercase text-white/40"
                  style={{ background: "var(--color-dark)", letterSpacing: 2, width: "34%" }}
                >
                  Süreç
                </th>
                <th
                  className="text-center py-5 px-4 font-fredoka font-bold text-sm uppercase text-white/40"
                  style={{ background: "var(--color-dark)", letterSpacing: 2 }}
                >
                  Klasik Yaklaşım
                </th>
                <th
                  className="text-center py-5 px-4 font-fredoka font-bold text-sm uppercase text-white"
                  style={{ background: "var(--color-brand)", letterSpacing: 2 }}
                >
                  Sözderece Rota Sistemi
                </th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#F7FBFB" }}>
                  <td className="py-4 px-6 font-nunito font-bold text-sm text-[#475569]" style={{ borderBottom: "1px solid rgba(23,37,45,0.07)" }}>
                    {row.label}
                  </td>
                  <td className="py-4 px-4 text-center" style={{ borderBottom: "1px solid rgba(23,37,45,0.07)" }}>
                    <span className="font-nunito font-semibold text-sm text-[#94a3b8]">{row.klasik}</span>
                  </td>
                  <td className="py-4 px-4 text-center" style={{ borderBottom: "1px solid rgba(14,124,136,0.15)", background: "rgba(14,124,136,0.04)" }}>
                    <span
                      className="inline-block font-fredoka font-bold text-sm px-3 py-1.5 rounded-full"
                      style={{ background: "#FFFFFF", color: "var(--color-brand)" }}
                    >
                      {row.sozderece}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Ana yaklaşım — tablonun tamamının anlattığı şeyi tek satıra
            indiren, görsel olarak büyütülmüş kapanış karşılaştırması. */}
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
    <section className="bg-white py-16 md:py-24 px-5">
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
            <span style={{ color: "var(--color-brand)" }}>sorular.</span>
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
                    border: isOpen ? "1px solid rgba(14,124,136,0.35)" : "1px solid rgba(23,37,45,0.08)",
                    background: isOpen ? "var(--color-brand-light)" : "#F7FBFB",
                    boxShadow: isOpen ? "0 0 0 3px rgba(14,124,136,0.08)" : "none",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px] transition-all duration-300"
                    style={{ background: isOpen ? "var(--color-brand)" : "transparent" }}
                  />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className="font-fredoka font-bold text-base transition-colors duration-200 m-0"
                        style={{ color: isOpen ? "var(--color-brand)" : "var(--color-dark)" }}
                      >
                        {faq.q}
                      </h3>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-fredoka font-bold text-lg transition-all duration-300"
                        style={{
                          background: isOpen ? "var(--color-brand)" : "rgba(23,37,45,0.07)",
                          color: isOpen ? "#ffffff" : "#94a3b8",
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
            className="inline-flex items-center gap-2 font-fredoka font-bold text-white text-base px-9 py-4 rounded-full no-underline hover:scale-105 transition-transform"
            style={{ background: "var(--color-brand)", boxShadow: "0 6px 20px rgba(14,124,136,0.3)" }}
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
      id="final-cta"
      className="relative overflow-hidden py-16 md:py-24 px-5"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 60%, #1F3A44 0%, #17252D 55%, #0A1114 100%)" }}
    >
      <style>{`
        @keyframes ctaShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ctaPulse { 0%{box-shadow:0 8px 28px rgba(14,124,136,0.5),0 0 0 0 rgba(14,124,136,0.55)} 70%{box-shadow:0 8px 28px rgba(14,124,136,0.5),0 0 0 20px rgba(14,124,136,0)} 100%{box-shadow:0 8px 28px rgba(14,124,136,0.5),0 0 0 0 rgba(14,124,136,0)} }
      `}</style>

      <div style={{
        position: "absolute", top: -100, right: -80, width: 480, height: 480,
        borderRadius: "50%", background: "var(--color-brand)", filter: "blur(100px)", opacity: 0.25,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60, width: 320, height: 320,
        borderRadius: "50%", background: "var(--color-brand-on-dark)", filter: "blur(100px)", opacity: 0.2,
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
              background: "linear-gradient(90deg, var(--color-brand-on-dark), #ffffff, var(--color-brand-on-dark))",
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
              background: "var(--color-brand)",
              animation: "ctaPulse 2.5s ease-out infinite",
              letterSpacing: "0.3px",
            }}
          >
            Ücretsiz Görüşme Al →
          </Link>
          <div className="mt-6">
            <ScrollCta
              to="paketler"
              className="font-nunito font-bold text-white/70 text-[15px] underline underline-offset-4 hover:text-white transition-colors"
            >
              veya Paketleri &amp; Fiyatları Gör
            </ScrollCta>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// STICKY MOBİL CTA — tek eylem: paketlere in
// ══════════════════════════════════════════════
// Paketler, son CTA ya da footer ekranda olduğunda gizlenir (aynı eylemi zaten
// gösteriyorlar / içeriğin üstüne binmesin). Alt güvenli alan (iPhone home
// indicator) padding'e eklenir.
function StickyMobileCta() {
  const [scrolled, setScrolled] = useState(false);
  const [hiddenZones, setHiddenZones] = useState({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = [
      ["paketler", document.getElementById("paketler")],
      ["final", document.getElementById("final-cta")],
      ["footer", document.querySelector("footer")],
    ].filter(([, el]) => el);
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      setHiddenZones((prev) => {
        const next = { ...prev };
        entries.forEach((en) => {
          const key = targets.find(([, el]) => el === en.target)?.[0];
          if (key) next[key] = en.isIntersecting;
        });
        return next;
      });
    }, { threshold: 0.12 });
    targets.forEach(([, el]) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const visible = scrolled && !Object.values(hiddenZones).some(Boolean);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[900] px-4 hidden max-[960px]:block"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
        >
          <ScrollCta
            to="paketler"
            className="block w-full font-fredoka font-bold text-white text-base py-4 rounded-2xl text-center no-underline shadow-[0_-4px_24px_rgba(14,124,136,0.35)]"
            style={{ background: "var(--color-brand)" }}
          >
            Paketleri &amp; Fiyatları Gör →
          </ScrollCta>
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
      <TrackLinksSection />
      <ComparisonSection />
      <FaqSection />
      <ContactCtaSection />
      <Footer />
      <StickyMobileCta />
    </div>
  );
}
