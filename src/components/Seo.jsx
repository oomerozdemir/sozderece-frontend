import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const Seo = ({ 
  title, 
  description, 
  canonical,
  keywords,
  image,
  type = "website",
  author,
  noindex = false
}) => {
  const location = useLocation();
  
  const siteName = "Sözderece Koçluk";
  const defaultTitle = "Sözderece Koçluk | YKS & LGS Online Öğrenci Koçluğu";
  const defaultDesc = "Sözderece Koçluk ile YKS ve LGS sınavlarına hazırlanın. Kişiye özel ders programı, deneme analizi, motivasyon desteği ve derece öğrencisi koçlarla başarıya ulaşın. İlk 5 gün koşulsuz iade garantisi.";
  const defaultKeywords = "YKS koçluk, LGS koçluk, öğrenci koçluğu, online koçluk, ders çalışma programı, sınav koçluğu, TYT koçluk, AYT koçluk, üniversite sınavı koçluğu";
  const siteUrl = "https://sozderecekocluk.com";
  const defaultImage = `${siteUrl}/seo-cover.jpg`;

  // Canonical URL Mantığı
  const rawPath = canonical || location.pathname;
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const canonicalUrl = `${siteUrl}${path}`;

  // Meta değerler
  const currentTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const currentDesc = description || defaultDesc;
  const currentKeywords = keywords || defaultKeywords;
  const currentImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
  const currentAuthor = author || siteName;

  // Robots meta
  const robotsContent = noindex ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      {/* --- Temel Meta Etiketleri --- */}
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      <meta name="keywords" content={currentKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* --- Robots --- */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* --- Author and Copyright --- */}
      <meta name="author" content={currentAuthor} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteName}`} />
      
      {/* --- Language and Locale --- */}
      <meta name="language" content="Turkish" />
      <meta httpEquiv="content-language" content="tr" />
      
      {/* --- Additional SEO --- */}
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* --- Open Graph (Facebook, WhatsApp, LinkedIn) --- */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={currentImage} />
      <meta property="og:image:secure_url" content={currentImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="tr_TR" />

      {/* --- Twitter Cards --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDesc} />
      <meta name="twitter:image" content={currentImage} />
      <meta name="twitter:site" content="@sozderece" />
      <meta name="twitter:creator" content="@sozderece" />
      
      {/* --- Mobile Optimization --- */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* --- Additional Tags for Better SEO --- */}
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      
      {/* --- Structured Data (JSON-LD) --- */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteName,
          "url": siteUrl,
          "logo": `${siteUrl}/images/hero-logo.webp`,
          "description": currentDesc,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "TR",
            "addressLocality": "Türkiye"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+90-531-254-6701",
            "contactType": "Customer Service",
            "availableLanguage": "Turkish"
          },
          "sameAs": [
            "https://www.instagram.com/sozderece/",
            "https://www.linkedin.com/company/sözderece-koçluk"
          ]
        })}
      </script>
      
      {/* Educational Service Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": siteName,
          "description": currentDesc,
          "url": canonicalUrl,
          "image": currentImage,
          "priceRange": "₺₺",
          "areaServed": "TR",
          "availableLanguage": "Turkish"
        })}
      </script>
    </Helmet>
  );
};

export default Seo;