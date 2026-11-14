import { useState, useEffect, useRef } from "react";

// remainingSeconds backend'den gelen GÜVENİLİR kalan süre — bu hook SADECE
// görüntüleme için yerel saniye saniye azaltır, aktiflik kararı burada ASLA
// hesaplanmaz (o karar backend'in campaignActive alanında). onExpire İKİ
// durumda çağrılır: (1) yerel sayaç 0'a inince, (2) tab uzun süre arka
// planda kaldıktan sonra tekrar görünür olunca (browser timer throttle'ı
// yüzünden yerel sayaç gerçek zamandan sapmış olabilir — bu durumda interval
// eklemeden, tek seferlik bir "resync" olarak aynı callback tekrar
// çağrılır). İkisi de aynı eylemi istiyor: çağıran sayfa kendi fiyat
// verisini sessizce yeniden çeksin. Hook'un kendisi hiç network kodu
// içermez, bu yüzden farklı veri şekillerine (prop/self-fetch/single-pkg)
// aynı hook uyar.
const VISIBILITY_RESYNC_THRESHOLD_MS = 10_000;

export default function useCampaignCountdown({ remainingSeconds, onExpire }) {
  const [display, setDisplay] = useState(remainingSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const hiddenAtRef = useRef(null);
  const isCounting = display != null;

  useEffect(() => {
    setDisplay(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!isCounting) return;
    const id = setInterval(() => {
      setDisplay((d) => {
        if (d == null) return d;
        if (d <= 1) {
          clearInterval(id);
          onExpireRef.current?.();
          return 0;
        }
        return d - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isCounting]);

  useEffect(() => {
    if (!isCounting) return;
    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }
      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (hiddenAt != null && Date.now() - hiddenAt >= VISIBILITY_RESYNC_THRESHOLD_MS) {
        onExpireRef.current?.();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isCounting]);

  if (display == null) return null;
  const days = Math.floor(display / 86400);
  const hours = Math.floor((display % 86400) / 3600);
  const minutes = Math.floor((display % 3600) / 60);
  const seconds = display % 60;
  return { days, hours, minutes, seconds, totalSeconds: display };
}
