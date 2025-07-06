import axios from "../utils/axios";
import { useState } from "react";
import "../cssFiles/contactPage.css";


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
        setSuccessMsg("Form başarıyla gönderildi! En kısa sürede sizinle iletişime geçeceğiz.");
        setFormData({ name: "", email: "", phone: "", userType: "", message: "" });
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
    <section className="iletisim-page">
      <h2>Ücretsiz Ön Görüşme Formu</h2>
      <p>Lütfen formu eksiksiz doldurun. Size kısa sürede geri dönüş yapacağız.</p>

      <form onSubmit={handleSubmit} className="trial-form">
        <input
          type="text"
          name="name"
          placeholder="Ad Soyad"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefon"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <select
          name="userType"
          value={formData.userType}
          onChange={handleChange}
          required
        >
          <option value="">Görüşme Kimin İçin?</option>
          <option value="Öğrenci">Öğrenci</option>
          <option value="Veli">Veli</option>
        </select>
        <textarea
          name="message"
          placeholder="Eklemek istediğiniz not..."
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit" disabled={loading}>
          {loading ? "Gönderiliyor..." : "Gönder"}
        </button>

        {successMsg && <p className="success">{successMsg}</p>}
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
    </section>
  );
};

export default IletisimPage;