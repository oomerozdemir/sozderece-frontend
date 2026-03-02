import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Seo from "../components/Seo";
import { FiRefreshCw } from "react-icons/fi";

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

      <div className="py-10 px-5 bg-[#fafafa] min-h-screen text-[#1a1a1a] max-[768px]:py-6 max-[768px]:px-3.5">
        <header className="text-center mb-[50px]">
          <h1 className="text-[2rem] font-bold text-[#222] max-[768px]:text-[1.4rem]">Sözderece Blog</h1>
          <p>YKS ve LGS sürecinde ihtiyacın olan tüm rehberlik yazıları burada.</p>
          <div>
            <input
              type="text"
              placeholder="İçeriklerde ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-2.5 px-3.5 w-[60%] max-w-[400px] mt-3.5 rounded-lg border border-[#ccc] outline-none transition-all focus:border-[#fbbf24] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.2)] max-[768px]:w-[90%]"
            />
          </div>
        </header>

        <div className="flex gap-10 flex-wrap justify-center max-w-[1200px] mx-auto">
          <section className="flex-[3] grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <div
                key={post.id}
                className="relative h-[320px] rounded-2xl overflow-hidden cursor-pointer bg-cover bg-center flex items-end text-white shadow-[0_3px_10px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
                style={{ backgroundImage: `url(${post.image})` }}
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="bg-gradient-to-t from-[rgba(0,0,0,0.65)] to-transparent p-5 w-full">
                  <span className="text-xs text-yellow-300">{post.category}</span>
                  <h3 className="text-[1.3rem] font-semibold mb-2">{post.title}</h3>
                  <p className="text-[0.95rem] text-[#fbbf24] m-0">{post.description}</p>
                  <span className="text-xs text-gray-300">{post.date}</span>
                </div>
              </div>
            ))}

            {visibleCount < filteredPosts.length && (
              <div className="text-center my-10 col-span-full">
                <button className="py-3 px-[26px] rounded-lg border-0 bg-[#fbbf24] text-black font-semibold text-base cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-all hover:bg-[#facc15] hover:-translate-y-[3px]" onClick={handleLoadMore}>
                  <span className="inline-flex items-center gap-2"><FiRefreshCw /> Daha Fazla Yükle</span>
                </button>
              </div>
            )}

            {filteredPosts.length === 0 && (
              <div className="p-5 text-center w-full">
                Aradığınız kriterlere uygun yazı bulunamadı.
              </div>
            )}
          </section>

          <aside className="flex-1 max-w-[320px]">
            <h4 className="font-bold mb-4">Öne Çıkanlar</h4>
            {blogPosts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex gap-3 items-center mb-[18px] cursor-pointer transition-transform hover:translate-x-1"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <img src={post.image} alt={post.title} loading="lazy" className="w-[65px] h-[65px] object-cover rounded-md" />
                <div>
                  <span className="text-xs text-[#888]">{post.date}</span>
                  <p className="text-[0.9rem] text-[#333] font-medium">{post.title}</p>
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
