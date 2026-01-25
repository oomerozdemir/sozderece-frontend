import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const Seo = ({ title, description, canonical }) => {
  const location = useLocation();
  
  const siteName = "Sözderece Koçluk";
  const defaultTitle = "Sözderece Koçluk | LGS & YKS İçin Birebir Eğitim Koçluğu";
  const defaultDesc = "YKS ve LGS sürecinde profesyonel öğrenci koçluğu, kişiye özel program ve deneme analizi. Hedefinize Sözderece ile ulaşın.";
  const siteUrl = "https://sozderecekocluk.com";
  const defaultImage = `${siteUrl}/seo-cover.jpg`; // public klasöründe bu resmin olduğundan emin olun

  // Canonical URL Mantığı: 
  const rawPath = canonical || location.pathname;
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const canonicalUrl = `${siteUrl}${path}`;

  const currentTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const currentDesc = description || defaultDesc;

  return (
    <Helmet>
      {/* --- Temel Meta Etiketleri --- */}
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      <link rel="canonical" href={canonicalUrl} />

      {/* --- Open Graph (Facebook, WhatsApp, LinkedIn) --- */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDesc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:locale" content="tr_TR" />

      {/* --- Twitter Cards --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDesc} />
      <meta name="twitter:image" content={defaultImage} />
    </Helmet>
  );
};

export default Seo;