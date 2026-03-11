import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";

export default function PreCartAuth() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const slug = qs.get("slug");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("checking");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [resendIn, setResendIn] = useState(0);
  const [hasRemember, setHasRemember] = useState(false);
  const [pkg, setPkg] = useState(null);
  const [pkgLoaded, setPkgLoaded] = useState(false);

  useEffect(() => {
    if (!slug) { setPkgLoaded(true); return; }
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const found = data.packages.find((p) => p.slug === slug) || null;
          setPkg(found);
        }
      })
      .catch(() => {})
      .finally(() => setPkgLoaded(true));
  }, [slug]);

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

  // Server sepetine ekle ve /sepet'e git
  const addToCartAndGo = async (tokenToUse, userEmail) => {
    try {
      await axios.post(
        "/api/cart/items",
        {
          slug,
          title: pkg.name,
          name: pkg.name,
          unitPrice: Number(pkg.unitPrice),
          quantity: 1,
          email: userEmail || undefined,
        },
        tokenToUse ? { headers: { Authorization: `Bearer ${tokenToUse}` } } : undefined
      );
      trackAddToCart();
    } catch {
      // hata olsa da akışı bozma
    } finally {
      setStep("done");
      navigate("/sepet", { replace: true });
    }
  };

  // AÇILIŞ AKIŞI
  useEffect(() => {
    if (!pkgLoaded) return;
    (async () => {
      if (!pkg) {
        setStep("email");
        return;
      }

      // 1) Geçerli token varsa direkt ekle & git
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr && isTokenValid(token)) {
        const userObj = (() => { try { return JSON.parse(userStr || "{}"); } catch { return {}; } })();
        await addToCartAndGo(token, userObj?.email);
        return;
      }

      // 2) token yok/expired → remember cookie'yi SADECE PROBE et (soft=1)
      try {
        if (sessionStorage.getItem("skipSilentLoginOnce")) {
          sessionStorage.removeItem("skipSilentLoginOnce");
        } else {
          const res = await axios.get("/api/auth/silent-login?soft=1");
          //ÖNEMLİ: soft=1'de token dönse bile KULLANMIYORUZ
          if (res?.data?.authenticated === true) {
            setHasRemember(true); // Tek tıkla giriş butonunu göstereceğiz
          }
        }
      } catch {
        // cookie yok/bozuk → OTP adımına geç
      }

      // 3) OTP email adımına geç
      localStorage.removeItem("token");
      setStep("email");
    })();
  }, [slug, pkg, pkgLoaded, navigate]);

  // "Tek tıkla giriş ve sepete ekle"
  const oneTapLoginAndAdd = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get("/api/auth/silent-login"); // soft=0
      if (res?.data?.token && res?.data?.user) {
        const t = res.data.token;
        const u = res.data.user;
        localStorage.setItem("token", t);
        localStorage.setItem("user", JSON.stringify(u));
        await addToCartAndGo(t, u?.email);
        return;
      }
      setMsg("Tek tıkla giriş başarısız. Lütfen e-posta ile devam edin.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Tek tıkla giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

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

      const token = res.data.token;
      const user = res.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      await addToCartAndGo(token, user?.email || email.trim().toLowerCase());
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kod doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (!pkgLoaded || step === "checking" || step === "done") {
    return (
      <div className="flex justify-center items-start min-h-[60vh] bg-white">
        <form className="w-full max-w-[420px] text-center p-6 mx-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <h1>Yönlendiriliyor…</h1>
        </form>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="flex justify-center items-start min-h-[60vh] bg-white">
        <form className="w-full max-w-[420px] text-center p-6 mx-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <h1>Paket bulunamadı</h1>
          <button className="w-full py-3.5 bg-[#02095f] text-white font-bold text-sm tracking-widest border-none rounded mt-1.5 cursor-pointer hover:bg-[#ec5802] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70" type="button" onClick={() => navigate("/#paketler")}>
            Paketlere dön
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-[60vh] bg-white">
      <form className="w-full max-w-[420px] text-center p-6 mx-4 my-8" onSubmit={(e) => e.preventDefault()}>
        <h1>Devam etmeden önce giriş yap</h1>
        <p className="text-sm text-slate-600 mb-6">
          {pkg.name} paketini sepete eklemek için e-posta ile tek kullanımlık kodla giriş yap.
        </p>

        {step === "email" && (
          <>
            {/* Bu cihazda remember varsa → Tek tıkla butonu */}
            {hasRemember && (
              <div style={{ marginBottom: 10, textAlign: "center" }}>
                <button
                  className="w-full py-3.5 bg-[#02095f] text-white font-bold text-sm tracking-widest border-none rounded mt-1.5 cursor-pointer hover:bg-[#ec5802] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  onClick={oneTapLoginAndAdd}
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  Tek tıkla giriş ve sepete ekle
                </button>
                <div style={{ fontSize: ".9rem", color: "#6b7280", marginTop: 6 }}>
                  Bu cihazda kayıtlı oturum bulundu.
                </div>
              </div>
            )}

            <label className="block text-left text-sm text-gray-900 mb-1.5">E-posta</label>
            <input
              type="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-4 bg-transparent text-black outline-none focus:border-gray-800"
            />
            <label className="inline-flex items-center gap-2 my-2 mb-4 text-sm text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[#02095f]"
              />
              Beni Hatırla
            </label>
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
              {loading ? "Doğrulanıyor..." : "Doğrula ve Sepete Ekle"}
            </button>

            <button className="w-full py-3 text-gray-900 bg-white border border-slate-300 rounded cursor-pointer mt-2 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70" type="button" onClick={sendCode} disabled={resendIn > 0 || loading}>
              {resendIn > 0 ? `Tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
            </button>

            <button className="w-full py-3 text-gray-900 bg-white border border-slate-300 rounded cursor-pointer mt-2 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70" type="button" style={{ marginTop: 8 }} onClick={() => setStep("email")}>
              E-postayı değiştir
            </button>
          </>
        )}

        {!!msg && <p className="mt-2.5 text-sm text-gray-700">{msg}</p>}
      </form>
    </div>
  );
}
