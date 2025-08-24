// src/pages/preAuth.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { PACKAGES } from "../hooks/packages.js";
import "../cssFiles/preAuth.css";
import { isTokenValid } from "../utils/auth";

export default function PreCartAuth() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const slug = qs.get("slug");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("checking"); // checking | email | code | done
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [resendIn, setResendIn] = useState(0);

  const pkg = slug ? PACKAGES[slug] : null; // { title, unitPrice, ... }

  const trackAddToCart = () => {
    try {
      if (!window.fbq || !pkg) return;
      window.fbq("track", "AddToCart", {
        content_ids: [slug],
        content_type: "product",
        value: Number(pkg.unitPrice) / 100,
        currency: "TRY",
      });
    } catch {}
  };

  // Tek bir yardımcı: server sepetine ekle ve /sepet'e git
  const addToCartAndGo = async (tokenToUse, userEmail) => {
    try {
      await axios.post(
        "/api/cart/items",
        {
          slug,
          title: pkg.title,
          name: pkg.title,
          unitPrice: Number(pkg.unitPrice),
          quantity: 1,
          email: userEmail || undefined,
        },
        tokenToUse
          ? { headers: { Authorization: `Bearer ${tokenToUse}` } }
          : undefined
      );
      trackAddToCart();
    } catch {
      // hata olsa da akışı bozma
    } finally {
      setStep("done");
      navigate("/sepet", { replace: true });
    }
  };

  // Açılış akışı: 1) token geçerliyse → ekle & git
  //               2) değilse → silent-login dene
  //               3) cookie yoksa → OTP (email) adımı
  useEffect(() => {
    (async () => {
      if (!pkg) {
        setStep("email");
        return;
      }

      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr && isTokenValid(token)) {
        const userObj = (() => {
          try { return JSON.parse(userStr || "{}"); } catch { return {}; }
        })();
        await addToCartAndGo(token, userObj?.email);
        return;
      }

      // token yok/expired → remember cookie ile sessiz giriş dene
      try {
        const res = await axios.get("/api/auth/silent-login");
        if (res?.data?.token && res?.data?.user) {
          const newT = res.data.token;
          const newU = res.data.user;
          localStorage.setItem("token", newT);
          localStorage.setItem("user", JSON.stringify(newU));
          await addToCartAndGo(newT, newU?.email);
          return;
        }
      } catch {
        // cookie yok/bozuk → OTP adımına geç
      }

      localStorage.removeItem("token");
      setStep("email");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, pkg, navigate]);

  // resend sayaç
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    setLoading(true);
    setMsg("");
    try {
      if (sessionStorage.getItem("skipSilentLoginOnce")) {
   sessionStorage.removeItem("skipSilentLoginOnce");
   // bu açılışta sessiz girişi es geç
 } else {
      await axios.post("/api/auth/otp/send", { email: email.trim().toLowerCase() });
      setStep("code");
      setResendIn(60);
      setMsg("Doğrulama kodu e-posta adresine gönderildi.");
 }
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
        rememberMe: remember, // ✅ remember cookie'yi BE yazar
      });

      const token = res.data.token;
      const user = res.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // server sepetine ekle ve git
      await addToCartAndGo(token, user?.email || email.trim().toLowerCase());
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kod doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (!pkg) {
    return (
      <div className="preauth-container">
        <form className="preauth-form" onSubmit={(e) => e.preventDefault()}>
          <h1>Paket bulunamadı</h1>
          <button
            className="btn-primary"
            type="button"
            onClick={() => navigate("/#paketler")}
          >
            Paketlere dön
          </button>
        </form>
      </div>
    );
  }

  if (step === "checking" || step === "done") {
    return (
      <div className="preauth-container">
        <form className="preauth-form" onSubmit={(e) => e.preventDefault()}>
          <h1>Yönlendiriliyor…</h1>
        </form>
      </div>
    );
  }

  return (
    <div className="preauth-container">
      <form className="preauth-form" onSubmit={(e) => e.preventDefault()}>
        <h1>Devam etmeden önce giriş yap</h1>
        <p className="subtitle">
          {pkg.title} paketini sepete eklemek için e-posta ile tek kullanımlık kodla giriş yap.
        </p>

        {step === "email" && (
          <>
            <label>E-posta</label>
            <input
              type="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="btn-primary"
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
            <label>E-postana gelen kod</label>
            <input
              type="text"
              placeholder="• • • •"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
            />
            <button
              className="btn-primary"
              type="button"
              onClick={verify}
              disabled={code.length < 4 || loading}
            >
              {loading ? "Doğrulanıyor..." : "Doğrula ve Sepete Ekle"}
            </button>

            <button
              className="btn-secondary"
              type="button"
              onClick={sendCode}
              disabled={resendIn > 0 || loading}
            >
              {resendIn > 0 ? `Tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
            </button>

            <button
              className="btn-secondary"
              type="button"
              style={{ marginTop: 8 }}
              onClick={() => setStep("email")}
            >
              E-postayı değiştir
            </button>
          </>
        )}

        {!!msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
}
