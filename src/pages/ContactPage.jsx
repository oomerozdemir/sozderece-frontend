import React, { useState, useRef } from "react"; // useRef eklendi
import axios from "../utils/axios";
import { data, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";

// Yeni Tasarım için İkonlar ve CSS
import "../cssFiles/contactPage.css";
import { 
  FaPhoneAlt, 
  FaUserCheck, 
  FaClipboardList, 
  FaCalendarCheck, 
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowDown // Aşağı ok ikonu eklendi
} from "react-icons/fa";

const IletisimPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null); // Formu yakalamak için referans

  // Forma yumuşak kaydırma fonksiyonu
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const [formData, setFormData] = useState({
    name: "",
    // email: "",
    phone: "",
    userType: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
        const dataToSend = {
        ...formData,
        email: "mobil-basvuru@sozderece.com" // Veya "bos@yok.com"
      };

      const response = await axios.post("/api/contact/trial", dataToSend);

      if (response.data.success) {
        if (window.fbq) {
          window.fbq("track", "Lead", {
            value: 250.00,      
            currency: 'TRY',
            content_name: 'Ucretsiz On Gorusme Formu' 
          });
        }
        if (window.gtag) {
          window.gtag("event", "conversion", {
            send_to: "AW-17399744724/16ynCJSfIaobENSR7OhA",
            value: 250.0,      
            currency: "TRY",
          });
        }
        setSuccessMsg("Form başarıyla gönderildi! En kısa sürede size döneceğiz.");
        setFormData({
          name: "",
          //email: "",
          phone: "",
          userType: "",
          message: "",
        });
      } else {
        setErrorMsg("Form gönderilirken bir hata oluştu.");
      }
    } catch (error) {
      setErrorMsg("Sunucu hatası: Form gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ücretsiz Ön Görüşme | Sözderece Koçluk</title>
        <meta name="description" content="Koçluk sistemimiz hakkında ücretsiz ön görüşme formunu doldurun." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="contact-page-wrapper">
        
        {/* --- MOBİL STICKY BUTON (Sadece Mobilde Görünür) --- */}
        <div className="mobile-sticky-cta">
            <button onClick={scrollToForm} className="sticky-btn">
                Ücretsiz Analiz Formunu Doldur <FaArrowRight />
            </button>
        </div>

        <div className="contact-hero-section">
          <div className="contact-container split-layout">
            
            {/* SOL KOLON */}
            <div className="contact-text-content">
              <span className="highlight-badge">🚀 BAŞARIYA İLK ADIM</span>
              <h1 className="contact-title">
                Hayallerine Giden Yol <br />
                <span className="text-orange">Ücretsiz Ön Görüşme</span> ile Başlar
              </h1>
              
              {/* MOBİL İÇİN EKSTRA CTA BUTONU (Metnin hemen altında) */}
              <button className="mobile-inline-cta" onClick={scrollToForm}>
                 Hemen Başvur <FaArrowDown />
              </button>

              <p className="contact-desc">
                Seni tanımamız, seviyeni analiz etmemiz ve hedefine en uygun koçu belirlememiz için 
                formu doldur, eğitim danışmanımız seni arasın.
              </p>

              <ul className="benefit-list">
                <li>
                  <div className="b-icon"><FaClipboardList /></div>
                  <div>
                    <strong>Seviye Analizi</strong>
                    <span>Eksiklerini belirleyelim.</span>
                  </div>
                </li>
                <li>
                  <div className="b-icon"><FaUserCheck /></div>
                  <div>
                    <strong>Koç Eşleşmesi</strong>
                    <span>Sana en uygun koçu seçelim.</span>
                  </div>
                </li>
                <li>
                  <div className="b-icon"><FaCalendarCheck /></div>
                  <div>
                    <strong>3 Gün Ücretsiz</strong>
                    <span>Sistemi deneyimle.</span>
                  </div>
                </li>
              </ul>

              {/* Desktop Butonlar */}
              <div className="contact-actions-row desktop-only-actions">
                 <p className="small-label">Form doldurmak istemiyor musun?</p>
                 <div className="btn-group">
                    <a href="tel:+905312546701" className="action-btn call-btn">
                      <FaPhoneAlt /> Hemen Ara
                    </a>
                    <button onClick={() => navigate("/ekibimiz")} className="action-btn browse-btn">
                      Koçları İncele <FaArrowRight />
                    </button>
                 </div>
              </div>
            </div>

            {/* SAĞ KOLON: Form Kartı */}
            {/* ref={formRef} buraya eklendi */}
            <div className="contact-form-card" ref={formRef} id="analiz-formu">
              <div className="form-header">
                <h3>Ücretsiz Analiz Formu</h3>
                <p>Bilgilerini bırak, seni arayalım.</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input type="text" name="name" placeholder="Adınız Soyadınız" value={formData.name} onChange={handleChange} required />
                </div>

               {/*  <div className="form-group">
                  <label>E-Posta</label>
                  <input type="email" name="email" placeholder="ornek@email.com" value={formData.email} onChange={handleChange} required />
                </div>
                */}

                <div className="form-group">
                  <label>Telefon</label>
                  <input type="tel" name="phone" placeholder="05XX XXX XX XX" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-group">
                   <label>Kimin İçin?</label>
                   <div className="radio-group-wrapper">
                      <select name="userType" value={formData.userType} onChange={handleChange} required className="simple-select">
                        <option value="">Seçiniz...</option>
                        <option value="Öğrenci">Öğrenci</option>
                        <option value="Veli">Veli</option>
                      </select>
                   </div>
                </div>

                <div className="form-group">
                  <label>Hedefiniz</label>
                  <textarea name="message" placeholder="Sınıf, hedef veya sorular..." rows="2" value={formData.message} onChange={handleChange} required></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Ücretsiz Başvuruyu Gönder"}
                </button>

                {successMsg && <div className="form-alert success"><FaCheckCircle /> {successMsg}</div>}
                {errorMsg && <div className="form-alert error"><FaExclamationCircle /> {errorMsg}</div>}
                
                <p className="privacy-note">Bilgileriniz güvendedir.</p>
              </form>
            </div>

          </div>
        </div>

        {/* Süreç Bölümü (Değişmedi) */}
        <div className="process-section">
          <div className="contact-container">
            <h2 className="section-head">Süreç Nasıl İşliyor?</h2>
            <div className="process-grid">
              <div className="process-step">
                <div className="step-number">1</div>
                <h4>Başvuru</h4>
                <p>Formu doldur, danışmanımız seni arasın.</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h4>Eşleşme</h4>
                <p>Sana en uygun derece öğrencisi koç ile tanış.</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h4>Deneme</h4>
                <p>Sistemi 3 gün ücretsiz dene, memnun kalırsan devam et.</p>
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