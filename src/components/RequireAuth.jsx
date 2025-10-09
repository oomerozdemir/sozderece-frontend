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

        try {
          const res = await axios.get("/api/auth/me");
          if (res?.data?.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
          if (!alive) return;
          setOk(true);
        } catch {
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

  if (!ready) return null;

  if (!ok) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
