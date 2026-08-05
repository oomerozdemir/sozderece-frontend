import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";

/**
 * Abonelik başlatmadan önce gerçek giriş (e-posta OTP) zorunlu kılan kapı.
 * Tek-seferlik satın alma akışının aksine (misafir + otomatik hesap), abonelikte
 * müşterinin ileride giriş yapıp iptal edebilmesi/kart güncelleyebilmesi gerektiği
 * için burada gerçek kimlik doğrulama şart (bkz. plan: "Abonelik Sistemi").
 *
 * Zaten geçerli bir token varsa hiçbir şey göstermeden doğrudan onAuthenticated'ı
 * çağırır. Aksi halde e-posta + OTP kodu ile giriş akışını render eder.
 *
 * Kullanım: <SubscriptionAuthGate onAuthenticated={() => ...} />
 */
export default function SubscriptionAuthGate({ onAuthenticated }) {
  const [step, setStep] = useState("checking"); // "checking" | "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isTokenValid(token)) {
      onAuthenticated();
    } else {
      setStep("email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    setLoading(true);
    setMsg("");
    try {
      await axios.post("/api/auth/otp/send", { email: email.trim().toLowerCase() });
      setStep("code");
      setResendIn(60);
      setMsg("Doğrulama kodu e-posta adresine gönderildi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.post("/api/auth/otp/verify", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        rememberMe: true,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onAuthenticated();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kod doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "checking") return null;

  return (
    <div className="flex justify-center items-start min-h-[50vh] bg-white">
      <div className="w-full max-w-[420px] text-center p-6 mx-4 my-8">
        <h1 className="text-xl font-bold text-[#0f172a]">Devam etmeden önce giriş yap</h1>
        <p className="text-sm text-slate-600 mb-6">
          Abonelik başlatmak için e-posta ile tek kullanımlık kodla giriş yapman gerekiyor —
          böylece daha sonra aboneliğini görüntüleyip iptal edebilirsin.
        </p>

        {step === "email" && (
          <>
            <label className="block text-left text-sm text-gray-900 mb-1.5">E-posta</label>
            <input
              type="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-4 bg-transparent text-black outline-none focus:border-gray-800"
            />
            <button
              className="w-full py-3.5 bg-[#02095f] text-white font-bold text-sm tracking-widest border-none rounded mt-1.5 cursor-pointer hover:bg-[#ec5802] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={sendCode}
              disabled={!email.includes("@") || resendIn > 0 || loading}
            >
              {loading ? "Gönderiliyor..." : "Kodu Gönder"}
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <label className="block text-left text-sm text-gray-900 mb-1.5">E-postana gelen kod</label>
            <input
              type="text"
              placeholder="• • • •"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-4 bg-transparent text-black outline-none focus:border-gray-800"
            />
            <button
              className="w-full py-3.5 bg-[#02095f] text-white font-bold text-sm tracking-widest border-none rounded mt-1.5 cursor-pointer hover:bg-[#ec5802] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={verify}
              disabled={code.length < 4 || loading}
            >
              {loading ? "Doğrulanıyor..." : "Doğrula ve Devam Et"}
            </button>
            <button
              className="w-full py-3 text-gray-900 bg-white border border-slate-300 rounded cursor-pointer mt-2 hover:bg-slate-50 transition-all disabled:opacity-70"
              type="button"
              onClick={sendCode}
              disabled={resendIn > 0 || loading}
            >
              {resendIn > 0 ? `Tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
            </button>
          </>
        )}

        {!!msg && <p className="mt-2.5 text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}
