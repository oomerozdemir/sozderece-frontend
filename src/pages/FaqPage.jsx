import { useState } from "react";
import "../cssFiles/FaqSection.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Ahrefs uyarısı: <a> yerine <Link> kullanmalıyız
import coachImage from "../assets/manager.svg";
import { Helmet } from "react-helmet";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Navbar from "../components/navbar";
import Seo from "../components/Seo";

const faqs = [
  {
    question: "Sözderece Koçluk kimler için uygundur?",
    answer: "Hem düzenli çalışmayı oturtamayanlar hem de derece hedefleyenler için uygundur. YKS (TYT-AYT) ve LGS sürecinde; ne yapacağını bilemeyen, motivasyon kaybı yaşayan veya profesyonel bir yol haritasına ihtiyaç duyan her öğrenci sistemimizden maksimum verim alır.",
  },
  {
    question: "Ödeme seçenekleri neler? Taksit imkanı var mı?",
    answer: "Evet, tüm kredi kartlarına 12 taksite varan vade farksız/düşük farkla taksit imkanı sunuyoruz. Ödemeleriniz PayTR altyapısı ile 256-bit SSL güvencesiyle korunmaktadır. Ayrıca Havale/EFT seçeneğimiz de mevcuttur.",
  },
  {
    question: "Sisteme kayıt olduktan sonra süreç nasıl işliyor?",
    answer: "Kayıt sonrası en geç 2 saat içinde eğitim danışmanımız sizi arar. Akademik durumunuz analiz edilir ve size en uygun derece koçu atanır. Aynı gün koçunuzla tanışır, ilk haftalık programınızı yapar ve çalışmaya başlarsınız.",
  },
  {
    question: "Dershaneden veya özel dersten farkınız nedir?",
    answer: "Dershane size sadece ders anlatır, biz ise 'nasıl çalışmanız gerektiğini' öğretiriz. Özel ders haftada 1-2 saattir, biz ise 7/24 yanınızdayız. Koçunuz sadece bir öğretmen değil, bu yollardan başarıyla geçmiş bir yol arkadaşıdır.",
  },
  {
    question: "Memnun kalmazsam koçumu değiştirebilir miyim?",
    answer: "Kesinlikle. Enerjinizin uyuşması bizim için çok önemli. İlk 5 gün içinde koşulsuz olarak, veya ilerleyen süreçte talep etmeniz durumunda koç değişikliği hakkınız her zaman saklıdır.",
  },
  {
    question: "Netlerim ne zaman artmaya başlar?",
    answer: "Öğrenciden öğrenciye değişmekle birlikte, sistemimize tam uyum sağlayan öğrencilerimizde ortalama 3-4 hafta içinde gözle görülür bir çalışma disiplini ve deneme netlerinde artış gözlemliyoruz.",
  },
  {
    question: "Veli bilgilendirmesi yapıyor musunuz?",
    answer: "Evet, velilerimiz sürecin en önemli parçasıdır. Her 15 günde bir veli-koç görüşmesi yapılır. Öğrencinin gelişimi, eksikleri ve motivasyon durumu hakkında veliye detaylı rapor sunulur.",
  },
  {
    question: "Programlar kişiye özel mi hazırlanıyor?",
    answer: "Evet, 'kopyala-yapıştır' programlar kullanmıyoruz. Öğrencinin okul saatleri, seviyesi, hedefi ve yaşam tarzına göre her hafta sıfırdan, tamamen o kişiye özel bir program hazırlanır.",
  },
  {
    question: "İptal ve iade hakkım var mı?",
    answer: "Evet, güveniniz bizim için paradan daha değerli. Paketi satın aldıktan sonraki ilk 5 gün içinde hiçbir gerekçe göstermeksizin %100 ücret iadesi talep edebilirsiniz.",
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
      {/* 1. SEO BİLEŞENİ - Canonical düzeltildi */}
      <Seo 
        title="Sıkça Sorulan Sorular (SSS)" 
        description="Ödeme seçenekleri, iade garantisi, koçluk süreci ve başarı garantisi hakkında merak ettiğiniz tüm soruları yanıtladık."
        canonical="/sss"
      />

      {/* 2. SCHEMA - Google'da Soru-Cevap Çıkması İçin */}
      <Helmet>
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
        <h1 className="faq-title">Aklınızdaki Soruları Giderelim</h1> {/* h2 -> h1 (Sayfada 1 tane h1 olmalı) */}
        
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
                role="button" // Erişilebilirlik
                tabIndex={0}
              >
                <span>{item.question}</span>
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
        
        {/* Ahrefs Düzeltmesi: Görsele alt metin ve lazy loading eklendi */}
        <motion.img
          src={coachImage}
          alt="Sözderece Koçluk Destek Ekibi" 
          className="faq-coach"
          width="400" // CLS (Layout Shift) önlemek için yaklaşık boyutlar
          height="300"
          loading="lazy"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </motion.section>

      <div className="faq-cta">
        {/* Ahrefs Düzeltmesi: Internal linkler için <a> yerine <Link> kullanmalıyız. 
            Ayrıca /ucretsiz-on-gorusme sayfası yoksa var olan sayfaya yönlendirmeliyiz. */}
        <p>Hala sorularınız mı var? <Link to="/ucretsiz-on-gorusme">Ücretsiz Ön Görüşme</Link> formunu doldurun, sizi arayalım.</p>
      </div>
      
      <Footer />
    </>
  );
}