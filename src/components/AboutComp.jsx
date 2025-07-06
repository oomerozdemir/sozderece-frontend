import "../cssFiles/AboutComp.css";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faUserGraduate, faChartLine, faUserFriends, faHandshake, faLightbulb} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";


const AboutComp = () => {
  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      {/* === HERO SECTION === */}
      <section className="about-hero">
  <div className="hero-content">
    <h1>Hakkımızda</h1>
    <p>Sözderece Koçluk olarak, her öğrencinin benzersiz bir öğrenme yolculuğu olduğuna inanıyoruz. 
      Koçluk sistemimizle öğrencilerimizin bireysel potansiyellerini ortaya çıkarmalarına, hedeflerine kararlı adımlarla ilerlemelerine ve potansiyellerini en üst seviyeye taşımalarına destek oluyoruz.
      Amacımız, her öğrenciyi kendi hedeflerine uygun şekilde yönlendirerek, başarıya giden yolda güvenilir bir yol arkadaşı olmaktır.</p>
  </div>
 
</section>

      {/* === MISSION & VISION === */}
      <section className="mission-vision-values container">
  <div className="info-card">
    <h2>Misyonumuz</h2>
    <p>Öğrencilerimizin bireysel potansiyellerini en üst düzeye çıkararak onların hedeflerine ulaşmalarını sağlamak.</p>
  </div>
  <div className="info-card">
    <h2>Vizyonumuz</h2>
    <p>Eğitimde güvenilir ve fark yaratan bir platform olarak tüm Türkiye'de öğrencilerimizin yanında olmak.</p>
  </div>
  <div className="info-card">
    <h2>Değerlerimiz</h2>
    <p>Samimiyet, ulaşılabilirlik, disiplin, bireye özel yaklaşım ve etik ilkeler doğrultusunda çalışmak.</p>
  </div>
</section>

      {/* === Coaching About Section === */}
      <section className="coaching-system container">
  <div className="coaching-image">
    <img src="/images/teaching.svg" alt="Koçluk sistemi" />
  </div>
  <div className="coaching-text">
    <h2>Koçluk Sistemimiz</h2>
    <p>
      Öğrencilerimizin hedeflerini belirlemesine, plan yapmasına ve bu plana sadık kalmasına yardımcı oluyoruz. Haftalık takipler, birebir görüşmeler ve kişiye özel stratejilerle gelişimi sürekli kılıyoruz.
    </p>
  </div>
   <div className="coaching-highlights">
  <div className="highlight">
    <FontAwesomeIcon icon={faUserFriends} className="highlight-icon" />
    <p>Koçlarımız öğrencilere abi/abla şefkatiyle yaklaşır, güvenli bir iletişim ortamı sunar.</p>
  </div>
  <div className="highlight">
    <FontAwesomeIcon icon={faHandshake} className="highlight-icon" />
    <p>Her öğrenciyle birebir ilgileniriz; yol arkadaşlığı prensibimizdir.</p>
  </div>
  <div className="highlight">
    <FontAwesomeIcon icon={faLightbulb} className="highlight-icon" />
    <p>Motivasyon kaynağı olur, yalnız hissettikleri anlarda hep yanlarında oluruz.</p>
  </div>
</div>
</section>

      {/* === Kurucu About Section === */}

<div className="founder-message vertical container">
  <img src="/images/kurucu.png" alt="Kurucu" />
  <blockquote>
    “Amacımız sadece başarı değil, öğrencinin kendine güvenini kazandırmak.”
  </blockquote>
  <cite>– Zeynep Hanım, Kurucu Koç</cite>
</div>

      {/* === Ekibimiz About Section === */}

<section className="team-preview container">
  <h2>Koçluk Ekibimiz</h2>
  <p>
    Sözderece Koçluk olarak, her biri alanında deneyimli, öğrenci odaklı ve 
    eğitim koçluğu konusunda uzmanlaşmış bir ekip ile çalışıyoruz. 
    Size en uygun yol haritasını birlikte planlıyoruz.
  </p>

  <Link to="/coach-detail" className="team-link">
    Koçlarımız Hakkında Daha Fazla Bilgi
  </Link>
</section>

    
      
      {/* === Degerler === */}
      <div className="value-cards container">
  <div className="value-card">
    <FontAwesomeIcon icon={faLock} className="icon" />
    <h3>Gizlilik</h3>
    <p>Öğrencilerimizin tüm bilgileri gizlilik ilkemiz doğrultusunda korunur.</p>
  </div>
  <div className="value-card">
    <FontAwesomeIcon icon={faEye} className="icon" />
    <h3>Şeffaflık</h3>
    <p>Tüm süreçlerde öğrencilerimize açık ve anlaşılır bir şekilde rehberlik ederiz.</p>
  </div>
  <div className="value-card">
    <FontAwesomeIcon icon={faUserGraduate} className="icon" />
    <h3>Öğrenci Odaklılık</h3>
    <p>Her öğrencinin bireysel hedef ve ihtiyaçlarına göre özel çözümler sunarız.</p>
  </div>
  <div className="value-card">
    <FontAwesomeIcon icon={faChartLine} className="icon" />
    <h3>Sürekli Gelişim</h3>
    <p>Kendimizi ve sistemimizi güncel tutarak en iyiyi hedefleriz.</p>
  </div>
</div>

      {/* === Joint Section === */}

      <section className="join-section">
  <div className="container join-content">
    <div className="join-text">
      <h2>Hedeflerinize birlikte ulaşalım</h2>
      <p>
        Ücretsiz ön görüşme için formu doldurarak, size özel koçluk sürecinizi başlatalım.
      </p>
    </div>
    <Link to="/ucretsiz-on-gorusme" className="cta-button">Ücretsiz Görüşme Talep Et</Link>
  </div>
</section>
      <Footer />
    </motion.div>
  );
};

export default AboutComp;
