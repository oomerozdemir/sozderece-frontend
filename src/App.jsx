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
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const NotFound = lazy(() => import("./pages/notFound.jsx"));
const PreCartAuth = lazy(() => import("./pages/preAuth.jsx"));



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
            <Route path="/pre-auth" element={<PreCartAuth />}/>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sss" element={<FaqPage/>} />
            <Route path="/blog" element={<BlogList/>} />
            <Route path="/blog/:slug" element={<BlogDetail/>} />


            {/* Korunan sayfalar */}
            <Route path="/coach/dashboard" element={<RoleRoute allowedRoles={["coach"]}><CoachDashboard /></RoleRoute>} />
            <Route path="/student/dashboard" element={<RoleRoute allowedRoles={["student"]}><StudentDashboard /></RoleRoute>} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            <Route path="/order-success" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
            <Route path="/payment/iframe/:token" element={<PrivateRoute><PaymentIframePage /></PrivateRoute>} />

            <Route path="/sepet" element={<CartPage />} />
            <Route path="/paket-detay" element={<PackageDetail />} />
            <Route path="/ekibimiz" element={<CoachDetail />} />
            <Route path="/ucretsiz-on-gorusme" element={<ContactPage />} />
            <Route path="/payment-fail" element={<PaymentFailPage />} />

            <Route path="/admin/*" element={<RoleRoute allowedRoles={["admin"]}><AdminApp /></RoleRoute>} />
            <Route path="/admin/coaches" element={<RoleRoute allowedRoles={["admin"]}><AdminCoachPage /></RoleRoute>} />
            <Route path="/admin/coupons" element={<RoleRoute allowedRoles={["admin"]}><AdminCouponPage /></RoleRoute>} />
            <Route path="/admin/refund-requests" element={<RoleRoute allowedRoles={["admin"]}><RefundRequests /></RoleRoute>} />

            <Route path="/unauthorized" element={<div>Erişim izniniz yok.</div>} />

            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;




/*

giris kayit yapma kisminda sifre kullanmiyoruz artik email ve otp ile giris olucak hep
SIFRE KULLANILMICAK
OTP ILE GIRIS YAPAN KULLANICIYI 1 AY HATIRLICAK SISTEM VE OTP EMAILI ISTEMICEK BIR SURE
BUNLARI HALLET


*****Gıriş yapma ve kayıt olmada onemli değişiklikler*****
Paket-detay => Hemen Basla Butonu => e-posta girer kullanici ve otp kodu gider.
=> kod dogruysa paket sepete eklenir ve kullanici ayni zamanda giris yapmis olur.
=> sepet sayfasi acilir buradan devama basar => klasik payment sayfasina gider.

Bu sistemin artilari/eksileri
+ kullanici kayit olurken daha az zaman harcar
+ kullanicidan e posta alindigi icin ardindan rahatsiz edilebilir tekrar odemeyi tamamlamasa bile
+ sepette urun kaldiysa mail veya sms gonderimi yapilabilir.
- kullanicidan daha detayli bilgileri sonradan doldurmasi gerekir
- ilk eksideki sorunu daha fazla calisma gerekse bile su sekilde cozebiliriz;
fatura kisminda cogu bilgiyi aliriz ve onu user bilgisiyle baglariz bu sayede odeme tamamlandiginda cogu bilgi alinmis olur
-sifreyi tekrar olusturmasi gerekir
-eger sifre olusturmazsa her girisinde otp maili gider oyle girer
-kullaniciya hesabim kisminda eyleme geciricek sayi ikonu cikar.O sekilde doldurmasi gereken alanlari gosterebiliriz
Genel tani;
Daha fazla zaman ve emek gerekicek bu sistem icin bazi seyler silinicek ve hatalar olucak.Ancak en sonunda
daha gelismis,direkt olarak eyleme gecirebilecek ve pratik bir kullanicidan bilgi donusum alma yontemi olucak.
Panel bilgileri su anda zaten gostermelik.Ilerde paneli gelistirdigimizde ayri bir webApp uzerinden yonlendirmeyle
giris yaptirabiliriz.
**********************************************************************************


cerezlerin nasil calistigini ogren tamamiyle


googlesearch console da dızıne eklenen sayfaların hata raporlarını ıncele ve duzelt



*****Seviye tespit araci olusturabiliriz sitede*****


deneme analızı hesaplama net hesaplama gıbı seylerı ekle araç olarak

iade talebi gonderildiginde bana mail gelsin ayrica iade talebi yerinde 
siparisle ilgili fiyat bilgisi de olsun


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




✅ 5. Performans İyileştirmeleri
Mevcut Durum: Çok sayfalı veriler yok ama ileride olabilir.

Öneriler:

Kullanıcılar ve siparişler için pagination veya infinite scroll.

Her request’te tüm kullanıcıları değil, sadece gerekli alanları getirmek (örneğin: sadece id, name, role) için Prisma’da select kullanabilirsin.

React bileşenlerini memo, useCallback, useMemo ile optimize et.


✅ 8. Yedekleme ve Loglama
Öneriler:

Kullanıcı işlemleri için sunucu tarafında audit log tutmak (örn: user_logs).

Hatalar için winston veya pino ile backend loglama sistemi kurmak.

Veritabanını haftalık/momentlik olarak yedekleyen bir otomasyon düşün.




Yeni özellikler ekleyebilirsin (örneğin: PDF ödev ekleme, video dersler, öğrenci geri bildirim).


 Ekstra Tavsiyeler:
phone alanı mutlaka 10 veya 11 haneli ve sayısal olmalı (örneğin "05551234567").

user_address düzgün bir adres olmalı, emoji vs. olmamalı.

Tüm alanlarda null, undefined, "" gibi değerleri engelle.



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
Neden backend sepet?

Ölçüm & atribüsyon

Tüm funnel’ı sunucuda loglarsın: cart_created → item_added → checkout_started → payment_success/failed. Bu zincir tek bir cart_id üzerinden akar, raporlamak çok kolaylaşır.

Cihazlar arası tutarlılık: Kullanıcı telefon → laptop geçtiğinde sepeti aynen görür (client-side localStorage’da bu mümkün değil).

Abandonment (terk) takibi: “Sepete eklendi ama ödeme olmadı” vakalarını kesin ve kalıcı biçimde tespit edip e-posta/SMS otomasyonu tetikleyebilirsin (1 saat/24 saat sonra hatırlatma).

A/B testleri & kampanya atribüsyonu: Sepete ekleme anında kampanya/utm bilgilerini cart’a yazar, hangi kaynağın satışa döndüğünü güvenle ölçersin.

İş kuralları & esneklik

Stok/limit/paket kuralları: “Bir kullanıcı aynı anda şu iki paketi alamaz”, “indirim kodu X sadece yeni kullanıcılara” gibi kuralları tek yerde uygularsın.

Fiyat tutarlılığı: Fiyat, vergi, kur hesapları server’da standart olur; arayüzde farklı tarayıcılar sebebiyle hata/yanlış fiyat riski azalır.

Promosyon/kupon: Kupon doğrulama, kampanya koşullarını merkezi yönetirsin.

Güvenlik: Fiyat oynama, miktar manipülasyonu gibi client taraflı riskler azalır.

Pazarlama & CRM

Abandoned cart e-postası: E-posta zaten OTP ile elimizde. Sepette ürün kalan herkese otomatik akış kurmak çok basit hale gelir.

Yaşam döngüsü tetikleri: “Sepette 48 saattir bekleyen paket”, “döndü ama satın almadı” vb. segmentleri cart durumundan üretirsin.

Operasyonel

Destek/geri dönüş analizi: Bir kullanıcının sepet geçmişine bakıp destek verirken ne olduğunu anlarsın.

Raporlama: Günlük/haftalık sepet → ödeme dönüşüm oranları, ortalama sepet tutarı, en çok bırakılan ürün vb. raporlar tek sorguyla çıkar.
*************************************************************************************


*************************************************************************************
!!!Sms Eklentisi!!! Sımdılık vazgecıldı ılerde yogunlasırsak eklıcem
Başlangıç için İletiMerkezi veya NetGSM + basit bir Node.js API yeterli.

Pazarlama amaçlı gönderim yapacaksan, KVKK uyumu ve “onay” sistemi çok önemli.

Sistem büyürse, webhook ve mesaj takibi ekleyerek tam bir CRM benzeri yapı kurabilirsin.
**********************************************************************************************

*/