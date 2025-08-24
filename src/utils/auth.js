// src/utils/auth.js
import axios from "axios";

function b64urlToB64(input) {
  // base64url -> base64 çevir
  let out = input.replace(/-/g, "+").replace(/_/g, "/");
  // padding
  const pad = out.length % 4;
  if (pad === 2) out += "==";
  else if (pad === 3) out += "=";
  else if (pad !== 0) out += "=="; // olası düzensiz durumlar için
  return out;
}

export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const json = atob(b64urlToB64(payloadPart));
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

export async function logout({ forgetDevice = true, redirect = "/login" } = {}) {
  try {
    // Backend: remember cookie + DB revoke (logout endpoint'in bunu yapması lazım)
    await axios.post("/api/auth/logout", { forgetDevice });
  } catch (_) {
    // sessiz geç
  } finally {
    // Bu cihazdaki erişim bilgisini temizle
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Aynı sekmede ilk yüklemede sessiz girişi ATLA
    sessionStorage.setItem("skipSilentLoginOnce", "1");

    // İstersen yönlendir
    if (redirect && typeof window !== "undefined") {
      window.location.assign(redirect);
    }
  }
}