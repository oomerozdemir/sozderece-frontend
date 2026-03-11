import React, { useEffect, useState } from "react";
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

import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";

// Fiyat geçerlilik tarihi (Dinamik - 1 yıl sonrası)
const getPriceValidUntil = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
};

const defaultSlug = "kocluk-2026";

const PackageDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const querySlug = new URLSearchParams(location.search).get("slug");

  const [packages, setPackages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(querySlug || defaultSlug);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/packages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPackages(data.packages);
      })
      .catch((err) => console.error("Paketler yüklenemedi:", err));
  }, []);

  useEffect(() => {
    if (querySlug) {
      setSelectedSlug(querySlug);
    } else {
      const newUrl = `${location.pathname}?slug=${defaultSlug}`;
      window.history.replaceState(null, "", newUrl);
      setSelectedSlug(defaultSlug);
    }
  }, [querySlug, location.pathname]);

  const pkgMap = Object.fromEntries(packages.map((p) => [p.slug, p]));
  const selected = pkgMap[selectedSlug] || pkgMap[defaultSlug] || packages[0];

  if (!selected) return null;

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

  const features = (Array.isArray(selected.features) ? selected.features : []).map((f) =>
    typeof f === "string" ? { label: f, included: true } : f
  );

  const defaultFaq = [
    { title: "Ödeme güvenli mi?", content: "Evet, tüm ödemeler Paytr altyapısı ile korunmaktadır." },
    { title: "İade politikanız nedir?", content: "Koçluk programınız size verildikten sonraki ilk 5 gün içerisinde koşulsuz iade hakkınız vardır." }
  ];
  const faqList = [...defaultFaq];

  const numericPrice = selected.priceText
    ? selected.priceText.replace(/[^0-9.]/g, "")
    : String(selected.price || "0");

  const siteUrl = "https://sozderecekocluk.com";
  const canonicalUrl = `${siteUrl}/paket-detay?slug=${selected.slug}`;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": selected.name,
    "image": [`${siteUrl}/images/hero-logo.webp`, `${siteUrl}/images/paketlerImage1.webp`],
    "description": selected.subtitle || "Sözderece Koçluk YKS hazırlık paketi.",
    "brand": { "@type": "Brand", "name": "Sözderece Koçluk" },
    "sku": selected.slug,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "124", "bestRating": "5", "worstRating": "1" },
    "review": { "@type": "Review", "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "author": { "@type": "Person", "name": "Öğrenci Yorumu" }, "reviewBody": "Sistemli çalışma ile netlerim arttı, kesinlikle tavsiye ederim." },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "TRY",
      "price": numericPrice,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Sözderece" },
      "priceValidUntil": getPriceValidUntil(),
    }
  };

  return (
    <>
      <Seo
        title={selected.name}
        description={selected.subtitle}
        canonical={`/paket-detay?slug=${selected.slug}`}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="bg-[#f8f9fa] py-[60px] min-h-[80vh]">
        <div className="max-w-[800px] mx-auto px-5">

          <div className="bg-white p-[50px] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#eaeaea] max-[768px]:p-[25px]">
            <div className="text-center mb-[30px]">
              <span className="inline-block bg-[#e3f2fd] text-[#0f2a4a] font-bold py-1.5 px-4 rounded-[20px] text-[0.9rem] mb-[15px] tracking-wide uppercase">
                {isSpecialTutoring ? "Özel Ders" : "En Çok Tercih Edilen"}
              </span>
              <h1 className="text-[2.2rem] font-extrabold text-[#0f2a4a] mb-[15px] leading-[1.2] max-[768px]:text-[1.8rem]">{selected.name}</h1>
              <p className="text-[1.1rem] text-[#666] leading-[1.6] max-w-[600px] mx-auto">{selected.subtitle}</p>
            </div>

            <div className="text-center mb-[30px] pb-5 border-b border-[#f0f0f0]">
              <span className="text-[2.5rem] font-extrabold text-[#f39c12] max-[768px]:text-[2rem]">
                {selected.priceText || `${selected.price}₺`}
              </span>
              <p className="text-[0.9rem] text-[#999] mt-1">Tüm vergiler dahildir.</p>
            </div>

            {packages.length > 1 && (
              <div className="mb-[30px]">
                <label className="block font-semibold mb-2 text-[#333]">Paket Seçenekleri:</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => {
                    setSelectedSlug(e.target.value);
                    navigate(`?slug=${e.target.value}`, { replace: true });
                  }}
                  className="w-full py-3.5 px-3.5 border border-[#ddd] rounded-[10px] text-base bg-white cursor-pointer outline-none transition-all focus:border-[#f39c12]"
                >
                  {packages.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <ul className="list-none p-[25px] mb-10 bg-[#f9f9f9] rounded-[15px]">
              {features.map((f, i) => (
                <li key={i} className={`flex items-center gap-[15px] text-[1.05rem] mb-[15px] last:mb-0 ${f.included ? "text-[#444]" : "text-[#999] line-through opacity-70"}`}>
                  {f.included
                    ? <FaCheckCircle className="text-[#27ae60] text-[1.3rem] min-w-[24px]" />
                    : <FaTimesCircle className="text-[#ccc] text-[1.3rem] min-w-[24px]" />
                  }
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="flex justify-center gap-[30px] mb-[30px] flex-wrap max-[768px]:gap-[15px]">
              <div className="flex items-center gap-2 text-[0.9rem] text-[#555] font-semibold"><FaShieldAlt /> %100 Güvenli Ödeme</div>
              <div className="flex items-center gap-2 text-[0.9rem] text-[#555] font-semibold"><FaHeadset /> 7/24 Destek</div>
              <div className="flex items-center gap-2 text-[0.9rem] text-[#555] font-semibold"><FaCreditCard /> Taksit İmkanı</div>
            </div>

            <button
              className="w-full py-5 bg-[#f39c12] text-white border-0 rounded-xl text-[1.3rem] font-bold cursor-pointer transition-all shadow-[0_10px_25px_rgba(243,156,18,0.3)] mb-5 hover:bg-[#d35400] hover:-translate-y-[3px] hover:shadow-[0_15px_30px_rgba(243,156,18,0.4)]"
              onClick={handleContinue}
            >
              {isSpecialTutoring ? "Öğretmenleri İncele" : "Hemen Başla (Güvenli Ödeme)"}
            </button>

            <div className="flex justify-center gap-[15px] opacity-80 mb-10 pb-[30px] border-b border-[#eee]">
              <img src="/images/kare-logo-mastercard.webp" alt="Mastercard" width="40" height="25" loading="lazy" className="h-[35px] object-contain grayscale hover:grayscale-0 transition-all max-[768px]:h-[25px]" />
              <img src="/images/kare-logo-visa.webp" alt="Visa" width="40" height="25" loading="lazy" className="h-[35px] object-contain grayscale hover:grayscale-0 transition-all max-[768px]:h-[25px]" />
              <img src="/images/kare-logo-troy.webp" alt="Troy" width="40" height="25" loading="lazy" className="h-[35px] object-contain grayscale hover:grayscale-0 transition-all max-[768px]:h-[25px]" />
              <img src="/images/kare-logo-paytr.webp" alt="PayTR" width="40" height="25" loading="lazy" className="h-[35px] object-contain grayscale hover:grayscale-0 transition-all max-[768px]:h-[25px]" />
            </div>

            <div>
              <h3 className="text-[1.4rem] text-[#0f2a4a] mb-[25px] text-center">Sıkça Sorulan Sorular</h3>
              {faqList.map((item, idx) => (
                <div key={idx} className="border border-[#eee] rounded-[10px] mb-3 overflow-hidden">
                  <button
                    className="w-full flex justify-between items-center py-[18px] px-[18px] bg-white border-0 font-semibold text-[#333] cursor-pointer text-left text-base transition-colors hover:bg-[#fcfcfc]"
                    onClick={() => toggleAccordion(idx)}
                  >
                    {item.title}
                    {activeIndex === idx ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 bg-[#f9f9f9] ${activeIndex === idx ? "max-h-[200px] py-[18px] px-[18px] text-[#555] leading-[1.6] border-t border-[#eee]" : "max-h-0"}`}>
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
