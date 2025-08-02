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
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;



/*
kayıt olurken parolayı tekrar gırmesı gereksın

heroSectıon a ınteraktıf bır şeyler ekle reels vıdeosu nasıl ilerleriz gibi 
ekstra olarak resimlerle nasıl ilerlediğimizi anlatan bir bölüm sayfa yapabiliriz görsellerle.Görsel solda yazı sonra saga görsel sola yazı seklınde

blog uretilecek

-ogrencının sıparıs bıtımıne yakın bıldırımlerı ekle
-otomatık odeme/abonelık sıstemını ekle

sepete urun eklemek icin giris yapilmasina gerek olmazsa hangi kullanicinin sepete urun ekledigini nasil ogrenicez bunu arastir eger bir yolu varsa
sepete urun eklemek icin giris yapilmasina gerek olmasin

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
!!!Sms Eklentisi!!! Sımdılık vazgecıldı ılerde yogunlasırsak eklıcem
Başlangıç için İletiMerkezi veya NetGSM + basit bir Node.js API yeterli.

Pazarlama amaçlı gönderim yapacaksan, KVKK uyumu ve “onay” sistemi çok önemli.

Sistem büyürse, webhook ve mesaj takibi ekleyerek tam bir CRM benzeri yapı kurabilirsin.
**********************************************************************************************

*/