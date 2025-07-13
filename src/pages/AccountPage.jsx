// 📁 src/pages/AccountPage.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/account.css";

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", grade: "", track: "", });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState("");
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [passwords, setPasswords] = useState({
  current: "",
  new1: "",
  new2: ""
  });
const [passwordMsg, setPasswordMsg] = useState("");
const [editingClass, setEditingClass] = useState(false);





  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res.data.user;
      setUser(userData);
      setForm({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        grade: userData.grade || "",
        track: userData.track || "", 
      });
      setEmailVerified(userData.emailVerified || false);
      setPhoneVerified(userData.phoneVerified || false);
    } catch (err) {
      setError("Kullanıcı bilgisi alınamadı.");
    }
  };

  fetchUser();
}, []);


const handleUpdate = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("token");

    
    const cleanedForm = {
      ...form,
  track: ["9", "10", "11", "12", "Mezun"].includes(form.grade) ? form.track : null,
};

    const res = await axios.put("/api/auth/update-profile", cleanedForm, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(res.data.user);
    setSuccess("Bilgiler güncellendi.");
    setEmailVerified(res.data.user.emailVerified || false);
    setPhoneVerified(res.data.user.phoneVerified || false);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  } catch {
    setError("Güncelleme başarısız.");
  }
};


  const handleVerify = (type) => {
    setVerifyTarget(type);
    setShowVerifyBox(true);
    setVerificationCode("");
    setCodeSent(false);
    setVerifying("");
  };

  const sendCode = async () => {
    try {
      const input = verifyTarget === "email" ? form.email : form.phone;
      await axios.post("/api/auth/forgot-password", { input });
      setVerifying("Doğrulama kodu gönderildi.");
      setCodeSent(true);
    } catch {
      setVerifying("Kod gönderilemedi.");
    }
  };

  const submitCode = async () => {
  try {
    await axios.post("/api/auth/reset-password", { code: verificationCode });

    // Yeni doğrulama işlemini kalıcı hale getir
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/auth/verify-contact", {
      type: verifyTarget
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Güncel kullanıcı bilgileri ile güncelle
    setUser(res.data.user);
    setEmailVerified(res.data.user.emailVerified || false);
    setPhoneVerified(res.data.user.phoneVerified || false);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setShowVerifyBox(false);
    setVerifying("Doğrulama başarılı.");
  } catch {
    setVerifying("Kod doğrulanamadı.");
  }
};


  if (!user && !error) return <p>Yükleniyor...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;


const handlePasswordChange = async (e) => {
  e.preventDefault();
  setPasswordMsg("");

  if (passwords.new1 !== passwords.new2) {
    setPasswordMsg("Yeni şifreler uyuşmuyor.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    await axios.put(
      "/api/auth/change-password",
      {
        currentPassword: passwords.current,
        newPassword: passwords.new1
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setPasswordMsg("Şifre başarıyla değiştirildi.");
    setPasswords({ current: "", new1: "", new2: "" });
  } catch (err) {
    setPasswordMsg("Şifre değiştirilemedi. Mevcut şifre hatalı olabilir.");
  }
};

  return (
    <div className="accountPage-layout">
      <aside className="accountPage-sidebar">
        <ul className="accountPage-sidebar-menu">
          <li><a href="/">🏠 Anasayfaya Dön</a></li>
          <li>👤 Hesap</li>
          <li>🔒 Şifre Değiştir</li>
          <li><a href="/orders">📦 Siparişlerim</a></li>
          <li>📞 Destek</li>
          <li style={{ color: "red", marginTop: "20px" }}>
            <button onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}>🚪 Çıkış Yap</button>
          </li>
        </ul>
      </aside>

      <main className="accountPage-main">
        <section className="accountPage-profile-card">
          
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p style={{ fontSize: "0.9rem", color: "#888" }}>
              Son giriş: 3 dakika önce
            </p>
          </div>
        </section>

        <form onSubmit={handleUpdate} className="info-card modern-form">
          <h3>Kişisel Bilgiler</h3>

          <div className="accountPage-form-group">
            <label>Adınız&Soyadiniz</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Adınız"
            />
          </div>

          <div className="accountPage-form-group">
            <label>Email Adresi</label>
            <div className="input-verify">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="E-posta"
              />
              <span
                className={emailVerified ? "verified" : "not-verified"}
                onClick={() => !emailVerified && handleVerify("email")}
              >
                {emailVerified ? "✔ Doğrulandı" : "✉ Doğrula"}
              </span>
            </div>
          </div>

          <div className="accountPage-form-group">
            <label>Telefon Numarası</label>
            <div className="input-verify">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Telefon"
              />
              <span
                className={phoneVerified ? "verified" : "not-verified"}
                onClick={() => !phoneVerified && handleVerify("phone")}
              >
                {phoneVerified ? "✔ Doğrulandı" : "📞 Doğrula"}
              </span>
            </div>
          </div>

      {!editingClass && user.grade && user.track ? (
  <div style={{ marginBottom: "12px", padding: "10px", background: "#f8f8f8", borderRadius: "8px" }}>
    🎓 Sınıf: <strong>{user.grade}</strong> | Alan: <strong>{user.track}</strong>
    <button type="button" style={{ marginLeft: "10px" }} onClick={() => setEditingClass(true)}>
      🖊 Değiştir
    </button>
  </div>
) : (
  <>
    <div className="accountPage-form-group">
      <label>Sınıfınız</label>
      <select
        value={form.grade}
        onChange={(e) => setForm({ ...form, grade: e.target.value })}
        required
      >
        <option value="">Sınıf Seçin</option>
        <option value="8">8. Sınıf</option>
        <option value="9">9. Sınıf</option>
        <option value="10">10. Sınıf</option>
        <option value="11">11. Sınıf</option>
        <option value="12">12. Sınıf</option>
        <option value="Mezun">Mezun</option>
      </select>
    </div>

    {["9", "10", "11", "12", "Mezun"].includes(form.grade) && (
      <div className="accountPage-form-group">
        <label>Alanınız</label>
        <select
          value={form.track}
          onChange={(e) => setForm({ ...form, track: e.target.value })}
          required
        >
          <option value="">Alan Seçin</option>
          <option value="Sayısal">Sayısal</option>
          <option value="Eşit Ağırlık">Eşit Ağırlık</option>
          <option value="Sözel">Sözel</option>
        </select>
      </div>
    )}
  </>
)}


          

          <button type="submit" className="update-button">Bilgileri Güncelle</button>
          {success && <p className="success-message">{success}</p>}
          {verifying && <p className="success-message">{verifying}</p>}
        </form>

        {showVerifyBox && (
          <div className="verify-popup">
            <div className="verify-card">
              <h4>{verifyTarget === "email" ? "E-posta" : "Telefon"} Doğrulama</h4>
              {!codeSent ? (
                <button onClick={sendCode}>📨 Kodu Gönder</button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Kod Giriniz"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <button onClick={submitCode}>✔ Doğrula</button>
                </>
              )}
              <button onClick={() => setShowVerifyBox(false)} style={{ marginTop: "10px" }}>Kapat</button>
            </div>
          </div>
        )}
        <section className="accountPage-info-card modern-form" style={{ marginTop: "40px" }}>
  <h3>🔒 Şifre Değiştir</h3>
  <form onSubmit={handlePasswordChange}>
    <div className="accountPage-form-group">
      <label>Mevcut Şifre</label>
      <input
        type="password"
        value={passwords.current}
        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
        required
      />
    </div>
    <div className="accountPage-form-group">
      <label>Yeni Şifre</label>
      <input
        type="password"
        value={passwords.new1}
        onChange={(e) => setPasswords({ ...passwords, new1: e.target.value })}
        required
      />
    </div>
    <div className="accountPage-form-group">
      <label>Yeni Şifre (Tekrar)</label>
      <input
        type="password"
        value={passwords.new2}
        onChange={(e) => setPasswords({ ...passwords, new2: e.target.value })}
        required
      />
    </div>
    <button type="submit" className="accountPage-update-button">Şifreyi Güncelle</button>
    {passwordMsg && <p className="success-message">{passwordMsg}</p>}
  </form>
</section>

      </main>
    </div>
  );
};

export default AccountPage;
