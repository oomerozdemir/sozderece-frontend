import "../cssFiles/PricingSection.css";
import { motion } from "framer-motion";
import { FaUserCheck, FaStar, FaChalkboardTeacher } from "react-icons/fa";
// import useCart from "../hooks/useCart";
import { useNavigate } from "react-router-dom";


const packages = [
  {
    name: "TEK DERS PAKETİ",
    price: "700₺ / ders",
    subtitle: "Sadece birebir özel derse odaklanan esnek paket.",
    features: [
      "Alanında uzman öğretmen ile 1:1 özel ders",
      "40–60 dakikalık birebir online görüşme",
      "Eksik analizi + konu anlatımı + uygulama",
      "Ders sonunda gelişim değerlendirmesi",
      "Koçluk ve takip içermez"
    ],
    badge: null,
    highlight: false,
     icon: <FaChalkboardTeacher />,
  },
  {
    name: "LGS 2026 PAKETİ",
    price: "3000₺ / ay",
    subtitle: "Disiplinli bir sınav süreci için ihtiyaç duyduğun temel destek burada!",
    features: [
      "Haftalık birebir koçluk görüşmesi",
      "Kişiye özel haftalık/günlük program",
      "Sabah-akşam WhatsApp takibi",
      "Her ay 4 deneme sınavı",
      "1 hafta ücretsiz deneme",
      "15 günde bir veliye gelişim raporu"
    ],
    badge: null,
    highlight: false,
    icon: <FaUserCheck />,
  },
  {
    name: "YKS 2026 PAKETİ",
    price: "3000₺ / ay",
    subtitle: "Koçluk + birebir özel ders + 7/24 destek isteyenler için.",
    features: [
      "Öğrenciyi Derinlemesine Tanıma ve Seviye Belirleme",
      "Kişiye Özel Haftalık Ders ve Çalışma Programı",
      "Her Gün Birebir Takip ve Günlük Destek",
      "Haftalık Önerilen Yayından Deneme Sınavları ve Detaylı Geri Bildirim",
      "Veliyle Şeffaf ve Sürekli İletişim",
      " Seviyeye Uygun Kaynak ve İçerik Önerileri",
      " Sınav Öncesi Yoğun Prova ve Strateji Desteği",

    ],
    highlight: true,
    icon: <FaStar />,
  },
  
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};



function PricingSection() {
// const { addToCart } = useCart();
const navigate = useNavigate();


  return (
    
    <motion.div
      className="pricing-section"
      id="paketler"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h2 className="section-title" variants={cardVariants}>
        Koçluk Paketlerimiz
      </motion.h2>
      <div className="pricing-cards">
        {packages.map((pkg, index) => (
          <motion.div
            key={index}
            className={`pricing-card ${pkg.highlight ? "highlight" : ""}`}
            variants={cardVariants}
          >
            {pkg.badge && <div className="badge">{pkg.badge}</div>}
            <h3>
              <span className="package-icon">{pkg.icon}</span> {pkg.name}
            </h3>
            <p className="pricing-subtitle">{pkg.subtitle}</p>
            <p className="price">{pkg.price}</p>
            <ul>
              {pkg.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
<button
  className="pricing-button"
  onClick={() => navigate(`/package-detail`)}
>
  Hemen Başla
</button>




          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default PricingSection;
