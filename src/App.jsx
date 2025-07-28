import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

import PrivateRoute from "./components/PrivateRoute.jsx";
import RoleRoute from "./components/RoleRoutes.jsx";

import "./cssFiles/App.css";
import "./cssFiles/index.css";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Lazy yüklenen sayfalar
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AdminApp = lazy(() => import("./pages/AdminApp"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const RefundRequests = lazy(() => import("./pages/RefundRequest"));
const PackageDetail = lazy(() => import("./pages/PackageDetail"));
const CoachDetail = lazy(() => import("./pages/CoachDetailPage"));
const AdminCoachPage = lazy(() => import("./pages/AdminCoachPage"));
const AdminCouponPage = lazy(() => import("./pages/AdminCouponPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PaymentIframePage = lazy(() => import("./pages/PaymentIframePage"));
const PaymentFailPage = lazy(() => import("./pages/PaymentFailPage"));
const MesafeliSozlesme = lazy(() => import("./pages/MesafeliSozlesme"));
const IadeVeCaymaPolitikasi = lazy(() => import("./pages/IadeVeCayma"));
const GizlilikPolitikasiKvkk = lazy(() => import("./pages/GizlilikPolitikasi"));
const FaqPage = lazy(() => import("./pages/FaqPage.jsx"));

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="loading-spinner"><span></span>Yükleniyor...</div>}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/hakkimizda" element={<AboutPage />} />
            <Route path="/mesafeli-hizmet-sozlesmesi" element={<MesafeliSozlesme />} />
            <Route path="/iade-ve-cayma-politikasi" element={<IadeVeCaymaPolitikasi />} />
            <Route path="/gizlilik-politikasi-kvkk" element={<GizlilikPolitikasiKvkk />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sss" element={<FaqPage/>} />

            {/* Korunan sayfalar */}
            <Route path="/coach/dashboard" element={<RoleRoute allowedRoles={["coach"]}><CoachDashboard /></RoleRoute>} />
            <Route path="/student/dashboard" element={<RoleRoute allowedRoles={["student"]}><StudentDashboard /></RoleRoute>} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            <Route path="/order-success" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
            <Route path="/payment/iframe/:token" element={<PrivateRoute><PaymentIframePage /></PrivateRoute>} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/package-detail" element={<PackageDetail />} />
            <Route path="/coach-detail" element={<CoachDetail />} />
            <Route path="/ucretsiz-on-gorusme" element={<ContactPage />} />
            <Route path="/payment-fail" element={<PaymentFailPage />} />

            <Route path="/admin/*" element={<RoleRoute allowedRoles={["admin"]}><AdminApp /></RoleRoute>} />
            <Route path="/admin/coaches" element={<RoleRoute allowedRoles={["admin"]}><AdminCoachPage /></RoleRoute>} />
            <Route path="/admin/coupons" element={<RoleRoute allowedRoles={["admin"]}><AdminCouponPage /></RoleRoute>} />
            <Route path="/admin/refund-requests" element={<RoleRoute allowedRoles={["admin"]}><RefundRequests /></RoleRoute>} />

            <Route path="/unauthorized" element={<div>Erişim izniniz yok.</div>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;



/*
packageDetail de resimleri duzenle

kullanıcıdan bilgi aldığımız yerlerin doğru harfleri kelimeleri girdiğinden emin olmak için kontrolleri yap.

heroSectıon a ınteraktıf bır şeyler ekle reels vıdeosu nasıl ilerleriz gibi 
ekstra olarak resimlerle nasıl ilerlediğimizi anlatan bir bölüm sayfa yapabiliriz görsellerle.Görsel solda yazı sonra saga görsel sola yazı seklınde

bazi sayfalarda conatiner kaymis sayfaya ortalamasi


blog uretilecek
linkedinde web síten icin post paylas linki koymayi unutma backlink icin
(navbar ortalamak gpt sohbetine bak bu konular icin)

1-koclara ogrencı atandıgında bıldırım gıtsın aynı sekılde ogrencıye de
-ogrencının sıparıs bıtımıne yakın bıldırımlerı ekle
-otomatık odeme/abonelık sıstemını ekle

sepete urun eklemek icin giris yapilmasina gerek olmazsa hangi kullanicinin sepete urun ekledigini nasil ogrenicez bunu arastir eger bir yolu varsa
sepete urun eklemek icin giris yapilmasina gerek olmasin

kullaniciyi sitede tutmak giris yapmasini saglamak icin yontemler bul(belki giris yapmasini kolaylastirabiliriz)

-Ilerde bu guvenlı gırısı gelıstırırız sımdılık sadece e posta dogrulaması yeterlı



HAVALE ıle odeme yontemını sısteme ekle nehır kocluktakı gıbı bunu bı arastır.


iade talebi gonderildiginde bana mail gelsin ayrica iade talebi yerinde 
siparisle ilgili fiyat bilgisi de olsun


-ONEMLI!!! Odeme sonrası fatura gonderımı yapacagız.KDV GEREKLI MI GEREKSIZ MI FATURA DA BUNU SOR

-ilerde paketler bolumunu admin panelinden ekleme özelliğini getirebliriz veya farklı bir sistem


İleride Eklenebilecek Özellikler

Otomatik Abonelik	Kredi kartı entegresiyle paket süresi sonunda otomatik yenileme
Abonelik İptal Et	Süresi dolmadan kullanıcı iptal butonuna basarak ödemeyi durdurabilir
E-posta Hatırlatmaları	Bitmesine 3 gün kala kullanıcıya e-posta ile bilgilendirme
🧾 Sipariş geçmişi: Öğrenci, geçmiş siparişlerini görebiliyor mu?

 admin panelinde 

🕵️ Sipariş Geçmişi / Logları:


👁 Kullanıcı Kartında Sipariş Geçmişi Sekmesi:

Her kullanıcıya tıkladığında, geçmiş siparişleri listelenir


ekstra eklenicek ozellikler
ayni email ile farkli hesap olusturamama

tum sayfalarin mobilde nasil gorundugunu kontrol et


✅ 1. Kod Yapısı ve Dosya Organizasyonu
Mevcut Durum: Kodlar genelde işlevsel ama büyüdükçe karmaşık hale gelebilir.

Öneriler:

controllers, routes, middlewares, utils, services gibi alt klasörleri modülerleştir (örneğin: userService.js, coachService.js).

Modal, kart ve tab gibi bileşenleri components klasörüne alarak tekrar kullanılabilir hale getir.

AdminDashboard.jsx çok büyük bir bileşen — Custom hook veya bölünmüş child component’ler ile okunabilirliği artırabilirsin.

✅ 2. Veritabanı ve Backend Geliştirmeleri
Mevcut Durum: Prisma ile çalışıyorsun, bu harika. Ancak ilişkiler daha da güçlendirilebilir.

Öneriler:

User ile Coach arasında atanmış koç ilişkisini assignedCoachId yerine assignedCoach olarak include ile getirmek yerine Prisma ile relation tanımı yapabilirsin.

Koç geçmişi veya öğrenci-koç eşleşme geçmişi gibi bir assignment_log tablosu ekleyebilirsin (özellikle uzun vadeli sistemler için).

E-posta ya da telefon doğrulaması için verification tablosu ve JWT Refresh Token yapısı düşünebilirsin.


✅ 4. UI / UX Geliştirmeleri
Mevcut Durum: İşlevsel, ama daha profesyonel bir his için bazı iyileştirmeler gerekebilir.

Öneriler:

Modal geçişlerine fade/slide geçiş animasyonu ekleyebilirsin (Framer Motion gibi).

Koç seçimi için kart/küçük profil fotoğraflı gösterim gibi daha görsel bir yapı kullanabilirsin.

Geri bildirim mesajlarını (başarılı, hatalı) Toastify, React Hot Toast gibi kütüphanelerle daha etkili göster.

Karanlık mod / açık mod desteği düşünülebilir.

✅ 5. Performans İyileştirmeleri
Mevcut Durum: Çok sayfalı veriler yok ama ileride olabilir.

Öneriler:

Kullanıcılar ve siparişler için pagination veya infinite scroll.

Her request’te tüm kullanıcıları değil, sadece gerekli alanları getirmek (örneğin: sadece id, name, role) için Prisma’da select kullanabilirsin.

React bileşenlerini memo, useCallback, useMemo ile optimize et.

✅ 6. Gelişmiş Bildirim Sistemi
Mevcut Durum: Sınırlı sayıda mesaj sistemi var.

Öneriler:

Kullanıcılara bildirim geçmişi sunulabilir. (örn: size bir koç atandı / siparişiniz iade edildi).

Bu yapı için notifications tablosu ve frontend’de dropdown bildirim kutusu (🔔 simgesi) ekleyebilirsin.

✅ 7. Analitik & Yönetim Raporları
Mevcut Durum: Aylık sipariş grafiği güzel bir başlangıç.

Öneriler:

Öğrenci başına aktif sipariş sayısı, en çok tercih edilen koç, iade oranları gibi daha fazla gösterge paneli ekleyebilirsin.

Bunları Recharts, Chart.js veya Nivo gibi araçlarla geliştirebilirsin.

✅ 8. Yedekleme ve Loglama
Öneriler:

Kullanıcı işlemleri için sunucu tarafında audit log tutmak (örn: user_logs).

Hatalar için winston veya pino ile backend loglama sistemi kurmak.

Veritabanını haftalık/momentlik olarak yedekleyen bir otomasyon düşün.



✅ 10. Test & DevOps Hazırlığı
Öneriler:

API testleri için Jest, Supertest ile basit test altyapısı kurabilirsin.

Frontend testleri için React Testing Library başlangıç seviyesinde yeterli olur.

Projeyi ileride Vercel (frontend) + Render (backend) ya da Railway + PlanetScale gibi ortamlara taşıyabilirsin.

Eğer ileride:

🔐 IP bazlı koruma,

🔁 Kod tekrar gönderme sınırı,

🧠 Kod brute-force engelleme,

📬 Bildirim sistemi entegrasyonu,

🔔 Admin paneline doğrulama geçmişi loglama


 İlerleyebileceğimiz bazı adımlar:
🔍 Koç detay sayfasına "detayları görüntüle" özelliği (modal veya yeni sayfa)

🧑‍🎓 Öğrenci detay sayfası

🗓️ Koç ve öğrenci için randevu planlama modülü

🛡️ Role bazlı yetkilendirme ve route koruma (örn. öğrenci admin paneline giremesin)

🧪 Birim/test senaryoları yazma (isteğe bağlı)

 Opsiyonel Güvenlik Adımları (İleri Seviye – Sonra Yapabilirsin)
🔐 Şifre belirleme zorunluluğu ekle (şu an default123)






Yeni özellikler ekleyebilirsin (örneğin: PDF ödev ekleme, video dersler, öğrenci geri bildirim).

Mobil uyumluluğu test et.


 Ekstra Tavsiyeler:
phone alanı mutlaka 10 veya 11 haneli ve sayısal olmalı (örneğin "05551234567").

user_address düzgün bir adres olmalı, emoji vs. olmamalı.

Tüm alanlarda null, undefined, "" gibi değerleri engelle.


bildirim sistemiini ekle tum deneyimler icin

FATURA AKIS DIYAGRAMI
[ Kullanıcı ] 
     ↓
Ödeme Formunu Doldurur
     ↓
[ PayTR Ödeme Sayfası ]
     ↓
Ödeme Başarılı → [ callback_url ]
     ↓
Sunucunuzda "Sipariş Güncellenir" (status = paid)
     ↓
Fatura API'ye İstek (Paraşüt / Logo İşbaşı / Mükellef)
     ↓
Fatura PDF olarak oluşturulur
     ↓
PDF kullanıcıya e-posta ile gönderilir





*************************************************************************************
!!!Sms Eklentisi!!! Sımdılık vazgecıldı ılerde yogunlasırsak eklıcem
Başlangıç için İletiMerkezi veya NetGSM + basit bir Node.js API yeterli.

Pazarlama amaçlı gönderim yapacaksan, KVKK uyumu ve “onay” sistemi çok önemli.

Sistem büyürse, webhook ve mesaj takibi ekleyerek tam bir CRM benzeri yapı kurabilirsin.
**********************************************************************************************

*/