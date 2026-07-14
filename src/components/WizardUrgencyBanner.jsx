import { useSessionCountdown } from "../hooks/useCountdown";

const pad = (n) => String(n).padStart(2, "0");

// Yumuşak/motivasyonel aciliyet banner'ı — kapasite/kontenjan iddiası yok,
// tamamen client-side (sessionStorage), süre dolunca sessizce kaybolur ve
// hiçbir şekilde ödemeyi/akışı engellemez.
export default function WizardUrgencyBanner({ storageKey = "hemen-basla", minutes = 15 }) {
  const timeLeft = useSessionCountdown(minutes, storageKey);

  if (!timeLeft || timeLeft.expired) return null;

  return (
    <div className="bg-white border-b border-[#f1f5f9]">
      <div className="max-w-[1200px] mx-auto px-5 py-2.5 flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="font-fredoka font-bold text-sm text-[#1C1B8A]">
          ⏱ Bu fiyat için kalan süre:
        </span>
        <span className="font-fredoka font-bold text-sm text-[#FF6B35] tabular-nums">
          {pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
        <span className="text-[#64748b] text-xs font-nunito">
          Kaydını tamamlamak sadece birkaç dakika sürer.
        </span>
      </div>
    </div>
  );
}
