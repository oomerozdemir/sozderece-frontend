import React from "react";
import "../cssFiles/mesafeliSozlesme.css";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";

const today = new Date().toLocaleDateString("tr-TR");

const MesafeliHizmetSozlesmesi = () => {
  return (
    <>
    <TopBar />
    <Navbar />
    <div className="sozlesme-container">
      <h1>📝 MESAFELİ KOÇLUK HİZMET SÖZLEŞMESİ</h1>

      <p className="sozlesme-note">
        🔒 <strong>Önemli Not:</strong> Bu sözleşme, hizmet satın alma işlemi öncesinde kullanıcıya elektronik ortamda sunulmuştur. Kullanıcı, satın alma işlemini tamamlayarak işbu sözleşmeyi okuduğunu, anladığını ve tüm hükümlerini kabul ettiğini beyan eder.
      </p>

      <p>
        İşbu Mesafeli Koçluk Hizmet Sözleşmesi, aşağıda bilgileri yer alan
        Hizmet Sağlayıcı ile Hizmet Alan (Müşteri) arasında elektronik ortamda
        aşağıdaki şartlarla düzenlenmiştir.
      </p>

      <h2>1. TARAFLAR</h2>
      <p><strong>Hizmet Sağlayıcı (Satıcı):</strong></p>
      <ul>
        <li>Adı: Sözderece Koçluk</li>
        <li>Web Sitesi: https://sozderecekocluk.com</li>
        <li>E-posta: iletisim@sozderecekocluk.com</li>
        <li>Telefon: +90 531 254 67 01</li>
        <li>Adres: Ümraniye / İstanbul</li>
      </ul>
      <p><strong>Hizmet Alan (Alıcı):</strong> Kullanıcı tarafından çevrimiçi formda doldurulacaktır.</p>

      <h2>2. SÖZLEŞMENİN KONUSU</h2>
      <p>
        Bu sözleşmenin konusu, Hizmet Alan tarafından sozderecekocluk.com üzerinden
        satın alınan birebir YKS/LGS koçluk ve danışmanlık hizmetinin sunulmasına
        ilişkin tarafların hak ve yükümlülüklerini belirlemektir.
      </p>

      <h2>3. HİZMETİN KAPSAMI</h2>
      <p>
        Danışmanlık birebir ve çevrimiçi (online) olarak sunulur. Hizmetin kapsamı;
        haftalık planlama, bireysel seans, takip, gelişim raporlaması ve benzeri
        koçluk faaliyetlerini içerir.
      </p>
      <p>
        Detaylar, site üzerinden belirtilen paket açıklamalarında yer alır.
      </p>

      <h2>4. ÖDEME BİLGİLERİ</h2>
      <p>
        Ödemeler, PayTR sanal POS sistemi üzerinden kredi kartı veya banka kartı
        aracılığıyla alınır. Ödeme sonrası kullanıcıya seans planlaması iletilir.
        Fiyatlar, web sitesinde belirtilen paket ücretleriyle sabittir.
      </p>

      <h2>5. CAYMA HAKKI ve İADE POLİTİKASI</h2>
      <p>
        Hizmet Alan, sözleşmenin kurulduğu tarihten itibaren 5 (beş) gün içinde
        hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını
        kullanabilir.
      </p>
      <p>
        Cayma hakkı bildirimi web sitesi, e-posta veya WhatsApp üzerinden yazılı
        şekilde yapılmalıdır. Cayma halinde ödeme en geç 14 gün içinde iade edilir.
      </p>
      <p>
        Ancak cayma süresi içerisinde hizmetin kısmen/tamamen sunulmuş olması
        halinde, sunulan hizmet oranında ücret tahsil edilir.
      </p>

      <h2>6. KİŞİSEL VERİLERİN KORUNMASI</h2>
      <p>
        Hizmet sırasında paylaşılan kişisel veriler sadece koçluk hizmeti amacıyla
        saklanır ve KVKK kapsamında korunur.
      </p>

      <h2>7. UYUŞMAZLIK DURUMUNDA</h2>
      <p>
        Uyuşmazlık durumlarında öncelikle uzlaşma aranır, aksi durumda İstanbul
        Tüketici Hakem Heyetleri ve Mahkemeleri yetkilidir.
      </p>

      <h2>8. YÜRÜRLÜK</h2>
      <p>
        Bu sözleşme elektronik ortamda onaylanarak yürürlüğe girer. Hizmet Alan,
        tüm hükümleri okuduğunu ve kabul ettiğini beyan eder.
      </p>
    </div>
    <Footer />
    </>
  );
};

export default MesafeliHizmetSozlesmesi;