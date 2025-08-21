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
  const isPaymentDisabled = true;

  // PACKAGES → liste ve varsayılan slug
  const packageList = useMemo(() => Object.values(PACKAGES), []);
  const defaultSlug = useMemo(() => Object.keys(PACKAGES)[0], []);
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const selected = PACKAGES[selectedSlug];

  const handleContinue = () => {
    if (isPaymentDisabled) {
      alert("Sipariş vermek istiyorsanız lütfen WhatsApp üzerinden destek ekibimizle görüşün. Şu anda ödeme sistemiyle ilgili bir sorun üzerinde çalışıyoruz.");
      return;
    }
    navigate(`/pre-auth?slug=${encodeURIComponent(selected.slug)}`);
  };

  // ViewContent Pixel
  useEffect(() => {
    if (selected && window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [selected.slug],
        content_type: "product",
        value: selected.unitPrice / 100, // TL
        currency: "TRY",
      });
    }
  }, [selected]);

  const handleDropdownChange = (e) => {
    setSelectedSlug(e.target.value);
  };

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const faqItems = [
    { title: "Sipariş Sonrası Süreç", content: "Sipariş verdikten sonra 24 saat içinde koçunuz sizinle iletişime geçecektir." },
    { title: "Whatsapp İletişiminde Farkımız", content: "Koçlarımız 7/24 birebir takip sağlar." },
    { title: "İptal ve İade Koşulları", content: "Paket başladıktan sonraki ilk 5 gün içinde koşulsuz iade hakkınız vardır." },
    { title: "Diğer Sorular", content: "Tüm diğer sorularınız için iletisim@sozderecekocluk.com adresine ulaşabilir veya whatsapp üzerinden mesaj atabilirsiniz." },
  ];

  const images = [
    "/images/paketlerImage1.webp",
    "/images/paketlerImage2.webp",
    "/images/paketlerImage3.webp",
  ];

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  if (!selected) return <div className="package-not-found">Paket bulunamadı.</div>;

  const priceNumberTL = (selected.unitPrice / 100).toFixed(2);

  return (
    <>
      <Helmet>
        <title>{selected.title} | Sözderece Koçluk</title>
        <meta name="description" content={selected.subtitle} />
        <meta
          name="keywords"
          content="yks koçluk, lgs koçluk, online koçluk paketi, öğrenci koçluğu fiyatları, veli bilgilendirmesi, net artıran koçluk, sözderece koçluk"
        />
        <meta property="og:title" content={`${selected.title} | Sözderece Koçluk`} />
        <meta
          property="og:description"
          content="Hemen koçluk paketi satın al! YKS ve LGS için online eğitim danışmanlığıyla hedeflerine ulaş. Güvenli ödeme ve memnuniyet garantisi."
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://sozderecekocluk.com/paket/${selected.slug}`} />
        <meta property="og:image" content="https://sozderecekocluk.com/images/paketlerImage1.webp" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://sozderecekocluk.com/paket/${selected.slug}`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: selected.title,
            description: selected.subtitle,
            image: [
              "https://sozderecekocluk.com/images/paketlerImage1.webp",
              "https://sozderecekocluk.com/images/paketlerImage2.webp",
              "https://sozderecekocluk.com/images/paketlerImage3.webp",
            ],
            brand: { "@type": "Brand", name: "Sözderece Koçluk" },
            sku: selected.slug,
            offers: {
              "@type": "Offer",
              url: `https://sozderecekocluk.com/paket/${selected.slug}`,
              priceCurrency: "TRY",
              price: priceNumberTL, // numeric string
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          })}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="package-detail-layout">
        {/* MOBİL: Üstte paket seçimi */}
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

          {selected?.kontenjan !== undefined && (
            <div className="kontenjan-bilgi-blok">
              <p className="kontenjan-title">Kontenjan durumu</p>
              <div className="kontenjan-bilgi">
                <span className="yanip-sonen-simge"></span>
                SON {selected.kontenjan} KİŞİ
              </div>
            </div>
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
            Hemen Süreci Başlat!
          </button>

          <div className="accordion-container">
            {faqItems.map((item, index) => (
              <div key={index} className="accordion-item">
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
            <img src={images[currentIndex]} alt={`Koçluk Paketi Görseli ${currentIndex + 1}`} className="carousel-image" />
            <button className="carousel-arrow right" onClick={handleNext}>
              ›
            </button>
          </div>

          <div className="desktop-image-list">
            {images.map((src, index) => (
              <img key={index} src={src} alt={`Görsel ${index + 1}`} className="carousel-image" />
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
