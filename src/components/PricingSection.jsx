import { useMemo } from "react";
import { Link } from "react-router-dom";
import "../cssFiles/PricingSection.css";

import {
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaSmile,
} from "react-icons/fa";


import { PACKAGES, PACKAGES_ORDER } from "../hooks/packages.js";

function PricingSection() {
  // Vitrin sırasına göre 4 paket
  const list = useMemo(
    () => PACKAGES_ORDER.map((k) => PACKAGES[k]).filter(Boolean),
    []
  );

  return (
    <div className="pricing-section" id="paketler">
      <h2 className="pricing-section-title">Koçluk & Özel Ders Paketleri</h2>
      <p className="pricing-section-sub">Bütçenize ve ihtiyacınıza uygun çözümü seçin.</p>

      {/* 4'lü paket ızgarası */}
      <div className="pricing-grid">
        {list.map((p) => {
          const isTutoringOnly = p.unitPrice == null || p.type === "tutoring_only";
          return (
            <article key={p.slug} className="pricing-card">
              <div className="pricing-head">
                <h3 className="pricing-name">{p.title}</h3>
                <div className="pricing-price">{p.priceText}</div>
                <p className="pricing-note">{p.subtitle}</p>
              </div>

              <ul className="pricing-features">
                {(p.features || []).map((f, i) => (
                  <li key={i} className={`feat ${f.included ? "on" : "off"}`}>
                    <span className="tick" aria-hidden>
                      {f.included ? "✓" : "—"}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              {/* CTA: Özel Ders → /ogretmenler, diğerleri → /paket-detay?slug=... */}
              {isTutoringOnly ? (
                <Link className="pricing-cta" to="/ogretmenler">
                  Öğretmen seç ve ders al
                </Link>
              ) : (
                <Link className="pricing-cta" to={`/paket-detay?slug=${encodeURIComponent(p.slug)}`}>
                  Paketi seç
                </Link>
              )}

              <p className="verified-paragraph">
                <img src="/images/verified.png" alt="doğrulama simgesi" />
                5 gün içinde koşulsuz cayma hakkı
              </p>
            </article>
          );
        })}
      </div>

      {/* Bilgilendirici faydalar (mevcut blok korunuyor) */}
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
    points: ["Net-zaman takibi", "Gelişim çizelgesi", "Net Artışı"],
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

export default PricingSection;
