import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../utils/axios";

// Anonim ziyaretçi/oturum takibi — ikas benzeri "sipariş nereden geldi"
// özelliği için. Hiçbir şey render etmez, sadece arka planda session
// başlatma/ping isteklerini yönetir. Ödeme sayfaları bu değerleri
// (getStoredVisitorId/getStoredSessionId) okuyup siparişe ekliyor.

const VISITOR_ID_KEY = "sd_visitor_id";
const SESSION_ID_KEY = "sd_session_id";
const SESSION_LAST_ACTIVITY_KEY = "sd_session_last_activity";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30dk hareketsizlik = yeni oturum (GA4 varsayılanıyla aynı)
const PING_THROTTLE_MS = 20 * 1000;

const uuid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  }));

export const getStoredVisitorId = () => {
  try {
    return localStorage.getItem(VISITOR_ID_KEY) || null;
  } catch {
    return null;
  }
};

export const getStoredSessionId = () => {
  try {
    return sessionStorage.getItem(SESSION_ID_KEY) || null;
  } catch {
    return null;
  }
};

const getOrCreateVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return uuid(); // localStorage kapalıysa (gizli sekme kısıtı vb.) en azından bu istek için üret
  }
};

const isSessionExpired = () => {
  try {
    const lastActivity = sessionStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
    if (!lastActivity) return true;
    return Date.now() - parseInt(lastActivity, 10) > SESSION_TIMEOUT_MS;
  } catch {
    return true;
  }
};

const markActivity = () => {
  try {
    sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
  } catch {
    // sessiz geç — takip bir sonraki sayfa yüklemesinde yeni oturumla devam eder
  }
};

const extractUtm = (search) => {
  const params = new URLSearchParams(search);
  const get = (k) => params.get(k) || undefined;
  return {
    utmSource: get("utm_source"),
    utmMedium: get("utm_medium"),
    utmCampaign: get("utm_campaign"),
    utmTerm: get("utm_term"),
    utmContent: get("utm_content"),
  };
};

const startNewSession = async (visitorId) => {
  try {
    const res = await axios.post("/api/tracking/session/start", {
      visitorId,
      referrer: document.referrer || "",
      landingUrl: window.location.href,
      ...extractUtm(window.location.search),
    });
    const sessionId = res.data?.sessionId;
    if (sessionId) {
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      markActivity();
    }
  } catch {
    // Takip başarısız olsa bile site kullanımını hiçbir şekilde etkilememeli
  }
};

const pingSession = async (visitorId, sessionId) => {
  try {
    const res = await axios.post("/api/tracking/session/ping", { visitorId, sessionId });
    if (res.data?.expired) {
      sessionStorage.removeItem(SESSION_ID_KEY);
    }
  } catch {
    // sessiz geç
  }
};

export default function VisitorTracker() {
  const location = useLocation();
  const lastPingAtRef = useRef(0);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const needsNewSession = !getStoredSessionId() || isSessionExpired();

    if (needsNewSession) {
      startNewSession(visitorId);
    } else {
      markActivity();
      if (bootstrappedRef.current) {
        // rota değişimi — throttle'lı ping
        const now = Date.now();
        if (now - lastPingAtRef.current > PING_THROTTLE_MS) {
          lastPingAtRef.current = now;
          pingSession(visitorId, getStoredSessionId());
        }
      }
    }
    bootstrappedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}
