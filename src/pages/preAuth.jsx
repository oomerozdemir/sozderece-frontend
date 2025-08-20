// src/pages/PreCartAuth.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { PACKAGES } from "../hooks/packages"; 

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
  const [resendIn, setResendIn] = useState(0);

  const pkg = slug ? PACKAGES[slug] : null; // { title, unitPrice, subtitle, ... }

  const trackAddToCart = () => {
    try {
      if (!window.fbq || !pkg) return;
      window.fbq("track", "AddToCart", {
        content_ids: [slug],
        content_type: "product",
        value: pkg.unitPrice / 100, // TL
        currency: "TRY",
      });
    } catch {}
  };

  // login'li ise: doğrudan server sepetine ekle ve /sepet'e git
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!pkg) {
      setStep("email");
      return;
    }

    if (token && userStr) {
      (async () => {
        try {
          await axios.post(
            "/api/cart/items",
            {
              slug,
              title: pkg.title,
              unitPrice: pkg.unitPrice, // kuruş (int)
              quantity: 1,
            },
            { headers: { Authorization: `Bearer ${token}` } }
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
            unitPrice: pkg.unitPrice,
            quantity: 1,
          },
          { headers: { Authorization: `Bearer ${res.data.token}` } }
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
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-3">Paket bulunamadı</h1>
        <button className="border rounded px-4 py-2" onClick={() => navigate("/#paketler")}>
          Paketlere dön
        </button>
      </div>
    );
  }

  if (step === "checking" || step === "done") {
    return <div className="max-w-md mx-auto p-6">Yönlendiriliyor…</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Devam etmeden önce giriş yap</h1>
      <p className="text-sm text-gray-600 mb-6">
        {pkg.title} paketini sepete eklemek için e-posta ile tek kullanımlık kodla giriş yap.
      </p>

      {step === "email" && (
        <>
          <label className="block text-sm mb-2">E-posta</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
            onClick={sendCode}
            disabled={!email.includes("@") || resendIn > 0 || loading}
          >
            {loading ? "Gönderiliyor..." : "Kodu Gönder"}
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <label className="block text-sm mb-2">E-postana gelen kod</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mb-3 tracking-widest text-center"
            placeholder="• • • •"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
          />
          <button
            className="w-full bg-black text-white rounded py-2 mb-3 disabled:opacity-50"
            onClick={verify}
            disabled={code.length < 4 || loading}
          >
            {loading ? "Doğrulanıyor..." : "Doğrula ve Sepete Ekle"}
          </button>

          <button
            className="w-full border rounded py-2 disabled:opacity-50"
            onClick={sendCode}
            disabled={resendIn > 0 || loading}
          >
            {resendIn > 0 ? `Tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
          </button>
          <button className="block mx-auto mt-4 text-sm underline" onClick={() => setStep("email")}>
            E-postayı değiştir
          </button>
        </>
      )}

      {!!msg && <p className="mt-4 text-sm text-gray-700">{msg}</p>}
    </div>
  );
}
