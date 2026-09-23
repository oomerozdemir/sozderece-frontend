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

// "3.890 TL / 4 hafta" tek bir bütün olarak okunsun: tutar + TL büyük, süre
// aynı satırda küçük. Süre "4 hafta" gibi kısa bir birimse satır içi, "YKS-LGS
// 2027'ye kadar" gibi cümle gibi bir açıklamaysa altta ayrı küçük satır.
const fmtAmount = (v) => {
  const t = String(v ?? "").trim();
  return /^\d{4,}$/.test(t) ? Number(t).toLocaleString("tr-TR") : t;
};
const cleanDuration = (d) => (d ? String(d).trim().replace(/^\//, "").trim() : "");
const isShortDuration = (d) => /^\d+\s*(hafta|ay|gün)/i.test(d);

function Amount({ amount, duration }) {
  const dur = cleanDuration(duration);
  const inline = dur && isShortDuration(dur);
  return (
    <div>
      <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0">
        <span className="font-fredoka font-bold text-page-navy leading-none" style={{ fontSize: "clamp(36px,3.4vw,44px)", letterSpacing: -1 }}>
          {fmtAmount(amount)}
          <span className="text-[0.55em] ml-1" style={{ letterSpacing: 0 }}>TL</span>
        </span>
        {inline && (
          <span className="font-fredoka font-bold text-[16px]" style={{ color: "#6B6B8A" }}>
            / {dur.toLocaleLowerCase("tr")}
          </span>
        )}
      </div>
      {dur && !inline && <div className="font-nunito font-bold text-xs mt-1.5 text-[#94a3b8]">{dur}</div>}
    </div>
  );
}

// Süre planı seçilince "3.890 TL sınava kadar mı?" sorusunu fiyatın hemen
// altında cevaplayan tek cümle.
function durationNote(_pkg, activePlan) {
  // Sadece süre planı (4 Hafta / Sınava Kadar) seçicisi olan paketlerde: tek
  // fiyatlı paketlerin (ör. "4 Hafta Boyunca Koçluk") süre vaadi kendi
  // özelliklerinde yazıyor, buradan farklı bir şey söylenmemeli.
  if (!activePlan) return null;
  const src = `${activePlan.durationText || ""} ${activePlan.label || ""}`;
  if (/hafta/i.test(src)) return "Koçluğa sınava kadar devam edebilirsin.";
  if (/kadar/i.test(src)) return "Tek ödemeyle sınava kadar koçluk.";
  return null;
}

function PriceDisplay({ pkg, activePlan }) {
  if (!pkg) return null;

  if (activePlan) {
    // "Sınava Kadar" gibi bir plan sekmesi sabit bir fiyat yerine sınav
    // tarihine göre CANLI hesaplanan bir fiyat istiyorsa (plan.dynamicExamPrice)
    // — aylık fiyat × sınava kalan ay × (1-indirim%) formülünü kullanıyoruz.
    // examDate geçmişse/tanımsızsa sessizce plan'ın kendi statik fiyatına
    // düşüyor, boş/kırık bir fiyat göstermek yerine.
    if (activePlan.dynamicExamPrice && isExamPriceActive(pkg)) {
      const price = getExamPrice(pkg);
      const days = getExamDaysLeft(pkg);
      const fullPrice = Math.round(((days / 30) * pkg.price));
      return (
        <div>
          <OldPrice text={`${fullPrice.toLocaleString("tr-TR")}₺`} />
          <Amount amount={price.toLocaleString("tr-TR")} duration={activePlan.durationText} />
        </div>
      );
    }

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

  // priceText genelde "2.000₺/30 Gün" gibi tutarı ve süreyi tek string'de
  // taşıyor — hepsini Amount'a "amount" olarak vermek süre metnini de
  // fiyatla AYNI dev punto ile gösteriyordu. "/" işaretinden bölüp süreyi
  // ayrı, küçük bir alt satıra taşıyoruz (Amount zaten bunu destekliyor).
  const priceStr = pkg.priceText || `${pkg.price}₺`;
  const cleaned = priceStr.replace(/₺/g, "").trim();
  const slashIdx = cleaned.indexOf("/");
  const priceNum = slashIdx >= 0 ? cleaned.slice(0, slashIdx).trim() : cleaned;
  const durationSuffix = slashIdx >= 0 ? `/${cleaned.slice(slashIdx + 1).trim()}` : null;
  return (
    <div>
      <OldPrice text={pkg.oldPriceText} />
      <Amount amount={priceNum} duration={durationSuffix} />
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

  // CTA sözlüğü: kart tek bir net eylem sunar. Vitrin CTA'sı her zaman
  // "Paketi Satın Al" (ödeme sihirbazı); DB'deki eski/özel etiketler
  // ("Hemen Başla", "Paketi seç") kullanılmaz. Eski /pre-auth ya da
  // /paket-detay yönlendirmeleri sihirbaza çevrilir.
  const wizardHref = hasPlanTabs
    ? `/hemen-basla?slug=${encodeURIComponent(pkg.slug)}&plan=${activePlanIdx}`
    : `/hemen-basla?slug=${encodeURIComponent(pkg.slug)}`;
  const customHref = activePlan?.ctaHref || pkg.ctaHref || "";
  const useCustomHref = customHref && !/^\/(pre-auth|paket-detay)/.test(customHref);
  const ctaHref = useCustomHref ? customHref : wizardHref;
  const ctaLabel = useCustomHref ? "Paketi İncele →" : "Paketi Satın Al →";
  const noteText = durationNote(pkg, activePlan);

  const videoEmbedUrl = pkg.videoUrl ? toYouTubeEmbed(pkg.videoUrl) : null;

  // Rozetli paket "tavsiye edilen/öne çıkan" paket demek — daha kalın renkli
  // çerçeve + daha belirgin gölgeyle diğer kartlardan ayrışsın. Yeni bir alan
  // eklemeye gerek yok, mevcut `badge` alanı zaten bunun için var.
  const featured = !!pkg.badge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-full rounded-[28px] bg-white"
      style={
        featured
          ? { border: "2px solid #1C1B8A", boxShadow: "0 20px 50px rgba(28,27,138,0.22)", padding: "36px 30px" }
          : { border: "1px solid #ECEAF5", boxShadow: "0 10px 30px rgba(28,27,138,0.08)", padding: "32px 28px" }
      }
    >
      {pkg.badge && (
        <span
          className="absolute -top-3 right-7 font-fredoka font-bold text-[12px] px-3 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: "#1C1B8A", color: "#D8FF4F", boxShadow: "0 4px 12px rgba(28,27,138,0.3)" }}
        >
          {pkg.badge}
        </span>
      )}

      <h3 className="font-fredoka font-bold text-page-navy text-xl leading-snug mb-1.5 pr-2">{pkg.name}</h3>
      {pkg.subtitle && (
        <p className="font-nunito text-[#64748b] text-sm leading-snug mb-4">{pkg.subtitle}</p>
      )}
      {!pkg.subtitle && <div className="mb-2.5" />}

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

      {noteText && (
        <p className="font-nunito font-bold text-[13px] mt-3 mb-0" style={{ color: "#3F6B0A" }}>{noteText}</p>
      )}

      <div className="h-px my-5" style={{ background: "#F1EFF8" }} />

      <div className="flex flex-col gap-2.5 mb-2">
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
      {!useCustomHref && (
        <Link
          to={`/paket-detay?slug=${encodeURIComponent(pkg.slug)}`}
          className="block text-center no-underline font-nunito font-bold text-[13px] text-[#8B87A6] hover:text-page-navy mt-3 transition-colors"
        >
          Paketi İncele
        </Link>
      )}

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

  // Rozetli ("tavsiye edilen") paket, displayOrder ne olursa olsun sekmenin
  // en başında görünsün — Array.sort kararlı (stable) olduğu için rozetsizler
  // kendi aralarındaki mevcut sırayı koruyor.
  const byFeaturedFirst = (a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
  const yksPackages = packages.filter((p) => p.type !== "lgs").sort(byFeaturedFirst);
  const lgsPackages = packages.filter((p) => p.type !== "yks").sort(byFeaturedFirst);
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
        className="mx-auto py-14 md:py-20 relative pricing-section-pad"
        style={{ maxWidth: 1280, paddingLeft: 60, paddingRight: 60, zIndex: 2 }}
      >
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>
            PAKETLER &amp; FİYATLAR
          </div>
          <h2 className="font-fredoka font-bold m-0 leading-[1]" style={{ letterSpacing: -1, fontSize: "clamp(34px, 4.5vw, 60px)" }}>
            <span className="block text-page-navy">YKS &amp; LGS</span>
            <span className="block" style={{ color: "transparent", WebkitTextStroke: "2px #FF6B35" }}>Koçluk Paketleri</span>
          </h2>
          <p className="font-nunito font-bold text-[#64748b] text-base leading-relaxed mt-4 mx-auto" style={{ maxWidth: 480 }}>
            İhtiyacına uygun koçluk paketini seç. Paket içeriklerini ve fiyatları aşağıda inceleyebilirsin.
          </p>
        </motion.div>

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
