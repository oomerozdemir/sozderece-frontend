import React from "react";
import { scrollToId } from "../utils/scrollToId";
import useCampaignCountdown from "../hooks/useCampaignCountdown";

const TARGET_SLUG = "yks-kocluk-paketi";

// "21 Kasım 23:59'a kadar" — İstanbul saatiyle, admin'in girdiği
// campaignEndsAt'ten (UTC ISO) türetilir, hardcode tarih YOK.
const endDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

// "Kasım İndirimi" ve benzeri gelecekteki plan-seviyesi kampanyalar için
// vitrin üstü şerit. packages prop'u PricingSection ile AYNI /api/packages
// fetch'ini paylaşır (HomePage.jsx'te lifted) — ikinci bir istek atılmaz.
// Aktiflik kararı SADECE backend'in verdiği plans[0].campaignActive'e
// bağlıdır, burada hiçbir Date.now() karşılaştırması yapılmaz.
//
// UX kararı: PricingSection'daki paket kartı ZATEN canlı saniye-saniye
// sayaç gösteriyor — aynı viewport'ta ikinci bir tikleyen sayaç tekrarcı
// olur. Bu yüzden banner sadece statik bitiş tarihini gösterir; hook yine
// de kullanılır ama SADECE süre dolunca otomatik kaybolmayı (onExpire)
// sağlamak için — görsel rakam kutuları YOK.
export default function HomepageCampaignBanner({ packages, onCampaignExpire }) {
  const pkg = Array.isArray(packages) ? packages.find((p) => p.slug === TARGET_SLUG) : null;
  const plan = pkg?.plans?.[0];
  useCampaignCountdown({
    remainingSeconds: plan?.campaignActive ? plan.remainingSeconds : null,
    onExpire: onCampaignExpire,
  });

  if (!plan?.campaignActive) return null;

  const oldPriceTL = plan.unitPrice != null ? Math.round(plan.unitPrice / 100) : null;
  const newPriceTL = Math.round(plan.campaignUnitPrice / 100);
  const endDateText = plan.campaignEndsAt ? endDateFormatter.format(new Date(plan.campaignEndsAt)) : null;

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

      {endDateText && (
        <span className="font-nunito font-bold text-[12px]" style={{ color: "#F7F7F2", opacity: 0.85 }}>
          {endDateText}'a kadar
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
