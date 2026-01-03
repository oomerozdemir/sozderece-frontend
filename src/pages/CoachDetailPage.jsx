import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/CoachDetail.css";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";
import Seo from "../components/Seo"; // SEO bileşenimizi ekledik

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

  // --- GOOGLE İÇİN LİSTE ŞEMASI ---
  // Koçlar yüklendiğinde Google'a bu kişilerin listesini sunuyoruz.
  const coachSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Sözderece Koçluk Ekibi",
    "description": "YKS ve LGS derecesi yapmış profesyonel eğitim koçları listesi.",
    "itemListElement": coaches.map((coach, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": coach.name,
        "description": coach.description || "Derece Öğrencisi Koç",
        "image": coach.image,
        "jobTitle": "Eğitim Koçu"
      }
    }))
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Koçlar yükleniyor...</div>;

  return (
    <>
      {/* 1. STANDART SEO AYARLARI */}
      <Seo 
        title="Ekibimiz - Derece Yapan Koçlar" 
        description="Sözderece Koçluk ekibiyle tanışın. Tıp, Mühendislik ve Hukuk kazanan derece öğrencisi koçlarımızla başarıya ulaşın."
        canonical="/ekibimiz"
      />

      {/* 2. DİNAMİK SCHEMA (Koç Listesi) */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(coachSchema)}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="coach-detail-page">
        {/* SEO İÇİN KRİTİK: Ana başlık h1 yapıldı (Eskiden h2 idi) */}
        <h1 className="coach-detail-title">Koçluk Ekibimiz</h1>
        <p style={{textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px auto', color: '#666'}}>
          Sınav sürecini başarıyla tamamlamış, tecrübeli ve dinamik kadromuzla tanışın.
        </p>

        <div className="coach-detail-list">
          {coaches.map((coach) => (
            <div key={coach.id} className="coach-detail-card">
              <img 
                src={coach.image} 
                alt={`${coach.name} - Sözderece Koçluk`} // Alt etiketi zenginleştirildi
                className="coach-detail-image" 
                loading="lazy" // Performans için lazy load eklendi
              />
              <h3 className="coach-detail-name">{coach.name}</h3>
              <p className="coach-detail-subject">{coach.subject}</p>
              <p className="coach-detail-description">{coach.description}</p>
            </div>
          ))}
        </div>

        {/* İç Linkleme (SEO için faydalı) */}
        <div style={{textAlign: 'center', marginTop: '50px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px'}}>
            <p style={{marginBottom: '10px'}}>Hala aklında sorular mı var?</p>
            <p>
            <a href="/sss" style={{color: '#0f2a4a', fontWeight: 'bold', textDecoration: 'underline'}}>Sıkça Sorulan Sorular</a> sayfasına göz atabilir veya 
            hemen <a href="/paketler" style={{color: '#f39c12', fontWeight: 'bold'}}>Koçluk Paketlerini</a> inceleyebilirsin.
            </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CoachDetailPage;