import "../cssFiles/WhyChooseUs.css";
import { motion } from "framer-motion";
import { FaHandsHelping, FaClipboardList, FaUserCheck, FaUsers, FaSeedling } from "react-icons/fa";

import waveBottom from "../assets/wave.svg";
import Lottie from "lottie-react";

import fishAnimation from "../assets/fish.json";

const reasons  = [
  {
    icon: <FaHandsHelping />,
    title: "Koçluk değil, yol arkadaşlığı sunuyoruz.",
    description: "Biz bir görev değil, bir güven bağı kuruyoruz. Öğrencinin duygusunu, inişini çıkışını anlıyor; yanında yürüyoruz.",
    
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
    title: " “Bugün çalışmadım” demek korkulacak şey değil.",
    description: "Çünkü biz öğrenciye suçluluk değil, çözüm sunarız. Bizimle birlikte olan öğrenci, yeniden ayağa kalkmayı öğrenir.",
    
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
const Bubbles = () => {
  return (
    <>
      {[...Array(10)].map((_, i) => (
        <span className="bubble" key={i} style={{ left: `${10 + i * 8}%`, animationDelay: `${i * 0.7}s` }} />
      ))}
    </>
  );
};
const FloatingFish = () => {
  return (
    <div className="floating-fish">
      <Lottie
        animationData={fishAnimation}
        loop={true}
        style={{ width: 80, height: 80 }}
      />
    </div>
  );
};

const WhyChooseUs = () => {
  return (
   <motion.section
  className="why-choose-us-modern"
  id="neden-biz"
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
>
  <div className="container">
    <motion.h2 className="modern-title" variants={cardVariants}>
      Neden Bizi Tercih Etmelisiniz?
    </motion.h2>

    <div className="card-grid">
      {reasons.map((reason, index) => (
        <motion.div
          className={`card ${reason.featured ? "featured" : ""}`}
          key={index}
          variants={cardVariants}
        >
          

          <div className="icon">{reason.icon}</div>
          <h3>{reason.title}</h3>
          <p>{reason.description}</p>
        </motion.div>
      ))}
    </div>

  </div>
  <Bubbles />

      <FloatingFish />
      <img src={waveBottom} alt="wave background" className="wave-decor" />

</motion.section>
  );
};

export default WhyChooseUs;
