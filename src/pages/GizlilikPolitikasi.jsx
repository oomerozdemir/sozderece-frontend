import "../cssFiles/mesafeliSozlesme.css";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";

const GizlilikPolitikasiKvkk = () => {
  return (
    <>
    <TopBar />
    <Navbar />
    <div className="sozlesme-container">
      <h1>🔐 GİZLİLİK POLİTİKASI ve KVKK AYDINLATMA METNİ</h1>

      <p className="sozlesme-note">
        🔒 <strong>Önemli Not:</strong> Bu sözleşme, hizmet satın alma işlemi öncesinde kullanıcıya elektronik ortamda sunulmuştur. Kullanıcı, satın alma işlemini tamamlayarak işbu sözleşmeyi okuduğunu, anladığını ve tüm hükümlerini kabul ettiğini beyan eder.
      </p>

      <h2>1. Veri Sorumlusu Bilgileri</h2>
      <p>
        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla hareket eden Söz Derece Koçluk tarafından hazırlanmıştır.
      </p>

      <h2>2. Toplanan Kişisel Veriler</h2>
      <ul>
        <li>Ad ve Soyad</li>
        <li>Telefon numarası</li>
        <li>Adres bilgileri</li>
        <li>E-posta adresi</li>
        <li>Ödeme bilgileri (PayTR üzerinden, tarafımızca saklanmaz)</li>
        <li>IP adresi ve işlem kayıtları (otomatik olarak)</li>
      </ul>

      <h2>3. Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
      <p>
        Kişisel veriler;
        <ul>
          <li>Web sitesi üzerinden doldurulan formlar,</li>
          <li>Ödeme işlemi sırasında iletilen bilgiler,</li>
          <li>İletişim kanalları (e-posta, WhatsApp, telefon)</li>
        </ul>
        aracılığıyla, sözleşmenin kurulması ve ifası, yasal yükümlülüklerin yerine getirilmesi, meşru menfaat ve açık rıza hukuki sebeplerine dayanarak toplanmaktadır.
      </p>

      <h2>4. Verilerin İşlenme Amaçları</h2>
      <ul>
        <li>Hizmetin sunulması ve randevuların planlanması</li>
        <li>Ödeme ve faturalandırma işlemlerinin gerçekleştirilmesi</li>
        <li>Müşteri iletişimi ve memnuniyet süreçlerinin yürütülmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Bilgilendirme, teknik destek veya hizmet duyurularının yapılması</li>
      </ul>

      <h2>5. Verilerin Aktarımı</h2>
      <p>
        Kişisel veriler, yukarıdaki amaçlar doğrultusunda;
        <ul>
          <li>PayTR (ödeme işlemleri),</li>
          <li>Yasal merciler (talep halinde),</li>
          <li>Hizmet sağlayıcılar ve iş ortaklarımız (örneğin teknik destek alınan firmalar)</li>
        </ul>
        ile KVKK’ya uygun şekilde paylaşılabilir.
      </p>
      <p>
        Veriler kesinlikle üçüncü şahıslara pazarlama veya reklam amaçlı satılmaz veya devredilmez.
      </p>

      <h2>6. Veri Sahibi Olarak Haklarınız</h2>
      <p>KVKK’nın 11. maddesi uyarınca kullanıcı olarak aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurtiçinde veya yurtdışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
        <li>KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
        <li>İşlem yapılan kişilere bu değişikliklerin bildirilmesini isteme</li>
        <li>İşlenen verilerin sadece otomatik sistemler aracılığıyla analiz edilerek aleyhinize bir sonucun çıkmasına itiraz etme</li>
        <li>KVKK’ya aykırı işlem nedeniyle zarara uğrarsanız tazminat talep etme</li>
      </ul>

      <h2>7. Saklama Süresi</h2>
      <p>
        Kişisel veriler, hizmetin ifası süresince ve ilgili mevzuatta öngörülen süreler boyunca saklanır.
        Süre sonunda yasal yükümlülüklere uygun olarak silinir, yok edilir veya anonim hale getirilir.
      </p>

      <h2>8. İletişim</h2>
      <ul>
        <li>📩 E-posta: iletisim@sozderecekocluk.com</li>
        <li>📱 Telefon/WhatsApp: +90 531 254 67 01</li>
      </ul>
    </div>
    <Footer />
    </>
  );
};

export default GizlilikPolitikasiKvkk;
