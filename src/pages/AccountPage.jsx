// 📁 src/pages/AccountPage.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/account.css";

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    track: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState("");
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [editingClass, setEditingClass] = useState(false);

  // eksik alan sayısını (email hariç) hesaplayan fonksiyon
  const calcMissing = (u) => {
    let missing = 0;
    if (!u.phone) missing++;
    if (!u.grade) missing++;
    if (["9", "10", "11", "12", "Mezun"].includes(u.grade) && !u.track) missing++;
    return missing;
  };

  // form bazlı (canlı) eksik alanlar
  const missingPhone = !form.phone;
  const missingGrade = !form.grade;
  const missingTrack = ["9", "10", "11", "12", "Mezun"].includes(form.grade) && !form.track;
  const liveMissingCount =
    (missingPhone ? 1 : 0) + (missingGrade ? 1 : 0) + (missingTrack ? 1 : 0);

  // Navbar’daki rozeti canlı güncelle (opsiyonel ama faydalı)
  useEffect(() => {
    localStorage.setItem("profileMissing", String(liveMissingCount));
  }, [liveMissingCount]);

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

        // sayfa açılışında eksik alanları hesapla
        const missing = calcMissing(userData);
        localStorage.setItem("profileMissing", String(missing));
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
        track: ["9", "10", "11", "12", "Mezun"].includes(form.grade)
          ? form.track
          : null,
      };

      const res = await axios.put("/api/auth/update-profile", cleanedForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      setSuccess("Bilgiler güncellendi.");
      setEmailVerified(res.data.user.emailVerified || false);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // güncellemeden sonra eksik alanları tekrar hesapla
      const missing = calcMissing(res.data.user);
      localStorage.setItem("profileMissing", String(missing));
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
      const actualTarget =
        verifyTarget === "email"
          ? document.querySelector("input[type=email]").value
          : form.phone;

      await axios.post("/api/verification/send-code", {
        type: verifyTarget,
        target: actualTarget,
      });

      setVerifying("Doğrulama kodu gönderildi.");
      setCodeSent(true);
    } catch {
      setVerifying("Kod gönderilemedi.");
    }
  };

  const submitCode = async () => {
    try {
      const actualTarget =
        verifyTarget === "email"
          ? document.querySelector("input[type=email]").value
          : form.phone;

      const token = localStorage.getItem("token");
      await axios.post(
        "/api/verification/verify-code",
        {
          type: verifyTarget,
          target: actualTarget,
          code: verificationCode.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // kullanıcı bilgilerini güncelle
      const meRes = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = meRes.data.user;
      setUser(updatedUser);
      setEmailVerified(updatedUser.emailVerified || false);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // doğrulama sonrası eksik alanları tekrar hesapla
      const missing = calcMissing(updatedUser);
      localStorage.setItem("profileMissing", String(missing));

      setShowVerifyBox(false);
      setVerifying("Doğrulama başarılı.");
    } catch {
      setVerifying("Kod doğrulanamadı.");
    }
  };

  if (!user && !error) return <p>Yükleniyor...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="accountPage-layout">
      <aside className="accountPage-sidebar">
        <ul className="accountPage-sidebar-menu">
          <li>
            <a href="/">🏠 Anasayfaya Dön</a>
          </li>
          <li>👤 Hesap</li>
          <li>
            <a href="/orders">📦 Siparişlerim</a>
          </li>
          <li style={{ color: "red", marginTop: "20px" }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              🚪 Çıkış Yap
            </button>
          </li>
        </ul>
      </aside>

      <main className="accountPage-main">
        {liveMissingCount > 0 && (
          <div className="profile-completion-banner">
            ⚠ Profilini tamamla — Eksik alan: {liveMissingCount}
          </div>
        )}

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
            <label>
              Adınız&Soyadiniz
              {!form.name ? (
                <span className="field-hint field-hint--missing">Önerilir</span>
              ) : (
                <span className="field-hint field-hint--ok">Tamam</span>
              )}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Adınız"
              className={!form.name ? "input-missing" : ""}
            />
          </div>

          <div className="accountPage-form-group">
            <label>
              Email Adresi
              {emailVerified ? (
                <span className="field-hint field-hint--ok">Doğrulandı</span>
              ) : (
                <span className="field-hint field-hint--missing">Doğrula</span>
              )}
            </label>
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

            <label>
              Telefon Numarası
              {missingPhone ? (
                <span className="field-hint field-hint--missing">Eksik</span>
              ) : (
                <span className="field-hint field-hint--ok">Tamam</span>
              )}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Telefon"
              className={missingPhone ? "input-missing" : ""}
            />
          </div>

          {!editingClass && user.grade && user.track ? (
            <div
              style={{
                marginBottom: "12px",
                padding: "10px",
                background: "#f8f8f8",
                borderRadius: "8px",
              }}
            >
              🎓 Sınıf: <strong>{user.grade}</strong> | Alan:{" "}
              <strong>{user.track}</strong>
              <button
                type="button"
                style={{ marginLeft: "10px" }}
                onClick={() => setEditingClass(true)}
              >
                🖊 Değiştir
              </button>
            </div>
          ) : (
            <>
              <div className="accountPage-form-group">
                <label>
                  Sınıfınız
                  {missingGrade ? (
                    <span className="field-hint field-hint--missing">Eksik</span>
                  ) : (
                    <span className="field-hint field-hint--ok">Tamam</span>
                  )}
                </label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className={missingGrade ? "input-missing" : ""}
                >
                  <option value="">Sınıf Seçin</option>
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
              </div>

              {["9", "10", "11", "12", "Mezun"].includes(form.grade) && (
                <div className="accountPage-form-group">
                  <label>
                    Alanınız
                    {missingTrack ? (
                      <span className="field-hint field-hint--missing">Eksik</span>
                    ) : (
                      <span className="field-hint field-hint--ok">Tamam</span>
                    )}
                  </label>
                  <select
                    value={form.track}
                    onChange={(e) => setForm({ ...form, track: e.target.value })}
                    className={missingTrack ? "input-missing" : ""}
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

          <button type="submit" className="update-button">
            Bilgileri Güncelle
          </button>
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
              <button onClick={() => setShowVerifyBox(false)} style={{ marginTop: "10px" }}>
                Kapat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountPage;
