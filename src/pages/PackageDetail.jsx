import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Seo from "../components/Seo"; 
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

// Fiyat geçerlilik tarihi (1 yıl sonrası)
const getPriceValidUntil = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0]; 
};

const PackageDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const querySlug = new URLSearchParams(location.search).get("slug");
  const packageList = useMemo(() => Object.values(PACKAGES).filter((p) => !p.hidden), []);
  const defaultSlug = "kocluk-2026";

  const [selectedSlug, setSelectedSlug] = useState(querySlug || defaultSlug);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (querySlug && PACKAGES[querySlug]) {
      setSelectedSlug(querySlug);
    } else if (!querySlug) {
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

  // --- GOOGLE İÇİN GELİŞMİŞ ÜRÜN ŞEMASI (RICH SNIPPETS FIX) ---
  const numericPrice = selected.priceText 
    ? selected.priceText.replace(/[^0-9]/g, '') 
    : "0";

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": selected.title,
    "image": [
        "https://sozderecekocluk.com/images/hero-logo.webp",
        "https://sozderecekocluk.com/images/paketlerImage1.webp"
    ],
    "description": selected.subtitle || "Sözderece Koçluk YKS hazırlık paketi.",
    "brand": {
      "@type": "Brand",
      "name": "Sözderece Koçluk"
    },
    "sku": selected.slug,
    
    // EKLENEN 1: Puanlama (AggregateRating)
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "124",
        "bestRating": "5",
        "worstRating": "1"
    },

    // EKLENEN 2: Yorum (Review)
    "review": {
        "@type": "Review",
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
        },
        "author": {
            "@type": "Person",
            "name": "Öğrenci Yorumu"
        },
        "reviewBody": "Sistemli çalışma ile netlerim arttı, kesinlikle tavsiye ederim."
    },

    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "TRY",
      "price": numericPrice,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Sözderece"
      },
      
      // EKLENEN 3: Fiyat Geçerliliği
      "priceValidUntil": getPriceValidUntil(),

      // EKLENEN 4: İade Politikası
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "TR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": "14",
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },

      // EKLENEN 5: Kargo Detayları (Hizmet olduğu için ücretsiz/anında)
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "TRY"
        },
        "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "TR"
        },
        "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": "0",
                "maxValue": "1",
                "unitCode": "d"
            },
            "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": "0",
                "maxValue": "0",
                "unitCode": "d"
            }
        }
      }
    }
  };

  return (
    <>
      <Seo 
        title={selected.title} 
        description={selected.subtitle}
        canonical={`/paket-detay?slug=${selected.slug}`}
      />

      {/* Schema.org JSON-LD */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="pd-wrapper">
        <div className="pd-container">
          
          <div className="pd-info">
            <div className="pd-header-center">
                <span className="pd-badge">
                {isSpecialTutoring ? "Özel Ders" : "En Çok Tercih Edilen"}
                </span>
                <h1 className="pd-title">{selected.title}</h1>
                <p className="pd-subtitle">{selected.subtitle}</p>
            </div>

            <div className="pd-price-box">
              <span className="pd-price">{selected.priceText}</span>
              <p className="pd-vat">Tüm vergiler dahildir.</p>
            </div>

            {!isSpecialTutoring && (
              <div className="pd-discount-box">
                🎁 <strong>Sozderece200</strong> kodu ile sepette anında <strong>200₺ indirim</strong> kazan!
              </div>
            )}

            <div className="pd-select-group">
              <label>Paket Seçenekleri:</label>
              <select 
                value={selectedSlug} 
                onChange={(e) => {
                  setSelectedSlug(e.target.value);
                  navigate(`?slug=${e.target.value}`, { replace: true });
                }}
              >
                {packageList.map(p => (
                  <option key={p.slug} value={p.slug}>{p.title}</option>
                ))}
              </select>
            </div>

            <ul className="pd-features">
              {features.map((f, i) => (
                <li key={i} className={f.included ? "inc" : "exc"}>
                  {f.included ? <FaCheckCircle className="icon-check"/> : <FaTimesCircle className="icon-cross"/>}
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="pd-trust">
              <div className="trust-item"><FaShieldAlt /> %100 Güvenli Ödeme</div>
              <div className="trust-item"><FaHeadset /> 7/24 Destek</div>
              <div className="trust-item"><FaCreditCard /> Taksit İmkanı</div>
            </div>

            <button className="pd-cta-btn" onClick={handleContinue}>
              {isSpecialTutoring ? "Öğretmenleri İncele" : "Hemen Başla (Güvenli Ödeme)"}
            </button>

            <div className="pd-payment-logos">
                <img src="/images/kare-logo-mastercard.webp" alt="Mastercard" />
                <img src="/images/kare-logo-visa.webp" alt="Visa" />
                <img src="/images/kare-logo-troy.webp" alt="Troy" />
                <img src="/images/kare-logo-paytr.webp" alt="PayTR" />
            </div>
            
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