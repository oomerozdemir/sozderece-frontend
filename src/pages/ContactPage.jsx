import React, { useState, useRef } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Seo from "../components/Seo";

// İkonlar ve CSS
import "../cssFiles/contactPage.css";
import { 
  FaPhoneAlt, 
  FaUserCheck, 
  FaClipboardList, 
  FaCalendarCheck, 
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowDown,
  FaClock,     // Saat ikonu eklendi
  FaEnvelope   // Mail ikonu eklendi
} from "react-icons/fa";

const IletisimPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null); 

  // Forma yumuşak kaydırma
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "", // Mail aktif edildi
    phone: "",
    userType: "",
    meetingTime: "", // Yeni: Randevu Saati
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Randevu Saatleri Listesi
  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00"
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
        setSuccessMsg("Randevu talebiniz alındı! Seçtiğiniz saat aralığında (veya en yakın müsaitlikte) sizi arayacağız.");
        setFormData({ name: "", email: "", phone: "", userType: "", meetingTime: "", message: "" });
        
        // Google Ads Form Dönüşümü
        if (window.gtag) {
          window.gtag('event', 'conversion', {
             'send_to': 'AW-17399744724/SENIN_FORM_ETIKETIN_BURAYA', // Burayı kendi etiket kodunla güncellemeyi unutma!
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
        description="Sözderece Koçluk ile hedeflerine ulaşmak için ilk adımı at. Formu doldur, derece öğrencisi koçlarımız seni arayıp sistem hakkında bilgi versin." 
      />
      
      <TopBar />
      <Navbar />

      <div className="contact-page-wrapper">
        
        {/* Header Section */}
        <div className="contact-header">
          <div className="contact-container header-content">
            <h1>Hedeflerine Ulaşmak İçin<br /><span>İlk Adımı At</span></h1>
            <p>
              YKS sürecinde yalnız değilsin. Formu doldur, derece öğrencisi koçlarımız 
              seni arayıp seviyene uygun yol haritasını anlatsın.
            </p>
            <button className="cta-button" onClick={scrollToForm}>
              Hemen Başvur <FaArrowDown />
            </button>
          </div>
        </div>

        {/* İletişim Formu & Bilgi Bölümü */}
        <div className="contact-main-section" ref={formRef}>
          <div className="contact-container grid-layout">
            
            {/* Sol Taraf: İkonlu Bilgiler */}
            <div className="info-side">
              <h3>Neden Başvuru Yapmalısın?</h3>
              <div className="info-item">
                <div className="icon-box"><FaUserCheck /></div>
                <div>
                  <h4>Kişiye Özel Analiz</h4>
                  <p>Mevcut durumunu analiz edip eksiklerini belirliyoruz.</p>
                </div>
              </div>
              <div className="info-item">
                <div className="icon-box"><FaClipboardList /></div>
                <div>
                  <h4>Sistem Tanıtımı</h4>
                  <p>Sözderece koçluk sisteminin sana nasıl kazandıracağını anlatıyoruz.</p>
                </div>
              </div>
              <div className="info-item">
                <div className="icon-box"><FaPhoneAlt /></div>
                <div>
                  <h4>Ücretsiz Görüşme</h4>
                  <p>Hiçbir ücret ödemeden koçlarımızla tanışma fırsatı.</p>
                </div>
              </div>
            </div>

            {/* Sağ Taraf: Form */}
            <div className="form-side">
              <h3>Ücretsiz Görüşme Formu 📞</h3>
              <p className="form-subtext">Bilgilerini bırak, seni arayalım.</p>
              
              <form onSubmit={handleSubmit}>
                
                <div className="input-group">
                  <FaUserCheck className="input-icon" />
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Adınız Soyadınız" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                {/* YENİ: E-posta Alanı */}
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="E-posta Adresiniz" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <FaPhoneAlt className="input-icon" />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Telefon Numaranız (05...)" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <FaClipboardList className="input-icon" />
                  <select 
                    name="userType" 
                    value={formData.userType} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">Durumunuz (Öğrenci/Veli)</option>
                    <option value="12. Sınıf">12. Sınıf Öğrencisi</option>
                    <option value="Mezun">Mezun Öğrenci</option>
                    <option value="11. Sınıf">11. Sınıf Öğrencisi</option>
                    <option value="Veli">Öğrenci Velisi</option>
                  </select>
                </div>

                {/* YENİ: Saat Seçimi (Randevu) */}
                <div className="input-group">
                  <FaClock className="input-icon" />
                  <select 
                    name="meetingTime" 
                    value={formData.meetingTime} 
                    onChange={handleInputChange} 
                    required
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Sizi ne zaman arayalım? (Saat Seçin)</option>
                    {timeSlots.map((slot, index) => (
                      <option key={index} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group full-width">
                  <textarea 
                    name="message" 
                    placeholder="Eklemek istedikleriniz veya hedefleriniz..." 
                    value={formData.message} 
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Randevu Talebi Oluştur"} <FaArrowRight />
                </button>

                {successMsg && <div className="form-alert success"><FaCheckCircle /> {successMsg}</div>}
                {errorMsg && <div className="form-alert error"><FaExclamationCircle /> {errorMsg}</div>}
                
                <p className="privacy-note">Bilgileriniz 3. şahıslarla paylaşılmaz.</p>
              </form>
            </div>

          </div>
        </div>

        {/* Süreç Bölümü */}
        <div className="process-section">
          <div className="contact-container">
            <h2 className="section-head">Süreç Nasıl İşliyor?</h2>
            <div className="process-grid">
              <div className="process-step">
                <div className="step-number">1</div>
                <h4>Randevu</h4>
                <p>Formu doldur ve sana uygun aranma saatini seç.</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h4>Görüşme</h4>
                <p>Belirlediğin saatte koçumuz seni arasın ve analiz yapsın.</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h4>Başlangıç</h4>
                <p>Sistemi ve koçunu sevdiysen hemen çalışmaya başla.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default IletisimPage;