import { useParams } from "react-router-dom";
import { blogPosts } from "../components/posts";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import { Helmet } from "react-helmet";

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) return <p>Yazı bulunamadı.</p>;

  return (
    <>

    <Helmet>
  <title>{post.title} | Sözderecek Koçluk Blog</title>
  <meta name="description" content={post.description} />
  <meta name="keywords" content={post.tags?.join(", ")} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.description} />
  <meta property="og:image" content={post.image || "https://sozderecekocluk.com/images/default-blog.webp"} />

  <meta property="og:url" content={`https://www.sozderecekocluk.com/blog/${post.slug}`} />
  <meta property="og:type" content="article" />
<meta property="article:published_time" content={post.date} />
<meta name="robots" content="index, follow" />
  <link rel="canonical" href={`https://sozderecekocluk.com/blog/${post.slug}`} />

</Helmet>
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
    </div>
    <Footer />

    </>
  );
};

export default BlogDetail;
