import "../cssFiles/PricingSection.css";
import { motion } from "framer-motion";
import { FaUserCheck, FaStar, FaChalkboardTeacher } from "react-icons/fa";
// import useCart from "../hooks/useCart";
import { useNavigate } from "react-router-dom";


const packages = [
  /*{
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
  },*/
  {
    name: "LGS 2026 PAKETİ",
    price: "2800₺ / ay",
    subtitle: "",
    features: [
      "Her Hafta Hedef Belirleme",
      "Kişiye Özel Haftalık/Günlük program",
      "Takip, Motivasyon ve Yönlendirme",
      "Türkçe, Matematik, Fen, İnkılap, Din, İngilizce analizleri",
      "Net gelişimi – Yanlış nedenleri – Süre kontrolü",
      "Kaynak Takibi",
      "Düzenli Veli Bilgilendirmesi",
      "Tekrar planlaması",
      "Motivasyon Takviyeleri",

      
    ],
    badge: null,
    highlight: true,
    icon: <FaStar />,
  },
 {
  name: "YKS 2026 PAKETİ",
  price: "2800₺ / ay",
  subtitle: "",
  features: [
    " Haftalık Koçluk Görüşmeleri",
    "  Birebir takip sistemi",
  
    " Kişiye Özel Ders ve Soru Dağılım Planı",
    " Eksik–güçlü ders analizine göre haftalık program",
    " Deneme sonuçlarına göre dinamik güncellemeler",

    " TYT–AYT deneme analizleri",
    " Net sayısı ve zaman yönetimi takibi",
    " Gelişim çizelgesi",

    " Soru Takibi ve Kaynak Yönetimi",
    " Eksik kalan konulara göre yönlendirme",
    " Düzenli Birebir İletişim (WhatsApp–Telefon)",
    " Koç–öğrenci–veli üçgeninde güçlü iletişim",
    " Sınav Haftalarında Psikolojik Destek",
    " Sınav öncesi stres yönetimi",
    " Sınav günü taktikleri ve rahatlama önerileri",
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
      <motion.h2 className="pricing-section-title" variants={cardVariants}>
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
