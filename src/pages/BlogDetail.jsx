import { useParams } from "react-router-dom";
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Seo from "../components/Seo";

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) return <p>Yazı bulunamadı.</p>;

  return (
    <>

   <Seo 
        title={post.title} // Örn: "YKS Son 3 Ay Çalışma Taktikleri"
        description={post.summary || post.content.substring(0, 150)} // İçeriğin ilk 150 harfi
        canonical={`/blog/${post.slug}`}
      />
    <TopBar />
    <Navbar />

    <div className="blog-detail-page">
      <div className="blog-detail-header">
        <h1>{post.title}</h1>
        <p className="blog-date">{post.date}</p>
        <img src={post.image} alt={post.title} className="blog-detail-img" />
      </div>
      <div
        className="blog-detail-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <section className="related-posts">
  <h3>Benzer Yazılar</h3>
  <ul>
    <li><a href="/blog/yks-tercihlerin-onemi">YKS Tercihlerin Önemi</a></li>
    <li><a href="/blog/yks-hazirlik-stratejileri">YKS Hazırlık Stratejileri</a></li>
  </ul>
</section>
    </div>
    <Footer />

    </>
  );
};

export default BlogDetail;
