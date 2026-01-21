import React, { useState, useRef } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Seo from "../components/Seo";

// CSS
import "../cssFiles/contactPage.css";

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <>
      <Seo 
        title="İletişim & Ücretsiz Ön Görüşme" 
        description="Sözderece Koçluk ile hedeflerine ulaşmak için ilk adımı at." 
      />
      
      <TopBar />
      <Navbar />

      <div className="contact-page-wrapper">
        
        {/* HERO SECTION */}
        <div className="contact-hero-section">
          <div className="contact-container">
            <div className="split-layout">
              
              {/* SOL TARAF */}
              <div className="contact-text-content">
                <span className="highlight-badge">🚀 YKS 2026 Hazırlık</span>
                <h1 className="contact-title">Hedeflerine Ulaşmak İçin<br /><span className="text-orange">İlk Adımı At</span></h1>
                <p className="contact-desc">
                  YKS sürecinde yalnız değilsin. Formu doldur, derece öğrencisi koçlarımız 
                  seni arayıp seviyene uygun yol haritasını anlatsın.
                </p>

                <div className="mobile-inline-cta" onClick={scrollToForm}>
                  Hemen Başvur <FaArrowDown />
                </div>

                <ul className="benefit-list">
                  <li>
                    <div className="b-icon"><FaUserCheck /></div>
                    <div><strong>Kişiye Özel Analiz</strong><span>Eksiklerini nokta atışı belirle.</span></div>
                  </li>
                  <li>
                    <div className="b-icon"><FaClipboardList /></div>
                    <div><strong>Sistem Tanıtımı</strong><span>Derece yaptıran sistemi öğren.</span></div>
                  </li>
                  <li>
                    <div className="b-icon"><FaPhoneAlt /></div>
                    <div><strong>Ücretsiz Görüşme</strong><span>Koçunla tanış, sorularını sor.</span></div>
                  </li>
                </ul>

                <div className="contact-actions-row desktop-only-actions">
                  <p className="small-label">Veya bize ulaşın:</p>
                  <div className="btn-group">
                    <a href="tel:05312546701" className="action-btn call-btn"><FaPhoneAlt /> 0 531 254 67 01</a>
                    <button onClick={() => navigate('/paket-detay')} className="action-btn browse-btn">Paketleri İncele</button>
                  </div>
                </div>
              </div>

              {/* SAĞ TARAF: FORM KARTI */}
              <div className="contact-form-card" ref={formRef}>
                <div className="form-header">
                  <h3>Randevu Oluştur 📅</h3>
                  <p>Müsait olduğun zamanı seç, biz arayalım.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Adınız Soyadınız</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Örn: Ahmet Yılmaz" 
                    />
                  </div>

                  <div className="form-group">
                    <label>E-posta Adresi</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="ornek@gmail.com" 
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefon Numarası</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="0555..." 
                    />
                  </div>

                  <div className="form-group">
                    <label>Durumunuz</label>
                    <select name="userType" value={formData.userType} onChange={handleInputChange} required>
                      <option value="">Seçiniz...</option>
                      <option value="12. Sınıf">12. Sınıf Öğrencisi</option>
                      <option value="Mezun">Mezun Öğrenci</option>
                      <option value="11. Sınıf">11. Sınıf Öğrencisi</option>
                      <option value="Veli">Öğrenci Velisi</option>
                    </select>
                  </div>

                  {/* TARİH VE SAAT SEÇİMİ */}
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Tarih Seçiniz</label>
                      <input 
                        type="date" 
                        name="meetingDate" 
                        value={formData.meetingDate} 
                        onChange={handleInputChange} 
                        min={today} 
                        required 
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    <div className="form-group half">
                      <label>Müsait olduğunuz Saat Aralığı</label>
                      <select name="meetingTime" value={formData.meetingTime} onChange={handleInputChange} required>
                        <option value="">Seçiniz...</option>
                        {timeSlots.map((slot, i) => <option key={i} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Hedefleriniz / Notunuz</label>
                    <textarea 
                      name="message" 
                      rows="3" 
                      value={formData.message} 
                      onChange={handleInputChange} 
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Gönderiliyor..." : "Randevu Talebi Oluştur"}
                  </button>

                  {successMsg && <div className="form-alert success"><FaCheckCircle /> {successMsg}</div>}
                  {errorMsg && <div className="form-alert error"><FaExclamationCircle /> {errorMsg}</div>}
                  
                  <p className="privacy-note">Bilgileriniz 3. şahıslarla paylaşılmaz.</p>
                </form>
              </div>

            </div>
          </div>
        </div>

        {/* PROCESS SECTION */}
        <div className="process-section">
          <div className="contact-container">
            <h2 className="section-head">Süreç Nasıl İşliyor?</h2>
            <div className="process-grid">
              <div className="process-step">
                <div className="step-number">1</div>
                <h4>Randevu</h4>
                <p>Formu doldur, sana uygun tarih ve saati seç.</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h4>Görüşme</h4>
                <p>Belirlediğin zamanda koçumuz seni arasın ve analiz yapsın.</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h4>Başlangıç</h4>
                <p>Sistemi ve koçunu sevdiysen hemen çalışmaya başla.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mobile-sticky-cta">
           <button className="sticky-btn" onClick={scrollToForm}>Hemen Başvur <FaArrowDown/></button>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default IletisimPage;