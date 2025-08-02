import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import { FiRefreshCw } from "react-icons/fi";
import { Helmet } from "react-helmet";

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

<Helmet>
  <title>YKS ve LGS Blog İçerikleri | Sözderecek Koçluk</title>
  <meta name="description" content="YKS ve LGS öğrencileri için rehberlik, sınav stratejileri, tercih dönemleri hakkında güncel ve bilgilendirici blog yazıları." />
  <meta name="keywords" content="YKS blog, LGS blog, tercih rehberi, sınav koçluğu, eğitim danışmanlığı" />
  <meta property="og:title" content="YKS ve LGS Blog İçerikleri | Sözderecek Koçluk" />
  <meta property="og:description" content="YKS ve LGS sürecinde ihtiyacınız olan tüm bilgi ve ipuçları blog yazılarımızda." />
  <meta property="og:url" content="https://www.sozderecekocluk.com/blog" />
  <meta name="robots" content="index, follow" />
</Helmet>

      <TopBar />
      <Navbar />

      <div className="blog-page">
        <header className="blog-header">
          <h1>Sözderece Koçluk Blog </h1>
          <p>YKS ve LGS yolculuğunda ihtiyacınız olan tüm içerikler burada.</p>
          <input
            type="text"
            placeholder="Blog içinde ara..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </header>

        <main className="blog-main">
          <section className="blog-cards">
  {filteredPosts.slice(0, visibleCount).map((post) => (
    <div
      key={post.id}
      className="blog-card"
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

          </section>

          <aside className="blog-sidebar">
            <h4>Öne Çıkanlar</h4>
            {blogPosts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="sidebar-post"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <img src={post.image} alt="" />
                <div>
                  <span className="sidebar-date">{post.date}</span>
                  <p>{post.title}</p>
                </div>
              </div>
            ))}
          </aside>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default BlogList;
