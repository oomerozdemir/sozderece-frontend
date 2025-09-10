// src/components/PricingSection.jsx
import "../cssFiles/PricingSection.css";
import {
  FaUserCheck,
  FaChalkboardTeacher,
  FaHeadset,
  FaBookOpen,
  FaCheck,
  FaTimes,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaSmile,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PACKAGES, PACKAGES_ORDER } from "../data/packages"; // ✅ tek kaynak

function FeatureItem({ label, included }) {
  return (
    <li className={`feat ${included ? "on" : "off"}`}>
      <span className="tick">{included ? <FaCheck /> : <FaTimes />}</span>
      <span>{label}</span>
    </li>
  );
}

const iconForType = (type) => {
  switch (type) {
    case "tutoring_only":
      return <FaBookOpen />;
    case "hybrid_light":
      return <FaChalkboardTeacher />;
    case "coaching_only":
      return <FaUserCheck />;
    case "coaching_plus_tutoring":
      return <FaHeadset />;
    default:
      return <FaUserCheck />;
  }
};

const badgeForType = (type) => {
  switch (type) {
    case "tutoring_only":
      return "Özel Ders";
    case "hybrid_light":
      return "Ara Paket";
    case "coaching_only":
      return "Koçluk";
    case "coaching_plus_tutoring":
      return "En Kapsamlı";
    default:
      return "";
  }
};

const benefitItems = [
  {
    title: "Koçluk Görüşmeleri",
    icon: <FaChalkboardTeacher />,
    points: ["Birebir takip sistemi", "Planlama & geri bildirim", "Motivasyon desteği"],
  },
  {
    title: "Kişiye Özel Planlama",
    icon: <FaCalendarCheck />,
    points: ["Haftalık/derslik program", "Deneme sonuçlarına göre güncelleme"],
  },
  {
    title: "Deneme Analizi",
    icon: <FaChartLine />,
    points: ["Net-zaman takibi", "Gelişim çizelgesi", "Net artışı"],
  },
  {
    title: "Soru & Kaynak Takibi",
    icon: <FaClipboardList />,
    points: ["Yayın takibi", "Eksik konu yönlendirmesi"],
  },
  {
    title: "Veliyle Etkileşim",
    icon: <FaUsers />,
    points: ["Aylık geri bildirim", "Veli–koç iletişimi"],
  },
  {
    title: "Psikolojik Destek",
    icon: <FaSmile />,
    points: ["Stres yönetimi", "Sınav taktikleri"],
  },
];

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <div className="pricing-section" id="paketler">
      <h2 className="pricing-section-title">Hedefine Göre Paketler</h2>
      <p className="pricing-section-sub">
        Özel dersten tam kapsamlı YKS/LGS koçluğuna uzanan seçenekler.
      </p>

      <div className="pricing-grid">
        {PACKAGES_ORDER.map((key) => {
          const p = PACKAGES[key];
          if (!p) return null;

          const icon = iconForType(p.type);
          const badge = badgeForType(p.type);

          return (
            <div key={p.slug} className="pricing-card">
              {badge && <div className="badge">{badge}</div>}

              <div className="pricing-head">
                <div className="package-icon">{icon}</div>
                <h3 className="pricing-name">{p.title}</h3>

                {p.priceText && <div className="pricing-price">{p.priceText}</div>}
                {p.subtitle && <p className="pricing-note">{p.subtitle}</p>}
              </div>

              {Array.isArray(p.features) && (
                <ul className="pricing-features">
                  {p.features.map((f, i) => (
                    <FeatureItem key={i} label={f.label} included={!!f.included} />
                  ))}
                </ul>
              )}

              {p.cta?.href && (
                <button className="pricing-cta" onClick={() => navigate(p.cta.href)}>
                  {p.cta.label || "Detayları Gör"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h3 className="benefit-title">YKS/LGS Koçluk Paketi Size Ne Kazandırır?</h3>
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
    </div>
  );
}
