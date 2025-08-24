// src/components/RequireAuth.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";

export default function RequireAuth({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const t = localStorage.getItem("token");

        // 1) Token geçersizse: önce tek seferlik skip bayrağına bak, sonra sessiz giriş dene
        if (!isTokenValid(t)) {
          if (sessionStorage.getItem("skipSilentLoginOnce")) {
            sessionStorage.removeItem("skipSilentLoginOnce");
            if (alive) {
              setOk(false);
              setReady(true);
            }
            return;
          }
          try {
            const r = await axios.get("/api/auth/silent-login?soft=1");
            if (r?.data?.token) {
              localStorage.setItem("token", r.data.token);
              if (r?.data?.user) {
                localStorage.setItem("user", JSON.stringify(r.data.user));
              }
              if (!alive) return;
              setOk(true);
            } else {
              if (!alive) return;
              setOk(false);
            }
          } catch {
            if (!alive) return;
            setOk(false);
          } finally {
            if (!alive) return;
            setReady(true);
          }
          return; // burada bitiriyoruz
        }

        // 2) Token geçerliyse: (isteğe bağlı) /me ile kullanıcıyı tazele
        try {
          const res = await axios.get("/api/auth/me");
          if (res?.data?.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
          if (!alive) return;
          setOk(true);
        } catch {
          // /me 401 dönerse token bozulmuş olabilir → sessiz giriş fallback
          try {
            const r = await axios.get("/api/auth/silent-login");
            if (r?.data?.token) {
              localStorage.setItem("token", r.data.token);
              if (r?.data?.user) {
                localStorage.setItem("user", JSON.stringify(r.data.user));
              }
              if (!alive) return;
              setOk(true);
            } else {
              if (!alive) return;
              setOk(false);
            }
          } catch {
            if (!alive) return;
            setOk(false);
          }
        } finally {
          if (!alive) return;
          setReady(true);
        }
      } catch {
        if (!alive) return;
        setOk(false);
        setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  // küçük skeleton göstermek istersen buraya bir loader koyabilirsin
  if (!ready) return null;

  if (!ok) {
    // geldiğin yolu saklayarak login'e gönder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
