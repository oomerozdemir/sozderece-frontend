import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import WizardStepBar from "../components/WizardStepBar";
import WizardUrgencyBanner from "../components/WizardUrgencyBanner";

const WIZARD_STEPS = [{ label: "Alan" }, { label: "Paket" }, { label: "Ödeme" }];

const ALAN_OPTIONS = [
  { value: "Sayısal", emoji: "🔬", desc: "Fen, matematik ağırlıklı" },
  { value: "Sözel", emoji: "📚", desc: "Tarih, edebiyat ağırlıklı" },
  { value: "Eşit Ağırlık", emoji: "⚖️", desc: "Sayısal + Sözel dengeli" },
  { value: "Dil", emoji: "🌍", desc: "Yabancı dil ağırlıklı" },
];

export default function CoachingWizardAlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const goNext = (alan) => {
    const params = new URLSearchParams();
    params.set("alan", alan);
    const slug = searchParams.get("slug");
    const plan = searchParams.get("plan");
    if (slug) params.set("slug", slug);
    if (plan !== null) params.set("plan", plan);
    navigate(`/hemen-basla/paket?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Navbar />
      <WizardUrgencyBanner storageKey="hemen-basla" minutes={15} />
      <WizardStepBar currentStep={1} steps={WIZARD_STEPS} />

      <main className="flex-1 max-w-[900px] mx-auto px-5 py-10 w-full">
        <div className="text-center mb-10">
          <div
            className="font-fredoka font-bold text-[#FF6B35] text-[12px] uppercase mb-3"
            style={{ letterSpacing: 4 }}
          >
            ADIM 1/3
          </div>
          <h1
            className="font-fredoka font-bold text-[#1C1B8A] leading-[0.95]"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: -1 }}
          >
            Hangi alanda hazırlanıyorsun?
          </h1>
          <p className="font-nunito text-[#64748b] text-base mt-3">
            Programını sana göre şekillendirebilmemiz için önce alanını öğrenelim.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          {ALAN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => goNext(opt.value)}
              className="text-left rounded-[24px] border-2 border-[#f4f2fa] hover:border-[#1C1B8A] bg-[#f8f9fc] hover:bg-white transition-all p-6"
            >
              <div className="text-[32px] mb-2">{opt.emoji}</div>
              <div className="font-fredoka font-bold text-[#1C1B8A] text-xl mb-1">{opt.value}</div>
              <div className="font-nunito text-[#64748b] text-sm">{opt.desc}</div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => goNext("Diğer")}
            className="font-nunito text-[#64748b] text-sm underline underline-offset-2 hover:text-[#1C1B8A] bg-transparent border-none cursor-pointer"
          >
            Emin değilim / Diğer →
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
