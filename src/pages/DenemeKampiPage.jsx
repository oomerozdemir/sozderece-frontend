import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import useCampPage from "../hooks/useCampPage";
import useCart from "../hooks/useCart";
import axios from "../utils/axios";

// ── Helpers ───────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return 0;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return time;
}

// Highlight a phrase in a string with orange color
function HighlightedText({ text, phrase }) {
  if (!phrase || !text.includes(phrase)) return <>{text}</>;
  const [before, after] = text.split(phrase);
  return <>{before}<span className="text-[#f39c12]">{phrase}</span>{after}</>;
}

function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black text-white border border-white/20">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-white/60 text-xs mt-1 font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6 py-20 px-6 max-w-3xl mx-auto">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded-xl" style={{ width: `${85 - i * 8}%` }} />
      ))}
    </div>
  );
}

const Check = () => <span className="text-[#22c55e] text-lg font-black">✓</span>;
const Cross = () => <span className="text-[#ef4444] text-lg">✗</span>;
const inpCls = "w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm text-[#0f172a] outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

// ─────────────────────────────────────────────────────────────
export default function DenemeKampiPage() {
  const navigate = useNavigate();
  const { content, loading } = useCampPage();
  const { cart, addToCart, removeFromCart } = useCart();
  const formRef = useRef(null);

  const [coaches, setCoaches] = useState([]);
  const [activePlan, setActivePlan] = useState(0); // eslint-disable-line no-unused-vars
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", grade: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    axios.get("/api/coach/public-coach").then((r) => setCoaches(r.data || [])).catch(() => {});
  }, []);

  const offerRef = useRef(null);
  const scrollToOffer = () => offerRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const addToCartAndPay = async (plan, planIndex) => {
    const price = parseInt(plan.price);
    if (!price || isNaN(price)) { alert("Bu plan için fiyat bilgisi eksik."); return; }
    const campSlug = content?.slug || "deneme-kampi";
    const slug = `camp-${campSlug}-plan-${planIndex}`;
    const title = plan.label || content?.name || "Deneme Kampı";
    try {
      // Sepetteki tüm mevcut ürünleri temizle — son seçilen plan geçerli olsun
      if (Array.isArray(cart) && cart.length > 0) {
        for (const item of cart) {
          await removeFromCart(item.slug);
        }
      }
      await addToCart({ slug, title, unitPrice: price * 100 });
      navigate("/payment");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (err?.response?.status === 401 || msg.toLowerCase().includes("giriş")) {
        navigate("/login", { state: { next: "/payment" } });
      } else {
        console.error(err);
        alert("Bir hata oluştu, lütfen tekrar deneyin.");
      }
    }
  };
  const countdown = useCountdown(content?.offer?.yksDate || "2026-06-15");

  const handleSubmit = async (type = "free") => {
    setFormError("");
    const { firstName, lastName, phone, email, grade } = form;
    if (!firstName || !lastName || !phone || !email || !grade) {
      setFormError("Lütfen tüm alanları doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/api/camp-page/apply", { ...form, type });
      setSubmitted(true);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><div className="bg-[#f8f9fa] min-h-screen"><Skeleton /></div><Footer /></>;
  if (!content) return null;

  if (content.isActive === false) return (
    <>
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center p-10">
          <div className="text-5xl mb-4">🏕</div>
          <h1 className="text-2xl font-black text-[#0f172a] mb-3">Kamp Şu An Aktif Değil</h1>
          <p className="text-[#64748b]">Yakında yeni dönem başlıyor. Takipte kal!</p>
        </div>
      </div>
      <Footer />
    </>
  );

  const { hero, painPoints, camp, testimonials, offer, form: formCfg = {} } = content;
  const quota = content._quota || {};
  const remainingQuota = quota.remainingQuota ?? offer?.maxQuota ?? 10;
  const daysLeft = daysUntil(offer?.yksDate);
  const plans = Array.isArray(offer?.plans) ? offer.plans : [];
  const currentPlan = plans[activePlan] || null;

  return (
    <>
      <Seo
        title={`${content.name || "Deneme Kampı"} — Sözderece Koçluk`}
        description={hero.subtitle}
        canonical={`/${content.slug || "deneme-kampi"}`}
      />

      {/* ══════════ HERO ══════════ */}
      <section className="relative bg-gradient-to-br from-[#100481] to-[#0a0a1a] text-white pt-16 pb-20 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f39c12]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#100481]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative text-center">
          {/* Urgency bar */}
          {daysLeft > 0 && (
            <div className="inline-flex items-center gap-2 bg-[#f39c12]/20 border border-[#f39c12]/40 rounded-full px-4 py-1.5 text-sm font-bold mb-5 backdrop-blur">
              ⏳ YKS'ye <span className="text-[#f39c12] font-black">{daysLeft} gün</span> kaldı —&nbsp;
              <span className="text-[#f39c12]">{hero.highlightPhrase || "Sözderece ile"}</span> kontrol sende!
            </div>
          )}

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-5 backdrop-blur">
            🏕 {content.name || "Deneme Kampı"}
          </div>

          <h1 className="text-4xl max-[768px]:text-2xl font-black leading-[1.25] mb-6">
            <span className="block"><HighlightedText text={hero.title} phrase={hero.highlightPhrase || "Sözderece ile"} /></span>
            {hero.titleLine2 && (
              <span className="block"><HighlightedText text={hero.titleLine2} phrase="Kontrol Altında" /></span>
            )}
          </h1>

          <p className="text-white/70 text-lg max-[768px]:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
            <HighlightedText text={hero.subtitle} phrase={hero.highlightPhrase || "Sözderece ile"} />
          </p>

          {/* Chips */}
          {(hero.chip1 || hero.chip2) && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {hero.chip1 && <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur">{hero.chip1}</span>}
              {hero.chip2 && <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur">{hero.chip2}</span>}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={scrollToOffer}
            className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-lg px-10 py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(243,156,18,0.35)] hover:-translate-y-1"
          >
            {hero.buttonText || "Yerini Ayırt"}
          </button>

          {/* CTA Badges */}
          {Array.isArray(hero.ctaBadges) && hero.ctaBadges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {hero.ctaBadges.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur text-white/90">
                  {b.icon && <span>{b.icon}</span>}
                  {b.text}
                </span>
              ))}
            </div>
          )}

          {/* Social proof avatars */}
          {hero.socialProofText && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex -space-x-2">
                {(hero.socialProofAvatars || ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"]).slice(0, 5).map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#100481] flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: color }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-white/80 text-sm font-semibold">{hero.socialProofText}</span>
            </div>
          )}

          {/* Quota alert */}
          {remainingQuota <= 5 && remainingQuota > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-full px-4 py-1.5 text-sm font-bold text-[#fca5a5]">
              🔥 Sadece {remainingQuota} yer kaldı
            </div>
          )}

          {/* Medya: Video veya 3 Resim */}
          <div className="mt-12">
            {hero.mediaType === "images" ? (
              Array.isArray(hero.images) && hero.images.some((img) => img?.url) ? (
                <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto max-[640px]:grid-cols-1">
                  {hero.images.slice(0, 3).map((img, i) =>
                    img?.url ? (
                      <div key={i} className="rounded-2xl overflow-hidden border border-white/10 shadow-xl aspect-[4/3]">
                        <img src={img.url} alt={img.alt || `Görsel ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-10 px-6 max-w-2xl mx-auto flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl">🖼️</div>
                  <p className="text-white/40 text-sm">Görseller henüz eklenmedi</p>
                </div>
              )
            ) : hero.videoUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video max-w-2xl mx-auto">
                <iframe src={hero.videoUrl} title="Tanıtım" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl py-12 px-6 max-w-2xl mx-auto flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl">🎬</div>
                <p className="text-white/40 text-sm">Tanıtım videosu yakında eklenecek</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ PAIN POINTS ══════════ */}
      <section className="bg-[#f8fafc] py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] text-center mb-12">{painPoints.title}</h2>
          <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
            {painPoints.items.map((item, i) => {
              const bgColors = ["bg-[#fef3c7]","bg-[#ede9fe]","bg-[#fce7f3]","bg-[#dcfce7]","bg-[#dbeafe]","bg-[#fff1f2]"];
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${bgColors[i % bgColors.length]} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-[#0f172a] mb-1.5 text-base leading-snug">{item.title}</h3>
                    <p className="text-[#64748b] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ CAMP PROGRAM ══════════ */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] text-center mb-4">{camp.title}</h2>
          <p className="text-[#64748b] text-center mb-12 max-w-2xl mx-auto">{camp.description}</p>

          {/* Timeline */}
          <div className="grid grid-cols-3 gap-5 mb-16 max-[640px]:grid-cols-1">
            {camp.weeks.map((w, i) => (
              <div key={i} className="relative bg-[#f0f4ff] rounded-2xl p-6 border border-[#c7d2fe]">
                <div className="absolute -top-3 left-5 bg-[#100481] text-white text-xs font-black px-3 py-1 rounded-full">{w.week}</div>
                <h3 className="font-black text-[#100481] mb-2 mt-2 text-base">{w.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <h3 className="text-2xl max-[768px]:text-xl font-black text-[#0f172a] text-center mb-6">
            {camp.comparisonTitle || "Neden Sözderece?"}
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] shadow-sm mb-8">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-[#100481] text-white text-sm">
                  <th className="text-left px-5 py-4 font-bold rounded-tl-2xl">Özellik</th>
                  <th className="px-4 py-4 font-bold">Sözderece</th>
                  <th className="px-4 py-4 font-bold">Dershane</th>
                  <th className="px-4 py-4 font-bold rounded-tr-2xl">Tekli Öğretmen</th>
                </tr>
              </thead>
              <tbody>
                {camp.comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                    <td className="px-5 py-3 text-sm font-semibold text-[#374151]">{row.feature}</td>
                    <td className="px-4 py-3 text-center">{row.sozderece ? <Check /> : <Cross />}</td>
                    <td className="px-4 py-3 text-center">{row.dershane ? <Check /> : <Cross />}</td>
                    <td className="px-4 py-3 text-center">{row.tekli ? <Check /> : <Cross />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA below table */}
          <div className="text-center">
            <button
              onClick={scrollToOffer}
              className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-base px-10 py-4 rounded-2xl transition-all shadow-[0_8px_24px_rgba(243,156,18,0.3)] hover:-translate-y-0.5 mb-3"
            >
              {camp.comparisonCTAText || "Hemen Kayıt Ol"}
            </button>
            {camp.comparisonRating && (
              <p className="text-[#f39c12] font-bold text-sm">{camp.comparisonRating}</p>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="bg-[#f8fafc] py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] text-center mb-10">{testimonials.title}</h2>
          <div className="grid grid-cols-3 gap-5 mb-12 max-[640px]:grid-cols-1">
            {testimonials.stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] text-center shadow-sm">
                <div className="text-3xl font-black text-[#100481]">{s.number}</div>
                <div className="text-[#64748b] text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-5 max-[640px]:grid-cols-1">
            {testimonials.items.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center font-black text-[#100481] text-sm flex-shrink-0">
                    {t.name?.[0] || "?"}
                  </div>
                  <span className="font-black text-[#0f172a] text-sm">{t.name}</span>
                  <span className="ml-auto bg-[#dcfce7] text-[#166534] text-xs font-bold px-2.5 py-0.5 rounded-full">{t.badge}</span>
                </div>
                <p className="text-[#475569] text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <span key={j} className="text-[#f39c12]">★</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OFFER + COUNTDOWN ══════════ */}
      <section id="teklif" ref={offerRef} className="relative bg-gradient-to-br from-[#100481] to-[#0a0a1a] py-20 px-5 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#f39c12]/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl max-[768px]:text-2xl font-black mb-3">{offer.title}</h2>

            {/* Countdown */}
            <div className="flex justify-center gap-3 mb-5">
              <CountdownBox value={countdown.days} label="Gün" />
              <CountdownBox value={countdown.hours} label="Saat" />
              <CountdownBox value={countdown.minutes} label="Dakika" />
              <CountdownBox value={countdown.seconds} label="Saniye" />
            </div>

            {remainingQuota > 0 && remainingQuota <= offer.maxQuota && (
              <div className="inline-flex items-center gap-1.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-full px-4 py-1 text-sm font-bold text-[#fca5a5]">
                🔥 Sadece {remainingQuota} yer kaldı
              </div>
            )}
          </div>

          {/* Plan cards */}
          {plans.length > 0 ? (
            <div className={`grid gap-5 mb-10 ${plans.length === 1 ? "max-w-sm mx-auto" : plans.length === 2 ? "grid-cols-2 max-w-2xl mx-auto max-[640px]:grid-cols-1" : "grid-cols-3 max-[768px]:grid-cols-1"}`}>
              {plans.map((plan, i) => {
                const planIncludes = Array.isArray(plan.includes) && plan.includes.length > 0 ? plan.includes : offer.includes;
                return plan.isFeatured ? (
                  /* ── Featured card (white) ── */
                  <div key={i} className="relative bg-white rounded-3xl p-7 flex flex-col shadow-2xl">
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-[#f39c12] text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 mb-5">
                      <p className="text-[#100481] font-black text-sm uppercase tracking-widest mb-3">{plan.label}</p>
                      {plan.oldPrice && (
                        <p className="line-through text-[#9ca3af] text-base">{plan.oldPrice}₺</p>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-black text-[#100481]">{plan.price}₺</span>
                        <span className="text-[#64748b] text-sm font-semibold">{plan.priceText}</span>
                      </div>
                      {plan.desc && <p className="text-[#64748b] text-sm mt-1.5">{plan.desc}</p>}
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      {planIncludes.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-[#374151]">
                          <span className="w-5 h-5 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#166534] text-xs font-black flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => addToCartAndPay(plan, i)}
                      className="w-full py-4 rounded-2xl bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-base transition-all shadow-[0_6px_20px_rgba(243,156,18,0.3)] hover:-translate-y-0.5"
                    >
                      {plan.ctaText || offer.ctaButtonText || "Hemen Başla"}
                    </button>
                  </div>
                ) : (
                  /* ── Normal card (glass) ── */
                  <div key={i} className="relative bg-white/8 border border-white/15 rounded-3xl p-7 flex flex-col backdrop-blur-sm">
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-white/20 text-white text-xs font-black px-5 py-1.5 rounded-full border border-white/30 whitespace-nowrap">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 mb-5">
                      <p className="text-white/60 font-black text-sm uppercase tracking-widest mb-3">{plan.label}</p>
                      {plan.oldPrice && (
                        <p className="line-through text-white/30 text-base">{plan.oldPrice}₺</p>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-black text-white">{plan.price}₺</span>
                        <span className="text-white/50 text-sm font-semibold">{plan.priceText}</span>
                      </div>
                      {plan.desc && <p className="text-white/50 text-sm mt-1.5">{plan.desc}</p>}
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      {planIncludes.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#22c55e] text-xs font-black flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => addToCartAndPay(plan, i)}
                      className="w-full py-4 rounded-2xl border-2 border-white/30 hover:border-white/60 text-white font-black text-base transition-all hover:bg-white/10"
                    >
                      {plan.ctaText || offer.ctaButtonText || "Başla"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Fallback: no plans, single price ── */
            <div className="max-w-sm mx-auto bg-white/8 border border-white/15 rounded-3xl p-8 text-center mb-10 backdrop-blur-sm">
              <div className="text-6xl font-black text-[#f39c12] mb-1">{offer.price}₺</div>
              <p className="text-white/50 text-sm mb-6">Tüm vergiler dahil</p>
              <ul className="space-y-2 mb-6 text-left">
                {offer.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-[#22c55e]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => addToCartAndPay({ price: offer.price, label: offer.ctaButtonText || "Deneme Kampı" }, 0)}
                className="w-full py-4 rounded-2xl bg-[#f39c12] hover:bg-[#d35400] text-white font-black transition-all"
              >
                {offer.ctaButtonText || "Hemen Başla"}
              </button>
            </div>
          )}

          {/* Guarantees */}
          <div className="flex flex-wrap justify-center gap-3">
            {offer.guarantees.map((g, i) => (
              <span key={i} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur">🛡 {g}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COACHES ══════════ */}
      {coaches.length > 0 && (
        <section className="bg-white py-20 px-5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] text-center mb-3">Koçlarımız</h2>
            <p className="text-[#64748b] text-center mb-12 max-w-xl mx-auto">Alanında uzman, sınav deneyimli koçlarımızla sınava kadar yanındayız.</p>
            <div className="grid grid-cols-3 gap-6 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
              {coaches.map((coach) => (
                <div key={coach.id} className="bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0] text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md bg-[#eff6ff] flex items-center justify-center">
                    {coach.image ? (
                      <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-[#100481]">{coach.name?.[0] || "K"}</span>
                    )}
                  </div>
                  <h3 className="font-black text-[#0f172a] text-base mb-1">{coach.name}</h3>
                  {coach.subject && <p className="text-[#f39c12] text-xs font-bold mb-2 uppercase tracking-wide">{coach.subject}</p>}
                  {coach.description && <p className="text-[#64748b] text-sm leading-relaxed line-clamp-3">{coach.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FORM ══════════ */}
      <section id="kayit" ref={formRef} className="bg-[#f8fafc] py-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] mb-3">
              {formCfg.title || "Yerini Şimdi Ayırt"}
            </h2>
            <p className="text-[#64748b]">{formCfg.subtitle || "Kontenjan dolmadan başvurunu tamamla. Ücretsiz ön görüşme ile başla."}</p>
            {remainingQuota > 0 && (
              <span className="inline-flex items-center gap-1 mt-3 bg-[#fef2f2] text-[#991b1b] text-xs font-bold px-3 py-1 rounded-full border border-[#fecaca]">
                🔥 Sadece {remainingQuota} yer kaldı
              </span>
            )}
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#e2e8f0] shadow-sm">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-[#0f172a] mb-2">{formCfg.successTitle || "Başvurun Alındı!"}</h3>
              <p className="text-[#64748b] mb-6">{formCfg.successText || "En kısa sürede seninle iletişime geçeceğiz."}</p>
              <button onClick={() => navigate("/")} className="text-[#100481] font-bold text-sm hover:underline">Ana sayfaya dön</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-4 max-[480px]:grid-cols-1">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Ad</label>
                  <input className={inpCls} placeholder="Adın" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Soyad</label>
                  <input className={inpCls} placeholder="Soyadın" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#374151] mb-1">Telefon</label>
                <input className={inpCls} type="tel" placeholder="05XX XXX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#374151] mb-1">E-posta</label>
                <input className={inpCls} type="email" placeholder="eposta@ornek.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#374151] mb-1">Sınıf</label>
                <select className={`${inpCls} cursor-pointer`} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                  <option value="">Sınıfını seç</option>
                  <option value="9">9. Sınıf</option>
                  <option value="10">10. Sınıf</option>
                  <option value="11">11. Sınıf</option>
                  <option value="12">12. Sınıf</option>
                  <option value="mezun">Mezun</option>
                </select>
              </div>

              {formError && (
                <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-sm px-4 py-3 rounded-xl mb-4">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit("free")}
                  className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 border-[#100481] text-[#100481] font-black text-sm transition-all hover:bg-[#eff6ff] disabled:opacity-50"
                >
                  <span>{formCfg.freeButtonText || "🆓 Ücretsiz Görüşme"}</span>
                  <span className="text-xs font-normal text-[#64748b]">{formCfg.freeButtonSub || "Tanışalım, ihtiyacını anlayalım"}</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit("paid")}
                  className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(243,156,18,0.3)] disabled:opacity-50"
                >
                  <span>{formCfg.paidButtonText || "💳 Hemen Başla"}</span>
                  <span className="text-xs font-normal text-white/80">
                    {currentPlan ? `${currentPlan.price}₺ ${currentPlan.priceText}` : `${offer.price}₺ — Sınava Kadar`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
