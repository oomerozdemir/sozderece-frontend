// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/login.css"; // kart stil eklerini buraya koyacağız

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      const token = data?.token;
      const user = data?.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/account", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-split">
            {/* SOL KART — Özel Ders Öğretmeni CTA */}
            <aside className="teacher-card">
              <h3>Özel ders vermek ister misin?</h3>
              <p className="teacher-sub">
                Profilini oluştur, fiyatını belirle ve öğrencilerle buluş.
              </p>
              <ul className="teacher-benefits">
                <li>🔹 Şehir / ilçe & sınıf filtreleri</li>
                <li>🔹 Online / yüz yüze seçenekleri</li>
                <li>🔹 Kişisel profil sayfası (slug)</li>
              </ul>

              <Link to="/ogretmen/kayit" className="teacher-primary-btn">
                Özel ders vermek için <strong>kayıt ol</strong>
              </Link>

              <div className="teacher-secondary">
                Zaten öğretmen misin?{" "}
                <Link to="/ogretmen/giris" className="teacher-link">
                  Giriş yap
                </Link>
              </div>
            </aside>

            {/* SAĞ — Mevcut Login Formu */}
            <section className="login-form-card">
              <form className="login-form" onSubmit={onSubmit}>
                <h2>Giriş Yap</h2>
                {!!err && <p className="error-message">{err}</p>}
                <input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>

                <div className="form-footer-links">
                  <span onClick={() => navigate("/forgot-password")}>
                    Şifremi Unuttum
                  </span>
                  <span onClick={() => navigate("/reset-password")}>
                    Şifre Sıfırla
                  </span>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
