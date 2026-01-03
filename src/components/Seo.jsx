import React from "react";
import { Helmet } from "react-helmet";

const Seo = ({ title, description, canonical }) => {
  // Varsayılan değerler (Eğer bir sayfa için özel bilgi girmezsen bunlar görünür)
  const defaultTitle = "Sözderece Koçluk | LGS & YKS İçin Birebir Eğitim Koçluğu";
  const defaultDesc = "YKS ve LGS sürecinde profesyonel öğrenci koçluğu, kişiye özel program ve deneme analizi. Hedefinize Sözderece ile ulaşın.";
  const siteUrl = "https://sozderecekocluk.com";

  return (
    <Helmet>
      {/* Sayfa Başlığı */}
      <title>{title ? `${title} | Sözderece` : defaultTitle}</title>

      {/* Meta Açıklaması */}
      <meta name="description" content={description || defaultDesc} />

      {/* Canonical URL (Kopya içerik durumunu önler) */}
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      {/* Twitter Kartları (Sosyal medyada paylaşılınca güzel görünmesi için) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
    </Helmet>
  );
};

export default Seo;