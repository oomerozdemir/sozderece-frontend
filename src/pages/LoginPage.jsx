import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

import axios from "../utils/axios"
import "../cssFiles/login.css";
import Navbar from "../components/navbar";

const LoginPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", grade: "", track: "", });

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        // Giriş işlemi
        const res = await axios.post(`/api/auth/login`, {
          email: form.email,
          password: form.password,
        });

        const token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        const role = jwtDecode(token).role;

        if (role === "admin") navigate("/admin");
        else if (role === "coach") navigate("/coach/dashboard");
        else navigate("/student/dashboard");
      } else {
        // Kayıt işlemi
        await axios.post(`/api/auth/register`, form);
        setIsLogin(true);
      }
    } catch (err) {
      setError("İşlem başarısız! Bilgileri kontrol edin.");
    }
  };

  return (
    <><Navbar />
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>

        {error && <p className="error-message">{error}</p>}

        {!isLogin && (
  <>
    <input
      type="text"
      placeholder="Adınız ve Soyadınız"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      required
    />

    <input
      type="tel"
      placeholder="Telefon Numaranız"
      value={form.phone}
      onChange={(e) => setForm({ ...form, phone: e.target.value })}
      required
    />

    <select
      value={form.grade}
      onChange={(e) => setForm({ ...form, grade: e.target.value })}
      required
    >
      <option value="">Sınıfınızı Seçin</option>
      <option value="8">8. Sınıf</option>
      <option value="9">9. Sınıf</option>
      <option value="10">10. Sınıf</option>
      <option value="11">11. Sınıf</option>
      <option value="12">12. Sınıf</option>
      <option value="Mezun">Mezun</option>
    </select>

    {(form.grade === "9" || form.grade === "10" || form.grade === "11" || form.grade === "12" || form.grade === "Mezun") && (
      <select
        value={form.track}
        onChange={(e) => setForm({ ...form, track: e.target.value })}
        required
      >
        <option value="">Alanınızı Seçin</option>
        <option value="Sayısal">Sayısal</option>
        <option value="Eşit Ağırlık">Eşit Ağırlık</option>
        <option value="Sözel">Sözel</option>
      </select>
    )}
  </>
)}


  
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Şifre"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button type="submit">{isLogin ? "Giriş Yap" : "Kayıt Ol"}</button>

  <div className="form-footer-links">
  <span onClick={() => setIsLogin(!isLogin)}>
    {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
  </span>
  {isLogin && (
    <span onClick={() => navigate("/forgot-password")}>Şifremi mi unuttun?</span>
  )}
</div>

      </form>
      
    </div>
<footer className="custom-footer">
              <div className="footer-icons">
                <FaInstagram />
                <FaTiktok />
                <FaYoutube />
              </div>
              <div className="footer-links">
                <a href="#">Hakkımızda</a>
                <a href="#">Kullanım Koşulları</a>
                <a href="#">Gizlilik</a>
                <a href="#">Satış Sözleşmeleri</a>
                <a href="#">İade Politikası</a>
                <a href="#">Mağaza Blog</a>
              </div>
              <div className="footer-copy">© 2025 SÖZDERECE KOÇLUK Her Hakkı Saklıdır</div>
            </footer>
    
    </>
  );
};

export default LoginPage;
