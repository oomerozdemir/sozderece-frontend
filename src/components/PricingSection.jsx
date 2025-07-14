import "../cssFiles/PricingSection.css";
import { motion } from "framer-motion";
import { FaUserCheck, FaChalkboardTeacher, FaCalendarCheck, FaChartLine, FaClipboardList, FaUsers, FaSmile } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const packageData = {
  name: "Koçluk Paketi (LGS/YKS 2026)",
  price: "2800₺ / ay",
  subtitle:
    "Hedefe yönelik birebir koçluk, programlama, deneme takibi ve veli bilgilendirmesi.",
  features: [
    "Haftalık birebir koçluk görüşmeleri",
    "Kişiye özel haftalık/günlük program",
    "Deneme analizi ve net gelişimi takibi",
    "Soru takibi ve kaynak yönlendirmesi",
    "Düzenli veli bilgilendirmesi",
  ],
  icon: <FaUserCheck />,
};

const benefitItems = [
  {
    title: "Koçluk Görüşmeleri",
    icon: <FaChalkboardTeacher />,
    points: [
      "Birebir takip sistemi",
      "Planlama & geri bildirim",
      "Motivasyon desteği"
    ]
  },
  {
    title: "Kişiye Özel Planlama",
    icon: <FaCalendarCheck />,
    points: [
      "Haftalık/derslik program",
      "Deneme sonuçlarına göre güncelleme"
    ]
  },
  {
    title: "Deneme Analizi",
    icon: <FaChartLine />,
    points: [
      "Net-zaman takibi",
      "Gelişim çizelgesi"
    ]
  },
  {
    title: "Soru & Kaynak Takibi",
    icon: <FaClipboardList />,
    points: [
      "Yayın takibi",
      "Eksik konu yönlendirmesi"
    ]
  },
  {
    title: "Veliyle Etkileşim",
    icon: <FaUsers />,
    points: [
      "Aylık geri bildirim",
      "Veli–koç iletişimi"
    ]
  },
  {
    title: "Psikolojik Destek",
    icon: <FaSmile />,
    points: [
      "Stres yönetimi",
      "Sınav taktikleri"
    ]
  }
];

function PricingSection() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="pricing-section"
      id="paketler"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h2 className="pricing-section-title">
        Koçluk Paketimiz
      </motion.h2>

      <div className="pricing-card-horizontal no-image">
        <div className="pricing-card-content">
          <h3>
            <span className="package-icon">{packageData.icon}</span>{" "}
            {packageData.name}
          </h3>
          <p className="pricing-subtitle">{packageData.subtitle}</p>
          <p className="price">{packageData.price}</p>
          <ul>
            {packageData.features.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
          <button
            className="pricing-button"
            onClick={() => navigate("/package-detail")}
          >
            Hemen Başla!
          </button>
        </div>
      </div>

      <h3 className="benefit-title">Bu Paket Size Ne Kazandırır?</h3>
      <div className="benefit-grid">
        {benefitItems.map((item, index) => (
          <div className="benefit-card" key={index}>
            <div className="benefit-icon">{item.icon}</div>
            <h4>{item.title}</h4>
            <ul>
              {item.points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default PricingSection;