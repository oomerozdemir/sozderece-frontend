import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { Helmet } from "react-helmet"; 
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Seo from "../components/Seo";

import "../cssFiles/blog.css"; 

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((item) => item.slug === slug);

  // Sayfa açıldığında en üste atması için (Görsel sorunuyla bağımsız, UX iyileştirmesi)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Yazı bulunamadı.</h2>
        <button onClick={() => navigate("/blog")} style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}>
          Blog Listesine Dön
        </button>
      </div>
    );
  }

  const siteUrl = "https://sozderecekocluk.com";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`
    },
    "headline": post.title,
    "image": post.image?.startsWith("http") ? post.image : `${siteUrl}${post.image}`,
    "author": {
      "@type": "Organization",
      "name": "Sözderece Koçluk Ekibi",
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sözderece Koçluk",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/hero-logo.webp`
      }
    },
    "datePublished": post.date, 
    "description": post.summary || post.content?.substring(0, 150).replace(/<[^>]*>?/gm, '') 
  };

  return (
    <>
      <Seo 
        title={post.title}
        description={post.summary || post.content.substring(0, 150).replace(/<[^>]*>?/gm, '')}
        canonical={`/blog/${post.slug}`}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="blog-detail-page">
        <div className="blog-detail-header">
          <h1>{post.title}</h1>
          <p className="blog-date">{post.date} | <span style={{color: '#f39c12'}}>{post.category}</span></p>
          
          {/* --- DÜZELTME BURADA YAPILDI --- 
              1. 'width="100%"' etiketi SİLİNDİ.
              2. 'style' prop'u ile kesin kurallar yazıldı.
          */}
          <img 
            src={post.image} 
            alt={`${post.title} görseli`} 
            className="blog-detail-img" 
            loading="eager" 
            style={{
              display: 'block',
              maxWidth: '100%',      // Ekrana sığsın ama taşmasın
              width: 'auto',         // Resim orijinal genişliğinde kalsın (esnetilmesin)
              maxHeight: '500px',    // Çok uzunsa 500px'i geçmesin
              margin: '0 auto 30px', // Ortala
              objectFit: 'contain',  // Görsel bozulmasın
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          />
        </div>

        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <section className="related-posts">
          <h3>Diğer Yazılarımız</h3>
          <div className="related-grid">
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 3)
              .map((rel) => (
                <div 
                  key={rel.id} 
                  className="related-card" 
                  onClick={() => {
                    navigate(`/blog/${rel.slug}`);
                    window.scrollTo(0, 0); 
                  }}
                  style={{cursor: 'pointer'}}
                >
                  <img src={rel.image} alt={rel.title} loading="lazy" />
                  <h4>{rel.title}</h4>
                </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default BlogDetail;