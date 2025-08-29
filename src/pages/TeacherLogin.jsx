import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { isTokenValid, getRoleFromToken } from "../utils/auth";
import "../cssFiles/teacher.css"; // ⬅️ YENİ: sayfaya özel css

export default function TeacherLogin() {
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
      const { data } = await axios.post("/api/v1/ogretmen/auth/giris", { email, password });
      const token = data?.token;
      const user  = data?.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      const role = getRoleFromToken(token) || (user?.role || "").toLowerCase();
      if (isTokenValid(token) && role === "teacher") {
        navigate("/ogretmen/panel/profil", { replace: true });
      } else {
        setErr("Yetki hatası: öğretmen rolü bulunamadı.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="tlogin">
        <div className="login-container tlogin-container">
          <form className="login-form tlogin-card" onSubmit={onSubmit}>
            <h2 className="tlogin-title">Öğretmen Girişi</h2>
            <p className="tlogin-sub">Özel ders profilini yönetmek için giriş yap.</p>

            {!!err && <p className="error-message">{err}</p>}

            <input
              className="tlogin-input"
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
            <input
              className="tlogin-input"
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <button className="tlogin-btn" type="submit" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <div className="tlogin-footer">
              <Link to="/ogretmen/kayit" className="tlogin-link">
                Özel ders vermek için <strong>kayıt ol</strong>
              </Link>
              <span className="tlogin-sep">•</span>
              <Link to="/forgot-password" className="tlogin-link-secondary">
                Şifremi unuttum
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
