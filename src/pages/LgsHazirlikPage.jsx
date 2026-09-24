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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-dark)" }}>
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
      <section className="relative overflow-hidden py-24 px-5 text-white" style={{ background: "var(--color-dark)" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 500, height: 500, background: "var(--color-brand)", filter: "blur(120px)", opacity: 0.3, top: -120, right: -100, animation: "lgsOrb1 7s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 340, height: 340, background: "var(--color-brand-hover)", filter: "blur(90px)", opacity: 0.25, bottom: -60, left: -80, animation: "lgsOrb2 9s ease-in-out infinite" }} />

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border font-nunito font-bold text-xs" style={{ background: "rgba(14,124,136,0.14)", borderColor: "rgba(14,124,136,0.3)", color: "var(--color-brand-on-dark)" }}>
              🎯 2027 LGS Öğrencilerine Özel
            </div>

            <h1 className="font-fredoka font-bold leading-tight mb-4" style={{ fontSize: "clamp(28px,5vw,52px)", animation: "lgsShimmer 4s ease-in-out infinite" }}>
              Her Gün "Ders Çalıştın mı?"{" "}
              <span style={{ color: "var(--color-brand-on-dark)" }}>{hero.titleAccent || "Diye Sormak Zorunda Kalmayın."}</span>
            </h1>

            <p className="font-nunito font-bold text-lg mb-4" style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(15px,2vw,18px)" }}>
              {hero.subtitle || "Çocuğunuzun çalışma rotasını birlikte oluşturalım, ilerlemesini düzenli takip edelim ve ihtiyaçlarına göre planını güncelleyelim."}
            </p>

            <p className="font-fredoka font-bold text-sm mb-8" style={{ letterSpacing: 0.5 }}>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>Kişisel Rota</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.3)" }}>→</span>{" "}
              <span style={{ color: "var(--color-brand-on-dark)" }}>İlerleme Takibi</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.3)" }}>→</span>{" "}
              <span style={{ color: "var(--color-brand-on-dark)" }}>Dinamik Planlama</span>
            </p>

            {remaining !== null && remaining > 0 && (
              <div className="flex justify-center mb-8">
                <span className="font-nunito font-bold text-xs px-4 py-1.5 rounded-full border" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  🔥 Sadece {remaining} yer kaldı
                </span>
              </div>
            )}

            <div className="flex flex-wrap justify-center items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={scrollToOffer}
                className="font-fredoka font-bold text-base px-10 py-4 rounded-full"
                style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 10px 32px rgba(14,124,136,0.35)" }}
              >
                {hero.ctaPrimary || "LGS Koçluğu İçin Görüşme Talep Et →"}
              </motion.button>
              <button onClick={scrollToForm} className="font-nunito font-bold text-sm text-white/55 hover:text-white transition-colors underline underline-offset-4">
                Süreç Nasıl İşliyor?
              </button>
            </div>

            {/* Ürünün gerçek işlevini gösteren küçük mockup — net iddiası yerine */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-12 max-w-[320px] mx-auto">
              <div className="bg-white rounded-[20px] p-5 text-left">
                <p className="font-fredoka font-bold text-[10px] uppercase mb-3" style={{ color: "var(--color-brand)", letterSpacing: 2 }}>Mert'in Bu Haftaki Rotası</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-nunito font-bold text-xs text-[#64748b]">İlerleme</span>
                  <span className="font-fredoka font-bold text-sm text-page-navy">8 / 11 görev</span>
                </div>
                {[
                  { text: "Matematik", done: true },
                  { text: "Türkçe", done: true },
                  { text: "Fen — Devam ediyor", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.done ? "var(--color-brand)" : "#f1f5f9" }}>
                      {item.done && <svg width="9" height="9" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" /></svg>}
                    </div>
                    <span className="font-nunito font-bold text-xs" style={{ color: item.done ? "#0f172a" : "#94a3b8" }}>{item.text}</span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
                  <span className="font-nunito font-bold text-[11px] text-[#64748b]">Koç geri bildirimi gönderildi</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SİZDE DE BÖYLE Mİ? ── */}
      {painPoints.items?.length > 0 && (
        <section className="py-20 px-5" style={{ background: "var(--color-brand-light)" }}>
          <div className="max-w-2xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-10">
              <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>SİZDE DE BÖYLE Mİ?</div>
              <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
                {painPoints.title || "LGS süreci evde sürekli bir hatırlatma döngüsüne mi dönüştü?"}
              </h2>
            </motion.div>

            <div className="flex flex-col gap-3">
              {painPoints.items.map((p, i) => (
                <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="bg-white rounded-2xl px-5 py-4 border border-[#e2e8f0] shadow-sm flex items-center gap-3.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-brand)", color: "#FFFFFF" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6 L4.5 8.5 L10 2.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <p className="font-nunito font-bold text-[#0f172a] text-sm">{p.title}</p>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp} className="mt-10 text-center">
              <p className="font-nunito font-bold text-[#475569] text-base max-w-xl mx-auto mb-5 leading-relaxed">
                Amaç çocuğunuza daha fazla baskı kurmak değil.{" "}
                <span className="text-page-navy">Kendi çalışma sürecini daha sistemli yönetebileceği bir yapı oluşturmak.</span>
              </p>
              <button onClick={scrollToForm} className="font-fredoka font-bold text-sm px-8 py-3.5 rounded-full transition-all hover:scale-105 inline-flex items-center gap-2" style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 4px 16px rgba(14,124,136,0.3)" }}>
                Bu Yükü Biz Devralalım → Ücretsiz Veli Görüşmesi
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── VELİ – ÖĞRENCİ – KOÇ MODELİ ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fadeUp} className="mb-14">
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>NASIL YÖNETİYORUZ</div>
            <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
              LGS Sürecini Tek Bir Kişinin Omzuna Bırakmıyoruz.
            </h2>
          </motion.div>

          <div className="flex flex-col items-center">
            {[
              { label: "ÖĞRENCİ", desc: "Rotasını uygular, sorumluluk alır.", color: "#0E7C88" },
              { label: "KOÇ", desc: "Planlar, takip eder, geri bildirim verir, rotayı günceller.", color: "#17252D" },
              { label: "VELİ", desc: "Sürecin nasıl ilerlediğini görür.", color: "#0B6976" },
            ].map((p, i) => (
              <div key={i} className="w-full max-w-sm">
                <motion.div {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="rounded-2xl px-6 py-5 border-2" style={{ borderColor: p.color, background: `${p.color}0d` }}>
                  <p className="font-fredoka font-bold text-sm mb-1" style={{ color: p.color, letterSpacing: 1 }}>{p.label}</p>
                  <p className="font-nunito font-bold text-[#334155] text-sm">{p.desc}</p>
                </motion.div>
                {i < 2 && (
                  <div className="flex justify-center py-2">
                    <span className="font-fredoka font-bold text-lg text-[#cbd5e1]">↕</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <motion.p {...fadeUp} className="font-nunito font-bold text-[#475569] text-base max-w-lg mx-auto mt-10 leading-relaxed">
            Böylece veli sürekli kontrol eden kişi olmak yerine{" "}
            <span className="text-page-navy">süreci takip eden kişi</span> olabilir.
          </motion.p>
        </div>
      </section>

      {/* ── SÖZDERECE ROTA SİSTEMİ ── */}
      <section className="py-20 px-5 text-white relative overflow-hidden" style={{ background: "var(--color-dark)" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 340, height: 340, background: "var(--color-brand)", filter: "blur(100px)", opacity: 0.35, top: -80, right: -60, animation: "lgsOrb1 8s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 260, height: 260, background: "var(--color-brand-hover)", filter: "blur(90px)", opacity: 0.22, bottom: -50, left: -50, animation: "lgsOrb2 10s ease-in-out infinite" }} />
        <div className="max-w-5xl mx-auto relative">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="font-fredoka font-bold text-lime text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>SÖZDERECE ROTA SİSTEMİ</div>
            <h2 className="font-fredoka font-bold text-white m-0 leading-tight" style={{ fontSize: "clamp(26px,4vw,44px)" }}>
              Çocuğunuza Yalnızca Bir Program Değil,{" "}
              <span style={{ color: "var(--color-brand-on-dark)" }}>Takip Edilen Bir Çalışma Süreci.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-6 mb-14 max-[768px]:grid-cols-1">
            {[
              { num: "01", title: "Kişisel Rota", desc: "Öğrencinin seviyesi, eksikleri, okul düzeni ve hedefleri değerlendirilerek çalışma rotası oluşturulur.", color: "rgba(255,255,255,0.4)" },
              { num: "02", title: "İlerleme Takibi", desc: "Programın yalnızca hazırlanması değil, uygulanması da takip edilir. Aksayan noktalar görünür hale gelir.", color: "var(--color-brand-on-dark)" },
              { num: "03", title: "Dinamik Planlama", desc: "Deneme sonuçları, konu ilerleyişi ve öğrencinin ihtiyaçlarına göre rota güncellenir.", color: "var(--color-brand-on-dark)" },
            ].map((b, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: "rgba(14,124,136,0.4)" }}
                className="rounded-2xl p-6 border relative" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.14)" }}>
                <div className="font-fredoka font-bold mb-3" style={{ fontSize: 44, color: "rgba(255,255,255,0.14)", lineHeight: 1 }}>{b.num}</div>
                <h3 className="font-fredoka font-bold text-white text-base mb-2">{b.title}</h3>
                <p className="font-nunito text-white/55 text-sm leading-relaxed">{b.desc}</p>
                <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÇOCUĞUMUN BİR HAFTASI NASIL GEÇECEK ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>NASIL İŞLİYOR</div>
            <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
              Çocuğumun Bir Haftası Nasıl Geçecek?
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute top-0 bottom-0 w-[2px]" style={{ left: 19, background: "linear-gradient(to bottom, var(--color-dark), var(--color-brand), var(--color-brand-hover), var(--color-dark), var(--color-brand))", opacity: 0.25 }} />
            {[
              { day: "Pazartesi", desc: "Haftalık çalışma rotası belli.", color: "var(--color-dark)" },
              { day: "Hafta Boyunca", desc: "Öğrenci planını uygular, ilerleyişi takip edilir.", color: "var(--color-brand)" },
              { day: "Takıldığı Noktada", desc: "Koçundan destek ve geri bildirim alır.", color: "var(--color-brand-hover)" },
              { day: "Deneme Sonrası", desc: "Sonuç yalnızca kaydedilmez; eksikler değerlendirilir.", color: "var(--color-dark)" },
              { day: "Yeni Hafta", desc: "Gerekiyorsa çalışma rotası güncellenir.", color: "var(--color-brand)" },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="relative flex items-start gap-5 pb-8 last:pb-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-fredoka font-bold text-sm relative z-10" style={{ background: s.color, color: "#fff" }}>
                  {i + 1}
                </div>
                <div className="pt-2">
                  <h3 className="font-fredoka font-bold text-page-navy text-base mb-0.5">{s.day}</h3>
                  <p className="font-nunito text-[#64748b] text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeUp} className="text-center font-fredoka font-bold mt-6" style={{ fontSize: "clamp(17px,2.4vw,24px)", color: "var(--color-dark)" }}>
            Planla → Uygula → Takip Et → Güncelle
          </motion.p>
        </div>
      </section>

      {/* ── ÖĞRENCİ PANELİ ── */}
      <section className="py-20 px-5" style={{ background: "var(--color-brand-light)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-14 items-center max-[900px]:grid-cols-1 max-[900px]:gap-10">
          <motion.div {...fadeUp}>
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>ÖĞRENCİ PANELİ</div>
            <h2 className="font-fredoka font-bold text-page-navy leading-tight mb-6" style={{ fontSize: "clamp(24px,3.6vw,36px)" }}>
              Öğrenci Ne Yapacağını Görür. Siz Sürecin Nasıl Gittiğini Bilirsiniz.
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Bugünkü Rotası", desc: "Bugün ne yapması gerektiğini görür." },
                { title: "Haftalık İlerlemesi", desc: "Planının ne kadarını uyguladığını takip eder." },
                { title: "Deneme Gelişimi", desc: "Deneme sonuçlarını ve gelişimini görür." },
                { title: "Koç Desteği", desc: "Takıldığı noktada koçuyla iletişim kurar." },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--color-brand)" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" /></svg>
                  </span>
                  <div>
                    <p className="font-fredoka font-bold text-page-navy text-xs">{c.title}</p>
                    <p className="font-nunito text-[#64748b] text-xs">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="rounded-[24px] p-5 max-w-[380px] mx-auto" style={{ background: "var(--color-dark)" }}>
              <div className="bg-white rounded-[18px] p-5">
                <p className="font-fredoka font-bold text-[10px] uppercase mb-3" style={{ color: "var(--color-brand)", letterSpacing: 2 }}>Bugünkü Rotam</p>
                {[
                  { text: "Matematik — Denklemler", done: true },
                  { text: "Türkçe — Paragraf", done: true },
                  { text: "Fen — Kuvvet ve Hareket", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.done ? "var(--color-brand)" : "#f1f5f9" }}>
                      {item.done && <svg width="9" height="9" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" /></svg>}
                    </div>
                    <span className="font-nunito font-bold text-xs" style={{ color: item.done ? "#0f172a" : "#94a3b8" }}>{item.text}</span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                  <span className="font-nunito font-bold text-[10px] uppercase text-[#94a3b8]">Bu Hafta</span>
                  <span className="font-fredoka font-bold text-sm text-page-navy">8/11 görev</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden mt-1.5">
                  <div className="h-full rounded-full" style={{ width: "73%", background: "linear-gradient(90deg, var(--color-dark), var(--color-brand))" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VELİ BİLGİLENDİRMESİ ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-14 items-center max-[900px]:grid-cols-1 max-[900px]:gap-10">
          <motion.div {...fadeUp}>
            <p className="font-nunito font-bold text-[#94a3b8] text-sm italic mb-3">"Peki ben sürecin nasıl gittiğini nasıl bileceğim?"</p>
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>VELİ BİLGİLENDİRMESİ</div>
            <h2 className="font-fredoka font-bold text-page-navy leading-tight mb-4" style={{ fontSize: "clamp(24px,3.6vw,36px)" }}>
              Düzenli Veli Bilgilendirmesi
            </h2>
            <p className="font-nunito text-[#64748b] text-sm leading-relaxed">
              Çocuğunuza her gün "çalıştın mı?" diye sormadan da sürecin nasıl ilerlediğini görebilirsiniz.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-[0_8px_30px_rgba(28,27,138,0.08)] max-w-[340px] mx-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="font-fredoka font-bold text-page-navy text-sm">Haftalık Veli Raporu</p>
                <span className="font-nunito font-bold text-[10px] text-[#94a3b8]">14–20 Eylül</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
                  <p className="font-fredoka font-bold text-page-navy text-lg">%82</p>
                  <p className="font-nunito font-bold text-[10px] text-[#94a3b8]">Plan Uygulama</p>
                </div>
                <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
                  <p className="font-fredoka font-bold text-page-navy text-lg">64,5</p>
                  <p className="font-nunito font-bold text-[10px] text-[#94a3b8]">Son Deneme Net</p>
                </div>
              </div>
              <div style={{ background: "var(--color-brand-light)" }} className="rounded-xl p-3">
                <p className="font-nunito font-bold text-[10px] uppercase mb-1" style={{ color: "var(--color-brand)" }}>Koçtan Not</p>
                <p className="font-nunito text-xs text-[#475569] leading-relaxed">"Bu hafta fen konularında güzel ilerleme kaydetti, önümüzdeki hafta matematik tekrarına ağırlık veriyoruz."</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOSYAL KANIT ── */}
      {(socialProof.stats?.length > 0 || socialProof.testimonials?.length > 0) && (
        <section className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>SOSYAL KANIT</div>
              <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
                {socialProof.title || "Sadece söz değil,"}{" "}
                <span style={{ color: "var(--color-brand)" }}>{socialProof.titleAccent || "aileler konuşuyor"}</span>
              </h2>
            </motion.div>

            {socialProof.stats?.length > 0 && (
              <div className="grid gap-5 mb-12 max-[640px]:grid-cols-2" style={{ gridTemplateColumns: `repeat(${Math.min(socialProof.stats.length + (remaining > 0 ? 1 : 0), 4)}, minmax(0,1fr))` }}>
                {socialProof.stats.map((s, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="rounded-2xl p-6 border border-[#e2e8f0] text-center shadow-sm" style={{ background: "var(--color-brand-light)" }}>
                    <div className="font-fredoka font-bold text-page-navy mb-1" style={{ fontSize: "clamp(28px,3vw,40px)" }}>{s.val}</div>
                    <div className="font-nunito font-bold text-sm text-[#64748b]">{s.label}</div>
                  </motion.div>
                ))}
                {remaining !== null && remaining > 0 && (
                  <motion.div {...fadeUp} transition={{ delay: socialProof.stats.length * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="rounded-2xl p-6 border text-center shadow-sm" style={{ background: "var(--color-dark)", borderColor: "var(--color-dark)" }}>
                    <div className="font-fredoka font-bold mb-1" style={{ fontSize: "clamp(28px,3vw,40px)", color: "var(--color-brand-on-dark)" }}>{remaining}</div>
                    <div className="font-nunito font-bold text-sm text-white/50">yer kaldı</div>
                  </motion.div>
                )}
              </div>
            )}

            {socialProof.testimonials?.length > 0 && (
              <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
                {socialProof.testimonials.map((t, i) => {
                  const catColors = { "Düzen": "#17252D", "Sorumluluk": "#0E7C88", "Akademik İlerleme": "#0B6976" };
                  const color = catColors[t.category] || "#0B6976";
                  return (
                    <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-[0_8px_24px_rgba(28,27,138,0.09)] transition-shadow duration-200 flex flex-col gap-3">
                      {t.category && (
                        <span className="inline-flex self-start font-fredoka font-bold text-[10px] uppercase px-2.5 py-1 rounded-full" style={{ background: `${color}18`, color, letterSpacing: 1 }}>
                          {t.category}
                        </span>
                      )}
                      {(t.problem || t.process) && (
                        <div className="text-[11px] font-nunito leading-relaxed border-l-2 pl-2.5" style={{ borderColor: `${color}40` }}>
                          {t.problem && <p><span className="font-bold text-[#94a3b8]">Başlangıç:</span> <span className="text-[#64748b]">{t.problem}</span></p>}
                          {t.process && <p className="mt-0.5"><span className="font-bold text-[#94a3b8]">Süreç:</span> <span className="text-[#64748b]">{t.process}</span></p>}
                        </div>
                      )}
                      <div className="flex gap-0.5">{Array(5).fill(0).map((_, j) => <span key={j} style={{ color: "var(--color-brand)" }}>★</span>)}</div>
                      <p className="font-nunito text-[#374151] text-sm leading-relaxed italic flex-grow">"{t.quote}"</p>
                      <div className="flex items-center gap-3 pt-2 border-t border-[#f1f5f9]">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-fredoka font-bold text-sm flex-shrink-0" style={{ background: t.isParent ? "var(--color-dark)" : "var(--color-brand)" }}>
                          {t.author?.[0]?.toUpperCase() || (t.isParent ? "V" : "Ö")}
                        </div>
                        <div>
                          <p className="font-nunito font-bold text-xs text-[#0f172a]">{t.author}</p>
                          <p className="font-nunito text-xs text-[#94a3b8]">{t.isParent ? "Veli" : "Öğrenci"}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── KOÇLUKTA NELER VAR ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>KOÇLUKTA NELER VAR</div>
            <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
              Rota Sisteminin Parçaları
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            {[
              { title: "Kişiye Özel Çalışma Rotası", desc: "Nereden başlayacağını düşünmesine gerek yok — rotası onun için hazırlanır." },
              { title: "Günlük İlerleme Takibi", desc: "Plan çocuğunuza bırakılmaz, her gün nerede olduğu takip edilir." },
              { title: "Deneme Analizi", desc: "Deneme sonuçları sadece net olarak kalmaz, sonraki rotaya yansıtılır." },
              { title: "Dinamik Program Güncelleme", desc: "İhtiyaçlar değiştiğinde rota da güncellenir, sabit kalmaz." },
              { title: "Koç Desteği", desc: "Takıldığı noktada bir sonraki görüşmeyi beklemesine gerek kalmaz." },
              { title: "Öğrenci Paneli", desc: "Rotasını ve ilerlemesini kendi panelinden görebilir." },
              { title: "Dikkat Dağıtan Alışkanlıkların Yönetimi", desc: "Çalışma düzenine etkisi birlikte yönetilir." },
              { title: "Düzenli Veli Bilgilendirmesi", desc: "Süreci sormadan da takip edebilirsiniz." },
            ].map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3) }}
                className="flex items-start gap-3.5 bg-[#f8fafc] rounded-2xl p-5">
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--color-brand)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" /></svg>
                </span>
                <div>
                  <h3 className="font-fredoka font-bold text-page-navy text-sm mb-1">{f.title}</h3>
                  <p className="font-nunito text-[#64748b] text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KİMLER İÇİN ── */}
      <section className="py-20 px-5" style={{ background: "var(--color-brand-light)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>KİMLER İÇİN</div>
            <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
              Bu Koçluk Çocuğunuz İçin Uygun mu?
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-5 max-[768px]:grid-cols-1">
            <motion.div {...fadeUp} className="bg-white rounded-2xl p-7 border-2" style={{ borderColor: "var(--color-brand)" }}>
              <h3 className="font-fredoka font-bold text-page-navy text-base mb-4">Bu koçluk çocuğunuz için uygun olabilir eğer...</h3>
              <ul className="flex flex-col gap-3">
                {[
                  "Çalışmaya başlamakta zorlanıyorsa",
                  "Programını sürdüremiyorsa",
                  "Hangi derse öncelik vereceğini bilmiyorsa",
                  "Düzenli takip ve yönlendirmeye ihtiyaç duyuyorsa",
                  "Sorumluluk almaya açıksa",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#ecfdf5", color: "#059669" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </span>
                    <span className="font-nunito font-bold text-sm text-[#334155]">{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-7 border border-[#e2e8f0]">
              <h3 className="font-fredoka font-bold text-[#64748b] text-base mb-4">Uygun olmayabilir eğer...</h3>
              <ul className="flex flex-col gap-3">
                {[
                  "Koçun öğrencinin yerine çalışma sorumluluğunu üstlenmesini bekliyorsanız",
                  "Garanti edilmiş net veya sıralama sonucu arıyorsanız",
                  "Öğrencinin sürece hiç katılım göstermesini beklemiyorsanız",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#f1f5f9", color: "#94a3b8" }}>
                      <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </span>
                    <span className="font-nunito font-bold text-sm text-[#64748b]">{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BAŞVURU SÜRECİ (4 adım) ── */}
      {howItWorks.steps?.length > 0 && (
        <section className="py-20 px-5 text-white relative overflow-hidden" style={{ background: "var(--color-dark)" }}>
          <div className="absolute rounded-full pointer-events-none" style={{ width: 320, height: 320, background: "var(--color-brand)", filter: "blur(90px)", opacity: 0.3, top: -60, right: -60 }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, background: "var(--color-brand-hover)", filter: "blur(70px)", opacity: 0.25, bottom: -40, left: -40 }} />
          <div className="max-w-5xl mx-auto relative">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="font-fredoka font-bold text-lime text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>BAŞVURU SÜRECİ</div>
              <h2 className="font-fredoka font-bold text-white m-0 leading-tight" style={{ fontSize: "clamp(24px,4vw,40px)" }}>
                Sürece Başlamak <span style={{ color: "var(--color-brand-on-dark)" }}>Çok Kolay.</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-4 gap-5 mb-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              {howItWorks.steps.map((s, i) => (
                <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4, borderColor: "rgba(216,255,79,0.4)" }}
                  className="rounded-2xl p-6 border relative" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.14)" }}>
                  <div className="font-fredoka font-bold mb-3" style={{ fontSize: 40, color: "rgba(216,255,79,0.18)", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-nunito font-bold text-white text-sm mb-2">{s.title}</h3>
                  <p className="font-nunito text-white/55 text-xs leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button onClick={scrollToOffer} className="font-fredoka font-bold text-base px-10 py-4 rounded-full transition-all hover:scale-105" style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 8px 24px rgba(14,124,136,0.35)" }}>
                {howItWorks.comparisonCta || "Hemen Kayıt Ol →"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── TEKLİF + FORM ── */}
      <section id="lgs-teklif" ref={offerRef} className="relative py-20 px-5 text-white overflow-hidden" style={{ background: "var(--color-dark)" }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: 380, height: 380, background: "var(--color-brand)", filter: "blur(110px)", opacity: 0.3, top: -60, right: -60, animation: "lgsOrb1 8s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 280, height: 280, background: "var(--color-brand-hover)", filter: "blur(80px)", opacity: 0.2, bottom: -40, left: -40, animation: "lgsOrb2 10s ease-in-out infinite" }} />

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
                            <span className="font-fredoka font-bold text-xs px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap" style={{ background: "var(--color-brand)", color: "#FFFFFF" }}>{plan.badge}</span>
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
                          <p className="font-nunito font-bold text-[#166534] text-xs mt-1">✓ 7 gün içinde memnun kalmazsanız iade alırsınız</p>
                        </div>
                        {planIncludes.length > 0 && (
                          <ul className="space-y-1.5 mb-6 flex-grow">
                            {planIncludes.map((item, j) => (
                              <li key={j} className="flex items-center gap-2 font-nunito text-xs text-[#374151]">
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: "var(--color-brand)", color: "#FFFFFF" }}>✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => addToCartAndPay(plan, i)} className="w-full py-3.5 rounded-full font-fredoka font-bold text-sm" style={{ background: "var(--color-brand)", color: "white", boxShadow: "0 6px 20px rgba(14,124,136,0.35)" }}>
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
                          <p className="font-nunito font-bold text-xs mt-1" style={{ color: "var(--color-brand-on-dark)" }}>✓ 7 gün içinde memnun kalmazsanız iade alırsınız</p>
                        </div>
                        {planIncludes.length > 0 && (
                          <ul className="space-y-1.5 mb-6 flex-grow">
                            {planIncludes.map((item, j) => (
                              <li key={j} className="flex items-center gap-2 font-nunito text-xs text-white/55">
                                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-black text-[10px] flex-shrink-0" style={{ color: "var(--color-brand-on-dark)" }}>✓</span>
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
                      <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-full font-fredoka font-bold text-sm transition-all disabled:opacity-60 hover:-translate-y-0.5" style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 6px 20px rgba(14,124,136,0.3)" }}>
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
                  <div className="font-fredoka font-bold" style={{ fontSize: "clamp(34px,4vw,52px)", color: "var(--color-brand-on-dark)" }}>₺{price}</div>
                  <p className="font-nunito text-white/40 text-xs mt-1">{offer.priceLabel || "LGS'ye kadar, tek seferlik"}</p>
                  <p className="font-nunito font-bold text-sm mt-1" style={{ color: "var(--color-brand-on-dark)" }}>✓ 7 gün içinde memnun kalmazsanız iade alırsınız</p>
                </div>
                {offer.includes?.length > 0 && (
                  <ul className="space-y-2 mb-8 flex-grow">
                    {offer.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 font-nunito text-sm text-white/65">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: "rgba(14,124,136,0.18)", color: "var(--color-brand-on-dark)" }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-col gap-3">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(offer.buyLink || "/paket-detay")} className="w-full py-4 rounded-full font-fredoka font-bold text-base" style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 6px 20px rgba(14,124,136,0.35)" }}>
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
                      <button type="submit" disabled={submitting} className="w-full py-4 rounded-full font-fredoka font-bold text-base transition-all disabled:opacity-60 hover:-translate-y-0.5" style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 6px 20px rgba(14,124,136,0.3)" }}>
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t" style={{ background: "rgba(23,37,45,0.95)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div className="font-nunito font-bold text-sm text-white flex items-center gap-2">
              {remaining !== null && remaining > 0 && <span style={{ color: "#ef4444" }}>🔥 {remaining} yer kaldı ·</span>}
              <span className="text-white/45">₺{price} / LGS'ye kadar</span>
            </div>
            <button onClick={scrollToOffer} className="font-fredoka font-bold text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105 whitespace-nowrap" style={{ background: "var(--color-brand)", color: "#FFFFFF", boxShadow: "0 4px 12px rgba(14,124,136,0.35)" }}>
              {hero.navbarCta || "⚡ Yerimi Ayırt →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
