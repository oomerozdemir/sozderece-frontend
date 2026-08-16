import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isValidName, isValidPhone, isValidEmail } from "../utils/validation";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Seo from "../components/Seo";

// İkonlar
import {
  FaPhoneAlt,
  FaUserCheck,
  FaClipboardList,
  FaArrowDown,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt
} from "react-icons/fa";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" },
};

const inputCls =
  "w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] focus:border-page-navy focus:ring-2 focus:ring-page-navy/10 transition-all bg-white";
const labelCls = "block font-nunito font-bold text-xs text-[#475569] mb-1.5";

const benefits = [
  { icon: <FaUserCheck />, color: "#D8FF4F", bg: "rgba(216,255,79,0.12)", title: "Kişiye Özel Analiz", desc: "Eksiklerini nokta atışı belirle." },
  { icon: <FaClipboardList />, color: "#a78bfa", bg: "rgba(115,64,200,0.18)", title: "Koçluk Sistemi Tanıtımı", desc: "Sana özel hazırlanan sistemin detaylarını öğren." },
  { icon: <FaPhoneAlt />, color: "#FF9A7A", bg: "rgba(255,107,53,0.15)", title: "Ücretsiz Görüşme", desc: "Koçunla tanış, sorularını sor." },
];

const steps = [
  { num: "01", title: "Randevu", desc: "Formu doldur, sana uygun tarih ve saati seç.", circleColor: "#D8FF4F", circleText: "#0D0A2E" },
  { num: "02", title: "Görüşme", desc: "Belirlediğin zamanda koçumuz seni arasın ve analiz yapsın.", circleColor: "#7340C8", circleText: "#ffffff" },
  { num: "03", title: "Başlangıç", desc: "Sistemi ve koçunu sevdiysen hemen çalışmaya başla.", circleColor: "#FF6B35", circleText: "#ffffff" },
];

const IletisimPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 2);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "",
    meetingDate: "",
    meetingTime: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [blockedSlots, setBlockedSlots] = useState(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchBlockedSlots = useCallback(async (date) => {
    if (!date) return;
    setSlotsLoading(true);
    try {
      const res = await axios.get(`/api/contact/slots?date=${date}`);
      setBlockedSlots(new Set(res.data.blockedSlots || []));
      setErrorMsg((prev) => prev.includes("Sistem yoğunluğu") ? "" : prev);
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMsg("Sistem yoğunluğu: Çok fazla tarih sorguladınız. Lütfen biraz bekleyin.");
      }
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!formData.meetingDate) {
      setBlockedSlots(new Set());
      return;
    }
    fetchBlockedSlots(formData.meetingDate);

    const interval = setInterval(() => {
      fetchBlockedSlots(formData.meetingDate);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData.meetingDate, fetchBlockedSlots]);

  // --- 20 Dakikalık Aralıklar ---
  const timeSlots = [
    // Sabah
    "09:00 - 09:20", "09:20 - 09:40", "09:40 - 10:00",
    "10:00 - 10:20", "10:20 - 10:40", "10:40 - 11:00",
    "11:00 - 11:20", "11:20 - 11:40", "11:40 - 12:00",

    // Öğle
    "12:00 - 12:20", "12:20 - 12:40", "12:40 - 13:00",
    "13:00 - 13:20", "13:20 - 13:40", "13:40 - 14:00",
    "14:00 - 14:20", "14:20 - 14:40", "14:40 - 15:00",

    // Öğleden Sonra
    "15:00 - 15:20", "15:20 - 15:40", "15:40 - 16:00",
    "16:00 - 16:20", "16:20 - 16:40", "16:40 - 17:00",
    "17:00 - 17:20", "17:20 - 17:40", "17:40 - 18:00",

    // Akşam
    "18:00 - 18:20", "18:20 - 18:40", "18:40 - 19:00",
    "19:00 - 19:20", "19:20 - 19:40", "19:40 - 20:00",
    "20:00 - 20:20", "20:20 - 20:40", "20:40 - 21:00"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "meetingDate") {
      setFormData((prev) => ({ ...prev, meetingDate: value, meetingTime: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Client-side validasyon (backend ile tutarlı) ---
    if (!isValidName(formData.name)) {
      setErrorMsg("Ad Soyad sadece harf içermeli ve en az 2 karakter olmalıdır.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMsg("Geçerli bir e-posta adresi giriniz.");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setErrorMsg("Telefon numarası 05XX XXX XX XX formatında olmalıdır.");
      return;
    }
    if (!formData.meetingTime) {
      setErrorMsg("Lütfen bir saat seçin.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axios.post("/api/contact", formData);
      if (res.data.success) {
        setSuccessMsg("Randevu talebiniz alındı! Seçtiğiniz tarihte sizi arayacağız.");
        setFormData({
          name: "", email: "", phone: "",
          userType: "", meetingDate: "", meetingTime: "",
          message: ""
        });

        if (window.gtag) {
          window.gtag('event', 'conversion', {
             'send_to': 'AW-17399744724/SENIN_FORM_ETIKETIN_BURAYA',
             'value': 1.0,
             'currency': 'TRY'
          });
        }
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        // Slot doldu (race condition): slotları yenile ve kullanıcıyı bilgilendir
        setErrorMsg("Bu randevu saati az önce doldu. Lütfen başka bir saat seçin.");
        fetchBlockedSlots(formData.meetingDate);
        setFormData((prev) => ({ ...prev, meetingTime: "" }));
      } else if (status === 429) {
        setErrorMsg("Çok fazla talep gönderildi. Lütfen 1 saat sonra tekrar deneyin.");
      } else if (status === 400 && err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Ücretsiz Ön Görüşme"
        description="Sözderece Koçluk ile hedeflerine ulaşmak için ilk adımı at. Uzman koçlarımızla ücretsiz tanışma görüşmesi planla."
        canonical="/ucretsiz-on-gorusme"
      />

      <TopBar />
      <Navbar />

      <div className="bg-white min-h-screen max-[960px]:pb-[70px]">

        {/* HERO + FORM */}
        <section
          className="relative overflow-hidden mx-3 sm:mx-6 lg:mx-10 mt-3 rounded-[32px] max-[640px]:rounded-[22px]"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 60% 40%, #3d1a80 0%, #1A0A40 55%, #0d0520 100%)",
          }}
        >
          {/* Orb'lar */}
          <div style={{
            position: "absolute", top: -120, right: 80, width: 420, height: 420, borderRadius: "50%",
            background: "#4a1da0", filter: "blur(90px)", opacity: 0.32, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -80, left: 60, width: 300, height: 300, borderRadius: "50%",
            background: "#FF6B35", filter: "blur(100px)", opacity: 0.16, pointerEvents: "none",
          }} />

          <div className="max-w-[1200px] mx-auto px-5 py-16 max-[960px]:py-10 relative" style={{ zIndex: 1 }}>
            <div className="grid grid-cols-[1.2fr_1fr] gap-[60px] items-start max-[960px]:grid-cols-1 max-[960px]:gap-10">

              {/* SOL — Metin */}
              <div className="max-[960px]:text-center">
                <motion.div {...fadeUp}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(216,255,79,0.12)", border: "1px solid rgba(216,255,79,0.3)",
                    borderRadius: 999, padding: "7px 16px", marginBottom: 18,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#D8FF4F", display: "inline-block" }} />
                    <span className="font-fredoka text-lime text-sm font-semibold tracking-[0.1em] uppercase">
                      YKS / LGS 2027 Hazırlık
                    </span>
                  </span>
                </motion.div>

                <motion.h1
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.1 }}
                  className="font-fredoka font-bold text-white text-[2.6rem] leading-[1.1] mb-5 max-[960px]:text-[1.9rem]"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  Hedeflerine Ulaşmak İçin<br />
                  <span className="text-lime">İlk Adımı At</span>
                </motion.h1>

                <motion.p
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.15 }}
                  className="font-nunito font-bold text-white/65 text-[1.05rem] leading-relaxed mb-8 max-w-[95%] max-[960px]:text-base max-[960px]:max-w-full"
                >
                  YKS/LGS sınav sürecinde yalnız değilsin. Formu doldur, derece öğrencisi koçlarımız
                  seni arayıp seviyene uygun yol haritasını anlatsın.
                </motion.p>

                <button
                  className="hidden max-[960px]:inline-flex items-center gap-2 font-fredoka font-bold text-sm px-6 py-3 rounded-full mb-6 cursor-pointer border-none"
                  style={{ background: "#D8FF4F", color: "#0D0A2E" }}
                  onClick={scrollToForm}
                >
                  Hemen Başvur <FaArrowDown />
                </button>

                <motion.ul
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.2 }}
                  className="list-none p-0 mb-8 flex flex-col gap-4 max-[960px]:flex-row max-[960px]:flex-wrap max-[960px]:justify-center max-[960px]:gap-2.5"
                >
                  {benefits.map((b, i) => (
                    <li key={i} className="flex gap-3.5 items-center max-[960px]:bg-white/5 max-[960px]:p-2.5 max-[960px]:px-3.5 max-[960px]:rounded-xl max-[960px]:w-full max-[960px]:justify-start">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: b.bg, color: b.color }}
                      >
                        {b.icon}
                      </div>
                      <div>
                        <strong className="font-fredoka font-bold text-white text-base block mb-0.5">{b.title}</strong>
                        <span className="font-nunito text-white/45 text-sm">{b.desc}</span>
                      </div>
                    </li>
                  ))}
                </motion.ul>

                <div className="pt-6 border-t border-white/10 max-[960px]:hidden">
                  <p className="font-nunito text-white/40 text-sm mb-3">Veya bize ulaşın:</p>
                  <div className="flex gap-3">
                    <a
                      href="tel:05312546701"
                      className="inline-flex items-center gap-2.5 py-3 px-6 rounded-full font-fredoka font-bold text-sm no-underline transition-all"
                      style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff" }}
                    >
                      <FaPhoneAlt /> 0 531 254 67 01
                    </a>
                    <button
                      onClick={() => navigate('/paket-detay')}
                      className="inline-flex items-center gap-2.5 py-3 px-6 rounded-full font-fredoka font-bold text-sm border-none cursor-pointer transition-all"
                      style={{ background: "rgba(216,255,79,0.12)", color: "#D8FF4F" }}
                    >
                      Paketleri İncele
                    </button>
                  </div>
                </div>
              </div>

              {/* SAĞ — Form Kartı */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-white p-7 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-[960px]:p-5"
                ref={formRef}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(216,255,79,0.15)", color: "#7340C8" }}>
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <h2 className="font-fredoka font-bold text-page-navy text-lg leading-tight">Randevu Oluştur</h2>
                    <p className="font-nunito text-[#94a3b8] text-xs mt-0.5">Müsait olduğun zamanı seç, biz arayalım.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3.5">
                    <label className={labelCls}>Adınız Soyadınız</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Örn: Ahmet Yılmaz" maxLength={100} className={inputCls} />
                  </div>

                  <div className="mb-3.5">
                    <label className={labelCls}>E-posta Adresi</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="ornek@gmail.com" maxLength={254} className={inputCls} />
                  </div>

                  <div className="mb-3.5">
                    <label className={labelCls}>Telefon Numarası</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="05XX XXX XX XX" pattern="^05\d{9}$" maxLength={11} className={inputCls} />
                  </div>

                  <div className="mb-3.5">
                    <label className={labelCls}>Durumunuz</label>
                    <select name="userType" value={formData.userType} onChange={handleInputChange} required className={inputCls}>
                      <option value="">Seçiniz...</option>
                      <option value="Mezun">Mezun Öğrenci</option>
                      <option value="12. Sınıf">12. Sınıf Öğrencisi</option>
                      <option value="11. Sınıf">11. Sınıf Öğrencisi</option>
                      <option value="8. Sınıf">8. Sınıf Öğrencisi</option>
                      <option value="7. Sınıf">7. Sınıf Öğrencisi</option>
                      <option value="Veli">Veli</option>
                    </select>
                  </div>

                  {/* TARİH VE SAAT SEÇİMİ */}
                  <div className="mb-3.5">
                    <label className={labelCls}>Tarih Seçiniz</label>
                    <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} min={today} max={maxDate} required style={{ cursor: "pointer" }} className={inputCls} />
                  </div>

                  {/* SAAT SLOT GRID */}
                  <div className="mb-3.5">
                    <label className={labelCls}>
                      Müsait Olduğunuz Saat Aralığı
                      {slotsLoading && <span className="text-[11px] font-normal normal-case text-[#94a3b8] ml-2">güncelleniyor…</span>}
                    </label>

                    {!formData.meetingDate ? (
                      <div className="w-full p-3 border border-[#e5e7eb] rounded-xl text-sm text-[#94a3b8] bg-[#f8fafc] text-center">
                        Önce tarih seçin
                      </div>
                    ) : (
                      <>
                        {/* Legenda */}
                        <div className="flex gap-3 mb-2 text-[11px] text-[#64748b]">
                          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-[#e8f5e9] border border-[#4caf50]"></span>Boş</span>
                          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-[#fde8e8] border border-[#e57373]"></span>Dolu</span>
                          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-page-navy border border-page-navy"></span>Seçili</span>
                        </div>

                        {/* Gruplara göre slotlar */}
                        {[
                          { label: "Sabah", slots: timeSlots.slice(0, 9) },
                          { label: "Öğle", slots: timeSlots.slice(9, 18) },
                          { label: "Öğleden Sonra", slots: timeSlots.slice(18, 27) },
                          { label: "Akşam", slots: timeSlots.slice(27) },
                        ].map((group) => (
                          <div key={group.label} className="mb-3">
                            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">{group.label}</div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {group.slots.map((slot) => {
                                const dolu = blockedSlots.has(slot);
                                const secili = formData.meetingTime === slot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    disabled={dolu}
                                    onClick={() => !dolu && setFormData((prev) => ({ ...prev, meetingTime: slot }))}
                                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all text-center leading-tight
                                      ${secili
                                        ? "bg-page-navy text-white border-page-navy shadow-md"
                                        : dolu
                                        ? "bg-[#fde8e8] text-[#c62828] border-[#e57373] cursor-not-allowed opacity-70"
                                        : "bg-[#e8f5e9] text-[#2e7d32] border-[#4caf50] hover:bg-page-navy hover:text-white hover:border-page-navy cursor-pointer"
                                      }`}
                                  >
                                    {slot.replace(" - ", "–")}
                                    {dolu && <span className="block text-[10px] mt-0.5 opacity-80">Dolu</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Seçilen saati göster */}
                        {formData.meetingTime && (
                          <div className="mt-1 text-xs text-page-navy font-bold">
                            ✓ Seçilen saat: {formData.meetingTime}
                          </div>
                        )}

                        {/* Hidden input for form validation */}
                        <input type="hidden" name="meetingTime" value={formData.meetingTime} required />
                      </>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Hedefleriniz / Notunuz</label>
                    <textarea name="message" rows="3" value={formData.message} onChange={handleInputChange} maxLength={1000} className={`${inputCls} resize-none`}></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 font-fredoka font-bold text-base rounded-full border-none cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                    style={{ background: "#D8FF4F", color: "#1C1B8A", boxShadow: "0 6px 18px rgba(216,255,79,0.3)" }}
                    disabled={loading}
                  >
                    {loading ? "Gönderiliyor..." : "Randevu Talebi Oluştur"}
                  </button>

                  {successMsg && <div className="p-3 rounded-xl mt-3 text-sm flex items-center gap-2 bg-[#ecfdf5] text-[#065f46] font-nunito font-bold"><FaCheckCircle /> {successMsg}</div>}
                  {errorMsg && <div className="p-3 rounded-xl mt-3 text-sm flex items-center gap-2 bg-[#fef2f2] text-[#991b1b] font-nunito font-bold"><FaExclamationCircle /> {errorMsg}</div>}

                  <p className="text-center text-[11px] text-[#94a3b8] font-nunito mt-3">Bilgileriniz 3. şahıslarla paylaşılmaz.</p>
                </form>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SÜREÇ */}
        <div className="py-20 max-[960px]:py-14">
          <div className="max-w-[1200px] mx-auto px-5">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>
                SÜREÇ
              </div>
              <h2 className="font-fredoka font-bold text-page-navy m-0 leading-tight" style={{ fontSize: "clamp(28px,4vw,40px)" }}>
                Süreç Nasıl İşliyor?
              </h2>
            </motion.div>

            <div className="grid grid-cols-3 gap-5 max-[960px]:grid-cols-1 max-[960px]:gap-6 relative">
              <div
                className="absolute max-[960px]:hidden"
                style={{
                  top: 22, left: "16.5%", right: "16.5%", height: 2,
                  background: "linear-gradient(to right, #D8FF4F, #7340C8, #FF6B35)",
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
                  <div className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(115,64,200,0.12)] transition-all h-full text-center">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-4 mx-auto font-fredoka font-bold text-base flex-shrink-0"
                      style={{ background: s.circleColor, color: s.circleText, boxShadow: `0 4px 14px ${s.circleColor}55` }}
                    >
                      {s.num}
                    </div>
                    <h3 className="font-fredoka font-bold text-page-navy text-base mb-2">{s.title}</h3>
                    <p className="font-nunito text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden max-[960px]:block fixed bottom-0 left-0 w-full bg-white p-3 px-5 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[999] border-t border-[#f1f5f9]">
           <button
             className="w-full border-none py-3.5 rounded-full font-fredoka font-bold text-base flex justify-center items-center gap-2.5 cursor-pointer"
             style={{ background: "#D8FF4F", color: "#1C1B8A" }}
             onClick={scrollToForm}
           >
             Hemen Başvur <FaArrowDown/>
           </button>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default IletisimPage;
