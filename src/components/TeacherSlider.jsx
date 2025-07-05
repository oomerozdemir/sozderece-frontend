/*import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

import "swiper/css";
import "swiper/css/navigation";
import "../cssFiles/TeacherSlider.css";

const teachers = [
  {
    name: "Ayşe Öğretmen",
    subject: "Matematik",
    image: "/images/teacher1.jpg",
    description: "20 yıllık tecrübesiyle üniversite hazırlık matematik eğitmeni.",
    linkedin: "https://linkedin.com/in/ayseogretmen"
  },
  {
    name: "Mehmet Hoca",
    subject: "Fizik",
    image: "/images/teacher2.jpg",
    description: "Fizikte kavram haritalarıyla öğrenimi kolaylaştırır.",
    linkedin: "https://linkedin.com/in/mehmethoca"
  },
  {
    name: "Zeynep Hoca",
    subject: "Kimya",
    image: "/images/teacher3.jpg",
    description: "Analitik kimyada uzman, öğrenci dostu anlatımıyla tanınır.",
    linkedin: "https://linkedin.com/in/zeynephoca"
  },
  {
    name: "Zeynep Hoca",
    subject: "Kimya",
    image: "/images/teacher3.jpg",
    description: "Analitik kimyada uzman, öğrenci dostu anlatımıyla tanınır.",
    linkedin: "https://linkedin.com/in/zeynephoca"
  },
  {
    name: "Zeynep Hoca",
    subject: "Kimya",
    image: "/images/teacher3.jpg",
    description: "Analitik kimyada uzman, öğrenci dostu anlatımıyla tanınır.",
    linkedin: "https://linkedin.com/in/zeynephoca"
  }
];

const TeacherModal = ({ index, onClose }) => {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <Swiper
          initialSlide={index}
          navigation
          modules={[Navigation]}
          loop={true}
          className="modal-swiper"
        >
          {teachers.map((teacher, idx) => (
            <SwiperSlide key={idx}>
              <div className="modal-card">
                <img src={teacher.image} alt={teacher.name} />
                <h3>{teacher.name}</h3>
                <p><strong>{teacher.subject} Öğretmeni</strong></p>
                <div className="teacher-bio">{teacher.description}</div>
                <div className="teacher-socials">
                  <a href={teacher.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>,
    document.body
  );
};

const TeacherSlider = () => {
  const [modalIndex, setModalIndex] = useState(null);

  const openModal = (index) => {
    setModalIndex(index);
  };

  return (
    <motion.section
      className="teacher-slider-section"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="section-title">Hocalarımızla Tanışın</h2>
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={30}
        slidesPerView={3}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        navigation
      >
        {teachers.map((teacher, index) => (
          <SwiperSlide key={index}>
            <div className="teacher-card">
              <img src={teacher.image} alt={teacher.name} />
              <h3>{teacher.name}</h3>
              <p>{teacher.subject} Öğretmeni</p>
              <div className="teacher-socials">

              </div>
              <button className="more-info-btn" onClick={() => openModal(index)}>
                Daha Fazla Bilgi
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {modalIndex !== null && (
        <TeacherModal index={modalIndex} onClose={() => setModalIndex(null)} />
      )}
    </motion.section>
  );
};

export default TeacherSlider;
*/