import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import coachImage from "../assets/manager.svg";


const faqs = [
  {
    question: "Sözderece Koçluk hizmeti kimler için uygundur?",
    answer: "Sözderece Koçluk sistemi, LGS ve YKS (TYT–AYT) sürecinde hedeflerine disiplinli ve motive şekilde ulaşmak isteyen tüm öğrenciler için uygundur. Hem sürece yeni başlayanlar hem de düzen oturtmakta zorlanan öğrenciler bu sistemden fayda görebilir.",
  },
  {
    question: "Sözderece YKS/LGS paketini aldıktan sonra süreç nasıl işler?",
    answer: "Paketi satın aldıktan birkaç saat içinde destek ekibimiz sizinle iletişime geçer.Ardından koçunuzla tanışma ve genel durum değerlendirmesi yapılır. Veli görüşmesiyle birlikte süreç resmen başlatılır.",
  },
  {
    question: "Sözderece ile görüşmeler nasıl gerçekleşiyor?",
    answer: "Tüm birebir görüşmelerimiz Zoom veya Google Meet üzerinden online olarak gerçekleşir.Görüşme sırasında öğrenci ve koç birlikte haftalık program hazırlar, hedefler belirlenir, motivasyon desteği sağlanır.",
  },
  {
    question: "Sözderece koçumu değiştirebilir miyim?",
    answer: "Evet, koç değişikliği yapabilirsiniz.İlk 5 gün içinde koşulsuz olarak, ya da ilk ayın sonunda ihtiyaç duyulursa koçunuz değiştirilebilir.",
  },
  {
    question: "Veli bilgilendirmesi yapılıyor mu?",
    answer: "Evet. Velilerimizin istediği her an velilerimize durum bilgilendirmesi hakkında görüşmeler yapılır.Bu görüşmelerde öğrencinin gelişimi, motivasyonu ve ihtiyaçları detaylı olarak paylaşılır. Böylece koç–öğrenci–veli arasında şeffaf ve güvenli bir iletişim kurulur.",
  },
  {
    question: "Programlar hazır mı veriliyor, kişiye özel mi hazırlanıyor?",
    answer: "Tüm programlar öğrenciyle birlikte, bireysel ihtiyaçlara göre sıfırdan hazırlanır.Hiçbir plan hazır ya da otomatik değildir.",
  },
  {
    question: "Motivasyon desteği nasıl sağlanıyor?",
    answer: "Koçlar öğrencilerle sadece ders değil, duygu bazlı iletişim de kurar.Motivasyon eksikliğinde yönlendirici olur, öğrenciyi \"başarabilirim\" inancına geri getirir.",
  },
  {
    question: "Koşulsuz iptal/iade hakkı nedir?",
    answer: "Satın aldığınız paketten memnun kalmazsanız, ilk 5 gün içinde koşulsuz cayma ve iade hakkınızı kullanabilirsiniz.Bu süreçte herhangi bir gerekçe bildirmeniz gerekmez.",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};


export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.section
      className="relative py-[60px] px-5 max-w-[900px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-center text-[2rem] font-bold mb-10 max-[600px]:text-[26px]">Sıkça Sorulan Sorular</h2>
      <div className="flex flex-col gap-5">
        {faqs.map((item, index) => (
          <motion.div
            key={index}
            className={`border rounded-xl p-5 bg-white transition-all duration-300 relative cursor-pointer hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] ${
              activeIndex === index
                ? "border-[#6366f1] bg-[#f5f7ff] shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                : "border-[#ddd]"
            }`}
            onClick={() => toggleFAQ(index)}
            variants={itemVariants}
          >
            <motion.div
              className="flex justify-between items-center cursor-pointer font-semibold text-[1.1rem] transition-colors duration-300 hover:text-[#1106f0]"
              onClick={() => toggleFAQ(index)}
              whileTap={{ scale: 0.98 }}
            >
              <span>{item.question}</span>
              <motion.div
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-[20px] transition-all duration-300"
              >
                {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </motion.div>
            </motion.div>
            <div
              className={`transition-all duration-[400ms] overflow-hidden text-base font-bold text-[#1e1e1e] ${
                activeIndex === index
                  ? "max-h-[300px] opacity-100 translate-y-0 pt-3"
                  : "max-h-0 opacity-0 -translate-y-2.5"
              }`}
            >
              <p className="m-0 leading-[1.6] text-[#f1670b]">{item.answer}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.img
        src={coachImage}
        alt="Koç"
        className="absolute top-0 right-0 w-[180px] opacity-90 z-0 pointer-events-none animate-float-up-down hidden md:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </motion.section>
  );
}
