import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import AboutComp from "../components/AboutComp";
import TopBar from "../components/TopBar";
import WhatsappButton from "../components/WhatsappButton";
import { Helmet } from "react-helmet";

export default function AboutPage() {
  return (
    <>
<Helmet>
  <title>Hakkımızda | Sözderece Koçluk</title>
  <meta
    name="description"
    content="Sözderece Koçluk; YKS ve LGS öğrencilerine yönelik birebir online eğitim koçluğu sunar. Misyonumuzu, vizyonumuzu ve ekibimizi bu sayfada keşfedin."
  />
  <meta
    name="keywords"
    content="sözderece koçluk, koçluk sistemi nedir, yks koçluğu, lgs koçluğu, online eğitim koçluğu, birebir koçluk"
  />
  <meta property="og:title" content="Hakkımızda | Sözderece Koçluk" />
  <meta
    property="og:description"
    content="Sözderece Koçluk hakkında merak ettikleriniz: Misyon, vizyon, koçluk sistemi ve uzman ekibimiz hakkında detaylı bilgi alın."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sozderecekocluk.com/hakkimizda" />
  <meta property="og:image" content="https://sozderecekocluk.com/images/hero-logo.webp" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://sozderecekocluk.com/hakkimizda" />
</Helmet>

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