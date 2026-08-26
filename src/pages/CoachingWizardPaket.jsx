import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaSyncAlt } from "react-icons/fa";
import axios from "../utils/axios";
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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

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
          <span className="font-fredoka font-bold text-[22px] mt-2 text-accent-orange">₺</span>
          <span
            className="font-fredoka font-bold text-page-navy leading-none"
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
          <span className="font-fredoka font-bold text-[22px] mt-2 text-accent-orange">₺</span>
          <span
            className="font-fredoka font-bold text-page-navy leading-none"
            style={{ fontSize: "clamp(48px,5vw,64px)", letterSpacing: -2 }}
          >
            {price}
          </span>
        </div>
        <span
          className="inline-block mt-2 font-fredoka font-bold text-[12px] px-3 py-1 rounded-full text-page-navy"
          style={{ background: "rgba(28,27,138,0.08)" }}
        >
          Sınava {days} gün kaldı, %{rate} indirimli
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
          <span className="font-fredoka font-bold text-[22px] mt-2 text-accent-orange">₺</span>
          <span
            className="font-fredoka font-bold text-page-navy leading-none"
            style={{ fontSize: "clamp(48px,5vw,64px)", letterSpacing: -2 }}
          >
            {pkg.promoPrice}
          </span>
        </div>
        <span
          className="inline-block mt-2 font-fredoka font-bold text-[12px] px-3 py-1 rounded-full text-page-navy"
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
        <span className="font-fredoka font-bold text-[22px] mt-2 text-accent-orange">₺</span>
        <span
          className="font-fredoka font-bold text-page-navy leading-none"
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
    axios.get("/api/packages")
      .then((r) => {
        if (r.data.success) setPackages(r.data.packages || []);
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
  // Sekme gösterilmese bile (tek plan varsa) billingCycle kontrolü için kullanılır.
  // Süre planı (sekmeli) hiç yoksa paketin kendi billingCycle/unitPrice'ı
  // "sanal bir plan" gibi kullanılıyor — admin panelde "normal paket ekleme"
  // formundaki Ödeme Tipi seçimi buraya karşılık geliyor.
  const effectivePlan =
    activePlan ||
    (plans.length === 1 ? plans[0] : null) ||
    (plans.length === 0 && selected ? { label: selected.name, billingCycle: selected.billingCycle, unitPrice: selected.unitPrice } : null);

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

    // Tek seferlik mi yoksa aylık abonelik mi olacağı artık Ödeme adımında,
    // kart bilgisi girilmeden önce müşterinin kendisi tarafından seçiliyor
    // (bkz. CoachingWizardOdeme.jsx) — burada sadece plan index'i taşınıyor.
    const params = new URLSearchParams();
    if (alan) params.set("alan", alan);
    params.set("slug", selected.slug);
    if (hasPlanTabs) params.set("plan", String(activePlanIdx));
    navigate(`/hemen-basla/odeme?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-white"
    >
      <TopBar />
      <Navbar />
      <WizardUrgencyBanner storageKey="hemen-basla" minutes={15} />
      <WizardStepBar currentStep={2} steps={WIZARD_STEPS} />

      <main className="flex-1 max-w-[700px] mx-auto px-5 py-10 w-full">
        <motion.button
          {...fadeUp}
          type="button"
          onClick={goBack}
          className="font-nunito text-[#64748b] text-sm mb-6 bg-transparent border-none cursor-pointer hover:text-page-navy"
        >
          ← Alanı değiştir {alan && `(${alan})`}
        </motion.button>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="text-center mb-8">
          <div className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3" style={{ letterSpacing: 4 }}>
            ADIM 2/3
          </div>
          <h1
            className="font-fredoka font-bold text-page-navy leading-[0.95]"
            style={{ fontSize: "clamp(26px, 3.5vw, 38px)", letterSpacing: -1 }}
          >
            Sana uygun paketi seç
          </h1>
        </motion.div>

        {!loaded && <p className="text-center text-[#64748b] font-nunito">Paketler yükleniyor…</p>}

        {loaded && !selected && (
          <div className="text-center">
            <p className="text-[#64748b] font-nunito mb-4">Şu anda gösterilecek bir paket bulunamadı.</p>
            <button
              type="button"
              onClick={() => navigate("/paket-detay")}
              className="font-fredoka font-bold text-page-navy underline"
            >
              Tüm paketlere göz at →
            </button>
          </div>
        )}

        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[28px] border-2 border-[#f4f2fa] bg-[#f8f9fc] p-8"
            >
              <div className="font-fredoka font-semibold text-page-navy text-[13px] uppercase mb-3" style={{ letterSpacing: 2 }}>
                {selected.name}
              </div>

              {hasPlanTabs && (
                <div className="flex gap-1 rounded-full p-1 mb-4" style={{ background: "rgba(28,27,138,0.08)" }}>
                  {plans.map((plan, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePlanIdx(i)}
                      className="relative font-fredoka font-bold text-[12px] px-4 py-1.5 rounded-full border-none cursor-pointer flex-1 text-center overflow-hidden"
                      style={{ color: activePlanIdx === i ? "#D8FF4F" : "#1C1B8A" }}
                    >
                      {activePlanIdx === i && (
                        <motion.span
                          layoutId="planTabBg"
                          className="absolute inset-0 rounded-full"
                          style={{ background: "#1C1B8A" }}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1">
                        {plan.billingCycle === "monthly" && <FaSyncAlt size={10} />} {plan.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selected.slug}-${activePlanIdx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <PackagePrice pkg={selected} activePlan={activePlan} />
                </motion.div>
              </AnimatePresence>

              <div className="font-nunito font-bold text-sm mt-3 text-[#64748b]">
                {selected.subtitle || "Kişiye özel koçluk programı"}
              </div>

              {features.length > 0 && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                  className="flex flex-col gap-2 mt-6"
                >
                  {features.map((f, i) => (
                    <motion.div
                      key={i}
                      variants={{ initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } }}
                      className="flex items-start gap-2 font-nunito text-sm text-[#374151]"
                    >
                      <FaCheckCircle className="text-accent-orange flex-shrink-0 mt-0.5" size={14} />
                      {f.label}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {effectivePlan?.billingCycle === "monthly" && (
                <p className="font-nunito text-xs text-[#64748b] mt-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-3 py-2.5 flex items-start gap-1.5">
                  <FaSyncAlt size={12} className="text-accent-orange flex-shrink-0 mt-0.5" />
                  <span>
                    Bu plan <strong>aylık abonelik</strong> olarak da alınabilir. Ödeme adımında tek seferlik mi
                    yoksa otomatik yenilenen aylık abonelik mi istediğini seçeceksin. Aboneliği dilediğin zaman
                    "Siparişlerim" sayfasından tek tıkla iptal edebilirsin.
                  </span>
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={goNext}
                className="w-full mt-7 py-4 rounded-full font-fredoka font-bold text-base"
                style={{ background: "#FF6B35", color: "white", boxShadow: "0 8px 24px rgba(255,107,53,0.3)" }}
              >
                Bu paketle devam et →
              </motion.button>
            </motion.div>

            {packages.length > 1 && (
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/paket-detay")}
                  className="font-nunito text-[#64748b] text-sm underline underline-offset-2 hover:text-page-navy bg-transparent border-none cursor-pointer"
                >
                  Farklı bir paket mi arıyorsun? Tüm paketlere göz at →
                </button>
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />
    </motion.div>
  );
}
