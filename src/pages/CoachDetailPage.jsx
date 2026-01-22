import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 1. Link bileşeni eklendi
import axios from "../utils/axios";
import "../cssFiles/CoachDetail.css";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";
import Seo from "../components/Seo";

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

  // --- GOOGLE SCHEMA OPTİMİZASYONU ---
  const siteUrl = "https://sozderecekocluk.com"; // Mutlak URL için site adresi

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
        // 2. DÜZELTME: Görsel URL'i 'http' ile başlamıyorsa başına site adresini ekle
        "image": coach.image?.startsWith("http") ? coach.image : `${siteUrl}${coach.image}`,
        "jobTitle": "Eğitim Koçu",
        "worksFor": {
            "@type": "Organization",
            "name": "Sözderece Koçluk"
        }
      }
    }))
  };

  if (loading) return (
    <div style={{padding: '100px 0', textAlign: 'center', width: '100%'}}>
       <div className="spinner-border" role="status">Yükleniyor...</div>
    </div>
  );

  return (
    <>
      <Seo 
        title="Ekibimiz - Derece Yapan Koçlar" 
        description="Sözderece Koçluk ekibiyle tanışın. Tıp, Mühendislik ve Hukuk kazanan derece öğrencisi koçlarımızla başarıya ulaşın."
        canonical="/ekibimiz"
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(coachSchema)}
        </script>
      </Helmet>

      <TopBar />
      <Navbar />

      <div className="coach-detail-page">
        <h1 className="coach-detail-title">Koçluk Ekibimiz</h1>
        <p style={{textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px auto', color: '#666'}}>
          Sınav sürecini başarıyla tamamlamış, tecrübeli ve dinamik kadromuzla tanışın.
        </p>

        <div className="coach-detail-list">
          {coaches.map((coach) => (
            <div key={coach.id} className="coach-detail-card">
              <img 
                src={coach.image} 
                alt={`${coach.name} - ${coach.subject || 'Derece Koçu'}`} // Alt metni zenginleştirdik
                className="coach-detail-image" 
                loading="lazy" 
                // 3. DÜZELTME: CLS önlemek için yaklaşık en-boy oranı değerleri (CSS ile override edilebilir ama tarayıcı yer ayırır)
                width="300" 
                height="300"
              />
              <h3 className="coach-detail-name">{coach.name}</h3>
              <p className="coach-detail-subject">{coach.subject}</p>
              <p className="coach-detail-description">{coach.description}</p>
            </div>
          ))}
        </div>

        {/* 1. DÜZELTME: <a> yerine <Link> kullanıldı */}
        <div style={{textAlign: 'center', marginTop: '50px', padding: '30px 20px', backgroundColor: '#f8f9fa', borderRadius: '12px'}}>
            <p style={{marginBottom: '15px', fontSize: '1.1rem'}}>Hala aklında sorular mı var?</p>
            <p>
            <Link to="/sss" style={{color: '#0f2a4a', fontWeight: 'bold', textDecoration: 'underline'}}>Sıkça Sorulan Sorular</Link> sayfasına göz atabilir veya 
            hemen <Link to="/paket-detay" style={{color: '#f39c12', fontWeight: 'bold'}}>Koçluk Paketlerini</Link> inceleyebilirsin.
            </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CoachDetailPage;