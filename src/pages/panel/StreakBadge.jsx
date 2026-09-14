import { FaFire } from "react-icons/fa";

// "Ateş Serisi" rozeti — Duolingo mantığı: seriyi bozmak istememe psikolojisi.
// current=0 iken soluk/gri (henüz başlamamış), >0 iken canlı turuncu-kırmızı.
export default function StreakBadge({ current = 0, compact = false }) {
  const active = current > 0;
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full font-fredoka font-bold flex-shrink-0"
      style={{
        padding: compact ? "5px 10px" : "7px 14px",
        fontSize: compact ? 12 : 14,
        background: active ? "linear-gradient(135deg, #ff9f1c, #ff5b1c)" : "#f1f5f9",
        color: active ? "#fff" : "#94a3b8",
        boxShadow: active ? "0 3px 10px rgba(255,91,28,0.35)" : "none",
      }}
      title={active ? `Art arda ${current} gündür programını %90'ın üzerinde tamamlıyorsun!` : "Bugün başla, serini yak!"}
    >
      <FaFire size={compact ? 11 : 13} />
      {current}
    </div>
  );
}
