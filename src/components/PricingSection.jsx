import "../cssFiles/PricingSection.css";
import {
  FaUserCheck,
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaSmile,
  FaBookOpen,
  FaHeadset,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Feature({ label, on }) {
  return (
    <li className={`feat ${on ? "on" : "off"}`}>
      <span className="tick">{on ? <FaCheck /> : <FaTimes />}</span>
      <span>{label}</span>
    </li>
  );
}

export default function PricingSection() {
  const navigate = useNavigate();

  const packages = [
    {
      slug: "ozel-ders",
      name: "Özel Ders Paketi",
      priceText: "500 TL'den başlayan",
      priceNote:
        "Alanında uzman öğretmenlerden istediğin dersten birebir özel ders.",
      icon: <FaBookOpen />,
      ctaText: "Özel Ders Bul",
      onClick: () => navigate("/ogretmenler"),
      features: [
        { label: "Alanında uzman öğretmen", on: true },
        { label: "İstediğin dersten birebir ders", on: true },
        { label: "Soru çözümü ve konu anlatımı", on: true },
        { label: "Kişiye özel koçluk takibi", on: false },
        { label: "Haftalık/aylık planlama", on: false },
        { label: "WhatsApp iletişimi", on: false },
      ],
      badge: "Özel Ders",
    },
    {
      slug: "hazir-ozel-ders",
      name: "Özel Ders + Hazır YKS/LGS",
      priceText: "1500 ₺ / ay",
      priceNote:
        "Ara paket: koçluk sistemine alışma için bütçe dostu seçenek.",
      icon: <FaChalkboardTeacher />,
      ctaText: "Detayları Gör",
      onClick: () => navigate("/paket-detay?slug=hazir-ozel-ders"),
      features: [
        { label: "Alanında uzman öğretmen", on: true },
        { label: "Aylık koçluk programı (hazır şablon)", on: true },
        { label: "2. haftada 40 dk online görüşme", on: true },
        { label: "Seçtiğin hocadan 1 özel ders hakkı", on: true },
        { label: "7/24 takip", on: false },
        { label: "Sürekli WhatsApp iletişimi", on: false },
      ],
      badge: "Ara Paket",
    },
    {
      slug: "kocluk-2026",
      name: "Koçluk Paketi (YKS/LGS 2026)",
      priceText: "2500 ₺ / ay",
      priceNote:
        "Hedefe yönelik birebir koçluk, programlama ve deneme takibi.",
      icon: <FaUserCheck />,
      ctaText: "Detayları Gör",
      onClick: () => navigate("/paket-detay"),
      features: [
        { label: "Hedefe yönelik birebir koçluk", on: true },
        { label: "Haftalık birebir görüşmeler", on: true },
        { label: "Kişiye özel haftalık/günlük program", on: true },
        { label: "Deneme analizi ve net gelişimi takibi", on: true },
        { label: "Kaynak yönlendirmesi & soru takibi", on: true },
        { label: "Sürekli motivasyon ve disiplin", on: true },
      ],
      badge: "Koçluk",
    },
    {
      slug: "kocluk-plus-ozel-ders",
      name: "Koçluk + Özel Ders",
      priceText: "3500 ₺ / ay",
      priceNote: "Koçluk sistemine ek düzenli özel ders desteği.",
      icon: <FaHeadset />,
      ctaText: "Detayları Gör",
      onClick: () => navigate("/paket-detay?slug=kocluk-plus-ozel-ders"),
      features: [
        { label: "Tam kapsamlı koçluk", on: true },
        { label: "Haftalık birebir görüşmeler", on: true },
        { label: "Kişiye özel program + deneme analizi", on: true },
        { label: "Düzenli özel ders (aylık)", on: true },
        { label: "Sürekli iletişim ve takip", on: true },
        { label: "Motivasyon & psikolojik destek", on: true },
      ],
      badge: "En Kapsamlı",
    },
  ];

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

  return (
    <div className="pricing-section" id="paketler">
      <h2 className="pricing-section-title">Bütçene ve Hedefine Göre Paketler</h2>
      <p className="pricing-section-sub">
        Özel dersten tam kapsamlı koçluğa uzanan seçenekler.
      </p>

      <div className="pricing-grid">
        {packages.map((p) => (
          <div key={p.slug} className="pricing-card">
            <div className="badge">{p.badge}</div>
            <div className="pricing-head">
              <div className="package-icon">{p.icon}</div>
              <h3 className="pricing-name">{p.name}</h3>
              <div className="pricing-price">{p.priceText}</div>
              <p className="pricing-note">{p.priceNote}</p>
            </div>

            <ul className="pricing-features">
              {p.features.map((f, i) => (
                <Feature key={i} label={f.label} on={f.on} />
              ))}
            </ul>

            <button className="pricing-cta" onClick={p.onClick}>
              {p.ctaText}
            </button>
          </div>
        ))}
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
