import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Seo from "../components/Seo"; // Seo bileşenini import ettik
import { FiRefreshCw } from "react-icons/fi";

import "../cssFiles/blog.css";

const BlogList = () => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");

  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <>

      <Seo 
        title="YKS ve LGS Blog İçerikleri" 
        description="YKS ve LGS öğrencileri için rehberlik, sınav stratejileri, tercih dönemleri hakkında güncel ve bilgilendirici blog yazıları."
        canonical="/blog"
      />

      <TopBar />
      <Navbar />

      <div className="blog-container">
        <header className="blog-header">
          <h1>Sözderece Blog</h1>
          <p>YKS ve LGS sürecinde ihtiyacın olan tüm rehberlik yazıları burada.</p>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="İçeriklerde ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="blog-main">
          <section className="blog-cards">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <div
                key={post.id}
                className="blog-card"
                // SEO için inline style yerine class veya optimize edilmiş görsel kullanılabilir ama şimdilik bırakıyoruz
                style={{ backgroundImage: `url(${post.image})` }} 
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="card-content">
                  <span className="category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <span className="date">{post.date}</span>
                </div>
              </div>
            ))}

            {visibleCount < filteredPosts.length && (
              <div className="load-more-wrapper">
                <button className="load-more-button" onClick={handleLoadMore}>
                  <span className="icon"><FiRefreshCw /></span> Daha Fazla Yükle
                </button>
              </div>
            )}
            
            {/* Arama sonucu boşsa kullanıcıya bilgi verelim */}
            {filteredPosts.length === 0 && (
               <div style={{padding: 20, textAlign: 'center', width: '100%'}}>
                 Aradığınız kriterlere uygun yazı bulunamadı.
               </div>
            )}
          </section>

          <aside className="blog-sidebar">
            <h4>Öne Çıkanlar</h4>
            {blogPosts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="sidebar-post"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <img src={post.image} alt={post.title} loading="lazy" /> {/* Lazy loading eklendi */}
                <div>
                  <span className="sidebar-date">{post.date}</span>
                  <p>{post.title}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default BlogList;