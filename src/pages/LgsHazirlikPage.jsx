import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import Footer from "../components/Footer";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };
const inp = "w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm text-[#0f172a] outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

function daysLeft(lgsDate) {
  return Math.max(0, Math.ceil((new Date(lgsDate) - new Date()) / (1000 * 60 * 60 * 24)));
}

export default function LgsHazirlikPage() {
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
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

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.grade) {
      setFormError("Ad soyad, telefon ve sınıf zorunludur.");
      return;
    }
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#94a3b8] text-sm">Yükleniyor...</div>
      </div>
    );
  }

  const days = daysLeft(content.lgsDate || "2026-06-14");
  const price = content.offer?.price || "2500";
  const dailyCost = days > 0 ? Math.round(parseInt(price) / days) : parseInt(price);
  const remaining = quota.remainingQuota;
  const hero = content.hero || {};
  const painPoints = content.painPoints || {};
  const howItWorks = content.howItWorks || {};
  const socialProof = content.socialProof || {};
  const offer = content.offer || {};
  const formContent = content.form || {};

  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      {/* ── Navbar ── */}
      <header className="bg-white border-b border-[#f1f5f9] sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <img src="/images/hero-logo.webp" alt="Sözderece" className="h-9 w-auto" />
          <button
            onClick={scrollToOffer}
            className="text-xs font-bold bg-[#f39c12] hover:bg-[#d35400] text-white px-4 py-2 rounded-xl transition-colors"
          >
            {hero.navbarCta || "Yerimi Ayırt →"}
          </button>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="relative bg-gradient-to-br from-[#100481] to-[#0a0357] text-white py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#f39c12]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              📅 LGS'ye <span className="text-[#f39c12] font-black">{days} gün</span> kaldı
            </div>

            <h1 className="text-4xl max-[640px]:text-3xl font-black leading-tight mb-4">
              LGS'ye {days} gün kaldı.<br />
              <span className="text-[#f39c12]">Çocuğunuz hazır mı?</span>
            </h1>
            <p className="text-white/70 text-lg max-[640px]:text-base mb-8">
              {hero.subtitle || "Her gün yanında biri var — koçu, planı, sistemi."}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                hero.chip1,
                hero.chip2,
                remaining !== null && remaining > 0 ? `🔥 Sadece ${remaining} yer kaldı` : null,
              ].filter(Boolean).map((chip, i) => (
                <span key={i} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={scrollToOffer}
                className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(243,156,18,0.35)] hover:-translate-y-0.5"
              >
                {hero.ctaPrimary || "⚡ Yerimi Şimdi Ayırt →"}
              </button>
              <button
                onClick={scrollToForm}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all"
              >
                {hero.ctaSecondary || "📞 Önce Konuşalım"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ ACI NOKTALARI ══════════ */}
      {(painPoints.items?.length > 0) && (
        <section className="py-20 px-5 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl max-[640px]:text-2xl font-black text-[#0f172a]">
                {painPoints.title || "Tanıdık geliyor mu?"}
              </h2>
              {painPoints.subtitle && (
                <p className="text-[#64748b] mt-2">{painPoints.subtitle}</p>
              )}
            </motion.div>
            <div className="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1 max-[1024px]:grid-cols-2">
              {painPoints.items.map((p, i) => (
                <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{p.emoji}</div>
                  <h3 className="font-bold text-[#0f172a] text-base mb-1">{p.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ NASIL ÇALIŞIR ══════════ */}
      {(howItWorks.steps?.length > 0 || howItWorks.comparison?.length > 0) && (
        <section className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            {howItWorks.steps?.length > 0 && (
              <>
                <motion.div {...fadeUp} className="text-center mb-12">
                  <h2 className="text-3xl max-[640px]:text-2xl font-black text-[#0f172a]">
                    <span className="text-[#f39c12]">Sözderece</span> LGS'de Nasıl Çalışır?
                  </h2>
                </motion.div>
                <div className="grid grid-cols-3 gap-6 mb-16 max-[768px]:grid-cols-1">
                  {howItWorks.steps.map((s, i) => (
                    <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="relative bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0]">
                      <div className="text-4xl font-black text-[#100481]/10 mb-3">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-black text-[#0f172a] text-base mb-2">{s.title}</h3>
                      <p className="text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
                      <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#100481] text-white text-xs font-black flex items-center justify-center">
                        {i + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {howItWorks.comparison?.length > 0 && (
              <motion.div {...fadeUp}>
                <h3 className="text-xl font-black text-[#0f172a] text-center mb-6">
                  {howItWorks.comparisonTitle || "Neden Sözderece?"}
                </h3>
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">
                  <div className="grid grid-cols-3 bg-[#100481] text-white text-sm font-bold">
                    <div className="px-5 py-3 col-span-1">Özellik</div>
                    <div className="px-5 py-3 text-center text-[#f39c12]">Sözderece</div>
                    <div className="px-5 py-3 text-center text-white/60">Yalnız Çalışmak</div>
                  </div>
                  {howItWorks.comparison.map((row, i) => (
                    <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}>
                      <div className="px-5 py-3 font-semibold text-[#374151]">{row.label}</div>
                      <div className="px-5 py-3 text-center">
                        <span className="text-[#22c55e] font-black text-base">✓</span>
                      </div>
                      <div className="px-5 py-3 text-center">
                        <span className="text-[#ef4444] font-black text-base">✗</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button
                    onClick={scrollToOffer}
                    className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-base px-10 py-4 rounded-2xl transition-all shadow-[0_8px_24px_rgba(243,156,18,0.3)] hover:-translate-y-0.5"
                  >
                    {howItWorks.comparisonCta || "Hemen Kayıt Ol →"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ SOSYAL KANIT ══════════ */}
      {(socialProof.stats?.length > 0 || socialProof.testimonials?.length > 0) && (
        <section className="py-20 px-5 bg-gradient-to-br from-[#f8fafc] to-[#eff6ff]">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl max-[640px]:text-2xl font-black text-[#0f172a]">
                {socialProof.title || "Sadece söz değil —"}{" "}
                <span className="text-[#f39c12]">{socialProof.titleAccent || "aileler konuşuyor"}</span>
              </h2>
            </motion.div>

            {socialProof.stats?.length > 0 && (
              <div className="grid gap-5 mb-12 max-[640px]:grid-cols-1"
                style={{ gridTemplateColumns: `repeat(${Math.min(socialProof.stats.length, 4)}, minmax(0, 1fr))` }}>
                {socialProof.stats.map((s, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-[#e2e8f0] text-center shadow-sm">
                    <div className="text-4xl font-black text-[#100481] mb-1">{s.val}</div>
                    <div className="text-sm text-[#64748b] font-medium">{s.label}</div>
                  </motion.div>
                ))}
                {remaining !== null && remaining > 0 && (
                  <motion.div {...fadeUp} transition={{ delay: socialProof.stats.length * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-[#e2e8f0] text-center shadow-sm">
                    <div className="text-4xl font-black text-[#100481] mb-1">{remaining}</div>
                    <div className="text-sm text-[#64748b] font-medium">yer kaldı</div>
                  </motion.div>
                )}
              </div>
            )}

            {socialProof.testimonials?.length > 0 && (
              <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
                {socialProof.testimonials.map((t, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                    <div className="flex gap-0.5 mb-3">
                      {Array(5).fill(0).map((_, j) => <span key={j} className="text-[#f39c12]">★</span>)}
                    </div>
                    <p className="text-[#374151] text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs ${t.isParent ? "bg-[#100481]" : "bg-[#f39c12]"}`}>
                        {t.isParent ? "V" : "E"}
                      </div>
                      <span className="text-xs font-bold text-[#64748b]">{t.author}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ TEKLİF + FORM ══════════ */}
      <section id="lgs-teklif" ref={offerRef} className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-8 max-[768px]:grid-cols-1">
            {/* Sol: Teklif */}
            <motion.div {...fadeUp}
              className="bg-gradient-to-br from-[#100481] to-[#0a0357] rounded-3xl p-8 text-white flex flex-col">
              <h2 className="text-2xl font-black mb-2">{offer.title || "LGS'ye Kadar Yanındayız"}</h2>
              <p className="text-white/60 text-sm mb-6">{offer.subtitle || "Tek seferlik ödeme, LGS'ye kadar tam destek."}</p>

              {remaining !== null && remaining > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-full px-3 py-1 text-xs font-bold text-[#fca5a5] mb-5 self-start">
                  🔥 Sadece {remaining} yer kaldı
                </div>
              )}

              <div className="mb-6">
                <div className="text-5xl font-black text-[#f39c12]">₺{offer.price || "2.500"}</div>
                <p className="text-white/50 text-xs mt-1">{offer.priceLabel || "LGS'ye kadar — tek seferlik"}</p>
                {days > 0 && (
                  <p className="text-white/60 text-sm mt-1">
                    Günlük maliyetin: <span className="text-[#f39c12] font-bold">~₺{dailyCost}</span>
                  </p>
                )}
              </div>

              {offer.includes?.length > 0 && (
                <ul className="space-y-2 mb-8 flex-grow">
                  {offer.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] text-xs font-black flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(offer.buyLink || "/paket-detay")}
                  className="w-full py-4 rounded-2xl bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-base transition-all shadow-[0_6px_20px_rgba(243,156,18,0.3)] hover:-translate-y-0.5"
                >
                  {offer.ctaPrimary || "⚡ Yerimi Ayırt"}
                </button>
                <button
                  onClick={scrollToForm}
                  className="w-full py-3.5 rounded-2xl border-2 border-white/30 hover:border-white/60 text-white font-bold text-sm transition-all hover:bg-white/10"
                >
                  {offer.ctaSecondary || "📞 Önce Konuşalım"}
                </button>
              </div>
            </motion.div>

            {/* Sağ: Form */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <div id="lgs-form" ref={formRef} className="bg-[#f8fafc] rounded-3xl p-8 border border-[#e2e8f0]">
                <h3 className="text-xl font-black text-[#0f172a] mb-1">
                  {formContent.title || "Hâlâ sorunuz var mı?"}
                </h3>
                <p className="text-[#64748b] text-sm mb-6">
                  {formContent.subtitle || "Formu doldurun, sizi arayalım."}
                </p>

                {submitted ? (
                  <div className="py-10 text-center">
                    <div className="text-5xl mb-3">✅</div>
                    <h4 className="text-lg font-black text-[#0f172a] mb-1">
                      {formContent.successTitle || "Başvurunuz alındı!"}
                    </h4>
                    <p className="text-[#64748b] text-sm">
                      {formContent.successSubtitle || "En kısa sürede sizi arayacağız."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[#374151] block mb-1">Ad Soyad *</label>
                      <input name="name" value={form.name} onChange={handleFormChange} className={inp} placeholder="Ayşe Yılmaz" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#374151] block mb-1">Telefon *</label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleFormChange} className={inp} placeholder="05XX XXX XX XX" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#374151] block mb-1">Kaçıncı sınıf? *</label>
                      <select name="grade" value={form.grade} onChange={handleFormChange} className={inp} required>
                        <option value="">Seçiniz</option>
                        <option value="7. Sınıf">7. Sınıf</option>
                        <option value="8. Sınıf">8. Sınıf</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#374151] block mb-1">Mesajınız (opsiyonel)</label>
                      <textarea name="message" value={form.message} onChange={handleFormChange} className={`${inp} resize-none h-20`} placeholder="Merak ettiklerinizi yazabilirsiniz..." />
                    </div>
                    {formError && <p className="text-red-500 text-xs">{formError}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-2xl bg-[#100481] hover:bg-[#0a0357] text-white font-black text-base transition-all disabled:opacity-60 shadow-[0_6px_20px_rgba(16,4,129,0.25)] hover:-translate-y-0.5"
                    >
                      {submitting ? "Gönderiliyor..." : (formContent.submitText || "Gönder, Sizi Arayalım →")}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ══════════ STICKY CTA ══════════ */}
      {showSticky && !stickyHidden && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur border-t border-[#e2e8f0] shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              {remaining !== null && remaining > 0 && (
                <span className="text-[#ef4444]">🔥 {remaining} yer kaldı ·</span>
              )}
              <span className="text-[#64748b]">₺{offer.price || "2.500"} / LGS'ye kadar</span>
            </div>
            <button
              onClick={scrollToOffer}
              className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-sm px-6 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-[0_4px_12px_rgba(243,156,18,0.3)]"
            >
              {hero.navbarCta || "⚡ Yerimi Ayırt →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
