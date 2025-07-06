import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaMedal, FaBullseye, FaComments, FaLock, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import "../cssFiles/packageDetail.css"; 
import Navbar from "../components/navbar";
import Topbar from "../components/TopBar";
import useCart from "../hooks/useCart";

const packageList = [
  /*{
    slug: "tek-ders-paketi",
    name: "TEK DERS PAKETİ",
    price: "700₺ / ders",
    subtitle: "Sadece birebir özel derse odaklanan esnek paket."
  },*/
  {
    slug: "lgs-2026-paketi",
    name: "LGS 2026 PAKETİ",
    price: "3000₺ / ay",
    subtitle: "Disiplinli bir sınav süreci için ihtiyaç duyduğun temel destek burada!"
  },
  {
    slug: "yks-2026-paketi",
    name: "YKS 2026 PAKETİ",
    price: "3000₺ / ay",
    subtitle: "Koçluk + birebir özel ders + 7/24 destek isteyenler için."
  }
];

const PackageDetail = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();

const handleContinue = () => {
  const userData = localStorage.getItem("user");
  if (!userData) {
    alert("Devam etmek için giriş yapmanız gereklidir.");
    navigate("/login");
    return;
  }

  const item = {
    name: selected.name,
    price: selected.price,
    description: selected.subtitle,
  };

  addToCart(item);
  navigate("/cart"); 
};



  useEffect(() => {
    setSelected(packageList[0]); 
  }, []);

  const handleDropdownChange = (e) => {
    const found = packageList.find(pkg => pkg.slug === e.target.value);
    setSelected(found);
  };

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const faqItems = [
    {
      title: "Sipariş Sonrası Süreç",
      content: "Sipariş verdikten sonra 24 saat içinde koçunuz sizinle iletişime geçecektir."
    },
    {
      title: "Whatsapp İletişiminde Farkımız",
      content: "Koçlarımız haftanın 7 günü sabah 08:00 - akşam 22:00 saatleri arasında birebir takip sağlar."
    },
    {
      title: "İptal ve İade Koşulları",
      content: "Paket başladıktan sonraki ilk 3 gün içinde koşulsuz iade hakkınız vardır."
    },
    {
      title: "Diğer Sorular",
      content: "Tüm diğer sorularınız için destek@sozderece.com adresine ulaşabilirsiniz."
    }
  ];

  const images = [
    "/images/detailPageImage1.png",
    "/images/detailPageImage2.png",
    "/images/detailPageImage1.png",
    "/images/detailPageImage4.png"
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!selected) return <div className="package-not-found">Paket bulunamadı.</div>;

  

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="package-detail-layout">
        <div className="package-image-placeholder">
          <div className="image-carousel">
            <button className="carousel-arrow left" onClick={handlePrev}>‹</button>
            <img src={images[currentIndex]} alt={`Görsel ${currentIndex + 1}`} className="carousel-image" />
            <button className="carousel-arrow right" onClick={handleNext}>›</button>
          </div>

          <div className="desktop-image-list">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Görsel ${index + 1}`}
                className="carousel-image"
              />
            ))}
          </div>
        </div>

        <div className="package-detail-content">
          <h1 className="package-title">{selected.name}</h1>
          <p className="package-price">{selected.price}</p>
          <p className="package-note">Tüm vergiler dahildir. <a href="#" className="underline">Kargo politikasını inceleyin.</a></p>

          <label htmlFor="package-dropdown" className="dropdown-label">Hizmet Paketi</label>
          <select id="package-dropdown" value={selected.slug} onChange={handleDropdownChange} className="package-dropdown">
            {packageList.map((pkg) => (
              <option key={pkg.slug} value={pkg.slug}>{pkg.name}</option>
            ))}
          </select>

          <p className="package-info">
            <FaMedal style={{ marginRight: "8px", color: "#f4b400" }} />
            Size özel dünya standartlarında profesyonel programlama ve sınırsız Whatsapp iletişimi. 12 aya kadar taksitle, güvenli ödeme imkanıyla.
          </p>

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

          <button className="choose-coach-button" onClick={handleContinue}>
            Devam Et
          </button>

          <div className="accordion-container">
            {faqItems.map((item, index) => (
              <div key={index} className="accordion-item">
                <div className="accordion-title" onClick={() => toggleAccordion(index)}>
                  {item.title}
                  <span>{activeIndex === index ? "▲" : "▼"}</span>
                </div>
                {activeIndex === index && (
                  <div className="accordion-content">{item.content}</div>
                )}
                <hr />
              </div>
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
            <a href="#">Hakkımızda</a>
            <a href="#">Kullanım Koşulları</a>
            <a href="#">Gizlilik</a>
            <a href="#">Satış Sözleşmeleri</a>
            <a href="#">İade Politikası</a>
            <a href="#">Mağaza Blog</a>
          </div>
          <div className="footer-copy">© 2025 SÖZDERECE KOÇLUK Her Hakkı Saklıdır</div>
        </footer>
      </div>
    </>
  );
};

export default PackageDetail;
