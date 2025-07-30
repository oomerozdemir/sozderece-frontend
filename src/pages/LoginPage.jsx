import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Helmet } from "react-helmet";
import { isValidPhone,isValidEmail } from "../utils/validation.js";

import axios from "../utils/axios"
import "../cssFiles/login.css";
import Navbar from "../components/navbar";

const LoginPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", grade: "", track: "", });

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Genel boşluk ve format kontrolleri
  if (!form.email || !isValidEmail(form.email)) {
    setError("Geçerli bir e-posta adresi girin.");
    return;
  }

  if (isLogin) {
    // Giriş işlemi
    try {
      const res = await axios.post(`/api/auth/login`, {
        email: form.email,
        password: form.password,
      });
if (!res.data.user.isVerified) {
  setError("Hesabınız henüz doğrulanmadı. Lütfen e-postanızı kontrol edin.");
  return;
}
      const token = res.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = jwtDecode(token).role;

      if (role === "admin") navigate("/admin");
      else if (role === "coach") navigate("/coach/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
    }
  } else {
    // Kayıt işlemi - tüm alanları kontrol et
    if (!form.name || form.name.trim().length < 2) {
      setError("İsminizi eksiksiz girin.");
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Geçerli bir telefon numarası girin (05XXXXXXXXX)");
      return;
    }

    if (!form.grade) {
      setError("Lütfen sınıfınızı seçin.");
      return;
    }

    const requiresTrack = ["9", "10", "11", "12", "Mezun"];
    if (requiresTrack.includes(form.grade) && !form.track) {
      setError("Lütfen alanınızı seçin.");
      return;
    }

    try {
      await axios.post(`/api/auth/register`, form);
navigate(`/verify-email?email=${form.email}`);
      setIsLogin(true);
    } catch (err) {
      setError("Kayıt başarısız. Bilgileri kontrol edin veya e-posta daha önce alınmış olabilir.");
    }
  }
};

  return (
    <>
    <Helmet>
  <title>Giriş Yap | Sözderece Koçluk</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
    <Navbar />
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
      <option value="5">5. Sınıf</option>
      <option value="6">6. Sınıf</option>
      <option value="7">7. Sınıf</option>
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

<div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Şifre"
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
    required
  />
  <span
    onClick={() => setPassword(!showPassword)}
    className="eye-toggle"
  >
    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
  </span>
</div>




        <button type="submit">{isLogin ? "Giriş Yap" : "Kayıt Ol"}</button>

  <div className="form-footer-links">
  <span onClick={() => setIsLogin(!isLogin)}>
    {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
  </span>
  {isLogin && (
    <span onClick={() => navigate("/forgot-password")}>Şifreni mi unuttun?</span>
  )}
</div>

      </form>
      
    </div>
<footer className="custom-footer">
              <div className="footer-icons">
                <a href="https://www.instagram.com/sozderece/"><FaInstagram/></a>
                <FaTiktok />
                <FaYoutube />
              </div>
              <div className="footer-links">
                <a href="/hakkimizda">Hakkımızda</a>
                <a href="/mesafeli-hizmet-sozlesmesi">Mesafeli Hizmet Sözleşmesi</a>
                <a href="/gizlilik-politikasi-kvkk">Gizlilik ve KVKK</a>
                <a href="/iade-ve-cayma-politikasi">İade ve Cayma Politikası</a>
              </div>
              <div className="footer-copy">© 2025 Sözderece Koçluk Her Hakkı Saklıdır</div>
            </footer>
    
    </>
  );
};

export default LoginPage;
