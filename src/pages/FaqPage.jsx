import { useState } from "react";
import "../cssFiles/FaqSection.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import coachImage from "../assets/manager.svg";
import { Helmet } from "react-helmet";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Navbar from "../components/navbar";

const faqs = [
  {
    question: "Sözderece Koçluk hizmeti kimler için uygundur?",
    answer: "Sözderece Koçluk sistemi, LGS ve YKS (TYT–AYT) sürecinde hedeflerine disiplinli ve motive şekilde ulaşmak isteyen tüm öğrenciler için uygundur. Hem sürece yeni başlayanlar hem de düzen oturtmakta zorlanan öğrenciler bu sistemden fayda görebilir.",
  },
  {
    question: "Sözderece YKS/LGS paketini aldıktan sonra süreç nasıl işler?",
    answer:   "Paketi satın aldıktan birkaç saat içinde destek ekibimiz sizinle iletişime geçer.Ardından koçunuzla tanışma ve genel durum değerlendirmesi yapılır. Veli görüşmesiyle birlikte süreç resmen başlatılır.",
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
    answer: "Evet. Her 15 günde bir velilerle birebir görüşmeler yapılır.Bu görüşmelerde öğrencinin gelişimi, motivasyonu ve ihtiyaçları detaylı olarak paylaşılır. Böylece koç–öğrenci–veli arasında şeffaf ve güvenli bir iletişim kurulur.",
  },

  {
    question:  "Programlar hazır mı veriliyor, kişiye özel mi hazırlanıyor?",
    answer: "Tüm programlar öğrenciyle birlikte, bireysel ihtiyaçlara göre sıfırdan hazırlanır.Hiçbir plan hazır ya da otomatik değildir.",
  },
  {
    question: "Motivasyon desteği nasıl sağlanıyor?",
    answer:   "Koçlar öğrencilerle sadece ders değil, duygu bazlı iletişim de kurar.Motivasyon eksikliğinde yönlendirici olur, öğrenciyi “başarabilirim” inancına geri getirir.",
  },
  {
    question: "Koşulsuz iptal/iade hakkı nedir?",
    answer:   "Satın aldığınız paketten memnun kalmazsanız, ilk 5 gün içinde koşulsuz cayma ve iade hakkınızı kullanabilirsiniz.Bu süreçte herhangi bir gerekçe bildirmeniz gerekmez.",
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
    
    <>
<Helmet>
  <title>SSS | Sıkça Sorulan Sorular | Sözderece Koçluk</title>
  <meta
    name="description"
    content="Sözderece Koçluk sistemi, koç değişikliği, veli bilgilendirmesi, program özelleştirmesi ve daha fazlası hakkında sıkça sorulan soruları bu sayfada yanıtlıyoruz."
  />
  <meta
    name="keywords"
    content="öğrenci koçluğu nedir, veli bilgilendirmesi, online koçluk sistemi, koç değişikliği, sık sorulan sorular koçluk, sözderece, online eğitim koçluğu"
  />
  <meta property="og:title" content="Sıkça Sorulan Sorular - SSS | Sözderece Koçluk" />
  <meta
    property="og:description"
    content="Sözderece Koçluk hakkında en çok merak edilen soruları ve detaylı cevaplarını bu sayfada bulabilirsiniz. Öğrenci ve veli odaklı eğitim sistemi hakkında bilgi alın."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sozderecekocluk.com/sss" />
  <meta property="og:image" content="https://sozderecekocluk.com/images/hero-logo.webp" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://sozderecekocluk.com/sss" />

  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer,
        },
      })),
    })}
  </script>
</Helmet>

 <TopBar />
 <Navbar />
    <motion.section
  className="faq-section"
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
>
  
      <h2 className="faq-title">Sıkça Sorulan Sorular</h2>
      <p className="faq-intro-text">
  <strong>Sözderece Koçluk</strong> hakkında merak ettiklerinizi bu <strong>sıkça sorulan sorular</strong> bölümünde derledik.
  <strong> Öğrenci koçluğu nedir</strong>, <strong>koç değişikliği nasıl yapılır</strong> veya <strong>veli bilgilendirmesi nasıl gerçekleşir</strong> gibi sorularınızın cevabını burada bulabilirsiniz.
  Tüm <strong>online eğitim koçluğu</strong> süreci hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.
</p>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <motion.div
          key={index}
          className={`faq-item ${activeIndex === index ? "active" : ""}`}
          onClick={() => toggleFAQ(index)}
          variants={itemVariants}
        >
            <motion.div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              whileTap={{ scale: 0.98 }}
            >
              <span>  {item.question}</span>
              <motion.div
              animate={{ rotate: activeIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeIndex === index ? (
                <FaChevronUp className="icon" />
              ) : (
                <FaChevronDown className="icon" />
              )}
            </motion.div>
            
            </motion.div>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
            
          </motion.div>
          
        ))}
      </div>
      <motion.img
        src={coachImage}
        alt="Koç"
        className="faq-coach"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </motion.section>
    <Footer />

    </>
  );
}
