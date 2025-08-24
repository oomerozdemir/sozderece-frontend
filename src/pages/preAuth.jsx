import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { PACKAGES } from "../hooks/packages.js"; // tek kaynak
import "../cssFiles/preAuth.css";

function decodeToken(t) {
  try {
    const base64 = t.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function PreCartAuth() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const slug = qs.get("slug");

  const [email, setEmail] = useState("");
  the
  const [code, setCode] = useState("");
  const [step, setStep] = useState("checking"); // checking | email | code | done
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [resendIn, setResendIn] = useState(0);

  const pkg = slug ? PACKAGES[slug] : null; // { title, unitPrice, subtitle, ... }

  const trackAddToCart = () => {
    try {
      if (!window.fbq || !pkg) return;
      window.fbq("track", "AddToCart", {
        content_ids: [slug],
        content_type: "product",
        value: Number(pkg.unitPrice) / 100, // TL
        currency: "TRY",
      });
    } catch {}
  };

  // login'li ise: token geçerliyse doğrudan server sepetine ekle ve /sepet'e git
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!pkg) {
      setStep("email");
      return;
    }

    if (token && userStr) {
      const payload = decodeToken(token);
      const valid = payload?.exp && payload.exp * 1000 > Date.now();

      if (valid) {
        (async () => {
          try {
            const userObj = JSON.parse(userStr || "{}");
            await axios.post(
              "/api/cart/items",
              {
                slug,
                title: pkg.title,
                name: pkg.title,
                unitPrice: Number(pkg.unitPrice),
                quantity: 1,
                email: userObj?.email || undefined
              }
              // Authorization header'ı axios interceptor otomatik ekliyor
            );
            trackAddToCart();
          } catch {
            // hata olsa da sepet sayfasına ilerleyelim
          } finally {
            setStep("done");
            navigate("/sepet", { replace: true });
          }
        })();
      } else {
        localStorage.removeItem("token");
        setStep("email");
      }
    } else {
      setStep("email");
    }
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
        rememberMe: remember,
      });

      // oturum aç
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // server sepetine ekle
      if (pkg) {
        await axios.post(
          "/api/cart/items",
          {
            slug,
            title: pkg.title,
            name: pkg.title,
            unitPrice: Number(pkg.unitPrice),
            quantity: 1,
            email: res.data?.user?.email || email.trim().toLowerCase(),
          }
          // Authorization header'ı axios interceptor otomatik ekliyor
        );
        trackAddToCart();
      }

      setStep("done");
      navigate("/sepet", { replace: true });
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
