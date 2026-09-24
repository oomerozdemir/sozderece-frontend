import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingShell, { OnboardingLoading } from "../../components/OnboardingShell";
import useOnboarding from "../../hooks/useOnboarding";
import { isAdminPreview, PREVIEW_ONBOARDING_WELCOME } from "../../utils/onboardingPreview";

const JOURNEY = [
  { n: "01", t: "Seni Tanıyalım" },
  { n: "02", t: "Koçunla Tanış" },
  { n: "03", t: "İlk Rotanı Oluşturalım" },
  { n: "04", t: "Birlikte İlerleyelim" },
];

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preview = isAdminPreview(searchParams);
  const real = useOnboarding(preview);
  const loading = preview ? false : real.loading;
  const ob = preview ? PREVIEW_ONBOARDING_WELCOME : real.data?.onboarding;

  useEffect(() => {
    if (preview || loading) return;
    if (!ob) navigate("/student/dashboard", { replace: true });
    else if (ob.formCompleted) navigate("/onboarding/tamamlandi", { replace: true });
  }, [preview, loading, ob, navigate]);

  if (loading || !ob || ob.formCompleted) return <OnboardingLoading />;

  const started = ob.stage !== "payment_completed";

  return (
    <OnboardingShell>
      {preview && (
        <div className="mb-4 text-center font-fredoka font-bold text-[12px] px-3 py-1.5 rounded-full inline-block mx-auto w-full" style={{ background: "#FFEDE3", color: "#C2410C" }}>
          Önizleme modu — hiçbir şey kaydedilmiyor, öğrenciler bunu görmüyor
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-[28px] p-6 md:p-10"
        style={{ border: "1px solid #ECEAF5", boxShadow: "0 16px 44px rgba(28,27,138,0.10)" }}
      >
        <span
          className="inline-flex items-center gap-2 font-fredoka font-bold text-[13px] px-3.5 py-1.5 rounded-full"
          style={{ background: "#EEFBC7", color: "#3F6B0A" }}
        >
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: "#3F6B0A" }}>✓</span>
          Kaydın Tamamlandı
        </span>

        <h1 className="font-fredoka font-bold text-page-navy mt-5 mb-4 leading-tight" style={{ fontSize: "clamp(30px, 6vw, 40px)" }}>
          Sözderece'ye Hoş Geldin! <span aria-hidden>👋</span>
        </h1>
        <p className="text-[#475569] text-base leading-relaxed mb-3">
          Bundan sonra sınav sürecini daha planlı, takip edilebilir ve sana uygun bir rotayla birlikte yöneteceğiz.
        </p>
        <p className="text-[#475569] text-base leading-relaxed mb-8">
          İlk çalışma rotanı oluşturmadan önce seni biraz daha yakından tanımamız gerekiyor.
        </p>

        <ol className="list-none p-0 m-0 mb-8 flex flex-col gap-2.5">
          {JOURNEY.map((s, i) => {
            const active = i === 0;
            return (
              <li
                key={s.n}
                className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
                style={{
                  background: active ? "#1C1B8A" : "#F4F2FA",
                  color: active ? "#fff" : "#8B87A6",
                }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center font-fredoka font-bold text-sm flex-shrink-0"
                  style={{ background: active ? "#D8FF4F" : "#E4E1F0", color: active ? "#0D0A2E" : "#8B87A6" }}
                >
                  {s.n}
                </span>
                <span className="font-fredoka font-bold text-[16px]">{s.t}</span>
                {active && (
                  <span className="ml-auto font-nunito font-bold text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(216,255,79,0.18)", color: "#D8FF4F" }}>
                    Şimdi
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={() => navigate(preview ? "/onboarding/surec?preview=1" : "/onboarding/tanisma")}
          className="w-full py-4 rounded-2xl font-fredoka font-bold text-[17px] border-0 cursor-pointer transition-transform hover:scale-[1.02]"
          style={{ background: "#D8FF4F", color: "#0D0A2E", boxShadow: "0 8px 24px rgba(216,255,79,0.35)" }}
        >
          {preview ? "Sürece Geç →" : started ? "Tanışma Formuna Devam Et →" : "Tanışma Formuna Başla →"}
        </button>
        <p className="text-center text-[#94a3b8] text-[13px] mt-3 mb-0">Yaklaşık 5 dakika sürer.</p>
      </motion.div>
    </OnboardingShell>
  );
}
