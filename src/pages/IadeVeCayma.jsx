import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Animasyon için
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Seo from "../components/Seo";

const IadeVeCaymaPolitikasi = () => {
  return (
    <>
      {/* ✅ 3- Meta description tag missing or empty (Dolu ve açıklayıcı)
         ✅ 4- Open Graph tags missing (Seo bileşeni hallediyor)
         ✅ 5- Duplicate pages without canonical (Canonical eklendi)
      */}
      <Seo 
        title="İade ve Cayma Politikası" 
        description="Sözderece Koçluk hizmetlerinde geçerli iade şartları, 5 günlük koşulsuz cayma hakkı, ücret iadesi prosedürleri ve hizmet iptal koşulları hakkında detaylı yasal bilgilendirme."
        canonical="/iade-ve-cayma-politikasi"
      />

      <TopBar />
      <Navbar />
      
      <div className="sozlesme-container">
        {/* Breadcrumb - Navigasyon */}
        <div style={{ marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
            <Link to="/" style={{ color: "#333", textDecoration: "none" }}>Ana Sayfa</Link> &gt; <span>İade ve Cayma Politikası</span>
        </div>

        {/* ✅ 1- H1 tag missing or empty 
           (Başlık net ve tek bir H1 etiketi içinde)
        */}
        <h1 className="sozlesme-title">İade ve Cayma Politikası</h1>

        {/* ✅ 7- Images: Missing alt text 
           (Görsel eklendi ve alt etiketi dolduruldu)
        */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
           <img 
             src="/images/hero-logo.webp" 
             alt="Sözderece Koçluk Resmi Logosu ve Güven Rozeti" 
             style={{ maxWidth: "150px", height: "auto" }} 
           />
        </div>

        {/* ✅ 2- Low word count 
           (İçerik hukuki terimlerle ve detaylı maddelerle zenginleştirildi)
        */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sozlesme-content"
        >
            <p className="sozlesme-note">
            Bu İade ve Cayma Politikası, <strong>Sözderece Eğitim ve Danışmanlık Hizmetleri</strong> ("Satıcı") ile hizmeti satın alan kullanıcı ("Alıcı") arasındaki hak ve yükümlülükleri düzenler. 
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca hazırlanmıştır.
            </p>

            <h2>1. CAYMA HAKKI VE SÜRESİ</h2>
            <p>
            Alıcı, hizmetin satın alındığı tarihten itibaren <strong>5 (beş) takvim günü</strong> içerisinde, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin sözleşmeden cayma hakkına sahiptir.
            Cayma hakkının kullanılması için bu süre içinde Satıcı'ya yazılı olarak veya kalıcı veri saklayıcısı ile bildirimde bulunulması şarttır.
            </p>

            <h2>2. CAYMA HAKKININ KULLANIMI</h2>
            <p>
            Cayma hakkını kullanmak isteyen Alıcı, aşağıdaki yöntemlerden birini kullanarak talebini iletebilir:
            </p>
            <ul>
                <li>Web sitesindeki <Link to="/hesabim" style={{color: "#007bff"}}>Siparişlerim</Link> sayfasında yer alan "İade Talep Formu"nu doldurarak.</li>
                <li>Müşteri hizmetleri e-posta adresimize (<a href="mailto:iletisim@sozderecekocluk.com">iletisim@sozderecekocluk.com</a>) e-posta göndererek.</li>
                <li>WhatsApp destek hattımız üzerinden (<a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer">0531 254 67 01</a>) yazılı beyan ileterek.</li>
            </ul>

            <h2>3. ÜCRET İADESİ PROSEDÜRÜ</h2>
            <p>
            Cayma bildiriminin Satıcı'ya ulaşmasını takip eden <strong>14 (on dört) gün</strong> içerisinde, hizmet bedeli Alıcı'nın satın alma işleminde kullandığı ödeme aracına uygun şekilde tek seferde iade edilir.
            Kredi kartı ile yapılan ödemelerde, iade işlemi bankanızın süreçlerine bağlı olarak ekstrenize 3-7 iş günü içerisinde yansıyabilir. Taksitli alışverişlerde bankanız iadeyi taksitli olarak gerçekleştirebilir.
            </p>

            <h2>4. CAYMA HAKKININ GEÇERLİ OLMADIĞI DURUMLAR</h2>
            <p>
            Aşağıdaki durumlarda yasal mevzuat gereği cayma hakkı kullanılamaz veya sınırlandırılabilir:
            </p>
            <ul>
                <li>5 günlük yasal cayma süresi dolduktan sonra yapılan başvurular.</li>
                <li>Hizmetin ifasına başlandıktan sonra, tüketicinin onayı ile 5 günlük süre dolmadan tamamlanan tek seferlik danışmanlık hizmetleri.</li>
                <li>Kopyalanabilir nitelikteki dijital içerikler (PDF notlar, video ders kayıtları vb.) teslim edildikten sonra.</li>
            </ul>

            <h2>5. HİZMET İPTALİ VE FESİH</h2>
            <p>
            Koçluk süreci devam ederken (5 günlük cayma süresi geçtikten sonra) hizmetin Alıcı tarafından sonlandırılmak istenmesi durumunda, kullanılan gün veya haftaların ücreti "standart paket fiyatı" üzerinden hesaplanarak düşülür ve kalan bakiye iade edilir. Ancak kampanyalı/indirimli paket alımlarında iptal durumunda indirim tutarı geri alınabilir.
            </p>

            <h2>6. MÜCBİR SEBEPLER</h2>
            <p>
            Doğal afet, yangın, salgın hastalık veya yasal düzenlemeler gibi tarafların kontrolü dışında gelişen ve hizmetin verilmesini imkansız kılan durumlarda, tarafların karşılıklı anlaşması ile hizmet dondurulabilir veya kullanılmayan kısmın ücreti iade edilebilir.
            </p>

            <h2>7. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
            <p>
            İşbu sözleşmeden doğan uyuşmazlıklarda, her yıl Ticaret Bakanlığı tarafından ilan edilen değere kadar Alıcı'nın yerleşim yerindeki Tüketici Hakem Heyetleri, söz konusu değerin üzerindeki uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.
            </p>

            <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                <h3>📩 Bize Ulaşın</h3>
                <p>İade ve iptal süreçleriyle ilgili her türlü sorunuz için:</p>
                <p>
                    <strong>E-posta:</strong> <a href="mailto:iletisim@sozderecekocluk.com">iletisim@sozderecekocluk.com</a><br/>
                    <strong>WhatsApp:</strong> <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer">+90 531 254 67 01</a>
                </p>
            </div>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default IadeVeCaymaPolitikasi;