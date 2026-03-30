import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import useCampPage from "../hooks/useCampPage";
import axios from "../utils/axios";

// ── Countdown helper ─────────────────────────────────────────
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

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-6 py-20 px-6 max-w-3xl mx-auto">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded-xl w-full" style={{ width: `${80 - i * 10}%` }} />
      ))}
    </div>
  );
}

// ── Check / Cross icon ────────────────────────────────────────
const Check = () => <span className="text-[#22c55e] text-lg">✓</span>;
const Cross = () => <span className="text-[#ef4444] text-lg">✗</span>;

// ─────────────────────────────────────────────────────────────
export default function DenemeKampiPage() {
  const navigate = useNavigate();
  const { content, loading } = useCampPage();
  const formRef = useRef(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", grade: "", type: "free" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const countdown = useCountdown(content?.offer?.yksDate || "2026-06-15");

  const handleSubmit = async (e, type = "free") => {
    e.preventDefault();
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

  if (loading) return (
    <>
      <div className="bg-[#f8f9fa] min-h-screen"><Skeleton /></div>
      <Footer />
    </>
  );

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

  const { hero, painPoints, camp, testimonials, offer } = content;

  return (
    <>
      <Seo title={`${content.name || "Deneme Kampı"} — Sözderece Koçluk`} description={hero.subtitle} canonical={`/${content.slug || "deneme-kampi"}`} />

      {/* ══════════ HERO ══════════ */}
      <section className="relative bg-gradient-to-br from-[#100481] to-[#0a0a1a] text-white py-20 px-5 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f39c12]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#100481]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-6 backdrop-blur">
            🏕 Sözderece Deneme Kampı
          </div>

          <h1 className="text-4xl max-[768px]:text-2xl font-black leading-[1.2] mb-6">
            {hero.title.includes("Kontrol Altında") ? (
              <>
                {hero.title.split("Kontrol Altında")[0]}
                <span className="text-[#f39c12]">Kontrol Altında</span>
                {hero.title.split("Kontrol Altında")[1]}
              </>
            ) : hero.title}
          </h1>

          <p className="text-white/70 text-lg max-[768px]:text-base mb-8 max-w-2xl mx-auto leading-relaxed">{hero.subtitle}</p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {(hero.chip1 || "✅ Sınava Kadar Takip") && <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur">{hero.chip1 || "✅ Sınava Kadar Takip"}</span>}
            {(hero.chip2 || "🎯 Kontenjan Dolmadan Kayıt Ol") && <span className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur">{hero.chip2 || "🎯 Kontenjan Dolmadan Kayıt Ol"}</span>}
          </div>

          <button
            onClick={scrollToForm}
            className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-lg px-10 py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(243,156,18,0.35)] hover:-translate-y-1"
          >
            {hero.buttonText || "Yerini Ayırt"}
          </button>

          {/* Video or placeholder */}
          <div className="mt-12">
            {hero.videoUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video max-w-2xl mx-auto">
                <iframe
                  src={hero.videoUrl}
                  title="Deneme Kampı Tanıtım"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl py-14 px-6 max-w-2xl mx-auto flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl">🎬</div>
                <p className="text-white/50 text-sm">Tanıtım videosu yakında eklenecek</p>
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
            {painPoints.items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex gap-4">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-black text-[#0f172a] mb-1 text-base">{item.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
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
          <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] shadow-sm">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-[#100481] text-white text-sm">
                  <th className="text-left px-5 py-4 font-bold">Özellik</th>
                  <th className="px-4 py-4 font-bold">Sözderece</th>
                  <th className="px-4 py-4 font-bold">Dershane</th>
                  <th className="px-4 py-4 font-bold">Tekli Öğretmen</th>
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
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="bg-[#f8fafc] py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] text-center mb-10">{testimonials.title}</h2>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-12 max-[640px]:grid-cols-1">
            {testimonials.stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] text-center shadow-sm">
                <div className="text-3xl font-black text-[#100481]">{s.number}</div>
                <div className="text-[#64748b] text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-5 max-[640px]:grid-cols-1">
            {testimonials.items.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center font-black text-[#100481] text-sm flex-shrink-0">
                    {t.name[0]}
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
      <section className="bg-gradient-to-br from-[#100481] to-[#0a0a1a] py-20 px-5 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl max-[768px]:text-2xl font-black mb-4">{offer.title}</h2>

          <div className="text-6xl max-[768px]:text-4xl font-black text-[#f39c12] mb-2">{offer.price}₺</div>
          <p className="text-white/60 text-sm mb-8">Sınava kadar tüm süreç dahil · Tüm vergiler dahil</p>

          {/* Countdown */}
          <div className="mb-8">
            <p className="text-white/60 text-sm mb-3 font-semibold uppercase tracking-wide">YKS'ye kalan süre</p>
            <div className="flex justify-center gap-4">
              <CountdownBox value={countdown.days} label="Gün" />
              <CountdownBox value={countdown.hours} label="Saat" />
              <CountdownBox value={countdown.minutes} label="Dakika" />
              <CountdownBox value={countdown.seconds} label="Saniye" />
            </div>
          </div>

          {/* Includes */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left backdrop-blur">
            <h3 className="font-black mb-4 text-base">Pakete dahil:</h3>
            <ul className="space-y-2">
              {offer.includes.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                  <span className="text-[#22c55e]">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {offer.guarantees.map((g, i) => (
              <span key={i} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur">🛡 {g}</span>
            ))}
          </div>

          <button
            onClick={scrollToForm}
            className="bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-lg px-12 py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(243,156,18,0.35)] hover:-translate-y-1 w-full max-w-md"
          >
            Hemen Başvur
          </button>
        </div>
      </section>

      {/* ══════════ FORM ══════════ */}
      <section id="kayit" ref={formRef} className="bg-[#f8fafc] py-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl max-[768px]:text-2xl font-black text-[#0f172a] mb-3">Yerini Şimdi Ayırt</h2>
            <p className="text-[#64748b]">Kontenjan dolmadan başvurunu tamamla. Ücretsiz ön görüşme ile başla.</p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#e2e8f0] shadow-sm">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-[#0f172a] mb-2">Başvurun Alındı!</h3>
              <p className="text-[#64748b] mb-6">En kısa sürede seninle iletişime geçeceğiz.</p>
              <button
                onClick={() => navigate("/")}
                className="text-[#100481] font-bold text-sm hover:underline"
              >
                Ana sayfaya dön
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm">
              <form onSubmit={(e) => handleSubmit(e, form.type)}>
                <div className="grid grid-cols-2 gap-4 mb-4 max-[480px]:grid-cols-1">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1">Ad</label>
                    <input
                      type="text"
                      placeholder="Adın"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1">Soyad</label>
                    <input
                      type="text"
                      placeholder="Soyadın"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Telefon</label>
                  <input
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#374151] mb-1">E-posta</label>
                  <input
                    type="email"
                    placeholder="eposta@ornek.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Sınıf</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white"
                  >
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
                    onClick={(e) => handleSubmit(e, "free")}
                    className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 border-[#100481] text-[#100481] font-black text-sm transition-all hover:bg-[#eff6ff] disabled:opacity-50"
                  >
                    <span>🆓 Ücretsiz Görüşme</span>
                    <span className="text-xs font-normal text-[#64748b]">Tanışalım, ihtiyacını anlayalım</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, "paid")}
                    className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-[#f39c12] hover:bg-[#d35400] text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(243,156,18,0.3)] disabled:opacity-50"
                  >
                    <span>💳 Hemen Başla</span>
                    <span className="text-xs font-normal text-white/80">{offer.price}₺ — Sınava Kadar</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
