import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Seo from "../components/Seo";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="text-center py-[100px] px-5">
        <h2>Yazı bulunamadı.</h2>
        <button onClick={() => navigate("/blog")} className="mt-5 py-2.5 px-5 cursor-pointer">
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

      <div className="max-w-[850px] mx-auto my-[50px] bg-white py-10 px-8 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] leading-[1.8] max-[768px]:py-6 max-[768px]:px-4">
        <div>
          <h1 className="text-[2.2rem] font-bold mb-3 text-[#111] max-[768px]:text-[1.4rem]">{post.title}</h1>
          <p className="text-[#777] text-sm mb-[25px]">{post.date} | <span style={{color: '#f39c12'}}>{post.category}</span></p>

          <img
            src={post.image}
            alt={`${post.title} görseli`}
            loading="eager"
            style={{
              display: 'block',
              maxWidth: '100%',
              width: 'auto',
              maxHeight: '500px',
              margin: '0 auto 30px',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          />
        </div>

        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <section className="mt-[50px] border-t border-[#eee] pt-[30px]">
          <h3 className="text-[1.4rem] text-[#222] mb-[18px] text-center">Diğer Yazılarımız</h3>
          <div className="flex justify-center gap-5 flex-wrap max-[768px]:flex-col max-[768px]:items-center max-[768px]:gap-2.5">
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 3)
              .map((rel) => (
                <div
                  key={rel.id}
                  className="cursor-pointer w-[220px] hover:opacity-80 transition-opacity"
                  onClick={() => {
                    navigate(`/blog/${rel.slug}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <img src={rel.image} alt={rel.title} loading="lazy" className="w-full rounded-lg mb-2" />
                  <h4 className="text-sm font-semibold text-[#222]">{rel.title}</h4>
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
