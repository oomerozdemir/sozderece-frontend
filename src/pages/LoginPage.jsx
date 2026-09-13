import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "../utils/axios";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import { isTokenValid, getRoleFromToken } from "../utils/auth";

const inputCls =
  "w-full py-3.5 px-4 border border-[#e2e8f0] rounded-xl text-base bg-white outline-none focus:border-page-navy focus:shadow-[0_0_0_3px_rgba(28,27,138,0.1)] placeholder:text-[#aaa] text-[#0f172a] transition-colors font-nunito";

function Eyebrow({ children }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <span className="inline-block w-6 h-[3px] rounded-full" style={{ background: "#FF6B35" }} />
      <span className="font-fredoka font-bold text-[12px] uppercase text-accent-orange" style={{ letterSpacing: 3 }}>
        {children}
      </span>
    </div>
  );
}

const LoginPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("checking");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false); // default false
  const [hasRemember, setHasRemember] = useState(false); // bu cihazda kayıtlı oturum var mı?

  // 1) Açılışta token/remember kontrolü
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
          if (res?.data?.authenticated === true) {
            setHasRemember(true);
          }
        }
      } catch {
      }

      setStep("email");
    })();
  }, [navigate]);

  const oneTapLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/auth/silent-login");
      if (res?.data?.token && res?.data?.user) {
       localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userName", res.data.user.name);
        const role = res.data.user.role;
        if (role === "admin") navigate("/admin", { replace: true });
        else if (role === "coach") navigate("/coach/dashboard", { replace: true });
        else navigate("/student/dashboard", { replace: true });
      } else {
        setError("Tek tıkla giriş başarısız.");
        window.location.reload();
      }

    } catch (e) {
      setError(e?.response?.data?.message || "Tek tıkla giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

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
           const res = await axios.post("/api/auth/otp/send", {
        email: email.trim().toLowerCase(),
      });

      // başarılı yanıt
      if (res?.data?.success) {
        setStep("code");
        setResendIn(60);
      }
    } catch (e) {
       const st = e?.response?.status;
      if (st === 429) {
        const retryAfter = Number(e?.response?.data?.retryAfter ?? 60);
        setError(e?.response?.data?.message || `Lütfen ${retryAfter} sn bekleyin.`);
        setResendIn(retryAfter);
      } else {
        setError(e?.response?.data?.message || "Kod gönderilemedi.");
      }
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
        rememberMe: remember, // kullanıcı işaretlerse BE remember cookie yazacak
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

      <TopBar />
      <Navbar />

      <main className="min-h-[65vh] flex items-center justify-center bg-white px-4 py-16 max-[480px]:py-10">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-7">
            <Eyebrow>Giriş Yap</Eyebrow>
            <h1
              className="font-fredoka font-bold text-page-navy m-0"
              style={{ fontSize: "clamp(26px, 3.5vw, 34px)", letterSpacing: -0.5 }}
            >
              Tekrar Hoş Geldin
            </h1>
            <p className="font-nunito text-[#64748b] text-sm mt-2">
              E-posta adresine gönderilecek kodla saniyeler içinde giriş yap.
            </p>
          </div>

          <div
            className="bg-white rounded-[28px] border border-[#ECEAF5] p-7 max-[480px]:p-5"
            style={{ boxShadow: "0 10px 30px rgba(28,27,138,0.08)" }}
          >
            <form className="w-full" onSubmit={(e) => e.preventDefault()}>
              {step === "checking" && (
                <p className="text-center font-nunito text-[#64748b] text-sm py-6">Yönlendiriliyor…</p>
              )}

              {!!error && (
                <p className="text-center font-nunito text-red-500 text-sm mb-3">{error}</p>
              )}

              {step === "email" && (
                <div className="flex flex-col gap-3.5">
                  {hasRemember && (
                    <div className="mb-1 text-center">
                      <Button onClick={oneTapLogin} disabled={loading} variant="secondary" fullWidth>
                        Tek tıkla giriş yap
                      </Button>
                      <p className="font-nunito text-xs text-[#94a3b8] mt-2">
                        Bu cihazda kayıtlı oturum bulundu.
                      </p>
                    </div>
                  )}

                  <input
                    type="email"
                    placeholder="E-posta adresin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputCls}
                  />
                  <label className="flex items-center gap-2 font-nunito text-sm text-[#475569] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 accent-page-navy"
                    />
                    Beni hatırla
                  </label>
                  <Button
                    onClick={sendCode}
                    disabled={!email.includes("@") || loading || resendIn > 0}
                    variant="secondary"
                    size="lg"
                    fullWidth
                  >
                    {loading
                      ? "Gönderiliyor..."
                      : resendIn > 0
                      ? `Tekrar gönder (${resendIn})`
                      : "Giriş Yap →"}
                  </Button>
                </div>
              )}

              {step === "code" && (
                <div className="flex flex-col gap-3.5">
                  <p className="font-nunito text-sm text-[#64748b] -mt-1">
                    <strong className="text-[#0f172a]">{email}</strong> adresine gönderdiğimiz kodu gir.
                  </p>
                  <input
                    type="text"
                    placeholder="E-postana gelen kod"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={8}
                    required
                    className={`${inputCls} text-center tracking-[0.3em] font-bold`}
                  />
                  <Button onClick={verify} disabled={code.trim().length < 4 || loading} variant="secondary" size="lg" fullWidth>
                    {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
                  </Button>

                  <div className="flex items-center justify-center gap-4 mt-1">
                    <Button onClick={sendCode} disabled={loading || resendIn > 0} variant="link" size="sm">
                      {resendIn > 0 ? `Kodu tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
                    </Button>
                    <span className="text-[#e2e8f0]">|</span>
                    <Button
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError("");
                      }}
                      variant="link"
                      size="sm"
                    >
                      E-postayı değiştir
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <p className="text-center font-nunito text-sm text-[#94a3b8] mt-6">
            Hesabın yok mu? Paket satın aldığında otomatik oluşturuluyor —{" "}
            <a href="/paket-detay" className="text-page-navy font-bold underline">
              paketleri incele
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default LoginPage;
