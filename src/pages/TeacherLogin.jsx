import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { isTokenValid, getRoleFromToken } from "../utils/auth";

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
      <div className="login-container">
        <form className="login-form" onSubmit={onSubmit}>
          <h2>Öğretmen Girişi</h2>
          {!!err && <p className="error-message">{err}</p>}
          <input type="email" placeholder="E-posta" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Şifre" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</button>
          <div style={{marginTop:8}}>
            <a href="/ogretmen/kayit">Hesabın yok mu? Kayıt ol</a>
          </div>
        </form>
      </div>
    </>
  );
}
