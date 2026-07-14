import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import WizardStepBar from "../components/WizardStepBar";
import WizardUrgencyBanner from "../components/WizardUrgencyBanner";
import {
  isPromoActive,
  formatPromoEndDate,
  isExamPriceActive,
  getExamPrice,
  getExamDaysLeft,
} from "../utils/promoUtils";

const WIZARD_STEPS = [{ label: "Alan" }, { label: "Paket" }, { label: "Ödeme" }];

// PricingSection.jsx'teki PriceDisplay ile aynı iş mantığı (promo/sınav/plan
// önceliklendirmesi), sadece açık zeminli sihirbaz kartına göre yeniden
// biçimlendirildi. PricingSection'ın kendisine dokunulmuyor.
function PackagePrice({ pkg, activePlan }) {
  if (activePlan) {
    const priceStr = (activePlan.priceText || `${activePlan.price}₺`).replace(/₺/g, "").trim();
    return (
      <div>
        {activePlan.oldPriceText && (
          <div className="font-nunito font-bold text-sm mb-1 text-[#94a3b8] line-through">
            {activePlan.oldPriceText}
          </div>
        )}
        <div className="flex items-start gap-1">
          <span className="font-fredoka font-bold text-[22px] mt-2 text-[#FF6B35]">₺</span>
          <span
            className="font-fredoka font-bold text-[#1C1B8A] leading-none"
            style={{ fontSize: "clamp(48px,5vw,64px)", letterSpacing: -2 }}
          >
            {priceStr}
          </span>
        </div>
        {activePlan.durationText && (
          <div className="font-nunito font-bold text-sm mt-1 text-[#64748b]">{activePlan.durationText}</div>
        )}
      </div>
    );
  }

  const examActive = isExamPriceActive(pkg);
  const promoActive = !examActive && isPromoActive(pkg);

  if (examActive) {
    const price = getExamPrice(pkg);
    const days = getExamDaysLeft(pkg);
    const rate = pkg.examDiscountRate ?? 5;
    return (
      <div>
        <div className="font-nunito font-bold text-sm mb-1 text-[#94a3b8] line-through">
          {pkg.priceText || `${pkg.price}₺`}
        </div>
        <div className="flex items-start gap-1">
          <span className="font-fredoka font-bold text-[22px] mt-2 text-[#FF6B35]">₺</span>
          <span
            className="font-fredoka font-bold text-[#1C1B8A] leading-none"
            style={{ fontSize: "clamp(48px,5vw,64px)", letterSpacing: -2 }}
          >
            {price}
          </span>
        </div>
        <span
          className="inline-block mt-2 font-fredoka font-bold text-[12px] px-3 py-1 rounded-full text-[#1C1B8A]"
          style={{ background: "rgba(28,27,138,0.08)" }}
        >
          Sınava {days} gün kaldı — %{rate} indirimli
        </span>
      </div>
    );
  }

  if (promoActive) {
    return (
      <div>
        <div className="font-nunito font-bold text-sm mb-1 text-[#94a3b8] line-through">
          {pkg.priceText || `${pkg.price}₺`}
        </div>
        <div className="flex items-start gap-1">
          <span className="font-fredoka font-bold text-[22px] mt-2 text-[#FF6B35]">₺</span>
          <span
            className="font-fredoka font-bold text-[#1C1B8A] leading-none"
            style={{ fontSize: "clamp(48px,5vw,64px)", letterSpacing: -2 }}
          >
            {pkg.promoPrice}
          </span>
        </div>
        <span
          className="inline-block mt-2 font-fredoka font-bold text-[12px] px-3 py-1 rounded-full text-[#1C1B8A]"
          style={{ background: "rgba(28,27,138,0.08)" }}
        >
          {pkg.promoLabel || `${formatPromoEndDate(pkg.promoEndDate)} tarihine kadar`}
        </span>
      </div>
    );
  }

  const priceStr = pkg.priceText || `${pkg.price}₺`;
  const priceNum = priceStr.replace(/₺/g, "").trim();
  return (
    <div>
      {pkg.oldPriceText && (
        <div className="font-nunito font-bold text-sm mb-1 text-[#94a3b8] line-through">{pkg.oldPriceText}</div>
      )}
      <div className="flex items-start gap-1">
        <span className="font-fredoka font-bold text-[22px] mt-2 text-[#FF6B35]">₺</span>
        <span
          className="font-fredoka font-bold text-[#1C1B8A] leading-none"
          style={{ fontSize: "clamp(48px,5vw,64px)", letterSpacing: -2 }}
        >
          {priceNum}
        </span>
      </div>
    </div>
  );
}

export default function CoachingWizardPaket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const alan = searchParams.get("alan") || "";
  const querySlug = searchParams.get("slug");

  const [packages, setPackages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(querySlug || "");
  const [activePlanIdx, setActivePlanIdx] = useState(() => {
    const p = searchParams.get("plan");
    return p !== null ? parseInt(p, 10) || 0 : 0;
  });

  useEffect(() => {
    if (!alan) {
      navigate("/hemen-basla", { replace: true });
    }
  }, [alan, navigate]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPackages(data.packages || []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const yksPackages = packages.filter((p) => p.type !== "lgs");
  const defaultPkg = yksPackages[0] || packages[0] || null;
  const selected = packages.find((p) => p.slug === selectedSlug) || defaultPkg;

  useEffect(() => {
    if (!selectedSlug && selected) setSelectedSlug(selected.slug);
  }, [selected, selectedSlug]);

  const plans = Array.isArray(selected?.plans) ? selected.plans : [];
  const hasPlanTabs = plans.length > 1;
  const activePlan = hasPlanTabs ? plans[Math.min(activePlanIdx, plans.length - 1)] : null;

  const features = (Array.isArray(selected?.features) ? selected.features : [])
    .map((f) => (typeof f === "string" ? { label: f, included: true } : f))
    .filter((f) => f.included)
    .slice(0, 6);

  const goBack = () => {
    const params = new URLSearchParams();
    if (querySlug) params.set("slug", querySlug);
    navigate(`/hemen-basla?${params.toString()}`);
  };

  const goNext = () => {
    if (!selected) return;
    const params = new URLSearchParams();
    if (alan) params.set("alan", alan);
    params.set("slug", selected.slug);
    if (hasPlanTabs) params.set("plan", String(activePlanIdx));
    navigate(`/hemen-basla/odeme?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Navbar />
      <WizardUrgencyBanner storageKey="hemen-basla" minutes={15} />
      <WizardStepBar currentStep={2} steps={WIZARD_STEPS} />

      <main className="flex-1 max-w-[700px] mx-auto px-5 py-10 w-full">
        <button
          type="button"
          onClick={goBack}
          className="font-nunito text-[#64748b] text-sm mb-6 bg-transparent border-none cursor-pointer hover:text-[#1C1B8A]"
        >
          ← Alanı değiştir {alan && `(${alan})`}
        </button>

        <div className="text-center mb-8">
          <div className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>
            ADIM 2/3
          </div>
          <h1
            className="font-fredoka font-bold text-[#1C1B8A] leading-[0.95]"
            style={{ fontSize: "clamp(26px, 3.5vw, 38px)", letterSpacing: -1 }}
          >
            Sana uygun paketi seç
          </h1>
        </div>

        {!loaded && <p className="text-center text-[#64748b] font-nunito">Paketler yükleniyor…</p>}

        {loaded && !selected && (
          <div className="text-center">
            <p className="text-[#64748b] font-nunito mb-4">Şu anda gösterilecek bir paket bulunamadı.</p>
            <button
              type="button"
              onClick={() => navigate("/paket-detay")}
              className="font-fredoka font-bold text-[#1C1B8A] underline"
            >
              Tüm paketlere göz at →
            </button>
          </div>
        )}

        {selected && (
          <>
            <div className="rounded-[28px] border-2 border-[#f4f2fa] bg-[#f8f9fc] p-8">
              <div className="font-fredoka font-semibold text-[#1C1B8A] text-[13px] uppercase mb-3" style={{ letterSpacing: 2 }}>
                {selected.name}
              </div>

              {hasPlanTabs && (
                <div className="flex gap-1 rounded-full p-1 mb-4" style={{ background: "rgba(28,27,138,0.08)" }}>
                  {plans.map((plan, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePlanIdx(i)}
                      className="font-fredoka font-bold text-[12px] px-4 py-1.5 rounded-full border-none cursor-pointer transition-all duration-200 flex-1 text-center"
                      style={{
                        background: activePlanIdx === i ? "#1C1B8A" : "transparent",
                        color: activePlanIdx === i ? "#D8FF4F" : "#1C1B8A",
                      }}
                    >
                      {plan.label}
                    </button>
                  ))}
                </div>
              )}

              <PackagePrice pkg={selected} activePlan={activePlan} />

              <div className="font-nunito font-bold text-sm mt-3 text-[#64748b]">
                {selected.subtitle || "Kişiye özel koçluk programı"}
              </div>

              {features.length > 0 && (
                <div className="flex flex-col gap-2 mt-6">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 font-nunito text-sm text-[#374151]">
                      <span className="text-[#FF6B35] font-bold">✓</span>
                      {f.label}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={goNext}
                className="w-full mt-7 py-4 rounded-full font-fredoka font-bold text-base transition-transform hover:scale-[1.02]"
                style={{ background: "#FF6B35", color: "white" }}
              >
                Bu paketle devam et →
              </button>
            </div>

            {packages.length > 1 && (
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/paket-detay")}
                  className="font-nunito text-[#64748b] text-sm underline underline-offset-2 hover:text-[#1C1B8A] bg-transparent border-none cursor-pointer"
                >
                  Farklı bir paket mi arıyorsun? Tüm paketlere göz at →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
