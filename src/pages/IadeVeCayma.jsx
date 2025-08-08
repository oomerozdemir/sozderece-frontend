import "../cssFiles/mesafeliSozlesme.css";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import { Helmet } from "react-helmet";

const IadeVeCaymaPolitikasi = () => {
  return (
    <>
     <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <TopBar />
    <Navbar />
    <div className="sozlesme-container">
      <h1>🔁 İADE VE CAYMA POLİTİKASI</h1>

      <p className="sozlesme-note">
        🔒 <strong>Önemli Not:</strong> Bu sözleşme, hizmet satın alma işlemi öncesinde kullanıcıya elektronik ortamda sunulmuştur. Kullanıcı, satın alma işlemini tamamlayarak işbu sözleşmeyi okuduğunu, anladığını ve tüm hükümlerini kabul ettiğini beyan eder.
      </p>

      <h2>1. Genel Bilgilendirme</h2>
      <p>
        Bu iade politikası, Sözderece Koçluk tarafından sağlanan birebir YKS ve LGS koçluk/danışmanlık hizmetleri için geçerlidir.
        Hizmet alımı sonrası kullanıcılar, Mesafeli Sözleşmeler Yönetmeliği ve Tüketicinin Korunması Hakkında Kanun çerçevesinde aşağıdaki haklara sahiptir.
      </p>

      <h2>2. Koşulsuz Cayma Hakkı (5 Gün)</h2>
      <p>
        Müşteri, hizmetin satın alındığı tarihten itibaren 5 (beş) takvim günü içinde, herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayabilir.
        Bu süre içinde hizmet kullanılmış olsa dahi, ödenen ücretin tamamı iade edilir.
      </p>

      <h2>3. Cayma Süresi Sonrası</h2>
      <p>
        5 günlük sürenin dolmasıyla birlikte cayma hakkı sona erer. Bu süreden sonra herhangi bir iade yapılmaz.
        Satın alınan hizmet paketi, belirlenen süre boyunca aktif olarak devam eder.
      </p>

      <h2>4. İade Süreci</h2>
      <p>
        Cayma hakkı süresi içinde yapılan talepler, tarafımıza "Siparişlerim" sayfasında bulunan iade talep formunun doldurulmasıyla iletilmelidir. Bir sorun olması halinde WhatsApp veya e-posta üzerinden bildirim yapılabilir.
        Geri ödeme, bildirimin alınmasından itibaren en geç 14 gün içinde ödeme yapılan yöntemle gerçekleştirilir.
      </p>

      <h2>5. İletişim</h2>
      <ul>
        <li>📩 E-posta: iletisim@sozderecekocluk.com</li>
        <li>📱 WhatsApp: +90 531 254 67 01</li>
      </ul>
    </div>
    <Footer />
    </>
  );
};

export default IadeVeCaymaPolitikasi;
