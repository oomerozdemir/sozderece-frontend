import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid, getRoleFromToken } from "../utils/auth";

export default function RoleRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Geçersiz token -> login'e
  if (!isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token'dan rol; yoksa localStorage'daki user'dan dene
  let role = (getRoleFromToken(token) || "").toLowerCase();
  if (!role) {
    try {
      role = JSON.parse(localStorage.getItem("user"))?.role?.toLowerCase() || "";
    } catch {}
  }

  const allow = allowedRoles.map((r) => r.toLowerCase()).includes(role);
  if (!allow) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
