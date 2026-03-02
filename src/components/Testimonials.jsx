import React from "react";
import { FaArrowUp } from "react-icons/fa";
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
    text: "Sene başında 45-50 bandında takılıp kalmıştım, ne çalışsam artmıyordu. Koçumla yaptığımız deneme analizlerinde yanlış derslere yüklendiğimi fark ettik. 6 ayda +40 net artışı yakaladık.",
  },
  {
    id: 2,
    name: "Selin K.",
    status: "12. Sınıf (Sayısal)",
    badge: "AYT Mat: 5 Net ➔ 23 Net",
    text: "Matematik benim için kabustu. 'Asla yapamam' diyordum. Koçum bana uygun kaynakları seçti ve sıfırdan alıp ilmek ilmek işledik. Şimdi denemelerde 30 üstünü görüyorum.",
  },
  {
    id: 3,
    name: "Ahmet Y.",
    status: "LGS Öğrencisi",
    badge: "Matematik: 3 Yanlış ➔ 20 Doğru",
    text: "LGS sürecinde stres yönetimini yapamıyordum. Deneme anında elim ayağım titriyordu. Koçumla yaptığımız taktiksel çalışmalar sayesinde artık sınavlarda daha rahat soruları çözüyorum.",
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
    badge: "Paragraf: 50 Dk ➔ 35 Dk",
    text: "Türkçede çok vakit kaybediyordum. Koçumun öğrettiği turlama tekniği ve paragraf rutinleri sayesinde hem sürem arttı hem de netlerim yükseldi.",
  }
];

export default function Testimonials() {
  return (
    <section className="bg-[#100481] py-[80px] px-5 relative overflow-hidden testimonials-section">
      <div className="max-w-[1200px] mx-auto relative z-[2]">

        {/* Başlık Alanı */}
        <div className="text-center mb-[50px] text-white">
          <span className="inline-block bg-[rgba(46,204,113,0.2)] text-[#2ecc71] py-1.5 px-4 rounded-[20px] text-[0.85rem] font-bold tracking-widest mb-[15px] border border-[rgba(46,204,113,0.4)]">GELİŞİM TABLOLARI</span>
          <h2 className="text-[2.5rem] font-extrabold mb-[15px] text-white leading-[1.2] max-[768px]:text-[1.8rem]">Sadece Başarıyı Değil, <br/>Gelişimi Kutluyoruz!</h2>
          <p className="text-[1.1rem] text-slate-300 max-w-[600px] mx-auto leading-[1.6]">
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
              <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] h-full flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-[5px]">

                {/* Kart Üstü: Net Artış Rozeti */}
                <div className="bg-[#e8f8f5] text-[#00b894] py-[15px] px-5 font-extrabold text-[1.05rem] flex items-center gap-2.5 border-b border-[#d1f2eb] max-[768px]:text-[0.95rem] max-[768px]:py-3 max-[768px]:px-[15px]">
                  <FaArrowUp /> {item.badge}
                </div>

                <div className="p-[25px] flex-grow">
                  <p className="text-base text-[#334e68] leading-[1.6] italic m-0">"{item.text}"</p>
                </div>

                <div className="flex items-center gap-[15px] py-5 px-[25px] bg-[#f8f9fa] border-t border-[#eee]">
                  <div className="flex flex-col">
                    <h4 className="text-[0.95rem] font-bold text-[#0f2a4a] m-0">{item.name}</h4>
                    <span className="text-[0.8rem] text-slate-500 font-medium">{item.status}</span>
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
