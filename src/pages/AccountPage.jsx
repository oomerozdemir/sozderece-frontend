import { useEffect, useState } from "react";
import { FiHome, FiUser, FiPackage, FiLogOut, FiEdit2, FiMenu, FiCheckCircle, FiXCircle, FiGrid } from "react-icons/fi";
import axios from "../utils/axios";

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

  if (!user && !error) return <p className="p-6">Yükleniyor...</p>;
  if (error) return <p className="mt-2.5 text-[#991b1b] font-semibold">{error}</p>;

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

  const menuItemCls = "grid grid-cols-[22px_1fr] items-center gap-2.5 py-2.5 px-3 rounded-[10px] no-underline text-[#0f172a] border border-transparent bg-transparent cursor-pointer font-semibold text-[0.95rem] hover:bg-[#f1f5f9] hover:border-[#e5e7eb] w-full text-left";
  const inputCls = "py-3 px-3 border border-[#e5e7eb] rounded-xl outline-none transition bg-white focus:border-[#3b82f6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.25)] w-full";

  return (
    <div className="px-5">
      {/* Mobil başlık + menü */}
      <div className="hidden max-[1024px]:flex items-center justify-between gap-2 pt-4 pb-2">
        <button
          className="grid place-items-center w-10 h-10 border border-[#e5e7eb] bg-white rounded-[10px] cursor-pointer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menü"
        >
          <FiMenu />
        </button>
        <h1 className="text-[1.25rem] m-0">Hesabım</h1>
        <div />
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-7 pt-6 pb-10 items-start max-[1024px]:grid-cols-1 max-[1024px]:gap-4">
        {/* Sidebar */}
        <aside className={`sticky top-[84px] bg-white rounded-[14px] p-4 shadow-[0_6px_24px_rgba(2,6,23,0.06)] border border-[#e5e7eb] h-fit max-[1024px]:sticky max-[1024px]:top-16 ${sidebarOpen ? "" : "max-[1024px]:hidden"}`}>
          <ul className="list-none p-0 m-0 grid gap-2.5">
            <li>
              <a href="/" className={menuItemCls}><FiHome /> <span>Ana sayfa</span></a>
            </li>
            <li>
              <a href="/account" className={`${menuItemCls} bg-[#eef2ff] border-[#e0e7ff]`}><FiUser /> <span>Hesap</span></a>
            </li>

            {roleIsStudent && (
              <li>
                <a href="/orders" className={menuItemCls}><FiPackage /> <span>Siparişlerim</span></a>
              </li>
            )}

            {panelItem && (
              <li>
                <a href={panelItem.href} className={menuItemCls}>
                  <FiGrid /> <span>{panelItem.label}</span>
                </a>
              </li>
            )}

            <li>
              <button
                onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                className={`${menuItemCls} text-[#991b1b]`}
              >
                <FiLogOut /> Çıkış Yap
              </button>
            </li>
          </ul>
        </aside>

        {/* Ana içerik */}
        <main className="max-w-[860px] w-full mx-auto">
          {liveMissingCount > 0 && (
            <div className="flex items-center gap-2.5 bg-[#fff7ed] border border-[#fed7aa] text-[#9a3412] py-2.5 px-3 rounded-xl mb-4 font-bold">
              ⚠ Profilini tamamla — Eksik alan: {liveMissingCount}
            </div>
          )}

          {/* Profil kartı */}
          <section className="bg-white grid grid-cols-[64px_1fr] gap-4 items-center rounded-[14px] shadow-[0_6px_24px_rgba(2,6,23,0.06)] border border-[#e5e7eb] p-[18px] mb-[18px]">
            <div className="w-16 h-16 rounded-full grid place-items-center bg-[#e2e8f0] text-[#0f172a] font-bold text-[1.25rem]">
              {(user.name || "K")[0]}
            </div>
            <div>
              <h2 className="m-0 mb-1 text-[1.1rem]">{user.name || "Kullanıcı"}</h2>
              <p className="m-0">{user.email}</p>
              <p className="text-[#64748b] mt-0.5 m-0">Son giriş: az önce</p>
            </div>
          </section>

          {/* Form kartı */}
          <form onSubmit={handleUpdate} className="bg-white p-[22px] rounded-[14px] shadow-[0_6px_24px_rgba(2,6,23,0.06)] border border-[#e5e7eb] mb-[18px]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3>Kişisel Bilgiler</h3>
              {roleIsStudent && user.grade && user.track ? (
                <button type="button" className="bg-transparent border-0 text-[#3b82f6] font-semibold cursor-pointer inline-flex gap-1.5 items-center" onClick={() => setEditingClass(true)}>
                  <FiEdit2 /> Sınıf / Alanı Değiştir
                </button>
              ) : null}
            </div>

            <div className="mb-4 flex flex-col">
              <label className="mb-1.5 font-semibold text-[#1f2937]">
                Adınız &amp; Soyadınız{" "}
                {!form.name ? (
                  <span className="inline-flex items-center justify-center align-middle ml-2 text-[#991b1b]">
                    <FiXCircle aria-label="Eksik" />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center align-middle ml-2 text-[#166534]">
                    <FiCheckCircle aria-label="Tamam" />
                  </span>
                )}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Adınız"
                className={`${inputCls}${!form.name ? " border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]" : ""}`}
              />
            </div>

            <div className="mb-4 flex flex-col">
              <label className="mb-1.5 font-semibold text-[#1f2937]">
                E-posta Adresi{" "}
                {emailVerified ? (
                  <span className="inline-flex items-center justify-center align-middle ml-2 text-[#166534]">Doğrulandı</span>
                ) : (
                  <span className="inline-flex items-center justify-center align-middle ml-2 text-[#991b1b]">Doğrula</span>
                )}
              </label>
              <div className="flex items-center gap-2.5 max-[1024px]:flex-col max-[1024px]:items-stretch">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="E-posta"
                  className={inputCls}
                />
                <span
                  className={`text-[0.9rem] py-2 px-3 rounded-[10px] cursor-pointer select-none transition max-[1024px]:w-full max-[1024px]:text-center ${
                    emailVerified
                      ? "bg-[#dcfce7] text-[#166534] border border-[#86efac]"
                      : "bg-[#fee2e2] text-[#991b1b] border border-[#f87171] hover:bg-[#fca5a5] hover:text-white"
                  }`}
                  onClick={() => !emailVerified && handleVerify("email")}
                >
                  {emailVerified ? "✔ Doğrulandı" : "✉ Doğrula"}
                </span>
              </div>
            </div>

            <div className="mb-4 flex flex-col">
              <label className="mb-1.5 font-semibold text-[#1f2937]">
                Telefon Numarası{" "}
                {missingPhone ? (
                  <span className="inline-flex items-center justify-center align-middle ml-2 text-[#991b1b]">
                    <FiXCircle aria-label="Eksik" />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center align-middle ml-2 text-[#166534]">
                    <FiCheckCircle aria-label="Tamam" />
                  </span>
                )}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Telefon"
                className={`${inputCls}${missingPhone ? " border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]" : ""}`}
              />
            </div>

            {/* ---- Sınıf / Alan sadece öğrenci rolünde görünür ---- */}
            {roleIsStudent && (
              !editingClass && user.grade && user.track ? (
                <div className="flex items-center gap-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-[10px] p-2.5 mb-3">
                  🎓 Sınıf: <strong>{user.grade}</strong> | Alan: <strong>{user.track}</strong>
                  <button type="button" className="bg-transparent border-0 text-[#3b82f6] font-semibold cursor-pointer inline-flex gap-1.5 items-center" onClick={() => setEditingClass(true)}>
                    <FiEdit2 /> Değiştir
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col">
                    <label className="mb-1.5 font-semibold text-[#1f2937]">
                      Sınıfınız{" "}
                      {missingGrade ? (
                        <span className="inline-flex items-center justify-center align-middle ml-2 text-[#991b1b]">
                          <FiXCircle aria-label="Eksik" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center align-middle ml-2 text-[#166534]">
                          <FiCheckCircle aria-label="Tamam" />
                        </span>
                      )}
                    </label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      className={`${inputCls}${missingGrade ? " border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]" : ""}`}
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
                    <div className="mb-4 flex flex-col">
                      <label className="mb-1.5 font-semibold text-[#1f2937]">
                        Alanınız{" "}
                        {missingTrack ? (
                          <span className="inline-flex items-center justify-center align-middle ml-2 text-[#991b1b]">
                            <FiXCircle aria-label="Eksik" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center align-middle ml-2 text-[#166534]">
                            <FiCheckCircle aria-label="Tamam" />
                          </span>
                        )}
                      </label>
                      <select
                        value={form.track}
                        onChange={(e) => setForm({ ...form, track: e.target.value })}
                        className={`${inputCls}${missingTrack ? " border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]" : ""}`}
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

            <button type="submit" className="mt-2 py-3 px-4 bg-[#3b82f6] border-0 rounded-xl text-white font-bold cursor-pointer transition hover:bg-[#2563eb] active:translate-y-px">
              Bilgileri Güncelle
            </button>

            {success && <p className="mt-2.5 text-[#166534] font-semibold">{success}</p>}
            {verifying && <p className="mt-2.5 text-[#166534] font-semibold">{verifying}</p>}
            {error && <p className="mt-2.5 text-[#991b1b] font-semibold">{error}</p>}
          </form>

          {/* Doğrulama popup */}
          {showVerifyBox && (
            <div className="fixed inset-0 bg-[rgba(15,23,42,0.45)] grid place-items-center z-50" onClick={() => setShowVerifyBox(false)}>
              <div className="bg-white p-6 rounded-2xl shadow-[0_16px_60px_rgba(2,6,23,0.25)] grid gap-3 w-[min(420px,90vw)] border border-[#e5e7eb]" onClick={(e) => e.stopPropagation()}>
                <h4>{verifyTarget === "email" ? "E-posta" : "Telefon"} Doğrulama</h4>
                {!codeSent ? (
                  <button className="bg-[#10b981] text-white py-2.5 px-3 border-0 rounded-[10px] font-bold cursor-pointer hover:bg-[#059669]" onClick={sendCode}>📨 Kodu Gönder</button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Kod Giriniz"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="py-3 px-3 border border-[#e5e7eb] rounded-[10px] outline-none w-full"
                    />
                    <button className="bg-[#10b981] text-white py-2.5 px-3 border-0 rounded-[10px] font-bold cursor-pointer hover:bg-[#059669]" onClick={submitCode}>✔ Doğrula</button>
                  </>
                )}
                <button onClick={() => setShowVerifyBox(false)} className="bg-transparent border-0 text-[#3b82f6] font-semibold cursor-pointer inline-flex gap-1.5 items-center mt-2.5">
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
