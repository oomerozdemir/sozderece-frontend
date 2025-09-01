import { useEffect, useState } from "react";
import { FiHome, FiUser, FiPackage, FiLogOut, FiEdit2, FiMenu, FiCheckCircle, FiXCircle, FiGrid } from "react-icons/fi";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---- Yardımcılar
  const isStudentRole = (u) => ((u?.role || "").toLowerCase() === "student");

  // eksik alan sayısı (rol bazlı)
  const calcMissing = (u) => {
    let m = 0;
    if (!u?.phone) m++;
    if (isStudentRole(u)) {
      if (!u?.grade) m++;
      if (["9", "10", "11", "12", "Mezun"].includes(u?.grade) && !u?.track) m++;
    }
    return m;
  };

  // form bazlı canlı eksikler (rol bazlı)
  const roleIsStudent = isStudentRole(user);
  const missingPhone = !form.phone;
  const missingGrade = roleIsStudent ? !form.grade : false;
  const missingTrack = roleIsStudent && ["9", "10", "11", "12", "Mezun"].includes(form.grade) && !form.track;
  const liveMissingCount =
    (missingPhone ? 1 : 0) + (missingGrade ? 1 : 0) + (missingTrack ? 1 : 0);

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
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          grade: userData.grade || "",
          track: userData.track || "",
        });
        setEmailVerified(Boolean(userData.emailVerified));

        const missing = calcMissing(userData);
        localStorage.setItem("profileMissing", String(missing));
      } catch {
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
        name: form.name,
        email: form.email,
        phone: form.phone,
        // Sadece öğrenci ise sınıf/alan gönder
        grade: roleIsStudent ? form.grade : null,
        track: roleIsStudent && ["9", "10", "11", "12", "Mezun"].includes(form.grade) ? form.track : null,
      };
      const res = await axios.put("/api/auth/update-profile", cleanedForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      setSuccess("Bilgiler güncellendi.");
      setEmailVerified(Boolean(res.data.user.emailVerified));
      localStorage.setItem("user", JSON.stringify(res.data.user));

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
          ? form.email
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
      const actualTarget = verifyTarget === "email" ? form.email : form.phone;
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/verification/verify-code",
        { type: verifyTarget, target: actualTarget, code: verificationCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const meRes = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = meRes.data.user;
      setUser(updatedUser);
      setEmailVerified(Boolean(updatedUser.emailVerified));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const missing = calcMissing(updatedUser);
      localStorage.setItem("profileMissing", String(missing));

      setShowVerifyBox(false);
      setVerifying("Doğrulama başarılı.");
    } catch {
      setVerifying("Kod doğrulanamadı.");
    }
  };

  if (!user && !error) return <p className="accountPage-loading">Yükleniyor...</p>;
  if (error) return <p className="accountPage-error">{error}</p>;


  const roleLower = (user?.role || "").toLowerCase();
const panelItem = (() => {
  switch (roleLower) {
    case "student":
      return { href: "/student/dashboard", label: "Öğrenci Paneli" };
    case "coach":
      return { href: "/coach/dashboard", label: "Koç Paneli" };
    case "teacher":
      return { href: "/ogretmen/panel/profil", label: "Öğretmen Paneli" };
    case "admin":
      return { href: "/admin", label: "Admin Paneli" };
    default:
      return null;
  }
})();


  return (
    <div className="accountPage-shell">
      {/* Mobil başlık + menü */}
      <div className="accountPage-mobileHeader">
        <button className="accountPage-iconBtn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menü">
          <FiMenu />
        </button>
        <h1>Hesabım</h1>
        <div />
      </div>

      <div className="accountPage-layout">
        {/* Sidebar */}
<aside className={`accountPage-sidebar ${sidebarOpen ? "open" : ""}`}>
  <ul className="accountPage-sidebar-menu">
    <li>
      <a href="/"><FiHome /> <span>Ana sayfa</span></a>
    </li>
    <li className="active">
      <a href="/account"><FiUser /> <span>Hesap</span></a>
    </li>

    {roleIsStudent && (
      <li>
        <a href="/orders"><FiPackage /> <span>Siparişlerim</span></a>
      </li>
    )}

    {panelItem && (
  <li>
    <a href={panelItem.href}>
      <FiGrid /> <span>{panelItem.label}</span>
    </a>
  </li>
)}

    <li className="logout-li">
      <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="accountPage-logoutBtn">
        <FiLogOut /> Çıkış Yap
      </button>
    </li>
  </ul>
</aside>


        {/* Ana içerik */}
        <main className="accountPage-main">
          {liveMissingCount > 0 && (
            <div className="profile-completion-banner">
              ⚠ Profilini tamamla — Eksik alan: {liveMissingCount}
            </div>
          )}

          {/* Profil kartı */}
          <section className="accountPage-profile-card">
            <div className="accountPage-avatar">{(user.name || "K")[0]}</div>
            <div className="accountPage-profile-info">
              <h2>{user.name || "Kullanıcı"}</h2>
              <p>{user.email}</p>
              <p className="muted">Son giriş: az önce</p>
            </div>
          </section>

          {/* Form kartı */}
          <form onSubmit={handleUpdate} className="accountPage-info-card modern-form">
            <div className="accountPage-sectionHeader">
              <h3>Kişisel Bilgiler</h3>
              {roleIsStudent && user.grade && user.track ? (
                <button type="button" className="accountPage-linkBtn" onClick={() => setEditingClass(true)}>
                  <FiEdit2 /> Sınıf / Alanı Değiştir
                </button>
              ) : null}
            </div>

            <div className="accountPage-form-group">
              <label>
                Adınız &amp; Soyadınız{" "}
                {!form.name ? (
                  <span className="field-hint field-hint--missing">
                    <FiXCircle aria-label="Eksik" />
                  </span>
                ) : (
                  <span className="field-hint field-hint--ok">
                    <FiCheckCircle aria-label="Tamam" />
                  </span>
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
                E-posta Adresi{" "}
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
            </div>

            <div className="accountPage-form-group">
              <label>
                Telefon Numarası{" "}
                {missingPhone ? (
                  <span className="field-hint field-hint--missing">
                    <FiXCircle aria-label="Eksik" />
                  </span>
                ) : (
                  <span className="field-hint field-hint--ok">
                    <FiCheckCircle aria-label="Tamam" />
                  </span>
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

            {/* ---- Sınıf / Alan sadece öğrenci rolünde görünür ---- */}
            {roleIsStudent && (
              !editingClass && user.grade && user.track ? (
                <div className="accountPage-previewBlock">
                  🎓 Sınıf: <strong>{user.grade}</strong> | Alan: <strong>{user.track}</strong>
                  <button type="button" className="accountPage-linkBtn" onClick={() => setEditingClass(true)}>
                    <FiEdit2 /> Değiştir
                  </button>
                </div>
              ) : (
                <>
                  <div className="accountPage-form-group">
                    <label>
                      Sınıfınız{" "}
                      {missingGrade ? (
                        <span className="field-hint field-hint--missing">
                          <FiXCircle aria-label="Eksik" />
                        </span>
                      ) : (
                        <span className="field-hint field-hint--ok">
                          <FiCheckCircle aria-label="Tamam" />
                        </span>
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
                        Alanınız{" "}
                        {missingTrack ? (
                          <span className="field-hint field-hint--missing">
                            <FiXCircle aria-label="Eksik" />
                          </span>
                        ) : (
                          <span className="field-hint field-hint--ok">
                            <FiCheckCircle aria-label="Tamam" />
                          </span>
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
              )
            )}
            {/* ---- /Sadece öğrenci ---- */}

            <button type="submit" className="accountPage-update-button">
              Bilgileri Güncelle
            </button>

            {success && <p className="accountPage-success">{success}</p>}
            {verifying && <p className="accountPage-success">{verifying}</p>}
            {error && <p className="accountPage-error">{error}</p>}
          </form>

          {/* Doğrulama popup */}
          {showVerifyBox && (
            <div className="verify-popup" onClick={() => setShowVerifyBox(false)}>
              <div className="verify-card" onClick={(e) => e.stopPropagation()}>
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
                <button onClick={() => setShowVerifyBox(false)} className="accountPage-linkBtn" style={{ marginTop: 10 }}>
                  Kapat
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountPage;
