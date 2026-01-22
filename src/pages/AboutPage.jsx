import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet"; // Schema eklemek için gerekli
import Navbar from "../components/navbar";
import AboutComp from "../components/AboutComp";
import TopBar from "../components/TopBar";
import WhatsappButton from "../components/WhatsappButton";
import Seo from "../components/Seo";

export default function AboutPage() {
  
  // --- AHREFS İÇİN OPTİMİZASYON: Organization Schema ---
  // Bu kod, arama motorlarına "Biz bir kurumuz, logomuz bu, adımız bu" der.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Sözderece Koçluk",
      "description": "YKS ve LGS sınavlarına hazırlanan öğrenciler için birebir online koçluk ve eğitim danışmanlığı platformu.",
      "url": "https://sozderecekocluk.com",
      "logo": "https://sozderecekocluk.com/images/hero-logo.webp",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-531-254-67-01",
        "contactType": "customer service",
        "areaServed": "TR",
        "availableLanguage": "Turkish"
      },
      "sameAs": [
        "https://www.instagram.com/sozderecekocluk",
        // Varsa diğer sosyal medya linkleri buraya eklenebilir
      ]
    }
  };

  return (
    <>
      <Seo 
        title="Hakkımızda - Biz Kimiz?" 
        description="Sözderece Koçluk ekibini tanıyın. Derece öğrencisi koçlarımızla başarı hikayemiz, vizyonumuz ve öğrencilere yaklaşımımız hakkında bilgi alın."
        canonical="/hakkimizda"
      />

      {/* Yapısal Veriyi Sayfaya Enjekte Ediyoruz */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
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
        
        {/* İçerik bileşeni - Tasarım değişmedi */}
        <AboutComp /> 
 
        <WhatsappButton />
      </motion.div>
    </>
  );
}