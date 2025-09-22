import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { FaMedal, FaBullseye, FaComments, FaLock, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import "../cssFiles/packageDetail.css";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import { Helmet } from "react-helmet";
import { PACKAGES } from "../hooks/packages";

const PackageDetail = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isPaymentDisabled = false;

  // Liste & seçim
  const packageList = useMemo(() => Object.values(PACKAGES), []);
  const defaultSlug = useMemo(() => Object.keys(PACKAGES)[0], []);
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const selected = PACKAGES[selectedSlug];

  //ilk paket mi?
const isFirstPackage = selectedSlug === defaultSlug;

  // Paket değiştiğinde slider ve accordion'ı sıfırla
  useEffect(() => {
    setCurrentIndex(0);
    setActiveIndex(null);
  }, [selectedSlug]);

 const handleContinue = () => {
  if (isPaymentDisabled) {
    alert("Sipariş vermek istiyorsanız lütfen WhatsApp üzerinden destek ekibimizle görüşün. Şu anda ödeme sistemiyle ilgili bir sorun üzerinde çalışıyoruz.");
    return;
  }

  if (isFirstPackage) {
    // Özel Ders paketi (ilk paket): Öğretmenler sayfasına yönlendir
    navigate("/ogretmenler");
    return;
  }

  // Diğer paketlerde mevcut davranış
  navigate(`/pre-auth?slug=${encodeURIComponent(selected.slug)}`);
};

  // FB Pixel - fiyat guard
  useEffect(() => {
    if (selected && window.fbq) {
      const payload = {
        content_ids: [selected.slug],
        content_type: "product",
        currency: "TRY",
      };
      if (Number.isFinite(selected?.unitPrice)) {
        payload.value = selected.unitPrice / 100; // TL
      }
      window.fbq("track", "ViewContent", payload);
    }
  }, [selected]);

  // Dropdown
  const handleDropdownChange = (e) => {
    setSelectedSlug(e.target.value);
  };

  // Accordion
  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  // ===== Paket verileri: images / features / faq =====
  const fallbackImages = [
    "/images/paketlerImage1.webp",
    "/images/paketlerImage2.webp",
    "/images/paketlerImage3.webp",
  ];
  const images = (selected?.images?.length ? selected.images : fallbackImages).filter(Boolean);

  // features: string[] veya {label,included}
  const normalizeFeature = (f) =>
    typeof f === "string" ? { label: f, included: true } : f;

  const features = Array.isArray(selected?.features)
    ? selected.features.map(normalizeFeature).filter(Boolean)
    : [];

  // --- DEFAULT FAQ sabit kalsın ---
  const defaultFaqItems = [
    { title: "Sipariş Sonrası Süreç", content: "Sipariş verdikten sonra 24 saat içinde koçunuz sizinle iletişime geçecektir." },
    { title: "Whatsapp İletişiminde Farkımız", content: "Koçlarımız 7/24 birebir takip sağlar." },
    { title: "İptal ve İade Koşulları", content: "Paket başladıktan sonraki ilk 5 gün içinde koşulsuz iade hakkınız vardır." },
    { title: "Diğer Sorular", content: "Tüm diğer sorularınız için iletisim@sozderecekocluk.com adresine ulaşabilir veya whatsapp üzerinden mesaj atabilirsiniz." },
  ];

  // Paket özel FAQ + default FAQ (üstte paket özel, altta default) + başlığa göre dedupe
  const pkgFaq = Array.isArray(selected?.faq) ? selected.faq : [];

  const normalizeFaq = (x) => {
    if (!x || !x.title || !x.content) return null;
    return { title: String(x.title), content: String(x.content) };
  };

  const mergeFaq = (top, bottom) => {
    const seen = new Set();
    const clean = (arr) =>
      arr
        .map(normalizeFaq)
        .filter(Boolean)
        .filter((item) => {
          const key = item.title.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    return [...clean(top), ...clean(bottom)];
  };

  const faqItems = mergeFaq(pkgFaq, defaultFaqItems);

  // Slider kontrolleri
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  if (!selected) return <div className="package-not-found">Paket bulunamadı.</div>;

  // Fiyat guard
  const priceNumberTL = Number.isFinite(selected?.unitPrice) ? (selected.unitPrice / 100).toFixed(2) : null;

  // JSON-LD için tam URL'ler
  const absoluteImages = images.map((src) => `https://sozderecekocluk.com${src}`);

  // React key için stabil yardımcı
  const keyForFaq = (item, i) =>
    `${selected.slug}-${(item.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`;

  return (
    <>
      <Helmet>
        <title>{selected.title} | Sözderece Koçluk</title>
        <meta name="description" content={selected.subtitle || "Koçluk paketleri ile hedeflerine ulaş."} />
        <meta
          name="keywords"
          content="yks koçluk, lgs koçluk, online koçluk paketi, öğrenci koçluğu fiyatları, veli bilgilendirmesi, net artıran koçluk, sözderece koçluk"
        />
        <meta property="og:title" content={`${selected.title} | Sözderece Koçluk`} />
        <meta
          property="og:description"
          content={selected.subtitle || "Hemen koçluk paketi satın al! YKS ve LGS için online eğitim danışmanlığıyla hedeflerine ulaş. Güvenli ödeme ve memnuniyet garantisi."}
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://sozderecekocluk.com/paket/${selected.slug}`} />
        <meta property="og:image" content={absoluteImages[0] || "https://sozderecekocluk.com/images/paketlerImage1.webp"} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://sozderecekocluk.com/paket/${selected.slug}`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: selected.title,
            description: selected.subtitle,
            image: absoluteImages.length ? absoluteImages : [
              "https://sozderecekocluk.com/images/paketlerImage1.webp",
              "https://sozderecekocluk.com/images/paketlerImage2.webp",
              "https://sozderecekocluk.com/images/paketlerImage3.webp",
            ],
            brand: { "@type": "Brand", name: "Sözderece Koçluk" },
            sku: selected.slug,
            ...(priceNumberTL
              ? {
                  offers: {
                    "@type": "Offer",
                    url: `https://sozderecekocluk.com/paket/${selected.slug}`,
                    priceCurrency: "TRY",
                    price: priceNumberTL,
                    availability: "https://schema.org/InStock",
                    itemCondition: "https://schema.org/NewCondition",
                  },
                }
              : {}),
          })}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="package-detail-layout">
        <div className="mobile-select">
          <label htmlFor="package-dropdown-mobile" className="dropdown-label">
            Hizmet Paketi
          </label>
          <select
            id="package-dropdown-mobile"
            value={selected.slug}
            onChange={handleDropdownChange}
            className="package-dropdown"
            aria-label="Hizmet Paketi Seçimi (Mobil)"
          >
            {packageList.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="package-detail-content">
          <h1 className="package-title">{selected.title}</h1>

          {/* Paket özel alt başlık */}
          {selected?.subtitle && (
            <p className="package-subtitle">{selected.subtitle}</p>
          )}

          <p className="package-price">{selected.priceText}</p>
          <p className="package-note">
            Tüm vergiler dahildir.{" "}
            <a href="/mesafeli-hizmet-sozlesmesi" className="underline">
              Mesafeli Hizmet Sözleşmesini İnceleyin.
            </a>
          </p>

          <label htmlFor="package-dropdown" className="dropdown-label">
            Hizmet Paketi
          </label>
          <select
            id="package-dropdown"
            value={selected.slug}
            onChange={handleDropdownChange}
            className="package-dropdown"
          >
            {packageList.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>

          <p className="package-info">
            <FaMedal style={{ marginRight: "8px", color: "#f4b400" }} />
            Size özel programlama ve sınırsız Whatsapp iletişimi. 12 aya kadar taksitle, güvenli ödeme imkanıyla.
          </p>

          {/* Paket özel kontenjan */}
          {selected?.kontenjan !== undefined && (
            <div className="kontenjan-bilgi-blok">
              <p className="kontenjan-title">Kontenjan durumu</p>
              <div className="kontenjan-bilgi">
                <span className="yanip-sonen-simge"></span>
                SON {selected.kontenjan} KİŞİ
              </div>
            </div>
          )}

          {/* Paket özel özellikler */}
          {features.length > 0 && (
            <ul className="feature-list" aria-label="Paket Özellikleri">
              {features.map((f, i) => (
                <li key={i} className={f.included === false ? "exc" : "inc"}>
                  {f.included === false ? "✖" : "✔"} {f.label}
                </li>
              ))}
            </ul>
          )}

          <div className="package-guarantees">
            <div className="guarantee-item">
              <FaBullseye style={{ marginRight: "6px" }} /> Memnuniyet Garantisi
            </div>
            <div className="guarantee-item">
              <FaComments style={{ marginRight: "6px" }} /> 7/24 İletişim Desteği
            </div>
            <div className="guarantee-item">
              <FaLock style={{ marginRight: "6px" }} /> Güvenli Ödeme
            </div>
          </div>

          <div className="payment-methods">
            <img src="/images/kare-logo-mastercard.webp" alt="Ödeme Yöntemleri" className="payment-logos" />
            <img src="/images/kare-logo-visa.webp" alt="Ödeme Yöntemleri" className="payment-logos" />
            <img src="/images/kare-logo-troy.webp" alt="Ödeme Yöntemleri" className="payment-logos" />
            <img src="/images/kare-logo-paytr.webp" alt="Ödeme Yöntemleri" className="payment-logos" />
          </div>

          <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "8px" }}>
            Tüm ödemeler 256-bit SSL sertifikası ile güvence altındadır.
          </p>

         <button className="choose-coach-button" onClick={handleContinue}>
  {isFirstPackage ? "Öğretmenleri Gör" : "Hemen Süreci Başlat!"}
</button>

          {/* Paket özel SSS: ÜSTTE paket özel + ALTA default + dedupe */}
          <div className="accordion-container">
            {faqItems.map((item, index) => (
              <div key={keyForFaq(item, index)} className="accordion-item">
                <div className="accordion-title" onClick={() => toggleAccordion(index)}>
                  {item.title}
                  <span>{activeIndex === index ? "▲" : "▼"}</span>
                </div>
                {activeIndex === index && <div className="accordion-content">{item.content}</div>}
                <hr />
              </div>
            ))}
          </div>
        </div>

        <div className="package-image-placeholder">
          <div className="image-carousel">
            <button className="carousel-arrow left" onClick={handlePrev}>
              ‹
            </button>
            <img
              src={images[currentIndex]}
              alt={`${selected.title} Görsel ${currentIndex + 1}`}
              className="carousel-image"
            />
            <button className="carousel-arrow right" onClick={handleNext}>
              ›
            </button>
          </div>

          <div className="desktop-image-list">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`${selected.title} Görsel ${index + 1}`}
                className="carousel-image"
              />
            ))}
          </div>
        </div>

        <footer className="custom-footer">
          <div className="footer-icons">
            <FaInstagram />
            <FaTiktok />
            <FaYoutube />
          </div>
          <div className="footer-links">
            <a href="/hakkimizda">Hakkımızda</a>
            <a href="/ucretsiz-on-gorusme">İletişim</a>
            <a href="/gizlilik-politikasi-kvkk">Gizlilik ve KVKK</a>
            <a href="/mesafeli-hizmet-sozlesmesi">Mesafeli Hizmet Sözleşmesi</a>
            <a href="/iade-ve-cayma-politikasi">İade Politikası</a>
          </div>
          <div className="footer-copy">© 2025 SÖZDERECE KOÇLUK Her Hakkı Saklıdır</div>
        </footer>
      </div>
    </>
  );
};

export default PackageDetail;
