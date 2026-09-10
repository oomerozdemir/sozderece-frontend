import { Link } from "react-router-dom";
import Navbar from "./navbar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import Seo from "./Seo";

// Bir özellik geçici olarak kapalıyken (ör. SHOW_OGRETMEN=false) ilgili
// rotaların gösterdiği ince, noindex'li sayfa. Amaç: Google bu URL'leri
// yeniden taradığında zengin içerik yerine "index'leme" sinyali görüp
// sonuçlardan düşürsün — robots.txt ile engellemek yerine (o zaman noindex'i
// göremezdi) bilerek taranabilir bırakılıyor.
export default function FeatureUnavailable({ title = "Sayfa şu anda aktif değil" }) {
  return (
    <>
      <Seo title={title} noindex />
      <TopBar />
      <Navbar />
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="font-fredoka font-bold text-page-navy" style={{ fontSize: "clamp(24px, 3vw, 34px)" }}>
          Bu sayfa şu anda aktif değil
        </h1>
        <p className="font-nunito text-[#64748b] mt-3 max-w-[420px]">
          Aradığınız bölüm şu an yayında değil. Koçluk programlarımızı ana sayfamızdan inceleyebilirsiniz.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-fredoka font-bold text-white rounded-2xl py-3 px-7 no-underline"
          style={{ background: "#1C1B8A" }}
        >
          Ana sayfaya dön →
        </Link>
      </main>
      <Footer />
    </>
  );
}
