// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // ⬅️ Link eklendi
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { Helmet } from "react-helmet";
import axios from "../utils/axios";
import "../cssFiles/login.css";
import Navbar from "../components/navbar";
import { isTokenValid, getRoleFromToken } from "../utils/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  // adımlar: checking | email | code
  const [step, setStep] = useState("checking");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);

  // 1) Açılışta token/remember kontrolü (AYNEN KORUNDU)
  useEffect(() => {
    (async () => {
      const t = localStorage.getItem("token");
      if (t && isTokenValid(t)) {
        const role = getRoleFromToken(t);
        if (role === "admin") navigate("/admin", { replace: true });
        else if (role === "coach") navigate("/coach/dashboard", { replace: true });
        else navigate("/student/dashboard", { replace: true });
        return;
      }

      try {
        if (sessionStorage.getItem("skipSilentLoginOnce")) {
          sessionStorage.removeItem("skipSilentLoginOnce");
        } else {
          const res = await axios.get("/api/auth/silent-login?soft=1");
          if (res?.data?.token) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            const role = (res.data.user?.role || "student").toLowerCase();
            if (role === "admin") navigate("/admin", { replace: true });
            else if (role === "coach") navigate("/coach/dashboard", { replace: true });
            else navigate("/student/dashboard", { replace: true });
            return;
          }
        }
      } catch {
        // sessiz giriş başarısızsa login ekranında kal
      }
      setStep("email");
    })();
  }, [navigate]);

  // resend sayacı
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/otp/send", { email: email.trim().toLowerCase() });
      setStep("code");
      setResendIn(60);
    } catch (e) {
      setError(e?.response?.data?.message || "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/otp/verify", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        rememberMe: remember,
      });
      const token = res.data.token;
      const user = res.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = getRoleFromToken(token) || (user?.role || "student").toLowerCase();
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "coach") navigate("/coach/dashboard", { replace: true });
      else navigate("/student/dashboard", { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || "Kod doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Giriş Yap | Sözderece Koçluk</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />

      {/* === YENİ: iki sütunlu layout (sol: öğretmen CTA, sağ: mevcut OTP formu) === */}
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-split">
            {/* SOL KART — Öğretmen CTA (sadece yönlendirme) */}
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

            {/* SAĞ KART — ÖĞRENCİ OTP GİRİŞİ (MEVCUT FORM) */}
            <section className="login-form-card">
              <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                {step === "checking" && <h2>Yönlendiriliyor…</h2>}
                {step !== "checking" && <h2>E-posta ile Giriş</h2>}

                {!!error && <p className="error-message">{error}</p>}

                {step === "email" && (
                  <>
                    <input
                      type="email"
                      placeholder="E-posta adresiniz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className="remember-me">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      Beni Hatırla
                    </label>
                    <button
                      type="button"
                      onClick={sendCode}
                      disabled={!email.includes("@") || loading || resendIn > 0}
                    >
                      {loading
                        ? "Gönderiliyor..."
                        : resendIn > 0
                        ? `Tekrar gönder (${resendIn})`
                        : "Giriş Yap"}
                    </button>
                  </>
                )}

                {step === "code" && (
                  <>
                    <input
                      type="text"
                      placeholder="E-postanıza gelen kod"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={verify}
                      disabled={code.trim().length < 4 || loading}
                    >
                      {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
                    </button>

                    <button
                      type="button"
                      className="linklike"
                      onClick={sendCode}
                      disabled={loading || resendIn > 0}
                      style={{ marginTop: 8 }}
                    >
                      {resendIn > 0
                        ? `Kodu tekrar gönder (${resendIn})`
                        : "Kodu tekrar gönder"}
                    </button>
                    <button
                      type="button"
                      className="linklike"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError("");
                      }}
                      style={{ marginTop: 8 }}
                    >
                      E-postayı değiştir
                    </button>
                  </>
                )}
              </form>
            </section>
          </div>
        </div>
      </div>

      {/* FOOTER (AYNEN KORUNDU) */}
      <footer className="custom-footer">
        <div className="footer-icons">
          <a href="https://www.instagram.com/sozderece/"><FaInstagram /></a>
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
