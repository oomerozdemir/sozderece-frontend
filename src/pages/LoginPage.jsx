import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { Helmet } from "react-helmet";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { isTokenValid, getRoleFromToken } from "../utils/auth";

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

      <Navbar />

      {/* İki sütun: sol öğretmen CTA, sağ öğrenci OTP girişi */}
      <div className="flex justify-center items-center min-h-[50vh] bg-white max-[900px]:min-h-0">
        <div className="w-full py-8 px-4 flex justify-center">
          <div className="w-full max-w-[1000px] grid grid-cols-2 gap-7 items-stretch max-[900px]:grid-cols-1">
            {/* SOL — Öğretmen CTA */}
            <aside className="bg-gradient-to-b from-[#f7f8ff] to-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_18px_rgba(0,0,0,0.06)]">
              <h3 className="text-[#100383] text-[1.4rem] font-bold mt-0 mb-2.5">Özel ders vermek ister misin?</h3>
              <p className="text-gray-700 mt-0 mb-4">
                Profilini oluştur, fiyatını belirle ve öğrencilerle buluş.
              </p>
              <ul className="mt-0 mb-[18px] pl-[18px] text-gray-800 leading-[1.45]">
                <li>🔹 Şehir / ilçe & sınıf filtreleri</li>
                <li>🔹 Online / yüz yüze seçenekleri</li>
                <li>🔹 Kişisel profil sayfası</li>
              </ul>

              <Link to="/ogretmen/kayit" className="inline-block text-center w-full py-3 px-3.5 bg-[#02095f] text-white rounded-xl font-bold no-underline transition-all hover:bg-[#ec5802] hover:-translate-y-px">
                Özel ders vermek için <strong>kayıt ol</strong>
              </Link>

              <div className="mt-2.5 text-center text-gray-600">
                Zaten öğretmen misin?{" "}
                <Link to="/ogretmen/giris" className="text-[#02095f] font-semibold underline">
                  Giriş yap
                </Link>
              </div>
            </aside>

            {/* SAĞ — Öğrenci OTP Girişi */}
            <section className="bg-white border border-gray-200 rounded-2xl px-2 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
              <form className="w-full max-w-[400px] text-center px-6 mx-auto" onSubmit={(e) => e.preventDefault()}>
                {step === "checking" && <h2 className="text-[2rem] mb-8 text-[#100383] font-semibold tracking-wide">Yönlendiriliyor…</h2>}
                {step !== "checking" && <h2 className="text-[2rem] mb-8 text-[#100383] font-semibold tracking-wide">E-posta ile Giriş</h2>}

                {!!error && <p className="text-red-500 text-sm mt-0 mb-2">{error}</p>}

                {step === "email" && (
                  <>
                    {/* Bu cihazda remember varsa Tek Tıkla Giriş */}
                    {hasRemember && (
                      <div className="mb-2.5 text-center">
                        <button
                          type="button"
                          onClick={oneTapLogin}
                          disabled={loading}
                          className="w-full py-3 px-3.5 bg-[#02095f] text-white rounded-xl font-bold border-0 cursor-pointer transition-all hover:bg-[#ec5802] hover:-translate-y-px disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Tek tıkla giriş yap
                        </button>
                        <div className="text-[0.9rem] text-gray-500 mt-1.5">
                          Bu cihazda kayıtlı oturum bulundu.
                        </div>
                      </div>
                    )}

                    <input
                      type="email"
                      placeholder="E-posta adresiniz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-6 bg-transparent text-black focus:outline-none focus:border-gray-800"
                    />
                    <label className="flex items-center gap-2 my-2 mb-4 text-[0.95rem] text-gray-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 m-0 p-0 accent-[#02095f]"
                      />
                      Beni Hatırla
                    </label>
                    <button
                      type="button"
                      onClick={sendCode}
                      disabled={!email.includes("@") || loading || resendIn > 0}
                      className="w-full py-3.5 bg-[#02095f] text-white font-bold text-[0.95rem] tracking-widest border-0 rounded mt-2.5 cursor-pointer transition-colors hover:bg-[#ec5802] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
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
                      className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-6 bg-transparent text-black focus:outline-none focus:border-gray-800"
                    />
                    <button
                      type="button"
                      onClick={verify}
                      disabled={code.trim().length < 4 || loading}
                      className="w-full py-3.5 bg-[#02095f] text-white font-bold text-[0.95rem] tracking-widest border-0 rounded mt-2.5 cursor-pointer transition-colors hover:bg-[#ec5802] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
                    </button>

                    <button
                      type="button"
                      onClick={sendCode}
                      disabled={loading || resendIn > 0}
                      className="bg-transparent border-0 text-[#02095f] cursor-pointer text-sm font-medium underline hover:text-[#ec5802] disabled:text-gray-400 disabled:cursor-not-allowed"
                      style={{ marginTop: 8 }}
                    >
                      {resendIn > 0
                        ? `Kodu tekrar gönder (${resendIn})`
                        : "Kodu tekrar gönder"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError("");
                      }}
                      className="bg-transparent border-0 text-[#02095f] cursor-pointer text-sm font-medium underline hover:text-[#ec5802]"
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

      {/* FOOTER */}
      <footer className="mt-[120px] pt-10 px-5 pb-5 border-t border-gray-300 text-center bg-[#fafafa]">
        <div className="flex justify-center gap-6 mb-5 text-[1.6rem]">
          <a href="https://www.instagram.com/sozderece/" className="text-[#010c69] border border-[#020074] rounded-full p-2.5 w-11 h-11 flex items-center justify-center transition-all hover:bg-[#e94b02] hover:border-[#e94b02] hover:text-white"><FaInstagram /></a>
          <span className="text-[#010c69] border border-[#020074] rounded-full p-2.5 w-11 h-11 flex items-center justify-center transition-all hover:bg-[#e94b02] hover:border-[#e94b02] hover:text-white"><FaTiktok /></span>
          <span className="text-[#010c69] border border-[#020074] rounded-full p-2.5 w-11 h-11 flex items-center justify-center transition-all hover:bg-[#e94b02] hover:border-[#e94b02] hover:text-white"><FaYoutube /></span>
        </div>
        <div className="flex justify-center flex-wrap gap-6 mb-4 text-[0.95rem]">
          <a href="/hakkimizda" className="text-gray-800 no-underline transition-colors hover:text-[#e5671e]">Hakkımızda</a>
          <a href="/mesafeli-hizmet-sozlesmesi" className="text-gray-800 no-underline transition-colors hover:text-[#e5671e]">Mesafeli Hizmet Sözleşmesi</a>
          <a href="/gizlilik-politikasi-kvkk" className="text-gray-800 no-underline transition-colors hover:text-[#e5671e]">Gizlilik ve KVKK</a>
          <a href="/iade-ve-cayma-politikasi" className="text-gray-800 no-underline transition-colors hover:text-[#e5671e]">İade ve Cayma Politikası</a>
        </div>
        <div className="text-sm text-gray-500">© 2025 Sözderece Koçluk Her Hakkı Saklıdır</div>
      </footer>
    </>
  );
};

export default LoginPage;
