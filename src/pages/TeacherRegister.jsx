import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { isValidName, isValidEmail, isValidPhone } from "../utils/validation";
import { getRoleFromToken, isTokenValid } from "../utils/auth";

export default function TeacherRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "",
    subjects: [], grades: [], city: "", district: "",
    mode: "BOTH", priceOnline: "", priceF2F: "", bio: ""
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!isValidName(form.firstName) || !isValidName(form.lastName)) return setErr("İsim soyisim geçersiz.");
    if (!isValidEmail(form.email)) return setErr("E-posta geçersiz.");
    if (form.phone && !isValidPhone(form.phone)) return setErr("Telefon geçersiz (05XXXXXXXXX).");

    setLoading(true);
    try {
      const payload = {
        ...form,
        // string boş ise null/undefined gönderme
        priceOnline: form.priceOnline === "" ? undefined : Number(form.priceOnline),
        priceF2F:    form.priceF2F    === "" ? undefined : Number(form.priceF2F),
      };
      const { data } = await axios.post("/api/v1/ogretmen/auth/kayit", payload);
      const token = data?.token;
      const user  = data?.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      const role = getRoleFromToken(token) || (user?.role || "").toLowerCase();
      if (isTokenValid(token) && role === "teacher") {
        navigate("/ogretmen/panel/profil", { replace: true });
      } else {
        setErr("Kayıt başarılı ama rol doğrulanamadı.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <form className="login-form" onSubmit={submit}>
          <h2>Öğretmen Kaydı</h2>
          {!!err && <p className="error-message">{err}</p>}

          <div className="grid-two">
            <input placeholder="Ad" value={form.firstName} onChange={(e)=>onChange("firstName", e.target.value)} required />
            <input placeholder="Soyad" value={form.lastName} onChange={(e)=>onChange("lastName", e.target.value)} required />
          </div>

          <input type="email" placeholder="E-posta" value={form.email} onChange={(e)=>onChange("email", e.target.value)} required />
          <input type="password" placeholder="Şifre" value={form.password} onChange={(e)=>onChange("password", e.target.value)} required />
          <input placeholder="Telefon (05XXXXXXXXX)" value={form.phone} onChange={(e)=>onChange("phone", e.target.value)} />

          <input placeholder="İl" value={form.city} onChange={(e)=>onChange("city", e.target.value)} required />
          <input placeholder="İlçe" value={form.district} onChange={(e)=>onChange("district", e.target.value)} required />

          <label>Mod</label>
          <select value={form.mode} onChange={(e)=>onChange("mode", e.target.value)}>
            <option value="ONLINE">ONLINE</option>
            <option value="FACE_TO_FACE">FACE_TO_FACE</option>
            <option value="BOTH">BOTH</option>
          </select>

          <div className="grid-two">
            <input type="number" placeholder="Online Fiyat (₺)" value={form.priceOnline} onChange={(e)=>onChange("priceOnline", e.target.value)} />
            <input type="number" placeholder="Yüz Yüze Fiyat (₺)" value={form.priceF2F} onChange={(e)=>onChange("priceF2F", e.target.value)} />
          </div>

          <label>Ders Alanları (virgülle ayır)</label>
          <input placeholder="matematik, fen, tarih..." onChange={(e)=>onChange("subjects", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} />

          <label>Sınıflar (virgülle ayır)</label>
          <input placeholder="ortaokul, lise..." onChange={(e)=>onChange("grades", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} />

          <label>Bio</label>
          <textarea value={form.bio} onChange={(e)=>onChange("bio", e.target.value)} />

          <button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Kayıt Ol"}</button>
          <div style={{marginTop:8}}>
            <a href="/ogretmen/giris">Zaten hesabın var mı? Giriş yap</a>
          </div>
        </form>
      </div>
    </>
  );
}
