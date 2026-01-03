import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import AboutComp from "../components/AboutComp";
import TopBar from "../components/TopBar";
import WhatsappButton from "../components/WhatsappButton";
import { Helmet } from "react-helmet";
import Seo from "../components/Seo";

export default function AboutPage() {
  return (
    <>
<Seo 
        title="Hakkımızda - Biz Kimiz?" 
        description="Sözderece Koçluk ekibini tanıyın. Derece öğrencisi koçlarımızla başarı hikayemiz, vizyonumuz ve öğrencilere yaklaşımımız hakkında bilgi alın."
        canonical="/hakkimizda"
      />
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
    <TopBar />

      <Navbar />
      <AboutComp /> 
 
      <WhatsappButton />
  
    </motion.div>
    </>
  );
}