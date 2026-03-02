import { motion } from "framer-motion";
import { FaHandsHelping, FaClipboardList, FaUserCheck, FaUsers, FaSeedling } from "react-icons/fa";

import waveBottom from "../assets/wave.svg";
import Lottie from "lottie-react";

import fishAnimation from "../assets/fish.json";

const reasons = [
  {
    icon: <FaHandsHelping />,
    title: "Koçluk değil, yol arkadaşlığı sunuyoruz.",
    description: "Biz bir görev değil, güven bağı kuruyoruz. Öğrencinin duygusunu, inişini çıkışını anlıyor; yanında yürüyoruz.",
  },
  {
    icon: <FaClipboardList />,
    title: "Hazır programlar değil, kişiye özel stratejiler yazıyoruz.",
    description: "Her öğrencinin hedefi, alışkanlığı, ritmi farklıdır. Biz ezbere değil, analizle plan yaparız.",
  },
  {
    icon: <FaUserCheck />,
    title: "Öğrenciyi sadece notla değil, karakteriyle takip ederiz.",
    description: "Bir öğrencinin başarısı sadece netle ölçülmez. Biz çabanın, tutarlılığın, dönüşümün izini süreriz.",
  },
  {
    icon: <FaUsers />,
    title: "Aileyi sürecin dışına itmeyiz, birlikte hareket ederiz.",
    description: "Veliyle düzenli iletişim kurar, öğrencinin duygusal sürecini de paylaşırız. Bu bir ekip işidir.",
  },
  {
    icon: <FaSeedling />,
    title: ' "Bugün çalışmadım" demek korkulacak şey değil.',
    description: "Çünkü biz öğrenciye suçluluk değil, çözüm sunarız. Bizimle birlikte olan öğrenci, yeniden ayağa kalkmayı öğrenir.",
  }
];


const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const Bubbles = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <span
        key={i}
        className="absolute bottom-[80px] w-3 h-3 bg-[rgba(173,216,230,0.5)] rounded-full animate-rise z-[1] pointer-events-none blur-[1px] max-[768px]:bottom-[50px] max-[768px]:w-2 max-[768px]:h-2"
        style={{ left: `${10 + i * 8}%`, animationDelay: `${i * 0.7}s` }}
      />
    ))}
  </>
);

const FloatingFish = () => (
  <div className="absolute bottom-[100px] right-[10%] z-[2] animate-swim-left pointer-events-none max-[768px]:bottom-[60px] max-[768px]:right-[5%]">
    <Lottie animationData={fishAnimation} loop={true} style={{ width: 80, height: 80 }} />
  </div>
);

const WhyChooseUs = () => {
  return (
    <motion.section
      className="relative py-20 px-4 bg-white text-center max-[768px]:py-10"
      id="neden-biz"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container">
        <motion.h2 className="text-[2rem] font-bold text-[#1e293b] mb-12 max-[768px]:text-[1.4rem] max-[768px]:mb-6" variants={cardVariants}>
          Neden Sözderece Koçluk?
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-8 max-[768px]:gap-4">
          {reasons.map((reason, index) => (
            <motion.div
              className="group bg-white rounded-[5rem] p-8 w-[320px] shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 relative z-[1] hover:-translate-y-[6px] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:bg-[#aed2e0] max-[768px]:w-[90%] max-[768px]:p-5 max-[768px]:rounded-[2rem]"
              key={index}
              variants={cardVariants}
            >
              <div className="text-[2rem] text-[#e27107] mb-4 max-[768px]:text-[1.5rem] max-[768px]:mb-2.5">{reason.icon}</div>
              <h3 className="text-[1.2rem] text-[#00174e] font-semibold mb-2 max-[768px]:text-base max-[768px]:mb-1">{reason.title}</h3>
              <p className="text-base text-[#475569] leading-[1.4] group-hover:text-[#f8f8f8] max-[768px]:text-[0.85rem] max-[768px]:leading-[1.3]">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Bubbles />
      <FloatingFish />
      <img src={waveBottom} alt="wave background" className="absolute bottom-0 left-0 w-full opacity-30 z-0 pointer-events-none" />
    </motion.section>
  );
};

export default WhyChooseUs;
