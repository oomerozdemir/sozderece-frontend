import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/HomeCoachSlider.css"; // CSS'yi unutma
import Slider from "react-slick"; // react-slick kullanılabilir

const HomeCoachSlider = () => {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await axios.get("/api/coaches/public-coach");
        setCoaches(res.data);
      } catch (error) {
        console.error("Koçlar yüklenemedi:", error);
      }
    };

    fetchCoaches();
  }, []);

  const settings = {
  dots: true,
  infinite: true,
  speed: 800,              // Geçiş animasyonu süresi (ms)
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,          // Otomatik kaydırma aktif
  autoplaySpeed: 4000,     // 4 saniyede bir kayar
  cssEase: "linear",       // Düzgün geçiş
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 2 },
    },
    {
      breakpoint: 768,
      settings: { slidesToShow: 1 },
    },
  ],
};


  return (

<div className="home-coach-slider">
    <h2 className="home-coach-title">Size Özel Ekibimizle Tanışın</h2>
      <Slider {...settings}>
        {coaches.map((coach) => (
          <div key={coach.id} className="coach-slide-card">
            <img src={coach.image} alt={coach.name} />
            <h3>{coach.name}</h3>
            <p>{coach.subject}</p>
            <p>{coach.description}</p>

          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomeCoachSlider;
