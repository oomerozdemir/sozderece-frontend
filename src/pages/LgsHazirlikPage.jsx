import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import useCart from "../hooks/useCart";
import Seo from "../components/Seo";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };
const inp = "w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm text-[#0f172a] outline-none focus:border-page-navy focus:ring-2 focus:ring-page-navy/10 transition-all bg-white font-nunito";

function FaqAccordion({ faqData }) {
  const [open, setOpen] = useState(null);
  const items = faqData?.items || [];
  const title = faqData?.title || "Sık Sorulan Sorular";
  if (!items.length) return null;
  return (
    <section className="bg-white py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>SSS</div>
          <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(26px,4vw,40px)" }}>{title}</h2>
        </motion.div>
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(i * 0.07, 0.35) }}>
                <div
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ${isOpen ? "border-page-navy shadow-[0_0_0_3px_rgba(28,27,138,0.06),0_8px_24px_rgba(28,27,138,0.08)] bg-white" : "border-[#e2e8f0] bg-white hover:border-page-navy/30"}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${isOpen ? "bg-lime" : "bg-transparent"}`} />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`font-nunito font-bold text-base transition-colors duration-200 ${isOpen ? "text-page-navy" : "text-[#0f172a]"}`}>{item.question}</h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-black transition-all duration-300 ${isOpen ? "bg-lime text-page-navy rotate-45" : "bg-[#f1f5f9] text-[#64748b] rotate-0"}`}>+</div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-[400ms] ${isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                      <p className="font-nunito text-[#475569] text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function LgsHazirlikPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [lgsPackage, setLgsPackage] = useState(null);
  const { cart, addToCart, removeFromCart } = useCart();
  const [quota, setQuota] = useState({ remainingQuota: null, maxQuota: 10 });
  const [showSticky, setShowSticky] = useState(false);
  const [stickyHidden, setStickyHidden] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", grade: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const offerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    axios.get("/api/lgs-content").then((r) => setContent(r.data)).catch(() => {});
    axios.get("/api/settings/lgs").then((r) => setQuota(r.data)).catch(() => {});
    // YksYolculuguPage.jsx ile aynı düzeltme: fiyat, admin panelinde elle
    // girilen içerik metni yerine gerçek paket fiyatından okunur — böylece
    // paket fiyatı değiştiğinde bu sayfa da otomatik güncellenir.
    axios.get("/api/packages")
      .then((r) => {
        const pkg = r.data?.packages?.find((p) => p.slug === "lgs-kocluk-paketi" || p.type === "lgs");
        if (pkg) setLgsPackage(pkg);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!offerRef.current) return;
    const obs = new IntersectionObserver(([e]) => setStickyHidden(e.isIntersecting), { threshold: 0.1 });
    obs.observe(offerRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollToOffer = () => offerRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const addToCartAndPay = async (plan, planIndex) => {
    const price = parseInt(plan.price);
    if (!price || isNaN(price)) { alert("Bu plan için fiyat bilgisi eksik."); return; }
    const slug = `lgs-hazirlik-plan-${planIndex}`;
    const title = plan.label || "LGS Hazırlık";
    try {
      if (Array.isArray(cart) && cart.length > 0) {
        for (const item of cart) { await removeFromCart(item.slug); }
      }
      await addToCart({ slug, title, unitPrice: price * 100 });
      navigate("/payment");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (err?.response?.status === 401 || msg.toLowerCase().includes("giriş")) {
        navigate("/giris-yap", { state: { next: "/payment" } });
      } else {
        alert("Bir hata oluştu, lütfen tekrar deneyin.");
      }
    }
  };

  const handleFormChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setFormError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.grade) { setFormError("Ad soyad, telefon ve sınıf zorunludur."); return; }
    setSubmitting(true);
    try {
      await axios.post("/api/lgs-application", { ...form, type: "call" });
      setSubmitted(true);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Bir hata oluştu, tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D0A2E" }}>
        <div className="font-nunito text-white/40 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  const price = String(lgsPackage?.price || content.offer?.price || "2500");
  const remaining = quota.remainingQuota;
  const hero = content.hero || {};
  const painPoints = content.painPoints || {};
  const howItWorks = content.howItWorks || {};
  const socialProof = content.socialProof || {};
  const offer = content.offer || {};
  const formContent = content.form || {};
  const plans = Array.isArray(offer.plans) ? offer.plans : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`
        @keyframes lgsOrb1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-18px) translateX(8px)}}
        @keyframes lgsOrb2{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(12px) translateX(-10px)}}
        @keyframes lgsShimmer{0%,100%{opacity:1}50%{opacity:0.75}}
      `}</style>

      <Seo title="LGS'ye Hazırlık | Kişisel Öğrenci Koçluğu" description="LGS sürecinde günlük WhatsApp takibi, deneme analizi ve veli raporuyla çocuğunuzun sınava hazırlanmasını sağlıyoruz. Sözderece LGS Koçluğu." canonical="/lgs-hazirlik" />

      <TopBar />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-24 px-5 text-white" style={{ background: "#0D0A2E" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 500, height: 500, background: "#7340C8", filter: "blur(120px)", opacity: 0.22, top: -120, right: -100, animation: "lgsOrb1 7s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 340, height: 340, background: "#1C1B8A", filter: "blur(90px)", opacity: 0.4, bottom: -60, left: -80, animation: "lgsOrb2 9s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, background: "#FF6B35", filter: "blur(80px)", opacity: 0.13, top: "40%", left: "28%" }} />

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border font-nunito font-bold text-xs" style={{ background: "rgba(216,255,79,0.1)", borderColor: "rgba(216,255,79,0.25)", color: "#D8FF4F" }}>
              🎯 2027 LGS Öğrencilerine Özel
            </div>

            <h1 className="font-fredoka font-bold leading-tight mb-4" style={{ fontSize: "clamp(28px,5vw,52px)", animation: "lgsShimmer 4s ease-in-out infinite" }}>
              Çocuğunuz Masaya Oturmuyor mu?<br />
              <span style={{ color: "#D8FF4F" }}>{hero.titleAccent || "Kalan Sürede Kontrolü Bize Bırakın."}</span>
            </h1>

            <p className="font-nunito font-bold text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(15px,2vw,18px)" }}>
              {hero.subtitle || "Her gün yanında biri var: koçu, planı, sistemi."}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[hero.chip1, hero.chip2, remaining !== null && remaining > 0 ? `🔥 Sadece ${remaining} yer kaldı` : null].filter(Boolean).map((chip, i) => (
                <span key={i} className="font-nunito font-bold text-xs px-4 py-1.5 rounded-full border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)" }}>{chip}</span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToOffer}
              className="font-fredoka font-bold text-base px-10 py-4 rounded-full"
              style={{ background: "#D8FF4F", color: "#1C1B8A", boxShadow: "0 10px 32px rgba(216,255,79,0.35)" }}
            >
              {hero.ctaPrimary || "⚡ Yerimi Şimdi Ayırt →"}
            </motion.button>

            {(hero.mediaType === "images" ? Array.isArray(hero.images) && hero.images.some((img) => img?.url) : !!hero.videoUrl) && (
              <div className="mt-10 max-w-3xl mx-auto w-full">
                {hero.mediaType === "images" ? (
                  <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                    {hero.images.slice(0, 3).map((img, i) => img?.url ? (
                      <div key={i} className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: "rgba(255,255,255,0.1)", aspectRatio: "4/3" }}>
                        <img src={img.url} alt={img.alt || `Görsel ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ) : null)}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border aspect-video" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <iframe src={hero.videoUrl} title="Tanıtım" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── ACI NOKTALARI ── */}
      {painPoints.items?.length > 0 && (
        <section className="py-20 px-5" style={{ background: "#f4f2fa" }}>
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>TANIDIK MI?</div>
              <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
                {painPoints.title || "Tanıdık geliyor mu?"}
              </h2>
              {painPoints.subtitle && <p className="font-nunito font-bold text-[#64748b] mt-2">{painPoints.subtitle}</p>}
            </motion.div>

            <div className="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1 max-[1024px]:grid-cols-2">
              {painPoints.items.map((p, i) => {
                const accents = ["#D8FF4F", "#FF6B35", "#7340C8", "#D8FF4F", "#FF6B35", "#7340C8"];
                const accent = accents[i % 6];
                const emojis = ["📉", "📱", "📋", "❓", "💔", ""];
                return (
                  <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-[0_8px_24px_rgba(28,27,138,0.09)] hover:border-page-navy/20 transition-shadow duration-200 flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${accent}22`, color: accent }}>
                      {emojis[i % 6]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-nunito font-bold text-[#0f172a] text-sm mb-1">{p.title}</h3>
                      <p className="font-nunito text-[#64748b] text-xs leading-relaxed">{p.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div {...fadeUp} className="mt-12 text-center">
              <p className="font-nunito font-bold text-[#475569] text-base max-w-xl mx-auto mb-5 leading-relaxed">
                Eğer bunlardan en az birini yaşıyorsan, yanlış giden bir şeyler var demektir.{" "}
                <span className="text-page-navy">Gel, sana özel bir çıkış yolu çizelim.</span>
              </p>
              <button onClick={scrollToForm} className="font-fredoka font-bold text-sm px-8 py-3.5 rounded-full transition-all hover:scale-105 inline-flex items-center gap-2" style={{ background: "#1C1B8A", color: "#D8FF4F", boxShadow: "0 4px 16px rgba(28,27,138,0.25)" }}>
                Bu Yükü Biz Devralalım → Ücretsiz Veli Görüşmesi
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── NASIL ÇALIŞIR ── */}
      {(howItWorks.steps?.length > 0 || howItWorks.comparison?.length > 0) && (
        <section className="py-20 px-5 text-white relative overflow-hidden" style={{ background: "#1C1B8A" }}>
          <div className="absolute rounded-full pointer-events-none" style={{ width: 320, height: 320, background: "#7340C8", filter: "blur(90px)", opacity: 0.3, top: -60, right: -60 }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, background: "#0D0A2E", filter: "blur(70px)", opacity: 0.5, bottom: -40, left: -40 }} />
          <div className="max-w-5xl mx-auto relative">
            {howItWorks.steps?.length > 0 && (
              <>
                <motion.div {...fadeUp} className="text-center mb-12">
                  <div className="font-fredoka font-bold text-lime text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>NASIL ÇALIŞIR</div>
                  <h2 className="font-fredoka font-bold text-white m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
                    <span style={{ color: "#D8FF4F" }}>Sözderece</span> LGS'de Nasıl Çalışır?
                  </h2>
                </motion.div>
                <div className="grid grid-cols-3 gap-6 mb-16 max-[768px]:grid-cols-1">
                  {howItWorks.steps.map((s, i) => (
                    <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -4, borderColor: "rgba(216,255,79,0.4)" }}
                      className="rounded-2xl p-6 border relative" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.14)" }}>
                      <div className="font-fredoka font-bold mb-3" style={{ fontSize: 52, color: "rgba(216,255,79,0.18)", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                      <h3 className="font-nunito font-bold text-white text-sm mb-2">{s.title}</h3>
                      <p className="font-nunito text-white/55 text-xs leading-relaxed">{s.desc}</p>
                      <div className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center font-fredoka font-bold text-xs" style={{ background: "#D8FF4F", color: "#1C1B8A" }}>{i + 1}</div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {howItWorks.comparison?.length > 0 && (
              <motion.div {...fadeUp}>
                <h3 className="font-fredoka font-bold text-white text-xl text-center mb-6">{howItWorks.comparisonTitle || "Neden Sözderece?"}</h3>
                <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <div className="grid grid-cols-3 font-nunito font-bold text-sm" style={{ background: "#0D0A2E" }}>
                    <div className="px-5 py-3 text-white/60">Özellik</div>
                    <div className="px-5 py-3 text-center" style={{ color: "#D8FF4F" }}>Sözderece</div>
                    <div className="px-5 py-3 text-center text-white/35">Dershane / Özel Ders</div>
                  </div>
                  {howItWorks.comparison.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 text-sm" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)" }}>
                      <div className="px-5 py-3 font-nunito font-bold text-white/65">{row.label}</div>
                      <div className="px-5 py-3 text-center font-fredoka font-bold" style={{ color: "#D8FF4F" }}>✓</div>
                      <div className="px-5 py-3 text-center text-white/30 font-fredoka font-bold">✗</div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button onClick={scrollToOffer} className="font-fredoka font-bold text-base px-10 py-4 rounded-full transition-all hover:scale-105" style={{ background: "#D8FF4F", color: "#1C1B8A", boxShadow: "0 8px 24px rgba(216,255,79,0.3)" }}>
                    {howItWorks.comparisonCta || "Hemen Kayıt Ol →"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ── SOSYAL KANIT ── */}
      {(socialProof.stats?.length > 0 || socialProof.testimonials?.length > 0) && (
        <section className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>SOSYAL KANIT</div>
              <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
                {socialProof.title || "Sadece söz değil,"}{" "}
                <span style={{ color: "#FF6B35" }}>{socialProof.titleAccent || "aileler konuşuyor"}</span>
              </h2>
            </motion.div>

            {socialProof.stats?.length > 0 && (
              <div className="grid gap-5 mb-12 max-[640px]:grid-cols-2" style={{ gridTemplateColumns: `repeat(${Math.min(socialProof.stats.length + (remaining > 0 ? 1 : 0), 4)}, minmax(0,1fr))` }}>
                {socialProof.stats.map((s, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="rounded-2xl p-6 border border-[#e2e8f0] text-center shadow-sm" style={{ background: i % 2 === 0 ? "#f4f2fa" : "#fff0ea" }}>
                    <div className="font-fredoka font-bold text-page-navy mb-1" style={{ fontSize: "clamp(28px,3vw,40px)" }}>{s.val}</div>
                    <div className="font-nunito font-bold text-sm text-[#64748b]">{s.label}</div>
                  </motion.div>
                ))}
                {remaining !== null && remaining > 0 && (
                  <motion.div {...fadeUp} transition={{ delay: socialProof.stats.length * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="rounded-2xl p-6 border text-center shadow-sm" style={{ background: "#0D0A2E", borderColor: "#0D0A2E" }}>
                    <div className="font-fredoka font-bold mb-1" style={{ fontSize: "clamp(28px,3vw,40px)", color: "#D8FF4F" }}>{remaining}</div>
                    <div className="font-nunito font-bold text-sm text-white/50">yer kaldı</div>
                  </motion.div>
                )}
              </div>
            )}

            {socialProof.testimonials?.length > 0 && (
              <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
                {socialProof.testimonials.map((t, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-[0_8px_24px_rgba(28,27,138,0.09)] transition-shadow duration-200 flex flex-col gap-3">
                    <div className="flex gap-0.5">{Array(5).fill(0).map((_, j) => <span key={j} style={{ color: "#FF6B35" }}>★</span>)}</div>
                    <p className="font-nunito text-[#374151] text-sm leading-relaxed italic flex-grow">"{t.quote}"</p>
                    <div className="flex items-center gap-3 pt-2 border-t border-[#f1f5f9]">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-fredoka font-bold text-sm flex-shrink-0" style={{ background: t.isParent ? "#1C1B8A" : "#FF6B35" }}>
                        {t.author?.[0]?.toUpperCase() || (t.isParent ? "V" : "Ö")}
                      </div>
                      <div>
                        <p className="font-nunito font-bold text-xs text-[#0f172a]">{t.author}</p>
                        <p className="font-nunito text-xs text-[#94a3b8]">{t.isParent ? "Veli" : "Öğrenci"}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TEKLİF + FORM ── */}
      <section id="lgs-teklif" ref={offerRef} className="relative py-20 px-5 text-white overflow-hidden" style={{ background: "#0D0A2E" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 380, height: 380, background: "#7340C8", filter: "blur(110px)", opacity: 0.2, top: -60, right: -60, animation: "lgsOrb1 8s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 280, height: 280, background: "#1C1B8A", filter: "blur(80px)", opacity: 0.35, bottom: -40, left: -40, animation: "lgsOrb2 10s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 180, height: 180, background: "#FF6B35", filter: "blur(70px)", opacity: 0.1, top: "35%", left: "22%" }} />

        <div className="max-w-5xl mx-auto relative">
          <motion.div {...fadeUp} className="text-center mb-8">
            <div className="font-fredoka font-bold text-lime text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>PAKETLER</div>
            <h2 className="font-fredoka font-bold text-white m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,44px)" }}>
              {offer.title || "LGS'ye Kadar Yanındayız"}
            </h2>
            <p className="font-nunito font-bold text-white/45 text-sm mt-2">{offer.subtitle || "Planını seç, hemen başla."}</p>
            {remaining !== null && remaining > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 font-nunito font-bold text-xs mt-4 border" style={{ background: "rgba(239,68,68,0.18)", borderColor: "rgba(239,68,68,0.35)", color: "#fca5a5" }}>
                🔥 Sadece {remaining} yer kaldı
              </div>
            )}
          </motion.div>

          {plans.length > 0 ? (
            <div className="grid gap-8 max-[900px]:grid-cols-1" style={{ gridTemplateColumns: "1fr auto" }}>
              <motion.div {...fadeUp}>
                <div className={`grid gap-5 max-[640px]:grid-cols-1 ${plans.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-2"}`}>
                  {plans.map((plan, i) => {
                    const planIncludes = Array.isArray(plan.includes) && plan.includes.length > 0 ? plan.includes : (offer.includes || []);
                    return plan.isFeatured ? (
                      <div key={i} className="relative bg-white rounded-3xl p-7 flex flex-col shadow-2xl">
                        {plan.badge && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="font-fredoka font-bold text-xs px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap" style={{ background: "#D8FF4F", color: "#1C1B8A" }}>{plan.badge}</span>
                          </div>
                        )}
                        <div className="pt-2 mb-5">
                          <p className="font-fredoka font-bold text-page-navy text-xs uppercase mb-2" style={{ letterSpacing: 3 }}>{plan.label}</p>
                          {plan.oldPrice && <p className="line-through text-[#9ca3af] text-sm font-nunito">₺{plan.oldPrice}</p>}
                          <div className="flex items-baseline gap-1">
                            <span className="font-fredoka font-bold text-page-navy" style={{ fontSize: "clamp(30px,4vw,44px)" }}>₺{plan.price}</span>
                            {plan.priceText && <span className="font-nunito text-[#64748b] text-xs">{plan.priceText}</span>}
                          </div>
                          {plan.desc && <p className="font-nunito text-[#64748b] text-xs mt-1">{plan.desc}</p>}
                          <p className="font-nunito font-bold text-[#166534] text-xs mt-1">✓ 14 gün içinde memnun kalmazsanız iade alırsınız</p>
                        </div>
                        {planIncludes.length > 0 && (
                          <ul className="space-y-1.5 mb-6 flex-grow">
                            {planIncludes.map((item, j) => (
                              <li key={j} className="flex items-center gap-2 font-nunito text-xs text-[#374151]">
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: "#D8FF4F", color: "#1C1B8A" }}>✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => addToCartAndPay(plan, i)} className="w-full py-3.5 rounded-full font-fredoka font-bold text-sm" style={{ background: "#FF6B35", color: "white", boxShadow: "0 6px 20px rgba(255,107,53,0.3)" }}>
                          {plan.ctaText || "⚡ Yerimi Ayırt"}
                        </motion.button>
                      </div>
                    ) : (
                      <div key={i} className="relative rounded-3xl p-7 flex flex-col border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.11)", backdropFilter: "blur(8px)" }}>
                        {plan.badge && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="font-fredoka font-bold text-xs px-5 py-1.5 rounded-full border whitespace-nowrap" style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.28)", color: "white" }}>{plan.badge}</span>
                          </div>
                        )}
                        <div className="pt-2 mb-5">
                          <p className="font-fredoka font-bold text-white/45 text-xs uppercase mb-2" style={{ letterSpacing: 3 }}>{plan.label}</p>
                          {plan.oldPrice && <p className="line-through text-white/25 text-sm font-nunito">₺{plan.oldPrice}</p>}
                          <div className="flex items-baseline gap-1">
                            <span className="font-fredoka font-bold text-white" style={{ fontSize: "clamp(30px,4vw,44px)" }}>₺{plan.price}</span>
                            {plan.priceText && <span className="font-nunito text-white/40 text-xs">{plan.priceText}</span>}
                          </div>
                          {plan.desc && <p className="font-nunito text-white/40 text-xs mt-1">{plan.desc}</p>}
                          <p className="font-nunito font-bold text-xs mt-1" style={{ color: "#D8FF4F" }}>✓ 14 gün içinde memnun kalmazsanız iade alırsınız</p>
                        </div>
                        {planIncludes.length > 0 && (
                          <ul className="space-y-1.5 mb-6 flex-grow">
                            {planIncludes.map((item, j) => (
                              <li key={j} className="flex items-center gap-2 font-nunito text-xs text-white/55">
                                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-black text-[10px] flex-shrink-0" style={{ color: "#D8FF4F" }}>✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={() => addToCartAndPay(plan, i)} className="w-full py-3.5 rounded-full border-2 font-fredoka font-bold text-sm transition-colors hover:bg-white/10" style={{ borderColor: "rgba(255,255,255,0.22)", color: "white" }}>
                          {plan.ctaText || "Başla"}
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="w-[340px] max-[900px]:w-full">
                <div id="lgs-form" ref={formRef} className="bg-white rounded-3xl p-7 border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <h3 className="font-fredoka font-bold text-page-navy text-xl mb-0.5">{formContent.title || "Hâlâ sorunuz var mı?"}</h3>
                  <p className="font-nunito text-[#64748b] text-xs mb-5">{formContent.subtitle || "Formu doldurun, sizi arayalım."}</p>
                  {submitted ? (
                    <div className="py-8 text-center">
                      <div className="text-4xl mb-2">✅</div>
                      <h4 className="font-fredoka font-bold text-page-navy text-base mb-1">{formContent.successTitle || "Başvurunuz alındı!"}</h4>
                      <p className="font-nunito text-[#64748b] text-xs">{formContent.successSubtitle || "En kısa sürede sizi arayacağız."}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                      <div><label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Ad Soyad *</label><input name="name" value={form.name} onChange={handleFormChange} className={inp} placeholder="Ayşe Yılmaz" required /></div>
                      <div><label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Telefon *</label><input name="phone" type="tel" value={form.phone} onChange={handleFormChange} className={inp} placeholder="05XX XXX XX XX" required /></div>
                      <div>
                        <label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Mesajınız (opsiyonel)</label>
                        <textarea name="message" value={form.message} onChange={handleFormChange} className={`${inp} resize-none h-16`} placeholder="Merak ettiklerinizi yazabilirsiniz..." />
                      </div>
                      {formError && <p className="font-nunito text-red-500 text-xs">{formError}</p>}
                      <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-full font-fredoka font-bold text-sm transition-all disabled:opacity-60 hover:-translate-y-0.5" style={{ background: "#1C1B8A", color: "#D8FF4F", boxShadow: "0 6px 20px rgba(28,27,138,0.25)" }}>
                        {submitting ? "Gönderiliyor..." : (formContent.submitText || "Gönder, Sizi Arayalım →")}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Plansız fallback */
            <div className="grid grid-cols-2 gap-8 max-[768px]:grid-cols-1">
              <motion.div {...fadeUp} className="rounded-3xl p-8 flex flex-col border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.11)", backdropFilter: "blur(8px)" }}>
                <div className="mb-6">
                  <div className="font-fredoka font-bold" style={{ fontSize: "clamp(34px,4vw,52px)", color: "#D8FF4F" }}>₺{price}</div>
                  <p className="font-nunito text-white/40 text-xs mt-1">{offer.priceLabel || "LGS'ye kadar, tek seferlik"}</p>
                  <p className="font-nunito font-bold text-sm mt-1" style={{ color: "#D8FF4F" }}>✓ 14 gün içinde memnun kalmazsanız iade alırsınız</p>
                </div>
                {offer.includes?.length > 0 && (
                  <ul className="space-y-2 mb-8 flex-grow">
                    {offer.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 font-nunito text-sm text-white/65">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: "rgba(216,255,79,0.15)", color: "#D8FF4F" }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-col gap-3">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(offer.buyLink || "/paket-detay")} className="w-full py-4 rounded-full font-fredoka font-bold text-base" style={{ background: "#D8FF4F", color: "#1C1B8A", boxShadow: "0 6px 20px rgba(216,255,79,0.3)" }}>
                    {offer.ctaPrimary || "⚡ Yerimi Ayırt"}
                  </motion.button>
                  <button onClick={scrollToForm} className="w-full py-3.5 rounded-full border-2 font-fredoka font-bold text-sm transition-all hover:bg-white/10" style={{ borderColor: "rgba(255,255,255,0.22)", color: "white" }}>
                    {offer.ctaSecondary || "📞 Önce Konuşalım"}
                  </button>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <div id="lgs-form" ref={formRef} className="bg-white rounded-3xl p-8 border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <h3 className="font-fredoka font-bold text-page-navy text-xl mb-1">{formContent.title || "Hâlâ sorunuz var mı?"}</h3>
                  <p className="font-nunito text-[#64748b] text-sm mb-6">{formContent.subtitle || "Formu doldurun, sizi arayalım."}</p>
                  {submitted ? (
                    <div className="py-10 text-center">
                      <div className="text-5xl mb-3">✅</div>
                      <h4 className="font-fredoka font-bold text-page-navy text-lg mb-1">{formContent.successTitle || "Başvurunuz alındı!"}</h4>
                      <p className="font-nunito text-[#64748b] text-sm">{formContent.successSubtitle || "En kısa sürede sizi arayacağız."}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div><label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Ad Soyad *</label><input name="name" value={form.name} onChange={handleFormChange} className={inp} placeholder="Ayşe Yılmaz" required /></div>
                      <div><label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Telefon *</label><input name="phone" type="tel" value={form.phone} onChange={handleFormChange} className={inp} placeholder="05XX XXX XX XX" required /></div>
                      <div>
                        <label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Kaçıncı sınıf? *</label>
                        <select name="grade" value={form.grade} onChange={handleFormChange} className={inp} required>
                          <option value="">Seçiniz</option>
                          <option value="7. Sınıf">7. Sınıf</option>
                          <option value="8. Sınıf">8. Sınıf</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-nunito font-bold text-xs text-[#374151] block mb-1">Mesajınız (opsiyonel)</label>
                        <textarea name="message" value={form.message} onChange={handleFormChange} className={`${inp} resize-none h-20`} placeholder="Merak ettiklerinizi yazabilirsiniz..." />
                      </div>
                      {formError && <p className="font-nunito text-red-500 text-xs">{formError}</p>}
                      <button type="submit" disabled={submitting} className="w-full py-4 rounded-full font-fredoka font-bold text-base transition-all disabled:opacity-60 hover:-translate-y-0.5" style={{ background: "#1C1B8A", color: "#D8FF4F", boxShadow: "0 6px 20px rgba(28,27,138,0.25)" }}>
                        {submitting ? "Gönderiliyor..." : (formContent.submitText || "Gönder, Sizi Arayalım →")}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <FaqAccordion faqData={content?.faq} />

      <div className="py-4 text-center border-t border-[#e2e8f0]">
        <p className="font-nunito text-xs text-[#94a3b8]">
          LGS sonrası doğru liseyi nasıl seçeceğini mi merak ediyorsun?{" "}
          <Link to="/blog/lgs-tercih-rehberi" className="underline hover:text-page-navy transition-colors">
            LGS Tercih Rehberi'ni oku
          </Link>
          .
        </p>
        <p className="font-nunito text-xs text-[#94a3b8] mt-1">
          Resmi LGS sınav takvimi için{" "}
          <a href="https://www.meb.gov.tr" target="_blank" rel="noopener noreferrer" className="underline hover:text-page-navy transition-colors">
            Milli Eğitim Bakanlığı
          </a>{" "}
          sayfasını ziyaret edebilirsiniz.
        </p>
      </div>

      <Footer />

      {/* Sticky CTA */}
      {showSticky && !stickyHidden && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t" style={{ background: "rgba(13,10,46,0.95)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div className="font-nunito font-bold text-sm text-white flex items-center gap-2">
              {remaining !== null && remaining > 0 && <span style={{ color: "#ef4444" }}>🔥 {remaining} yer kaldı ·</span>}
              <span className="text-white/45">₺{price} / LGS'ye kadar</span>
            </div>
            <button onClick={scrollToOffer} className="font-fredoka font-bold text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105 whitespace-nowrap" style={{ background: "#D8FF4F", color: "#1C1B8A", boxShadow: "0 4px 12px rgba(216,255,79,0.3)" }}>
              {hero.navbarCta || "⚡ Yerimi Ayırt →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
