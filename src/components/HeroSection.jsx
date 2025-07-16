import "../cssFiles/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faComments  } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";


const HeroSection = () => {
  return (
    <motion.section
    className="hero-section"
  initial={{ opacity: 0, scale: 0.9 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8 }}
  viewport={{ once: true }}
>
  <div className="container">
    <img
      src="../images/hero-logo.png"
      alt="Sözderece Logo"
      className="hero-logo"
    />
    <div className="hero-content">
      <h2 className="highlight">Söz veriyoruz,derece getiriyoruz!</h2>
      <p>
        Derece yapmış koçlarımızla YKS ve LGS sürecinde birebir koçluk
        hizmeti sunuyoruz.
        Koçluk sistemimizle öğrencilerimizin 
        bireysel potansiyellerini ortaya çıkarmalarına, 
        hedeflerine kararlı adımlarla ilerlemelerine ve potansiyellerini 
        en üst seviyeye taşımalarına destek oluyoruz.
      </p>
      <a href="#paketler" className="hero-button">
        <FontAwesomeIcon icon={faRocket} style={{ marginRight: "8px" }} />
        Hemen Başla
      </a>
      <a href="/ucretsiz-on-gorusme" className="hero-button outline">
  <FontAwesomeIcon icon={faComments} style={{ marginRight: "8px" }} />Ücretsiz Ön Görüşme İçin
    </a>
    </div>
  </div>
  </motion.section>

  );
};

export default HeroSection;
