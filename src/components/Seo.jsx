import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const Seo = ({ title, description, canonical }) => {
  const location = useLocation(); // Otomatik URL tespiti için gerekli
  
  const defaultTitle = "Sözderece Koçluk | LGS & YKS İçin Birebir Eğitim Koçluğu";
  const defaultDesc = "YKS ve LGS sürecinde profesyonel öğrenci koçluğu, kişiye özel program ve deneme analizi. Hedefinize Sözderece ile ulaşın.";
  const siteUrl = "https://sozderecekocluk.com";

  // MANTIK: 
  // 1. Eğer sayfada özel 'canonical' prop'u gönderildiyse (sizin HomePage'deki gibi), onu kullan.
  // 2. Gönderilmediyse, o anki sayfanın yolunu (location.pathname) otomatik al.
  const rawPath = canonical || location.pathname;
  
  // URL temizliği: Başında '/' olduğundan emin olalım
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  
  // Tam URL oluştur
  const canonicalUrl = `${siteUrl}${path}`;

  return (
    <Helmet>
      {/* Sayfa Başlığı */}
      <title>{title ? `${title} | Sözderece` : defaultTitle}</title>

      {/* Meta Açıklaması */}
      <meta name="description" content={description || defaultDesc} />

      {/* Canonical URL - Artık her zaman dolu ve doğru */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Twitter Kartları */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      
      {/* Open Graph URL (SEO için önemli) */}
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
};

export default Seo;