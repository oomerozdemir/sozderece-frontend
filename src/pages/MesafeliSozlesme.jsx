import React from "react";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Seo from "../components/Seo"; // Seo bileşeni eklendi

const MesafeliHizmetSozlesmesi = () => {
  return (
    <>
    
      <Seo 
        title="Mesafeli Satış Sözleşmesi" 
        description="Sözderece Koçluk mesafeli satış sözleşmesi. Hizmet kapsamı, ödeme koşulları, tarafların hakları, cayma hakkı ve iade koşulları hakkında yasal bilgilendirme."
        canonical="/mesafeli-satis-sozlesmesi"
      />

      <TopBar />
      <Navbar />

      <div className="max-w-[900px] mx-auto py-10 px-5 leading-relaxed text-slate-800 bg-white">
        <h1 className="text-[1.9rem] mb-5 text-slate-900 text-center">📝 MESAFELİ KOÇLUK HİZMET SÖZLEŞMESİ</h1>

        <p className="text-sm text-gray-500 mb-5">
           Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </p>

        <p className="my-3">
           <strong>Önemli Not:</strong> Bu sözleşme, hizmet satın alma işlemi öncesinde kullanıcıya elektronik ortamda sunulmuştur. Kullanıcı, satın alma işlemini tamamlayarak işbu sözleşmeyi okuduğunu, anladığını ve tüm hükümlerini kabul ettiğini beyan eder.
        </p>

        <p className="my-3">
          İşbu Mesafeli Koçluk Hizmet Sözleşmesi, aşağıda bilgileri yer alan
          Hizmet Sağlayıcı ile Hizmet Alan (Müşteri) arasında elektronik ortamda
          aşağıdaki şartlarla düzenlenmiştir.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">1. TARAFLAR</h2>
        <p className="my-3"><strong>Hizmet Sağlayıcı (Satıcı):</strong></p>
        <ul className="pl-5 mt-2 mb-4 list-disc">
          <li className="mb-1.5">Adı: Sözderece Koçluk</li>
          <li className="mb-1.5">Web Sitesi: https://sozderecekocluk.com</li>
          <li className="mb-1.5">E-posta: iletisim@sozderecekocluk.com</li>
          <li className="mb-1.5">Telefon: +90 531 254 67 01</li>
          <li className="mb-1.5">Adres: Ümraniye / İstanbul</li>
        </ul>
        <p className="my-3"><strong>Hizmet Alan (Alıcı):</strong> Kullanıcı tarafından çevrimiçi formda doldurulacaktır.</p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">2. SÖZLEŞMENİN KONUSU</h2>
        <p className="my-3">
          Bu sözleşmenin konusu, Hizmet Alan tarafından sozderecekocluk.com üzerinden
          satın alınan birebir YKS/LGS koçluk ve danışmanlık hizmetinin sunulmasına
          ilişkin tarafların hak ve yükümlülüklerini belirlemektir.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">3. HİZMETİN KAPSAMI</h2>
        <p className="my-3">
          Danışmanlık birebir ve çevrimiçi (online) olarak sunulur. Hizmetin kapsamı;
          haftalık planlama, bireysel seans, takip, gelişim raporlaması ve benzeri
          koçluk faaliyetlerini içerir.
        </p>
        <p className="my-3">
          Detaylar, site üzerinden belirtilen paket açıklamalarında yer alır.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">4. ÖDEME BİLGİLERİ</h2>
        <p className="my-3">
          Ödemeler, PayTR sanal POS sistemi üzerinden kredi kartı veya banka kartı
          aracılığıyla alınır. Ödeme sonrası kullanıcıya seans planlaması iletilir.
          Fiyatlar, web sitesinde belirtilen paket ücretleriyle sabittir.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">5. CAYMA HAKKI ve İADE POLİTİKASI</h2>
        <p className="my-3">
          Hizmet Alan, sözleşmenin kurulduğu tarihten itibaren 5 (beş) gün içinde
          hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını
          kullanabilir.
        </p>
        <p className="my-3">
          Cayma hakkı bildirimi web sitesi, e-posta veya WhatsApp üzerinden yazılı
          şekilde yapılmalıdır. Cayma halinde ödeme en geç 14 gün içinde iade edilir.
        </p>
        <p className="my-3">
          Ancak cayma süresi içerisinde hizmetin kısmen/tamamen sunulmuş olması
          halinde, sunulan hizmet oranında ücret tahsil edilir.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">6. KİŞİSEL VERİLERİN KORUNMASI</h2>
        <p className="my-3">
          Hizmet sırasında paylaşılan kişisel veriler sadece koçluk hizmeti amacıyla
          saklanır ve KVKK kapsamında korunur.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">7. UYUŞMAZLIK DURUMUNDA</h2>
        <p className="my-3">
          Uyuşmazlık durumlarında öncelikle uzlaşma aranır, aksi durumda İstanbul
          Tüketici Hakem Heyetleri ve Mahkemeleri yetkilidir.
        </p>

        <h2 className="mt-6 text-[1.3rem] text-slate-700 border-b border-slate-200 pb-1">8. YÜRÜRLÜK</h2>
        <p className="my-3">
          Bu sözleşme elektronik ortamda onaylanarak yürürlüğe girer. Hizmet Alan,
          tüm hükümleri okuduğunu ve kabul ettiğini beyan eder.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default MesafeliHizmetSozlesmesi;