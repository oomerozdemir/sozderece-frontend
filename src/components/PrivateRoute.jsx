// src/components/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");

        // Token geçersiz → önce tek seferlik skip bayrağına bak
        if (!isTokenValid(token)) {
          // logout sonrası aynı sekmede sessiz girişi atla
          if (sessionStorage.getItem("skipSilentLoginOnce")) {
            sessionStorage.removeItem("skipSilentLoginOnce");
            if (alive) {
              setOk(false);
              setReady(true);
            }
            return;
          }

          // sessiz giriş dene (remember cookie varsa yeni token gelir)
          try {
            const r = await axios.get("/api/auth/silent-login?soft=1");
            if (r?.data?.token) {
              localStorage.setItem("token", r.data.token);
              if (r?.data?.user) {
                localStorage.setItem("user", JSON.stringify(r.data.user));
              }
              if (alive) setOk(true);
            } else {
              if (alive) setOk(false);
            }
          } catch {
            if (alive) setOk(false);
          } finally {
            if (alive) setReady(true);
          }
          return;
        }

        // Token hâlâ geçerli
        if (alive) {
          setOk(true);
          setReady(true);
        }
      } catch {
        if (alive) {
          setOk(false);
          setReady(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  if (!ready) return null; // istersen skeleton koy

  if (!ok) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
