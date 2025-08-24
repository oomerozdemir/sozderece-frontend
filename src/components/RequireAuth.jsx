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
    const t = localStorage.getItem("token");
    if (!isTokenValid(t)) {
      setOk(false);
      setReady(true);
      return;
    }

    // İsteğe bağlı ama faydalı: token geçerliyse /me çekip user'ı tazele
    (async () => {
      try {
        const res = await axios.get("/api/auth/me");
        if (res?.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (_) {
        // 401 vs. olursa token bozuk demektir
        setOk(false);
      } finally {
        setReady(true);
      }
    })();
  }, [location.pathname]);

  if (!ready) return null; // küçük skeleton istersen koy

  if (!ok) {
    // geldiğin yolu saklayarak login'e gönder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
