import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFlask, FaBook, FaBalanceScale, FaGlobeAmericas } from "react-icons/fa";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import WizardStepBar from "../components/WizardStepBar";
import WizardUrgencyBanner from "../components/WizardUrgencyBanner";

const WIZARD_STEPS = [{ label: "Alan" }, { label: "Paket" }, { label: "Ödeme" }];

const ALAN_OPTIONS = [
  { value: "Sayısal", icon: <FaFlask />, desc: "Fen, matematik ağırlıklı" },
  { value: "Sözel", icon: <FaBook />, desc: "Tarih, edebiyat ağırlıklı" },
  { value: "Eşit Ağırlık", icon: <FaBalanceScale />, desc: "Sayısal + Sözel dengeli" },
  { value: "Dil", icon: <FaGlobeAmericas />, desc: "Yabancı dil ağırlıklı" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-white"
    >
      <TopBar />
      <Navbar />
      <WizardUrgencyBanner storageKey="hemen-basla" minutes={15} />
      <WizardStepBar currentStep={1} steps={WIZARD_STEPS} />

      <main className="flex-1 max-w-[900px] mx-auto px-5 py-10 w-full">
        <motion.div {...fadeUp} className="text-center mb-10">
          <div
            className="font-fredoka font-bold text-accent-orange text-[12px] uppercase mb-3"
            style={{ letterSpacing: 4 }}
          >
            ADIM 1/3
          </div>
          <h1
            className="font-fredoka font-bold text-page-navy leading-[0.95]"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: -1 }}
          >
            Hangi alanda hazırlanıyorsun?
          </h1>
          <p className="font-nunito text-[#64748b] text-base mt-3">
            Programını sana göre şekillendirebilmemiz için önce alanını öğrenelim.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1"
        >
          {ALAN_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => goNext(opt.value)}
              className="text-left rounded-[24px] border-2 border-[#f4f2fa] hover:border-page-navy bg-[#f8f9fc] hover:bg-white hover:shadow-[0_12px_32px_rgba(28,27,138,0.1)] transition-colors p-6"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 text-page-navy"
                style={{ background: "rgba(28,27,138,0.08)" }}
              >
                {opt.icon}
              </div>
              <div className="font-fredoka font-bold text-page-navy text-xl mb-1">{opt.value}</div>
              <div className="font-nunito text-[#64748b] text-sm">{opt.desc}</div>
            </motion.button>
          ))}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }} className="text-center mt-8">
          <button
            type="button"
            onClick={() => goNext("Diğer")}
            className="font-nunito text-[#64748b] text-sm underline underline-offset-2 hover:text-page-navy bg-transparent border-none cursor-pointer"
          >
            Emin değilim / Diğer →
          </button>
        </motion.div>
      </main>

      <Footer />
    </motion.div>
  );
}
