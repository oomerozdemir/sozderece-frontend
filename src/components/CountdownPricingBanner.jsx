import { useCountdownSettings } from "../hooks/useCountdown";
import { FaFire, FaArrowDown } from "react-icons/fa";

function TimeBox({ value, label }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-[#c0392b] font-extrabold text-[1.8rem] max-[768px]:text-[1.3rem] leading-none w-[64px] max-[768px]:w-[52px] h-[64px] max-[768px]:h-[52px] flex items-center justify-center rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.2)] tabular-nums">
        {padded}
      </div>
      <span className="text-white/80 text-[0.7rem] uppercase mt-[6px] tracking-wider font-semibold">{label}</span>
    </div>
  );
}

export default function CountdownPricingBanner() {
  const { settings, timeLeft, loading } = useCountdownSettings();

  if (loading || !settings?.enabled || !timeLeft || timeLeft.expired) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#c0392b] via-[#e74c3c] to-[#c0392b] rounded-[16px] p-[28px] max-[768px]:p-[20px] mb-[40px] max-w-[1200px] mx-auto shadow-[0_10px_40px_rgba(192,57,43,0.35)]">
      {/* Arka plan desenler */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-20px] right-[-20px] w-[150px] h-[150px] rounded-full bg-white"></div>
        <div className="absolute bottom-[-30px] left-[-30px] w-[120px] h-[120px] rounded-full bg-white"></div>
      </div>

      <div className="relative flex flex-col items-center text-center gap-[16px]">
        {/* Başlık */}
        <div className="flex items-center gap-[10px]">
          <FaFire className="text-yellow-300 text-[1.4rem] animate-pulse" />
          <h3 className="text-white font-extrabold text-[1.3rem] max-[768px]:text-[1.1rem] m-0">
            {settings.title || "Fiyatlar Yakında Artıyor!"}
          </h3>
          <FaFire className="text-yellow-300 text-[1.4rem] animate-pulse" />
        </div>

        {settings.subtitle && (
          <p className="text-white/90 text-[0.95rem] max-[768px]:text-[0.85rem] m-0 max-w-[500px]">
            {settings.subtitle}
          </p>
        )}

        {/* Geri Sayım */}
        <div className="flex items-end gap-[10px] max-[768px]:gap-[6px]">
          <TimeBox value={timeLeft.days} label="Gün" />
          <span className="text-white font-extrabold text-[2rem] mb-[24px] opacity-70">:</span>
          <TimeBox value={timeLeft.hours} label="Saat" />
          <span className="text-white font-extrabold text-[2rem] mb-[24px] opacity-70">:</span>
          <TimeBox value={timeLeft.minutes} label="Dakika" />
          <span className="text-white font-extrabold text-[2rem] mb-[24px] opacity-70">:</span>
          <TimeBox value={timeLeft.seconds} label="Saniye" />
        </div>

        {/* Aşağı ok */}
        <div className="flex items-center gap-[6px] text-white/80 text-[0.85rem] animate-bounce">
          <FaArrowDown />
          <span>Mevcut fiyatlarla hemen paketi seç</span>
          <FaArrowDown />
        </div>
      </div>
    </div>
  );
}
