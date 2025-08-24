// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // 1) Açılışta: varsa geçerli token → role'e göre yönlendir
  //    yoksa → sessiz giriş (remember cookie) dene; başarılıysa yönlendir
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

      // token yok/expired → silent-login dene (remember cookie varsa BE yeni token verir)
      try {
        if (sessionStorage.getItem("skipSilentLoginOnce")) {
   sessionStorage.removeItem("skipSilentLoginOnce");
   // bu açılışta sessiz girişi es geç
 } else {
        const res = await axios.get("/api/auth/silent-login");
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
        // cookie yok/bozuk → normal OTP akışı
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
        rememberMe: remember, // ✅ remember seçiliyse BE cookie yazacak
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

      <div className="login-container">
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
                {loading ? "Gönderiliyor..." : resendIn > 0 ? `Tekrar gönder (${resendIn})` : "Giriş Yap"}
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
                {resendIn > 0 ? `Kodu tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
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
      </div>

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
