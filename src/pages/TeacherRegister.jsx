import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { isValidName, isValidEmail, isValidPhone } from "../utils/validation";
import { getRoleFromToken, isTokenValid } from "../utils/auth";
import "../cssFiles/teacher-register.css";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";

export default function TeacherRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", password:"", phone:"",
    subjects:[], grades:[], city:"", district:"",
    mode:"BOTH", priceOnline:"", priceF2F:"", bio:"", whyMe: "",
  });

  const [step] = useState("form"); // form | verify
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);


  // İl değişince ilçe’yi sıfırla
  useEffect(() => {
    if (!form.city) return;
    const list = TR_DISTRICTS[form.city] || [];
    setForm((s) => ({ ...s, district: list[0] || "" }));
  }, [form.city]);

  const districts = useMemo(() => TR_DISTRICTS[form.city] || [], [form.city]);

  const modeKey = String(form.mode || "").toUpperCase();
  const isOnlineOnly = modeKey === "ONLINE";
  const isFaceOnly   = modeKey === "FACE_TO_FACE";
  const both         = modeKey === "BOTH";

  const onChange = (k, v) => setForm((s)=>({ ...s, [k]: v }));
  const toggleInArray = (key, value) => {
    setForm(s => {
      const arr = new Set(s[key]);
      if (arr.has(value)) arr.delete(value); else arr.add(value);
      return { ...s, [key]: Array.from(arr) };
    });
  };
  const onModeChange = (raw) => {
    const v = String(raw || "").toUpperCase();
    setForm(s => ({
      ...s,
      mode: v,
      priceOnline: v === "FACE_TO_FACE" ? "" : s.priceOnline,
      priceF2F:    v === "ONLINE"      ? "" : s.priceF2F
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!isValidName(form.firstName) || !isValidName(form.lastName)) return setErr("İsim soyisim geçersiz.");
    if (!isValidEmail(form.email)) return setErr("E-posta geçersiz.");
    if (form.phone && !isValidPhone(form.phone)) return setErr("Telefon geçersiz (05XXXXXXXXX).");
    if (!form.city || !form.district) return setErr("İl ve ilçe seçiniz.");
    if (!form.subjects.length) return setErr("En az bir ders alanı seçiniz.");
    if (!form.grades.length) return setErr("En az bir sınıf seviyesi seçiniz.");
    if (isOnlineOnly && form.priceOnline === "") return setErr("Online ders için fiyat giriniz.");
    if (isFaceOnly && form.priceF2F === "") return setErr("Yüz yüze ders için fiyat giriniz.");

    setLoading(true);
    try {
      const payload = {
        ...form,
        priceOnline: form.priceOnline === "" ? undefined : Number(form.priceOnline),
        priceF2F:    form.priceF2F    === "" ? undefined : Number(form.priceF2F),
      };
      const { data } = await axios.post("/api/v1/ogretmen/auth/kayit", payload);

      // token & user'ı sakla ama panele gitme — doğrulama adımına geç
      const token = data?.token;
      const user  = data?.user;
      if (token) localStorage.setItem("token", token);
      if (user)  localStorage.setItem("user", JSON.stringify(user));
navigate("/ogretmen/panel/profil", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <>
      <Navbar />
      <div className="teacher-register">
        <header className="tr-header">
          <h1>Özel Ders Öğretmeni Kaydı</h1>
          <p className="tr-sub">Bilgilerinle profilini oluştur; öğrenciler seni kolayca bulsun.</p>
        </header>

        {step === "form" && (
          <form className="tr-form" onSubmit={submit}>
            {!!err && <p className="error-message">{err}</p>}

            <div className="tr-grid">
              {/* Kimlik */}
              <div className="tr-card">
                <div className="section-title">Kimlik</div>
                <div className="grid-two">
                  <input placeholder="Ad" value={form.firstName} onChange={(e)=>onChange("firstName", e.target.value)} required />
                  <input placeholder="Soyad" value={form.lastName} onChange={(e)=>onChange("lastName", e.target.value)} required />
                </div>
                <input type="email" placeholder="E-posta" value={form.email} onChange={(e)=>onChange("email", e.target.value)} required />
                <input type="password" placeholder="Şifre" value={form.password} onChange={(e)=>onChange("password", e.target.value)} required />
                <input placeholder="Telefon (05XXXXXXXXX)" value={form.phone} onChange={(e)=>onChange("phone", e.target.value)} />
              </div>

              {/* Lokasyon */}
              <div className="tr-card">
                <div className="section-title">Lokasyon</div>
                <div className="grid-two">
                  <select value={form.city} onChange={(e)=>onChange("city", e.target.value)} required>
                    <option value="">İl seçin</option>
                    {TR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={form.district} onChange={(e)=>onChange("district", e.target.value)} required disabled={!form.city || districts.length === 0}>
                    <option value="">{!form.city ? "Önce il seçin" : (districts.length ? "İlçe seçin" : "Bu il için ilçe listesi yakında")}</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Ders Alanları */}
              <div className="tr-card">
                <div className="section-title">Ders Alanları</div>
                <div className="chips">
                  {["Matematik","Fen Bilimleri","Türkçe","Tarih","Coğrafya","Fizik","Kimya","Biyoloji","İngilizce","Almanca","Geometri","Edebiyat","Bilgisayar"].map(s => (
                    <label key={s} className={`chip ${form.subjects.includes(s) ? "active" : ""}`}>
                      <input type="checkbox" checked={form.subjects.includes(s)} onChange={() => toggleInArray("subjects", s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sınıf Seviyeleri */}
              <div className="tr-card">
                <div className="section-title">Ders Verilen Seviyeler</div>
                <div className="chips">
                  {["İlkokul","Ortaokul","Lise","Üniversite","Mezun"].map(g => (
                    <label key={g} className={`chip ${form.grades.includes(g) ? "active" : ""}`}>
                      <input type="checkbox" checked={form.grades.includes(g)} onChange={() => toggleInArray("grades", g)} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Mod & Fiyat */}
              <div className="tr-card">
                <div className="section-title">Saatlik ders ücreti ve yer seçimi</div>
                <label className="mb8">Dersin Yapılacağı Yeri Seçin</label>
                <select value={form.mode} onChange={(e)=>onModeChange(e.target.value)}>
                  <option value="ONLINE">Online</option>
                  <option value="FACE_TO_FACE">Yüz yüze</option>
                  <option value="BOTH">Online ve Yüz Yüze</option>
                </select>
                <div className="grid-two mt8">
                  {(isOnlineOnly || both) && (
                    <div>
                      <label className="small-label">Online Fiyat (₺)</label>
                      <input type="number" placeholder="Online ders ücreti" value={form.priceOnline} onChange={(e)=>onChange("priceOnline", e.target.value)} min={0} required={isOnlineOnly} />
                    </div>
                  )}
                  {(isFaceOnly || both) && (
                    <div>
                      <label className="small-label">Yüz Yüze Fiyat (₺)</label>
                      <input type="number" placeholder="Yüz yüze ders ücreti" value={form.priceF2F} onChange={(e)=>onChange("priceF2F", e.target.value)} min={0} required={isFaceOnly} />
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="tr-card">
                <div className="section-title">Hakkımda</div>
                <textarea placeholder="Kendinden ve tecrübenden bahset..." value={form.bio} onChange={(e)=>onChange("bio", e.target.value)} rows={4} />
              </div>
            </div>

              {/* WhyMe */}
            <div className="tr-card">
              <div className="section-title">Neden benden ders almalısınız?</div>
              <textarea
                placeholder="Öğrencilerin sizi seçmesi için güçlü yanlarınızı, yöntemlerinizi, sonuçlarınızı yazın"
                value={form.whyMe}
                onChange={(e)=>onChange("whyMe", e.target.value)}
                rows={5}
              />
            </div>

            <div className="tr-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kayıt Ol"}
              </button>
              <div> Zaten hesabın var mı? <Link to="/ogretmen/giris">Giriş yap</Link> </div>
            </div>
          </form>
        )}

        {step === "verify" && (
          <div className="tr-form">
            {!!err && <p className="error-message">{err}</p>}
            <div className="tr-card">
              <div className="section-title">E-posta Doğrulama</div>
              <p>E-posta adresine gönderilen 6 haneli kodu gir.</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="XXXXXX"
                value={vCode}
                onChange={(e)=>setVCode(e.target.value)}
              />
              <div className="tr-actions" style={{ marginTop: 12 }}>
                <button type="button" onClick={verify} disabled={loading || vCode.trim().length < 4}>
                  {loading ? "Doğrulanıyor..." : "Kodu Doğrula"}
                </button>
                <button type="button" className="secondary" onClick={resend} disabled={loading || resendIn > 0}>
                  {resendIn > 0 ? `Tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
                </button>
              </div>
              <p className="tr-sub" style={{ marginTop: 8 }}>
                Kod 5 dakika boyunca geçerlidir. Sık denemelerde 60 sn beklemeniz istenir.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
