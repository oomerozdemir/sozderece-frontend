import React from "react";
import "../cssFiles/AboutComp.css";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faUserGraduate, faChartLine, faRocket, faUsers, faLaptopCode, faAward } from "@fortawesome/free-solid-svg-icons";



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
      <section className="mission-vision-values">
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
      <section className="coaching-system">
  <div className="coaching-image">
    <img src="/images/coaching-system.jpg" alt="Koçluk sistemi" />
  </div>
  <div className="coaching-text">
    <h2>Koçluk Sistemimiz</h2>
    <p>
      Öğrencilerimizin hedeflerini belirlemesine, plan yapmasına ve bu plana sadık kalmasına yardımcı oluyoruz. Haftalık takipler, birebir görüşmeler ve kişiye özel stratejilerle gelişimi sürekli kılıyoruz.
    </p>
    <button className="learn-more-btn">Detaylı Bilgi</button>
  </div>
</section>
    
      

      {/* === Timeline Section === */}
      <section className="timeline-section">
  <h2 className="section-title">Zaman Çizelgemiz</h2>
  <div className="timeline">
    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="icon"><FontAwesomeIcon icon={faRocket} /></div>
      <div className="content">
        <h3>Kurumun Kuruluşu</h3>
        <p>2020 yılında eğitimde yeni bir soluk getirmek amacıyla kuruldu.</p>
      </div>
    </motion.div>

    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="icon"><FontAwesomeIcon icon={faUsers} /></div>
      <div className="content">
        <h3>İlk Öğrencilerimiz</h3>
        <p>2021 yılında ilk 100 öğrenciyle güçlü bir başlangıç yaptık.</p>
      </div>
    </motion.div>

    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="icon"><FontAwesomeIcon icon={faLaptopCode} /></div>
      <div className="content">
        <h3>Dijitalleşme</h3>
        <p>2022'de online koçluk sistemimizi hayata geçirdik.</p>
      </div>
    </motion.div>

    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="icon"><FontAwesomeIcon icon={faAward} /></div>
      <div className="content">
        <h3>Başarılarımız</h3>
        <p>2023 yılında öğrencilerimizin %90’ı hedefledikleri üniversitelere yerleşti.</p>
      </div>
    </motion.div>
  </div>
</section>


      {/* === Degerler === */}
      <div className="value-cards">
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





      {/* === İLETİŞİM CTA (Butonlar) === */}
      <section className="contact-section">
  <h2 className="section-title">Bize Ulaşın</h2>
  <p className="section-description">Sorularınız, önerileriniz veya kayıt için bize ulaşabilirsiniz.</p>

  <div className="contact-grid">
    {/* Left - Info */}
    <div className="contact-info">
      <p><strong>Telefon:</strong> +90 530 000 0000</p>
      <p><strong>E-posta:</strong> info@egitimplatformu.com</p>
      <p><strong>Adres:</strong> İstanbul, Türkiye</p>
      <a href="https://wa.me/905300000000" target="_blank" rel="noreferrer" className="whatsapp-button">
        WhatsApp ile İletişime Geç
      </a>
    </div>

    {/* Right - Form */}
    <form className="contact-form">
      <input type="text" placeholder="Adınız Soyadınız" required />
      <input type="email" placeholder="E-posta Adresiniz" required />
      <textarea placeholder="Mesajınız..." rows="5" required></textarea>
      <button type="submit">Gönder</button>
    </form>
  </div>
</section>

      <Footer />
    </motion.div>
  );
};

export default AboutComp;
