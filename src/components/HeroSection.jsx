import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBullseye, FaClipboardList, FaHourglassHalf, FaShieldAlt, FaChartLine } from "react-icons/fa";
import axios from "../utils/axios";

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
    stars: 5,
  },
  {
    quote: "Çocuğumun motivasyonu çok arttı. Veli raporu sayesinde süreci yakından takip edebildim.",
    name: "Serpil H.",
    role: "VELİ",
    badge: "LGS 2025",
    avatar: "S",
    avatarBg: "#7340C8",
    year: "LGS 2025",
    stars: 4,
  },
  {
    quote: "Deneme analizleri sayesinde hep aynı hataları yapıyordum fark ettim ve artık yapmıyorum.",
    name: "Ege K.",
    role: "ÖĞRENCİ",
    badge: "+18 NET",
    avatar: "E",
    avatarBg: "#FF6B35",
    year: "TYT 2024",
    stars: 5,
  },
  {
    quote: "Hedefimi koydu, programa bağladı. Sınava en hazır gittiğim yıl oldu bu.",
    name: "Mert A.",
    role: "ÖĞRENCİ",
    badge: "+22 NET",
    avatar: "M",
    avatarBg: "#1C1B8A",
    year: "AYT 2024",
    stars: 5,
  },
  {
    quote: "LGS puanı beklentimizin çok üzerinde çıktı. Sistematik çalışma fark yaratıyor.",
    name: "Ayşe K.",
    role: "VELİ",
    badge: "LGS 2024",
    avatar: "A",
    avatarBg: "#7340C8",
    year: "LGS 2024",
    stars: 4,
  },
];

const MARQUEE_CARDS = [...SOCIAL_PROOF, ...SOCIAL_PROOF];

const eyebrowStyle = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "rgba(216,255,79,0.12)",
  border: "1px solid rgba(216,255,79,0.3)",
  borderRadius: 999, padding: "7px 16px",
};

// ══════════════════════════════════════════════
// SLAYT 1 — Varsayılan (YKS + LGS genel)
// ══════════════════════════════════════════════
function DefaultSlide() {
  const stats = [
    { value: "500+", label: "Öğrenci" },
    { value: "%94", label: "Hedef Başarı" },
  ];

  return (
    <div className="grid grid-cols-[1fr_auto] gap-16 items-center max-[960px]:grid-cols-1">
      {/* Sol — metin */}
      <div>
        <motion.div {...fadeUp} className="mb-7">
          <span style={eyebrowStyle}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#D8FF4F", display: "inline-block",
              animation: "heroSparkle 1.5s ease-in-out infinite",
            }} />
            <span className="font-fredoka text-lime text-sm font-semibold tracking-[0.1em] uppercase">
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
          }}>Sorun Sende Değil.</span>
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
          <Link
            to="/ucretsiz-on-gorusme"
            className="inline-flex items-center gap-2 text-white font-fredoka font-bold text-[18px] px-9 py-4 rounded-full no-underline transition-transform hover:scale-105"
            style={{
              background: "#FF6B35",
              animation: "heroPulse 2.5s ease-out infinite",
              letterSpacing: "0.3px",
            }}
          >
            Ücretsiz Tanışma Görüşmesi
          </Link>
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
              <div className="font-fredoka font-bold text-lime text-[28px] leading-none">{s.value}</div>
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
            <div className="font-fredoka font-bold text-lime text-sm tracking-[0.12em] uppercase mb-4">
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
            <div className="font-fredoka font-bold text-page-dark text-[15px] leading-snug">Koçunla bugün</div>
            <div className="font-fredoka font-bold text-page-dark text-[15px] flex items-center gap-1.5">görüş <FaBullseye size={13} /></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════
// SLAYT 2 — Erken Kayıt (admin panelden yönetilen
// /api/settings/early-registration verisiyle dinamik)
// ══════════════════════════════════════════════
function ErkenKayitSlide({ earlyReg, daysLeft }) {
  const subtitle = earlyReg.subtitle || "Sınav öncesi başla, daha az öde. Bu fiyatlarla sınırlı süre.";
  const discountText = earlyReg.discountText || "%20 İndirim";
  const ctaText = earlyReg.ctaText || "Hemen Kaydol →";

  return (
    <div className="grid grid-cols-[1fr_auto] gap-16 items-center max-[960px]:grid-cols-1">
      {/* Sol — metin */}
      <div>
        <motion.div {...fadeUp} className="mb-7">
          <span style={eyebrowStyle}>
            <FaHourglassHalf size={11} color="#D8FF4F" />
            <span className="font-fredoka text-lime text-sm font-semibold tracking-[0.1em] uppercase">
              Erken Kayıt
            </span>
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="font-fredoka text-[64px] max-[900px]:text-[46px] max-[640px]:text-[38px] max-[400px]:text-[30px] leading-[1.05] text-white mb-6"
          style={{ letterSpacing: "-0.5px", maxWidth: 640 }}
        >
          Sınav Senesine{" "}
          <span style={{
            background: "linear-gradient(90deg, #D8FF4F, #ffffff, #D8FF4F)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "heroShimmer 3s linear infinite",
          }}>Rakiplerinden Önde Başla!</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="font-nunito font-bold text-white/65 text-[19px] max-[640px]:text-base leading-relaxed mb-10"
          style={{ maxWidth: 520 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.24 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/hemen-basla"
            className="inline-flex items-center gap-2 font-fredoka font-bold text-[18px] px-9 py-4 rounded-full no-underline transition-transform hover:scale-105"
            style={{
              background: "#D8FF4F",
              color: "#0D0A2E",
              animation: "heroPulse 2.5s ease-out infinite",
              letterSpacing: "0.3px",
            }}
          >
            {ctaText}
          </Link>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.32 }}
          className="flex items-center gap-2 mt-5"
        >
          <FaShieldAlt size={13} color="#D8FF4F" style={{ flexShrink: 0 }} />
          <span className="font-nunito font-bold text-white/50 text-[13px]">
            14 gün içinde beğenmezsen %100 iade garantisi
          </span>
        </motion.div>
      </div>

      {/* Sağ — değer görseli: programın kendisi, indirim/kontenjan sadece destekleyici rozet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex-shrink-0 max-[960px]:hidden"
      >
        <div className="relative" style={{ width: 390, height: 440 }}>
          <div style={{
            position: "absolute", top: 60, left: 10,
            width: 380, height: 380, borderRadius: "50%",
            background: "#D8FF4F", filter: "blur(90px)", opacity: 0.22,
            animation: "heroOrbMove 10s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          {/* Ana kart — programa dahil olanlar (değer görseli) */}
          <div style={{
            position: "absolute", top: 70, left: 40,
            width: 310,
            background: "rgba(216,255,79,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(216,255,79,0.25)",
            borderRadius: 28, padding: "28px 24px",
            animation: "heroFloat1 5s ease-in-out infinite",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}>
            <div className="font-fredoka font-bold text-lime text-sm tracking-[0.12em] uppercase mb-4">
              Programına Dahil
            </div>
            {[
              "Günlük WhatsApp Takibi",
              "Haftalık Deneme Analizi",
              "Kişisel Çalışma Planı",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 mb-3.5">
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: "#D8FF4F",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <polyline points="2 6 5 9 10 3" fill="none" stroke="#0D0A2E" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-nunito font-bold text-sm text-white">{text}</span>
              </div>
            ))}
          </div>

          {/* Turuncu rozet — kalan süre */}
          {daysLeft !== null && (
            <div style={{
              position: "absolute", top: 0, right: 10,
              background: "#FF6B35", borderRadius: 20, padding: "14px 20px",
              animation: "heroFloat2 4s ease-in-out infinite",
              boxShadow: "0 12px 30px rgba(255,107,53,0.5)",
            }}>
              <div className="font-fredoka font-bold text-white text-[24px] leading-none">{daysLeft}</div>
              <div className="font-nunito font-bold text-white/80 text-xs mt-0.5">gün kaldı</div>
            </div>
          )}

          {/* Lime rozet — indirim oranı */}
          <div style={{
            position: "absolute", bottom: 60, right: -10,
            background: "rgba(216,255,79,0.96)", borderRadius: 18, padding: "12px 18px",
            animation: "heroFloat3 6s ease-in-out infinite",
            boxShadow: "0 10px 24px rgba(216,255,79,0.35)",
          }}>
            <div className="font-fredoka font-bold text-page-dark text-[15px] leading-snug">{discountText}</div>
          </div>

          {/* Beyaz rozet — sınırlı kontenjan */}
          <div style={{
            position: "absolute", bottom: 0, left: 10,
            background: "rgba(255,255,255,0.96)", borderRadius: 18, padding: "12px 18px",
            animation: "heroFloat3 6s ease-in-out infinite",
            animationDelay: "1.5s",
            boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
          }}>
            <div className="font-fredoka font-bold text-page-dark text-[14px]">⚡ Sınırlı kontenjan</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════
// SLAYT 3 — LGS'ye özel
// ══════════════════════════════════════════════
function LgsSlide() {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-16 items-center max-[960px]:grid-cols-1">
      {/* Sol — metin */}
      <div>
        <motion.div {...fadeUp} className="mb-7">
          <span style={eyebrowStyle}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#D8FF4F", display: "inline-block",
              animation: "heroSparkle 1.5s ease-in-out infinite",
            }} />
            <span className="font-fredoka text-lime text-sm font-semibold tracking-[0.1em] uppercase">
              LGS Koçluğu
            </span>
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="font-fredoka text-[64px] max-[900px]:text-[46px] max-[640px]:text-[38px] max-[400px]:text-[30px] leading-[1.05] text-white mb-6"
          style={{ letterSpacing: "-0.5px", maxWidth: 640 }}
        >
          8. Sınıf Stresi Bitsin, {" "}
          <span style={{
            background: "linear-gradient(90deg, #D8FF4F, #ffffff, #D8FF4F)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "heroShimmer 3s linear infinite",
          }}>LGS'ye Hazır Gitsin.</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="font-nunito font-bold text-white/65 text-[19px] max-[640px]:text-base leading-relaxed mb-10"
          style={{ maxWidth: 520 }}
        >
          Günlük takip, telefon yönetimi ve haftalık veli raporuyla LGS'ye kadar yanında biri olsun.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.24 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/ucretsiz-on-gorusme"
            className="inline-flex items-center gap-2 text-white font-fredoka font-bold text-[18px] px-9 py-4 rounded-full no-underline transition-transform hover:scale-105"
            style={{
              background: "#FF6B35",
              animation: "heroPulse 2.5s ease-out infinite",
              letterSpacing: "0.3px",
            }}
          >
            Ücretsiz Görüşme Planla
          </Link>
          <Link
            to="/lgs-hazirlik"
            className="inline-flex items-center gap-2 text-white font-fredoka font-semibold text-[16px] px-7 py-4 rounded-full no-underline transition-all hover:bg-white/10"
            style={{ border: "1.5px solid rgba(255,255,255,0.25)" }}
          >
            LGS Hazırlığını İncele
          </Link>
        </motion.div>
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
          <div style={{
            position: "absolute", top: 60, left: 10,
            width: 380, height: 380, borderRadius: "50%",
            background: "#7340C8", filter: "blur(80px)", opacity: 0.28,
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-fredoka font-bold text-white text-xs flex-shrink-0" style={{ background: "#7340C8" }}>
                M
              </div>
              <div className="font-fredoka font-bold text-lime text-sm tracking-[0.06em] uppercase">
                Mert'in Bu Haftası
              </div>
            </div>
            {[
              { text: "Türkçe: Paragraf — 2 ders", done: true },
              { text: "Matematik: Denklemler — 1 ders", done: true },
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
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-nunito font-bold text-white/45 text-[11px] uppercase tracking-wide">Tamamlanma</span>
                <span className="font-fredoka font-bold text-lime text-xs">%65</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "65%", borderRadius: 999, background: "#D8FF4F" }} />
              </div>
            </div>
          </div>

          {/* Mor rozet — net artışı */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            background: "#7340C8", borderRadius: 20, padding: "16px 22px",
            animation: "heroFloat2 4s ease-in-out infinite",
            boxShadow: "0 12px 30px rgba(115,64,200,0.5)",
          }}>
            <div className="flex items-center gap-1.5">
              <span className="font-fredoka font-bold text-white text-[28px] leading-none">+38</span>
              <FaChartLine size={16} color="#D8FF4F" />
            </div>
            <div className="font-nunito font-bold text-white/80 text-xs mt-0.5">Net artışı</div>
          </div>

          {/* Lila/buzlu cam rozet — veli raporu (turuncu CTA'dan dikkat çalmasın diye
              artık neon lime değil, ana kartın frosted-glass diliyle ve mor tonuyla
              uyumlu, daha soft bir görünüm) */}
          <div style={{
            position: "absolute", bottom: 10, right: 0,
            background: "rgba(115,64,200,0.18)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(115,64,200,0.4)",
            borderRadius: 18, padding: "14px 20px",
            animation: "heroFloat3 6s ease-in-out infinite",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}>
            <div className="font-fredoka font-bold text-white text-[15px] leading-snug">Veli raporu</div>
            <div className="font-fredoka font-bold text-white text-[15px] flex items-center gap-1.5">her hafta <FaClipboardList size={13} color="#D8FF4F" /></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const [earlyReg, setEarlyReg] = useState(null);
  useEffect(() => {
    axios.get("/api/settings/early-registration")
      .then((r) => setEarlyReg(r.data))
      .catch(() => {});
  }, []);
  const earlyDaysLeft = earlyReg?.endDate
    ? Math.ceil((new Date(earlyReg.endDate) - new Date()) / 86400000)
    : null;
  const earlyRegActive = !!earlyReg?.enabled && (earlyDaysLeft === null || earlyDaysLeft > 0);

  const slides = [
    ...(earlyRegActive ? [{ key: "erken", content: <ErkenKayitSlide earlyReg={earlyReg} daysLeft={earlyDaysLeft} /> }] : []),
    { key: "default", content: <DefaultSlide /> },
    { key: "lgs", content: <LgsSlide /> },
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  // earlyRegActive geç yüklendiğinde slides.length değişip activeIdx'in
  // sınırın dışında kalmasını önler.
  useEffect(() => {
    if (activeIdx >= slides.length) setActiveIdx(0);
  }, [slides.length, activeIdx]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section
      className="relative overflow-hidden mx-3 sm:mx-6 lg:mx-10 mt-3 rounded-[32px] max-[640px]:rounded-[22px]"
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

        /* Slaytların hepsi birebir aynı boyutta olsun diye sabit bir
           "viewport" yüksekliği — içerik slayta göre değişse de kayan
           alan büyüyüp küçülmüyor. Masaüstünde sabit height (sağdaki
           floating kart grubu zaten 440px sabit), mobilde min-height
           (tek sütuna düşünce metin sarmasına göre taşma olmasın diye). */
        .hero-slide-viewport { height: 690px; }
        @media (max-width: 960px) {
          .hero-slide-viewport { height: auto; min-height: 600px; }
        }
        @media (max-width: 640px) {
          .hero-slide-viewport { min-height: 660px; }
        }
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

      {/* Star dots — metin sütununun (sol, ~x:0-640) dışında, kenarlarda/sağ
          görsel bölgesinde kalacak şekilde konumlandırılmış: aksi halde
          slayta göre değişen metin uzunluklarıyla kelimelerin arasına denk
          gelip "glitch" gibi görünebiliyor. */}
      {[[40,40,5,0],[700,55,4,0.5],[30,500,6,1],[730,150,3,0.8],[770,310,5,1.4],[660,25,4,0.3],[40,560,5,1.8],[790,430,3,0.6]].map(([x,y,s,d],i) => (
        <div key={i} style={{
          position: "absolute", left: x, top: y,
          width: s, height: s, borderRadius: "50%",
          background: "#D8FF4F",
          animation: `heroSparkle ${2+d}s ease-in-out infinite`,
          animationDelay: `${d}s`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      {/* Kayan slayt içeriği — tüm slaytlar ayn boyutta görünsün diye
          sabit yükseklikli bir "viewport" içinde dikey ortalanıyor. */}
      <div className="hero-slide-viewport max-w-[1200px] mx-auto px-5 flex items-center w-full" style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[activeIdx]?.key}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full"
          >
            {slides[activeIdx]?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slayt noktaları */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 relative" style={{ zIndex: 1, marginTop: -8, marginBottom: 8 }}>
          {slides.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActiveIdx(i)}
              aria-label={`Slayt ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300 border-none cursor-pointer"
              style={{
                width: i === activeIdx ? 22 : 8,
                background: i === activeIdx ? "#D8FF4F" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}

      {/* Sosyal kanıt marquee şeridi */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
          paddingTop: 16,
          paddingBottom: 14,
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
                  <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill={n <= (item.stars || 5) ? item.avatarBg : "rgba(255,255,255,0.15)"}>
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
