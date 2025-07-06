import "../cssFiles/contactPage.css";
import { useState } from "react";
import axios from "../utils/axios";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import FaqSection from "../components/FaqSection";
import contactUsSvg from "../assets/undraw_contact-us_kcoa.svg";


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
      <TopBar />
      <Navbar />

      <section className="iletisim-page two-column">
        <div className="info-panel">
          <h2>Ücretsiz Ön Görüşme</h2>
          <p>Size özel bir yol haritası belirlemek için hemen başvuru yapın.</p>
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
      
      <FaqSection />

      <Footer />
    </>
  );
};

export default IletisimPage;
