import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Slider from "react-slick";

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
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "linear",
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
    <div className="py-8 px-4 bg-[#f8f9fa] text-center max-w-[1200px] mx-auto max-[768px]:-mt-10">
      <h2 className="text-[2rem] text-[#0f172a] mb-12 font-bold max-[768px]:text-[1.35rem] max-[768px]:mt-[15px]">Sözderece Koçluk Ekibiyle Tanışın</h2>
      <Slider {...settings}>
        {coaches.map((coach) => (
          <div key={coach.id} className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex flex-col items-center max-w-[360px] mx-auto max-[768px]:max-w-[90%] max-[768px]:p-[0.8rem] max-[768px]:bg-transparent max-[768px]:shadow-none max-[768px]:text-center">
            <img
              src={coach.image}
              alt={coach.name}
              className="w-full max-w-full h-[340px] object-cover rounded-[10px] block mb-4 max-[768px]:w-40 max-[768px]:h-40 max-[768px]:rounded-full max-[768px]:mx-auto max-[768px]:mb-3 max-[500px]:w-[120px] max-[500px]:h-[120px]"
            />
            <h3 className="text-[1.2rem] text-[#e85d04] mb-2">{coach.name}</h3>
            <p className="text-[0.95rem] text-[#333] my-[0.2rem] leading-[1.4]">{coach.subject}</p>
            <p className="text-[0.95rem] text-[#333] my-[0.2rem] leading-[1.4]">{coach.description}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomeCoachSlider;
