import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/CoachDetail.css";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";


const CoachDetailPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await axios.get("/api/coaches/public-coach");
        setCoaches(res.data);
      } catch (error) {
        console.error("Koçlar yüklenemedi:");
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  if (loading) return <p>Koçlar yükleniyor...</p>;

  return (
    <>
<Helmet>
  <title>Ekibimiz | Sözderece Koçluk</title>
  <meta
    name="description"
    content="Sözderece Koçluk ekibinde yer alan uzman koçlarımızı yakından tanıyın. YKS ve LGS alanında derece yapmış eğitim koçlarımızla başarıya bir adım daha yaklaşın."
  />
  <meta
    name="keywords"
    content="yks koçları, lgs koçları, sözderece koçları, eğitim koçu, öğrenci koçu, sınav koçluğu, koçluk ekibi, yks mentor, lgs rehberlik"
  />
  <meta property="og:title" content="Ekibimiz | Sözderece Koçluk" />
  <meta
    property="og:description"
    content="Sözderece Koçluk ekibinde yer alan alanında uzman koçlarımızı bu sayfadan inceleyin. Her biri öğrencilerin motivasyon ve başarısına odaklıdır."
  />
  <meta property="og:url" content="https://sozderecekocluk.com/koclar" />
  <meta property="og:image" content="https://sozderecekocluk.com/hero-logo.webp" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://sozderecekocluk.com/koclar" />
</Helmet>


  <TopBar />
<Navbar />

<div className="coach-detail-page">
  <h2 className="coach-detail-title">Ekibimiz</h2>

  <p className="coach-detail-description">
    Sözderece Koçluk ekibi, <strong>YKS koçları</strong> ve <strong>LGS koçları</strong> olarak sınav sürecinde öğrencilerin her adımında yanında olmaktadır.
    <strong> Eğitim koçu</strong> desteği sayesinde öğrencilerimiz motivasyonlarını yüksek tutarken, sınav stratejilerini koçlarıyla birlikte geliştirir.
    <strong> Sınav koçluğu</strong> hizmetimizle disiplinli ve verimli bir hazırlık süreci sunuyoruz. Her bir <strong>öğrenci koçu</strong>, kendi alanında
    uzmanlaşmış ve <strong>YKS</strong> ile <strong>LGS</strong> sınavlarında derece yapmış mentorlerden oluşur.
    <strong> Koçluk ekibimizi</strong> aşağıdan inceleyebilir ve size en uygun koçla birebir rehberlik sürecinizi başlatabilirsiniz.
  </p>


  <div className="coach-detail-list">
    {coaches.map((coach) => (
      <div key={coach.id} className="coach-detail-card">
        <img src={coach.image} alt={coach.name} className="coach-detail-image" />
        <h3 className="coach-detail-name">{coach.name}</h3>
        <p className="coach-detail-subject">{coach.subject}</p>
        <p className="coach-detail-description">{coach.description}</p>
      </div>
    ))}
  </div>
</div>

<Footer />
    </>
  );
};

export default CoachDetailPage;
