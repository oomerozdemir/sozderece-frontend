import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaShieldAlt, 
  FaHeadset, 
  FaCreditCard, 
  FaChevronDown, 
  FaChevronUp 
} from "react-icons/fa";

// Bileşenler ve Veri
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { PACKAGES } from "../hooks/packages";
import Testimonials from "../components/Testimonials";
import "../cssFiles/packageDetail.css";

const PackageDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL'den gelen slug'ı yakala
  const querySlug = new URLSearchParams(location.search).get("slug");
  
  const packageList = useMemo(() => Object.values(PACKAGES).filter((p) => !p.hidden), []);

  // DEĞİŞİKLİK BURADA: Varsayılan olarak her zaman "kocluk-2026" (Tam Kapsamlı Paket) seçilsin.
  // Eğer bu ID değişirse burayı güncellemeniz gerekir.
  const defaultSlug = "kocluk-2026";

  // Eğer URL'de slug varsa onu kullan, yoksa belirlediğimiz varsayılanı kullan
  const [selectedSlug, setSelectedSlug] = useState(querySlug || defaultSlug);
  const [activeIndex, setActiveIndex] = useState(null);

  // URL değişirse (örn: kullanıcı geri giderse) state'i güncelle
  useEffect(() => {
    if (querySlug && PACKAGES[querySlug]) {
      setSelectedSlug(querySlug);
    } else if (!querySlug) {
      // Slug yoksa varsayılanı set et
      setSelectedSlug(defaultSlug);
    }
  }, [querySlug, defaultSlug]);

  const selected = PACKAGES[selectedSlug] || PACKAGES[defaultSlug];

  if (!selected) return <div className="loading-screen">Yükleniyor...</div>;

  const isSpecialTutoring = selected.type === "tutoring_only" || selected.slug === "ozel-ders-paketi";

  const handleContinue = () => {
    if (isSpecialTutoring) {
      navigate("/ogretmenler");
    } else {
      navigate(`/pre-auth?slug=${encodeURIComponent(selected.slug)}`);
    }
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const features = (selected.features || []).map(f => 
    typeof f === "string" ? { label: f, included: true } : f
  );

  const defaultFaq = [
    { title: "Ödeme güvenli mi?", content: "Evet, tüm ödemeler 256-bit SSL ve 3D Secure ile korunmaktadır." },
    { title: "İade politikanız nedir?", content: "Paket başladıktan sonraki ilk 5 gün koşulsuz iade hakkınız vardır." }
  ];
  const faqList = [...(selected.faq || []), ...defaultFaq];

  return (
    <>
      <Helmet>
        <title>{selected.title} | Sözderece Koçluk</title>
        <meta name="description" content={selected.subtitle} />
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="pd-wrapper">
        <div className="pd-container">
          
          {/* --- TEK KOLON: BİLGİLER --- */}
          <div className="pd-info">
            <div className="pd-header-center">
                <span className="pd-badge">
                {isSpecialTutoring ? "Özel Ders" : "En Çok Tercih Edilen"}
                </span>
                <h1 className="pd-title">{selected.title}</h1>
                <p className="pd-subtitle">{selected.subtitle}</p>
            </div>

            {/* Fiyat Alanı */}
            <div className="pd-price-box">
              <span className="pd-price">{selected.priceText}</span>
              <p className="pd-vat">Tüm vergiler dahildir.</p>
            </div>

            {/* İndirim Uyarısı */}
            {!isSpecialTutoring && (
              <div className="pd-discount-box">
                🎁 <strong>Sozderece200</strong> kodu ile sepette anında <strong>200₺ indirim</strong> kazan!
              </div>
            )}

            {/* Paket Seçimi Dropdown */}
            <div className="pd-select-group">
              <label>Paket Seçenekleri:</label>
              <select 
                value={selectedSlug} 
                onChange={(e) => {
                  setSelectedSlug(e.target.value);
                  // URL'i güncelle ama sayfayı yenileme (client-side routing)
                  navigate(`?slug=${e.target.value}`, { replace: true });
                }}
              >
                {packageList.map(p => (
                  <option key={p.slug} value={p.slug}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Özellikler Listesi */}
            <ul className="pd-features">
              {features.map((f, i) => (
                <li key={i} className={f.included ? "inc" : "exc"}>
                  {f.included ? <FaCheckCircle className="icon-check"/> : <FaTimesCircle className="icon-cross"/>}
                  {f.label}
                </li>
              ))}
            </ul>

            {/* Güven Rozetleri */}
            <div className="pd-trust">
              <div className="trust-item"><FaShieldAlt /> %100 Güvenli Ödeme</div>
              <div className="trust-item"><FaHeadset /> 7/24 Destek</div>
              <div className="trust-item"><FaCreditCard /> Taksit İmkanı</div>
            </div>

            {/* CTA Butonu */}
            <button className="pd-cta-btn" onClick={handleContinue}>
              {isSpecialTutoring ? "Öğretmenleri İncele" : "Hemen Başla (Güvenli Ödeme)"}
            </button>

            {/* Ödeme Logoları */}
            <div className="pd-payment-logos">
                <img src="/images/kare-logo-mastercard.webp" alt="Mastercard" />
                <img src="/images/kare-logo-visa.webp" alt="Visa" />
                <img src="/images/kare-logo-troy.webp" alt="Troy" />
                <img src="/images/kare-logo-paytr.webp" alt="PayTR" />
            </div>
            
            {/* SSS Accordion */}
            <div className="pd-faq">
              <h3>Sıkça Sorulan Sorular</h3>
              {faqList.map((item, idx) => (
                <div key={idx} className={`faq-item ${activeIndex === idx ? "active" : ""}`}>
                  <button className="faq-head" onClick={() => toggleAccordion(idx)}>
                    {item.title}
                    {activeIndex === idx ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  <div className="faq-body">
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Testimonials />
      
      <Footer />
    </>
  );
};

export default PackageDetail;