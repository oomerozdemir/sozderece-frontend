// src/utils/auth.js
export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64);
    return JSON.parse(json); // { id, email, role, iat, exp }
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const p = decodeToken(token);
  return !!(p?.exp && p.exp * 1000 > Date.now());
}

export function getRoleFromToken(token) {
  const p = decodeToken(token);
  return (p?.role || "").toLowerCase();
}
