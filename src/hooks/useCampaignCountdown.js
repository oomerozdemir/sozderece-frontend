import { useState, useEffect, useRef } from "react";

// remainingSeconds backend'den gelen GÜVENİLİR kalan süre — bu hook SADECE
// görüntüleme için yerel saniye saniye azaltır, aktiflik kararı burada ASLA
// hesaplanmaz (o karar backend'in campaignActive alanında). Süre 0'a inince
// onExpire bir kez çağrılır — çağıran taraf bunu "paket verisini sessizce
// yeniden çek" tetikleyicisi olarak kullanır.
export default function useCampaignCountdown(remainingSeconds, onExpire) {
  const [display, setDisplay] = useState(remainingSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setDisplay(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (display == null) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display == null]);

  if (display == null) return null;
  const days = Math.floor(display / 86400);
  const hours = Math.floor((display % 86400) / 3600);
  const minutes = Math.floor((display % 3600) / 60);
  const seconds = display % 60;
  return { days, hours, minutes, seconds, totalSeconds: display };
}
