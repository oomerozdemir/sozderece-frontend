import { useState, useEffect } from "react";
import axios from "../utils/axios";

// Geri sayım ayarlarını backend'den çeker ve kalan süreyi hesaplar
export function useCountdownSettings() {
  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/settings/countdown")
      .then((res) => setSettings(res.data))
      .catch(() => setSettings({ enabled: false }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!settings?.enabled || !settings?.targetDate) {
      setTimeLeft(null);
      return;
    }

    const calc = () => {
      const diff = new Date(settings.targetDate) - new Date();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  return { settings, timeLeft, loading };
}

// Tamamen client-side, oturuma özel geri sayım. Backend/admin ayarına
// bağlı değil — sessionStorage'da bir bitiş zamanı ankraj eder, sekme
// yenilense/adım değişse bile süre sıfırlanmaz. Süre dolunca sadece
// expired:true döner, hiçbir akışı engellemez.
export function useSessionCountdown(minutes, storageKey) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const key = `wizardCountdown:${storageKey}`;
    let deadline = Number(sessionStorage.getItem(key));
    if (!deadline || Number.isNaN(deadline)) {
      deadline = Date.now() + minutes * 60 * 1000;
      sessionStorage.setItem(key, String(deadline));
    }

    const calc = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        minutes: Math.floor(diff / 60000),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [minutes, storageKey]);

  return timeLeft;
}
