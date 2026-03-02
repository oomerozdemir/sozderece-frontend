import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
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

      <div className="max-w-[1200px] my-10 mx-auto px-5 text-center min-h-[70vh]">
        <h1 className="text-[2.2rem] font-bold mb-2.5 text-[#333]">Koçluk Ekibimiz</h1>
        <p style={{textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px auto', color: '#666'}}>
          Sınav sürecini başarıyla tamamlamış, tecrübeli ve dinamik kadromuzla tanışın.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 pb-10 max-[500px]:gap-4">
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-5 transition-transform hover:-translate-y-[5px] flex flex-col items-center text-left max-[500px]:p-4">
              <img
                src={coach.image}
                alt={`${coach.name} - ${coach.subject || 'Derece Koçu'}`}
                className="w-full max-h-[400px] [aspect-ratio:1/3] object-cover rounded-xl mb-[15px] max-[768px]:w-40 max-[768px]:h-40 max-[768px]:rounded-full max-[768px]:mx-auto max-[768px]:mb-3 max-[500px]:max-h-[500px]"
                loading="lazy"
                width="300"
                height="300"
              />
              <h3 className="text-[1.2rem] font-semibold text-[#222] mb-1.5">{coach.name}</h3>
              <p className="text-base text-[#777] mb-2.5">{coach.subject}</p>
              <p className="text-[0.95rem] text-[#444] leading-[1.5] max-[768px]:text-[0.75rem]">{coach.description}</p>
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
