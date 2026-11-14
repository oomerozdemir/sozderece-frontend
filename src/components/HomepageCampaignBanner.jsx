import React from "react";
import { scrollToId } from "../utils/scrollToId";
import useCampaignCountdown from "../hooks/useCampaignCountdown";

const TARGET_SLUG = "yks-kocluk-paketi";

const pad2 = (n) => String(n).padStart(2, "0");

// "Kasım İndirimi" ve benzeri gelecekteki plan-seviyesi kampanyalar için
// vitrin üstü şerit. packages prop'u PricingSection ile AYNI /api/packages
// fetch'ini paylaşır (HomePage.jsx'te lifted) — ikinci bir istek atılmaz.
// Aktiflik kararı SADECE backend'in verdiği plans[0].campaignActive'e
// bağlıdır, burada hiçbir Date.now() karşılaştırması yapılmaz.
export default function HomepageCampaignBanner({ packages, onCampaignExpire }) {
  const pkg = Array.isArray(packages) ? packages.find((p) => p.slug === TARGET_SLUG) : null;
  const plan = pkg?.plans?.[0];
  const countdown = useCampaignCountdown(plan?.campaignActive ? plan.remainingSeconds : null, onCampaignExpire);

  if (!plan?.campaignActive) return null;

  const oldPriceTL = plan.unitPrice != null ? Math.round(plan.unitPrice / 100) : null;
  const newPriceTL = Math.round(plan.campaignUnitPrice / 100);

  return (
    <div
      className="relative z-[1001] flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 text-center sm:flex-row sm:gap-3"
      style={{ background: "#17252D" }}
    >
      <span className="font-fredoka font-bold text-[13px] sm:text-sm" style={{ color: "#E4F7F8" }}>
        {plan.campaignLabel || "Kampanya"}: {oldPriceTL != null && (
          <span className="mx-1" style={{ textDecoration: "line-through", opacity: 0.55 }}>
            {oldPriceTL.toLocaleString("tr-TR")}₺
          </span>
        )}
        <span style={{ color: "#19A9B7" }}>{newPriceTL.toLocaleString("tr-TR")}₺</span>
      </span>

      {countdown && (
        <span className="font-nunito font-bold text-[12px] tabular-nums" style={{ color: "#F7F7F2", opacity: 0.85 }}>
          {countdown.days > 0 ? `${countdown.days}g ` : ""}
          {pad2(countdown.hours)}:{pad2(countdown.minutes)}:{pad2(countdown.seconds)} kaldı
        </span>
      )}

      <a
        href="#paketler"
        onClick={(e) => { e.preventDefault(); scrollToId("paketler"); }}
        className="font-fredoka font-bold text-[12px] px-3 py-1 rounded-full no-underline transition-transform hover:scale-105"
        style={{ background: "#19A9B7", color: "#17252D" }}
      >
        Paketi İncele →
      </a>
    </div>
  );
}
