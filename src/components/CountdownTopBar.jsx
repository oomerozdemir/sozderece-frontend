import { useCountdownSettings } from "../hooks/useCountdown";

// Sayı kutusu
function TimeBox({ value, label }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center mx-[6px]">
      <span className="bg-white text-[#c0392b] font-extrabold text-[0.95rem] leading-none px-[7px] py-[4px] rounded-[5px] min-w-[30px] text-center tabular-nums">
        {padded}
      </span>
      <span className="text-[0.6rem] text-white/80 uppercase mt-[2px] tracking-wide">{label}</span>
    </div>
  );
}

export default function CountdownTopBar() {
  const { settings, timeLeft, loading } = useCountdownSettings();

  if (loading || !settings?.enabled || !timeLeft || timeLeft.expired) return null;

  return (
    <div className="bg-[#c0392b] py-[6px] px-4 flex items-center justify-center gap-3 flex-wrap text-white text-sm">
      {settings.title && (
        <span className="font-semibold text-[0.85rem] text-center">{settings.title}</span>
      )}
      <div className="flex items-center">
        <TimeBox value={timeLeft.days} label="Gün" />
        <span className="text-white font-bold text-lg mb-3">:</span>
        <TimeBox value={timeLeft.hours} label="Saat" />
        <span className="text-white font-bold text-lg mb-3">:</span>
        <TimeBox value={timeLeft.minutes} label="Dak" />
        <span className="text-white font-bold text-lg mb-3">:</span>
        <TimeBox value={timeLeft.seconds} label="Sn" />
      </div>
      {settings.subtitle && (
        <span className="text-white/90 text-[0.8rem] text-center">{settings.subtitle}</span>
      )}
    </div>
  );
}
