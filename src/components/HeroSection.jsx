import React from "react";
import { motion } from "framer-motion";

const WA_LINK = "https://wa.me/905312546701?text=S%C4%B0STEM";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" },
};

const SOCIAL_PROOF = [
  {
    quote: "1. ayda +17 net yaptım. Koçum her gün takip etti, hiç kaçırmadım.",
    name: "Şevval",
    role: "ÖĞRENCİ",
    badge: "+17 NET · 1. AY",
    avatar: "Ş",
    avatarBg: "#1C1B8A",
    year: "TYT-AYT 2024",
  },
  {
    quote: "Çocuğumun motivasyonu çok arttı. Veli raporu sayesinde süreci yakından takip edebildim.",
    name: "Serpil H.",
    role: "VELİ",
    badge: "LGS 2025",
    avatar: "S",
    avatarBg: "#7340C8",
    year: "LGS 2025",
  },
  {
    quote: "Deneme analizleri sayesinde hep aynı hataları yapıyordum fark ettim ve artık yapmıyorum.",
    name: "Ege K.",
    role: "ÖĞRENCİ",
    badge: "+18 NET",
    avatar: "E",
    avatarBg: "#FF6B35",
    year: "TYT 2024",
  },
  {
    quote: "Hedefimi koydu, programa bağladı. Sınava en hazır gittiğim yıl oldu bu.",
    name: "Mert A.",
    role: "ÖĞRENCİ",
    badge: "+22 NET",
    avatar: "M",
    avatarBg: "#1C1B8A",
    year: "AYT 2024",
  },
  {
    quote: "LGS puanı beklentimizin çok üzerinde çıktı. Sistematik çalışma fark yaratıyor.",
    name: "Ayşe K.",
    role: "VELİ",
    badge: "LGS 2024",
    avatar: "A",
    avatarBg: "#7340C8",
    year: "LGS 2024",
  },
];

const MARQUEE_CARDS = [...SOCIAL_PROOF, ...SOCIAL_PROOF];

export default function HeroSection() {
  const stats = [
    { value: "500+", label: "Öğrenci" },
    { value: "%94", label: "Hedef Başarı" },
    { value: "4.9★", label: "Veli Puanı" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 60% 40%, #3d1a80 0%, #1A0A40 55%, #0d0520 100%)",
      }}
    >
      <style>{`
        @keyframes heroOrbMove  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.06)} 66%{transform:translate(-20px,20px) scale(0.96)} }
        @keyframes heroSparkle  { 0%,100%{opacity:0.15;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes heroFloat1   { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(6deg)} }
        @keyframes heroFloat2   { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-8deg)} }
        @keyframes heroFloat3   { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-22px) rotate(4deg)} }
        @keyframes heroShimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes heroPulse    { 0%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 0 rgba(255,107,53,0.5)} 70%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 20px rgba(255,107,53,0)} 100%{box-shadow:0 8px 28px rgba(255,107,53,0.45),0 0 0 0 rgba(255,107,53,0)} }
        @keyframes heroMarquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* Orb 1 */}
      <div style={{
        position: "absolute", top: -120, right: 80,
        width: 480, height: 480, borderRadius: "50%",
        background: "#4a1da0", filter: "blur(90px)", opacity: 0.35,
        animation: "heroOrbMove 12s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Orb 2 */}
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

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-5 pt-20 pb-10 max-[768px]:pt-14 max-[768px]:pb-8 w-full" style={{ position: "relative", zIndex: 1 }}>
        <div className="grid grid-cols-[1fr_auto] gap-16 items-center max-[960px]:grid-cols-1">

          {/* Sol — metin */}
          <div>
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

            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="font-fredoka text-[72px] max-[900px]:text-[52px] max-[640px]:text-[42px] max-[400px]:text-[34px] leading-[1.05] text-white mb-6"
              style={{ letterSpacing: "-0.5px", maxWidth: 640 }}
            >
              Çalışıyorsun Ama Netlerin Artmıyor Mu? {" "}
              <span style={{
                background: "linear-gradient(90deg, #D8FF4F, #ffffff, #D8FF4F)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "heroShimmer 3s linear infinite",
              }}>Sorun Sende Değil.</span>{" "}
          
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="font-nunito font-bold text-white/65 text-[19px] max-[640px]:text-base leading-relaxed mb-10"
              style={{ maxWidth: 520 }}
            >
              Kişiye özel koçluk, haftalık takip ve deneme analizleriyle LGS & YKS'ye hazırlan. Sistematik, stressiz, sonuç odaklı.
            </motion.p>

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
            <div className="relative" style={{ width: 390, height: 440 }}>

              {/* Glow ring */}
              <div style={{
                position: "absolute", top: 60, left: 10,
                width: 380, height: 380, borderRadius: "50%",
                background: "#4a1da0", filter: "blur(80px)", opacity: 0.28,
                animation: "heroOrbMove 10s ease-in-out infinite",
                pointerEvents: "none",
              }} />

              {/* Ana kart — haftalık plan */}
              <div style={{
                position: "absolute", top: 70, left: 40,
                width: 310,
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 28, padding: "28px 24px",
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
                position: "absolute", top: 0, left: 0,
                background: "#FF6B35", borderRadius: 20, padding: "16px 22px",
                animation: "heroFloat2 4s ease-in-out infinite",
                boxShadow: "0 12px 30px rgba(255,107,53,0.5)",
              }}>
                <div className="font-fredoka font-bold text-white text-[28px] leading-none">+47</div>
                <div className="font-nunito font-bold text-white/80 text-xs mt-0.5">Net artışı</div>
              </div>

              {/* Sarı rozet — koç */}
              <div style={{
                position: "absolute", bottom: 10, right: 0,
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

      {/* Sosyal kanıt marquee şeridi */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        {/* Sol fade */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: "linear-gradient(to right, rgba(13,5,32,0.95), transparent)",
          pointerEvents: "none",
        }} />
        {/* Sağ fade */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: "linear-gradient(to left, rgba(13,5,32,0.95), transparent)",
          pointerEvents: "none",
        }} />

        <div
          style={{
            display: "flex",
            gap: 16,
            animation: "heroMarquee 28s linear infinite",
            width: "max-content",
          }}
        >
          {MARQUEE_CARDS.map((item, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 280,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(n => (
                  <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill="#D8FF4F">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="font-nunito text-white/75 text-[13px] leading-snug mb-3 line-clamp-2">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-fredoka font-bold text-white text-sm flex-shrink-0"
                  style={{ background: item.avatarBg }}
                >
                  {item.avatar}
                </div>
                <div>
                  <div className="font-fredoka font-bold text-white text-[13px] leading-none">{item.name}</div>
                  <div className="font-nunito text-white/45 text-[11px] mt-0.5">{item.role} · {item.year}</div>
                </div>
                <div
                  className="ml-auto font-fredoka font-bold text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: "rgba(216,255,79,0.15)", color: "#D8FF4F", border: "1px solid rgba(216,255,79,0.3)" }}
                >
                  {item.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
