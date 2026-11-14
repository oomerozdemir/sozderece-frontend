import React from "react";

const pad2 = (n) => String(n).padStart(2, "0");

// Kalan süreye göre SADECE görsel ağırlık kademesi — fiyat/CTA/metin asla
// değişmez, kırmızı/neon yok, sadece turkuaz→yumuşak amber arası bir vurgu
// artışı.
function getUrgencyTier(totalSeconds) {
  if (totalSeconds < 6 * 3600) return "under6";
  if (totalSeconds < 24 * 3600) return "under24";
  if (totalSeconds < 48 * 3600) return "elevated";
  return "normal";
}

const TIER_STYLES = {
  normal: { box: "#FFFFFF", border: "#C9E9EB", text: "#17252D", accent: "#19A9B7" },
  elevated: { box: "#E4F7F8", border: "#19A9B7", text: "#17252D", accent: "#0E7C88" },
  under24: { box: "#E4F7F8", border: "#19A9B7", text: "#17252D", accent: "#0E7C88" },
  under6: { box: "#FFF3E0", border: "#E8A33D", text: "#8A5A12", accent: "#B9770E" },
};

function Segment({ value, unit, style, boxSize, fontSize }) {
  return (
    <div className="flex flex-col items-center" aria-hidden="true">
      <div
        className="flex items-center justify-center font-fredoka font-bold tabular-nums rounded-[10px]"
        style={{
          background: style.box,
          border: `1px solid ${style.border}`,
          color: style.text,
          width: boxSize,
          height: boxSize,
          fontSize,
        }}
      >
        {pad2(value)}
      </div>
      <span className="font-nunito font-bold text-[9px] uppercase mt-1 tracking-wide" style={{ color: style.accent }}>
        {unit}
      </span>
    </div>
  );
}

// Paylaşılan geri sayım görünümü — PricingSection/PackageDetail/
// CoachingWizardPaket/CoachingWizardOdeme'nin HEPSİ bu bileşeni kullanır,
// zaman matematiği useCampaignCountdown'da yaşar, görsel markup burada tek
// bir yerde yazılır. `countdown` null geldiyse (kampanya aktif değil) hiçbir
// şey render edilmez.
export default function CampaignCountdown({ countdown, campaignLabel, label = "İndirimin bitmesine", size = "md", dark = false }) {
  if (!countdown) return null;

  const { days, hours, minutes, seconds, totalSeconds } = countdown;
  const tier = getUrgencyTier(totalSeconds);
  const style = TIER_STYLES[tier];
  const showDays = days > 0;

  const ariaLabel = `${campaignLabel || "Kampanya"} bitmesine ${showDays ? `${days} gün ` : ""}${hours} saat ${minutes} dakika kaldı.`;

  if (size === "sm") {
    const compact = showDays ? `${days}g ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}` : `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    return (
      <div role="group" aria-label={ariaLabel} className="inline-flex items-center gap-1.5">
        <span className="font-nunito text-[12px]" style={{ color: style.accent }}>{label}</span>
        <span
          className="font-fredoka font-bold text-[12px] tabular-nums px-1.5 py-0.5 rounded-md"
          style={{ background: style.box, border: `1px solid ${style.border}`, color: style.text }}
          aria-hidden="true"
        >
          {compact}
        </span>
      </div>
    );
  }

  const boxSize = size === "lg" ? 52 : 42;
  const fontSize = size === "lg" ? 21 : 17;
  const segments = [
    ...(showDays ? [{ value: days, unit: "Gün" }] : []),
    { value: hours, unit: "Saat" },
    { value: minutes, unit: "Dk" },
    { value: seconds, unit: "Sn" },
  ];

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-col gap-1.5">
      {tier === "under24" && (
        <span className="font-fredoka font-bold text-[10px] uppercase self-start px-2 py-0.5 rounded-full" style={{ background: style.box, color: style.accent, border: `1px solid ${style.border}` }}>
          Son 24 Saat
        </span>
      )}
      <span className="font-nunito font-bold text-[11px]" style={{ color: dark ? "rgba(255,255,255,0.65)" : "#64748b" }}>{label}</span>
      <div className={segments.length === 4 ? "grid grid-cols-4 gap-1.5 max-[380px]:grid-cols-2 max-[380px]:gap-2 w-fit" : "flex gap-1.5"}>
        {segments.map((s) => (
          <Segment key={s.unit} value={s.value} unit={s.unit} style={style} boxSize={boxSize} fontSize={fontSize} />
        ))}
      </div>
    </div>
  );
}
