import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
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

const IletisimPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

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
    } catch {
      // fetch başarısız olursa tüm slotlar boş kalır
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

  // --- GÜNCELLEME: 20 Dakikalık Aralıklar ---
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
      setErrorMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 border border-[#ddd] rounded-lg text-base bg-[#fdfdfd]";
  const labelClass = "block font-semibold text-[0.85rem] text-[#444] mb-1";

  return (
    <>
      <Seo
        title="İletişim & Ücretsiz Ön Görüşme"
        description="Sözderece Koçluk ile hedeflerine ulaşmak için ilk adımı at."
      />

      <TopBar />
      <Navbar />

      <div className="bg-[#f8f9fa] min-h-screen max-[960px]:pb-[70px]">

        {/* HERO SECTION */}
        <div className="bg-[#100481] pt-[50px] pb-[80px] relative max-[960px]:pt-5 max-[960px]:pb-10">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-[1.2fr_1fr] gap-[60px] items-start max-[960px]:grid-cols-1 max-[960px]:gap-[30px]">

              {/* SOL TARAF */}
              <div className="text-white max-[960px]:text-center">
                <span className="bg-[rgba(243,156,18,0.2)] text-[#f39c12] py-1.5 px-3.5 rounded-[20px] text-[0.85rem] font-bold inline-block mb-[15px] border border-[rgba(243,156,18,0.4)]">🚀 YKS/LGS 2026 Hazırlık</span>
                <h1 className="text-[2.8rem] leading-[1.2] font-extrabold mb-5 max-[960px]:text-[1.8rem] max-[960px]:mb-2.5">Hedeflerine Ulaşmak İçin<br /><span className="text-[#f39c12]">İlk Adımı At</span></h1>
                <p className="text-[1.1rem] text-gray-300 leading-[1.6] mb-[30px] max-w-[95%] max-[960px]:text-base max-[960px]:mb-[15px]">
                  YKS/LGS sınav sürecinde yalnız değilsin. Formu doldur, derece öğrencisi koçlarımız
                  seni arayıp seviyene uygun yol haritasını anlatsın.
                </p>

                <div className="hidden max-[960px]:inline-flex items-center gap-2 bg-[rgba(255,255,255,0.15)] text-[#f39c12] border border-[rgba(243,156,18,0.5)] py-2.5 px-5 rounded-full font-semibold mb-5 cursor-pointer text-[0.95rem]" onClick={scrollToForm}>
                  Hemen Başvur <FaArrowDown />
                </div>

                <ul className="list-none p-0 mb-[30px] max-[960px]:flex max-[960px]:flex-wrap max-[960px]:justify-center max-[960px]:gap-2.5 max-[960px]:mb-5">
                  <li className="flex gap-[15px] mb-[15px] items-center max-[960px]:bg-[rgba(255,255,255,0.05)] max-[960px]:p-2 max-[960px]:px-3 max-[960px]:rounded-lg max-[960px]:m-0 max-[960px]:w-full max-[960px]:justify-start">
                    <div className="bg-[rgba(255,255,255,0.1)] text-[#f39c12] w-10 h-10 rounded-[10px] flex items-center justify-center text-[1.1rem] flex-shrink-0"><FaUserCheck /></div>
                    <div><strong className="block text-base mb-0.5">Kişiye Özel Analiz</strong><span className="text-[0.9rem] text-gray-400">Eksiklerini nokta atışı belirle.</span></div>
                  </li>
                  <li className="flex gap-[15px] mb-[15px] items-center max-[960px]:bg-[rgba(255,255,255,0.05)] max-[960px]:p-2 max-[960px]:px-3 max-[960px]:rounded-lg max-[960px]:m-0 max-[960px]:w-full max-[960px]:justify-start">
                    <div className="bg-[rgba(255,255,255,0.1)] text-[#f39c12] w-10 h-10 rounded-[10px] flex items-center justify-center text-[1.1rem] flex-shrink-0"><FaClipboardList /></div>
                    <div><strong className="block text-base mb-0.5">Koçluk Sistemi Tanıtımı</strong><span className="text-[0.9rem] text-gray-400">Sana özel hazırlanan sistemin detaylarını öğren.</span></div>
                  </li>
                  <li className="flex gap-[15px] mb-[15px] items-center max-[960px]:bg-[rgba(255,255,255,0.05)] max-[960px]:p-2 max-[960px]:px-3 max-[960px]:rounded-lg max-[960px]:m-0 max-[960px]:w-full max-[960px]:justify-start">
                    <div className="bg-[rgba(255,255,255,0.1)] text-[#f39c12] w-10 h-10 rounded-[10px] flex items-center justify-center text-[1.1rem] flex-shrink-0"><FaPhoneAlt /></div>
                    <div><strong className="block text-base mb-0.5">Ücretsiz Görüşme</strong><span className="text-[0.9rem] text-gray-400">Koçunla tanış, sorularını sor.</span></div>
                  </li>
                </ul>

                <div className="mt-5 pt-5 border-t border-[rgba(255,255,255,0.1)] max-[960px]:hidden">
                  <p className="text-[0.9rem] text-gray-400 mb-2.5">Veya bize ulaşın:</p>
                  <div className="flex gap-[15px]">
                    <a href="tel:05312546701" className="flex items-center gap-2.5 py-3 px-6 rounded-lg font-semibold no-underline transition-all cursor-pointer bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#100481]"><FaPhoneAlt /> 0 531 254 67 01</a>
                    <button onClick={() => navigate('/paket-detay')} className="flex items-center gap-2.5 py-3 px-6 rounded-lg font-semibold transition-all cursor-pointer bg-[rgba(255,255,255,0.1)] text-[#f39c12] border-0 hover:bg-[rgba(255,255,255,0.2)] hover:text-white">Paketleri İncele</button>
                  </div>
                </div>
              </div>

              {/* SAĞ TARAF: FORM KARTI */}
              <div className="bg-white p-[30px] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] max-[960px]:p-5 max-[960px]:shadow-[0_10px_30px_rgba(0,0,0,0.15)]" ref={formRef}>
                <div className="text-center mb-5">
                  <h3 className="text-[#0f2a4a] text-[1.4rem] font-bold mb-1">Randevu Oluştur 📅</h3>
                  <p className="text-gray-500 text-[0.9rem]">Müsait olduğun zamanı seç, biz arayalım.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className={labelClass}>Adınız Soyadınız</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Örn: Ahmet Yılmaz" className={inputClass} />
                  </div>

                  <div className="mb-3">
                    <label className={labelClass}>E-posta Adresi</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="ornek@gmail.com" className={inputClass} />
                  </div>

                  <div className="mb-3">
                    <label className={labelClass}>Telefon Numarası</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="0555..." className={inputClass} />
                  </div>

                  <div className="mb-3">
                    <label className={labelClass}>Durumunuz</label>
                    <select name="userType" value={formData.userType} onChange={handleInputChange} required className={inputClass}>
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
                  <div className="flex gap-[15px] w-full max-[600px]:flex-col max-[600px]:gap-0">
                    <div className="mb-3 flex-1 max-[600px]:w-full">
                      <label className={labelClass}>Tarih Seçiniz</label>
                      <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} min={today} required style={{ cursor: "pointer" }} className={inputClass} />
                    </div>
                    <div className="mb-3 flex-1 max-[600px]:w-full">
                      <label className={labelClass}>
                        Müsait olduğunuz Saat Aralığı
                        {slotsLoading && <span className="text-[0.75rem] text-gray-400 ml-2">güncelleniyor...</span>}
                      </label>
                      <select name="meetingTime" value={formData.meetingTime} onChange={handleInputChange} required className={inputClass} disabled={slotsLoading && !formData.meetingDate}>
                        <option value="">{formData.meetingDate ? "Seçiniz..." : "Önce tarih seçin"}</option>
                        {timeSlots.map((slot, i) => {
                          const dolu = blockedSlots.has(slot);
                          return (
                            <option key={i} value={slot} disabled={dolu} style={dolu ? { color: "#aaa" } : {}}>
                              {slot}{dolu ? " (Dolu)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className={labelClass}>Hedefleriniz / Notunuz</label>
                    <textarea name="message" rows="3" value={formData.message} onChange={handleInputChange} className={inputClass}></textarea>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#f39c12] to-[#d35400] text-white border-0 rounded-lg font-bold text-[1.1rem] cursor-pointer mt-2.5 shadow-[0_4px_15px_rgba(243,156,18,0.4)]" disabled={loading}>
                    {loading ? "Gönderiliyor..." : "Randevu Talebi Oluştur"}
                  </button>

                  {successMsg && <div className="p-2.5 rounded-md mt-2.5 text-[0.85rem] flex items-center gap-2 bg-[#d1e7dd] text-[#0f5132]"><FaCheckCircle /> {successMsg}</div>}
                  {errorMsg && <div className="p-2.5 rounded-md mt-2.5 text-[0.85rem] flex items-center gap-2 bg-[#f8d7da] text-[#842029]"><FaExclamationCircle /> {errorMsg}</div>}

                  <p className="text-center text-[0.75rem] text-gray-300 mt-2.5">Bilgileriniz 3. şahıslarla paylaşılmaz.</p>
                </form>
              </div>

            </div>
          </div>
        </div>

        {/* PROCESS SECTION */}
        <div className="py-[60px] bg-white">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-center text-[1.8rem] text-[#0f2a4a] mb-10 max-[480px]:text-[1.3rem] max-[480px]:mb-6">Süreç Nasıl İşliyor?</h2>
            <div className="grid grid-cols-3 gap-5 max-[960px]:grid-cols-1 max-[960px]:gap-[30px] max-[480px]:gap-4">
              <div className="text-center p-2.5">
                <div className="w-[45px] h-[45px] bg-[#eef2ff] text-[#0f2a4a] rounded-full text-[1.3rem] font-extrabold flex items-center justify-center mx-auto mb-[15px] border-2 border-[#0f2a4a]">1</div>
                <h4>Randevu</h4>
                <p>Formu doldur, sana uygun tarih ve saati seç.</p>
              </div>
              <div className="text-center p-2.5">
                <div className="w-[45px] h-[45px] bg-[#eef2ff] text-[#0f2a4a] rounded-full text-[1.3rem] font-extrabold flex items-center justify-center mx-auto mb-[15px] border-2 border-[#0f2a4a]">2</div>
                <h4>Görüşme</h4>
                <p>Belirlediğin zamanda koçumuz seni arasın ve analiz yapsın.</p>
              </div>
              <div className="text-center p-2.5">
                <div className="w-[45px] h-[45px] bg-[#eef2ff] text-[#0f2a4a] rounded-full text-[1.3rem] font-extrabold flex items-center justify-center mx-auto mb-[15px] border-2 border-[#0f2a4a]">3</div>
                <h4>Başlangıç</h4>
                <p>Sistemi ve koçunu sevdiysen hemen çalışmaya başla.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden max-[960px]:block fixed bottom-0 left-0 w-full bg-white p-3 px-5 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[999] border-t border-gray-200">
           <button className="w-full bg-[#f39c12] text-white border-0 py-3 rounded-lg font-bold text-base flex justify-center items-center gap-2.5 shadow-[0_4px_10px_rgba(243,156,18,0.3)]" onClick={scrollToForm}>Hemen Başvur <FaArrowDown/></button>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default IletisimPage;
