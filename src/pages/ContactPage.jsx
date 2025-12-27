import "../cssFiles/contactPage.css";
import { useState } from "react";
import axios from "../utils/axios";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import contactUsSvg from "../assets/undraw_contact-us_kcoa.svg";
import { Helmet } from "react-helmet";


const IletisimPage = () => {
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

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setSuccessMsg("");
  setErrorMsg("");

  try {
    const response = await axios.post("/api/contact/trial", formData);

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

      setSuccessMsg("Form başarıyla gönderildi!");
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
<Helmet>
  <title>Ücretsiz Ön Görüşme | Sözderece Koçluk</title>
  <meta
    name="description"
    content="Koçluk sistemimiz hakkında ücretsiz ön görüşme formunu doldurun. Öğrenci ve veliye özel eğitim planlaması ile sürece başlayın."
  />
  <meta
    name="keywords"
    content="ücretsiz ön görüşme, öğrenci koçluğu, veli danışmanlığı,  eğitim koçluğu başvuru, sözderece ücretsiz görüşme"
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

      <section className="iletisim-page two-column">
        <div className="info-panel">
          <h2>Ücretsiz Ön Görüşme</h2>
          <p>Size özel bir yol haritası belirlemek için hemen formu doldurun,biz size en kısa sürede dönelim.</p>
          <img src={contactUsSvg} alt="iletisim-ucretsiz" />

          <ul className="icon-info">
            <li><span className="icon">🔒</span> Verileriniz gizli tutulur</li>
            <li><span className="icon">⏱</span> 24 saat içinde geri dönüş</li>
            <li><span className="icon">🎓</span> Öğrenci ve veli odaklı destek</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="trial-form">
          <input type="text" name="name" placeholder="Ad Soyad" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="E-posta" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} required />
          <select name="userType" value={formData.userType} onChange={handleChange} required>
            <option value="">Görüşme Kimin İçin?</option>
            <option value="Öğrenci">Öğrenci</option>
            <option value="Veli">Veli</option>
          </select>
          <textarea name="message" placeholder="Eklemek istediğiniz not..." rows="5" value={formData.message} onChange={handleChange} required></textarea>

          <button type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>

          {successMsg && <p className="success-alert">{successMsg}</p>}
          {errorMsg && <p className="error-alert">{errorMsg}</p>}
        </form>
        
      </section>
      
      

      <Footer />
    </>
  );
};

export default IletisimPage;
