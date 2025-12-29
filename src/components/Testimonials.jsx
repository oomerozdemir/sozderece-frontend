import React from "react";
import "../cssFiles/Testimonials.css";
import { FaStar, FaQuoteLeft, FaArrowUp } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// GERÇEKÇİ NET ARTIŞI SENARYOLARI
const testimonials = [
  {
    id: 1,
    name: "Berkay D.",
    status: "Mezun Öğrenci",
    badge: "TYT: 45 Net ➔ 88 Net",
    text: "Sene başında 45-50 bandında takılıp kalmıştım, ne çalışsam artmıyordu. Koçumla yaptığımız deneme analizlerinde yanlış derslere yüklendiğimi fark ettik. 4 ayda +40 net artışı yakaladık.",
  },
  {
    id: 2,
    name: "Selin K.",
    status: "12. Sınıf (Sayısal)",
    badge: "AYT Mat: 5 Net ➔ 32 Net",
    text: "Matematik benim için kabustu. 'Asla yapamam' diyordum. Koçum bana uygun kaynakları seçti ve sıfırdan alıp ilmek ilmek işledik. Şimdi denemelerde 30 üstünü görüyorum.",
  },
  {
    id: 3,
    name: "Ahmet Y.",
    status: "LGS Öğrencisi",
    badge: "Matematik: 3 Yanlış ➔ Full",
    text: "LGS sürecinde stres yönetimini yapamıyordum. Deneme anında elim ayağım titriyordu. Koçumla yaptığımız taktiksel çalışmalar sayesinde artık sınavı ben yönetiyorum.",
  },
  {
    id: 4,
    name: "Zeynep T.",
    status: "12. Sınıf (Eşit Ağırlık)",
    badge: "Toplam: +35 Net Artışı",
    text: "Disiplin sorunum vardı, 3 gün çalışıp 1 hafta yatıyordum. Günlük takip sistemi sayesinde ipin ucunu hiç bırakmadım. İstikrar artınca netler kendiliğinden geldi.",
  },
  {
    id: 5,
    name: "Emre V.",
    status: "Mezun (Sözel)",
    badge: "Paragraf: 25 Dk ➔ 18 Dk",
    text: "Türkçede çok vakit kaybediyordum. Koçumun öğrettiği turlama tekniği ve paragraf rutinleri sayesinde hem sürem arttı hem de netlerim yükseldi.",
  }
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        
        {/* Başlık Alanı */}
        <div className="section-header">
          <span className="section-badge">GELİŞİM TABLOLARI</span>
          <h2 className="section-title">Sadece Başarıyı Değil, <br/>Gelişimi Kutluyoruz!</h2>
          <p className="section-subtitle">
            Öğrencilerimiz nerede başladı, nereye geldi? İşte disiplinli çalışmanın ve doğru takibin kanıtları.
          </p>
        </div>

        {/* Slider Alanı */}
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="testimonial-card">
                
                {/* Kart Üstü: Net Artış Rozeti */}
                <div className="net-increase-badge">
                  <FaArrowUp /> {item.badge}
                </div>

                <div className="card-content">
                    <div className="stars">
                        {[...Array(5)].map((_, i) => (
                        <FaStar key={i} />
                        ))}
                    </div>
                    
                    <p className="testimonial-text">"{item.text}"</p>
                </div>
                
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4 className="author-name">{item.name}</h4>
                    <span className="author-role">{item.status}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}