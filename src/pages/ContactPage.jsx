import React, { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom"; // Yönlendirme için eklendi
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
  FaExclamationCircle
} from "react-icons/fa";

const IletisimPage = () => {
  const navigate = useNavigate();

  // --- MEVCUT STATE YAPISI (KORUNDU) ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

  // --- MEVCUT SUBMIT FONKSİYONU (KORUNDU: Pixel ve Ads kodları dahil) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await axios.post("/api/contact/trial", formData);

      if (response.data.success) {
        // Facebook Pixel
        if (window.fbq) {
          window.fbq("track", "Lead", {
            value: 250.00,      
            currency: 'TRY',
            content_name: 'Ucretsiz On Gorusme Formu' 
          });
        }

        // Google Ads
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
          email: "",
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
      {/* --- MEVCUT META TAGLER (KORUNDU) --- */}
      <Helmet>
        <title>Ücretsiz Ön Görüşme | Sözderece Koçluk</title>
        <meta
          name="description"
          content="Koçluk sistemimiz hakkında ücretsiz ön görüşme formunu doldurun. Öğrenci ve veliye özel eğitim planlaması ile sürece başlayın."
        />
        <meta
          name="keywords"
          content="ücretsiz ön görüşme, öğrenci koçluğu, veli danışmanlığı, eğitim koçluğu başvuru, sözderece ücretsiz görüşme"
        />
        <meta property="og:title" content="Ücretsiz Ön Görüşme | Sözderece Koçluk" />
        <meta
          property="og:description"
          content="Hemen formu doldurun, uzman koçlarımız size özel birebir eğitim planlamasıyla dönüş yapsın!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sozderecekocluk.com/ucretsiz-on-gorusme" />
        <meta property="og:image" content="https://sozderecekocluk.com/images/hero-logo.webp" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://sozderecekocluk.com/ucretsiz-on-gorusme" />
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="contact-page-wrapper">
        
        {/* --- YENİ TASARIM: HERO & FORM --- */}
        <div className="contact-hero-section">
          <div className="contact-container split-layout">
            
            {/* SOL KOLON: İkna Edici Metinler */}
            <div className="contact-text-content">
              <span className="highlight-badge">🚀 BAŞARIYA İLK ADIM</span>
              <h1 className="contact-title">
                Hayallerine Giden Yol <br />
                <span className="text-orange">Ücretsiz Ön Görüşme</span> ile Başlar
              </h1>
              <p className="contact-desc">
                Seni tanımamız, seviyeni analiz etmemiz ve hedefine en uygun koçu belirlememiz için 
                formu doldur, eğitim danışmanımız seni arasın.
              </p>

              <ul className="benefit-list">
                <li>
                  <div className="b-icon"><FaClipboardList /></div>
                  <div>
                    <strong>Seviye Analizi:</strong>
                    <span>Eksiklerini ve çalışma alışkanlıklarını belirleyelim.</span>
                  </div>
                </li>
                <li>
                  <div className="b-icon"><FaUserCheck /></div>
                  <div>
                    <strong>Koç Eşleşmesi:</strong>
                    <span>Sana en uygun derece öğrencisi koçu birlikte seçelim.</span>
                  </div>
                </li>
                <li>
                  <div className="b-icon"><FaCalendarCheck /></div>
                  <div>
                    <strong>3 Günlük Ücretsiz Deneme:</strong>
                    <span>Sistemi deneyimle, memnun kalırsan devam et!</span>
                  </div>
                </li>
              </ul>

              {/* Alternatif Butonlar */}
              <div className="contact-actions-row">
                 <p className="small-label">Form doldurmak istemiyor musun?</p>
                 <div className="btn-group">
                    <a href="tel:+905312546701" className="action-btn call-btn">
                      <FaPhoneAlt /> Hemen Ara
                    </a>
                    <button onClick={() => navigate("/ogretmenler")} className="action-btn browse-btn">
                      Koçları İncele <FaArrowRight />
                    </button>
                 </div>
              </div>
            </div>

            {/* SAĞ KOLON: Form Kartı (Mantık Eski, Tasarım Yeni) */}
            <div className="contact-form-card">
              <div className="form-header">
                <h3>Ücretsiz Analiz Formu</h3>
                <p>Bilgilerini bırak, eğitim danışmanımız seni arasın.</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Adınız Soyadınız" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>E-Posta Adresi</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="ornek@email.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Telefon Numarası</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="05XX XXX XX XX" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Görüşme Kimin İçin?</label>
                  <select name="userType" value={formData.userType} onChange={handleChange} required>
                    <option value="">Seçiniz</option>
                    <option value="Öğrenci">Öğrenci</option>
                    <option value="Veli">Veli</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notunuz / Hedefiniz</label>
                  <textarea 
                    name="message" 
                    placeholder="Sınıfınız, hedefiniz veya sormak istedikleriniz..." 
                    rows="3" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Ücretsiz Başvuruyu Gönder"}
                </button>

                {/* Başarı / Hata Mesajları */}
                {successMsg && (
                  <div className="form-alert success">
                    <FaCheckCircle /> {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="form-alert error">
                    <FaExclamationCircle /> {errorMsg}
                  </div>
                )}
                
                <p className="privacy-note">Bilgileriniz 3. şahıslarla paylaşılmaz.</p>
              </form>
            </div>

          </div>
        </div>

        {/* --- YENİ TASARIM: SÜREÇ NASIL İŞLER? --- */}
        <div className="process-section">
          <div className="contact-container">
            <h2 className="section-head">Süreç Nasıl İşliyor?</h2>
            <div className="process-grid">
              <div className="process-step">
                <div className="step-number">1</div>
                <h4>Başvuru & Analiz</h4>
                <p>Formu doldurursun, eğitim danışmanımız seni arar ve akademik durumunu analiz eder.</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h4>Koç Eşleşmesi</h4>
                <p>Hedeflerine ve kişiliğine en uygun derece öğrencisi koç ile tanışırsın.</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h4>3 Günlük Deneme</h4>
                <p>Sistemi ücretsiz denersin. Program hazırlanır, takibine başlanır. Memnun kalırsan devam edersin.</p>
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