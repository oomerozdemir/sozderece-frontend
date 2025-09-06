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

// ÖĞRETMEN: yeni sayfalar/guard
const RequireTeacher = lazy(() => import("./components/RequireTeacher.jsx"));
const TeacherPanel = lazy(() => import("./pages/TeacherPanel.jsx"));
const TeacherLogin = lazy(() => import("./pages/TeacherLogin.jsx"));
const TeacherRegister = lazy(() => import("./pages/TeacherRegister.jsx"));
const TeachersList = lazy(() => import("./pages/TeacherList.jsx"));
const TeacherDetail = lazy(() => import("./pages/TeacherDetail.jsx"));

// Öğrenci akışı
const LessonRequest = lazy(() => import("./pages/LessonRequest.jsx"));
const PackageSelect = lazy(() => import("./pages/TutorPackageSelect.jsx"));
const SlotSelect = lazy(() => import("./pages/SlotSelect.jsx"));

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="loading-spinner"><span></span>Yükleniyor...</div>}>
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/hakkimizda" element={<AboutPage />} />
            <Route path="/mesafeli-hizmet-sozlesmesi" element={<MesafeliSozlesme />} />
            <Route path="/iade-ve-cayma-politikasi" element={<IadeVeCaymaPolitikasi />} />
            <Route path="/gizlilik-politikasi-kvkk" element={<GizlilikPolitikasiKvkk />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pre-auth" element={<PreCartAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sss" element={<FaqPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/sepet" element={<CartPage />} />
            <Route path="/paket-detay" element={<PackageDetail />} />
            <Route path="/ekibimiz" element={<CoachDetail />} />
            <Route path="/ucretsiz-on-gorusme" element={<ContactPage />} />
            <Route path="/payment-fail" element={<PaymentFailPage />} />

            {/* ÖĞRETMEN: public auth sayfaları */}
            <Route path="/ogretmen/giris" element={<TeacherLogin />} />
            <Route path="/ogretmen/kayit" element={<TeacherRegister />} />

            {/* Korunan sayfalar */}
            <Route path="/coach/dashboard" element={<RoleRoute allowedRoles={["coach"]}><CoachDashboard /></RoleRoute>} />
            <Route path="/student/dashboard" element={<RoleRoute allowedRoles={["student"]}><StudentDashboard /></RoleRoute>} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            <Route path="/order-success" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
            <Route path="/payment/iframe/:token" element={<PrivateRoute><PaymentIframePage /></PrivateRoute>} />

            {/* ÖĞRETMEN: panel (yalnızca teacher rolü) */}
            <Route
              path="/ogretmen/panel/profil"element={<RequireTeacher><TeacherPanel /></RequireTeacher>}/>
            <Route path="/ogretmenler" element={<TeachersList />} />
            <Route path="/ogretmenler/:slug" element={<TeacherDetail />} />


            {/* Öğrenci → Öğretmenden ders talebi formu */}
            <Route path="/ogretmenler/:slug/talep" element={<LessonRequest />} />

            {/* Paket seçim sayfası (talep sonrası) */}
            <Route path="/paket-sec" element={<PackageSelect />} />
            {/* Randevu seçim sayfası (paket secimi sonrası) */}
            <Route path="/saat-sec" element={<SlotSelect />} />

            {/* Admin */}
            <Route path="/admin/*" element={<RoleRoute allowedRoles={["admin"]}><AdminApp /></RoleRoute>} />
            <Route path="/admin/coaches" element={<RoleRoute allowedRoles={["admin"]}><AdminCoachPage /></RoleRoute>} />
            <Route path="/admin/coupons" element={<RoleRoute allowedRoles={["admin"]}><AdminCouponPage /></RoleRoute>} />
            <Route path="/admin/refund-requests" element={<RoleRoute allowedRoles={["admin"]}><RefundRequests /></RoleRoute>} />

            {/* Common */}
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
Ogretmen tarafından bakarken degısmesı ve eklenmesı gerekenler
  3-ogretmen panelı duzenlemesı
      -ogretmen talebı onayladıgında ogrencıye de mail gitsin ve ogrencı panelınde de onaylanmış ders talepleri alanında gözüksün
      - talepler kısmına onaylanmış taleplerım bekleyen taleplerım ve gecmıs taleplerım diye alan ekleyelım


      - ders tamamlandıktan sonra ogretmen de ogrencı de dersın tamamlandıgını onaylaması gereklı(bunu admın tarafında kontrol de edecegız)
  
      -degerlendirmelerin ve yorumlarin gozukecegi yeri yap(ogrenci kısmı halledilirken eşzamanlı)
      -ogretmen yayina alirken admin tarafina talep gonderimi talep onaylandiktan sonra yayina alinir
      gerisine ozeldersalanına ogretmen olarak giriş yap ve bak neler eklenebılır
  
  9-ogretmen kayıt olurken fıyat belırlerken ona onerı yapalım size benzer öğretmenler şu aralıkta(min-max) fiyat belirledi diye
  10-Ogrenci tarafida yapilirken randevu kismini iki tarafli onaylamalari vesaire kontrol et ve yap


******** ozel ders icin ogrenci tarafi ********
  -paket secimi sonrasi randevu secimi yapsin ogrenci sectigi pakete bagli olarak 3 ders secti ise 3 tane bos yeri alsin takvimdeki uygunluga gore
  -ogretmene mail gondeririz talep geldikce
  -talep onaylandiginda ayni sekilde talep onaylandi diye ogrenciye de mail gider
  -ders bittiginde ogretmen ders tamamlandi diye isaretler.
  -ogrenci de ayni sekilde dersi tamamlandi diye isaretler ve yorum degerlendirme yonlendirmesi yapilir ogrenciye.
  -bir chatbot yeri yapabiliriz ogretmen talebi onayladiginda konusabilecekleri ve iletisim saglayacaklari kolay bir yer olur.
  
*******************************ogrenci tarafi hoca secerken ki sorunlar ==>***********************
  2-ogretmen profil sayfasinda fiyat bilgisi ogretmenin resmi ve hakkinda kisminin daha uzun olmasi
  3-ogretmen kartindaki sayacin kontrolu her seferinde gir cik yapinca olmasin ayni local storage la kontrolu yapilsin bir kisi sadece bir kere sayilsin birden fazla gir cik olunca saymasi kotuye kullanilabilir
  
  

özel ders oğretmenı ve öğrenci koçu özel giriş ve kayıt yeri açıcaz
öğrencilerin giriş yaptıgı yerden farklı olucak bu
öğrenci koçu girişini şu anki sistemle aynı tutabiliriz çok fazla koç girişi olmayacaktır bizim kontrolumuzde kalsın o
özel ders öğretmeni girişi ve kayıt yeri farklı olucak sadece orda da sistemi özeldersalanından kopyalayabiliriz.
******onemli DEGISIKLIK********
1-Ders ve ardindan hoca sistemi eklenicek
2-Yeni paketler eklenecek
3-özel ders öğretmenleri için de bir sözleşme hazırlamak gerekli

Özel ders sistemi ile eklenicek yenilikler
Frontend görünen yüzde
1-heroSectıon de uyarıcılar button vs.
2-HomePage de hangı özel derslerden hizmet verdiğimiz ve o derslerden birine tıklandıgında
o derse özel öne çıkan hocalar
3-navbar da yönlendirmeler
4-pricingSection da 3 yeni paket daha eklenicek.Özel Ders Paketi,Özel Ders + sınırlı Koçluk,Normal sözderece koçluk paketi,Premium Paket
5-her öğretmen kartının biyografisi,değerlendirmesi ve hocanın öne çıkan özellikleri olucak(özel ders alanı sitesinden örnekleme yap)
6-Tabiki özel ders öğretmenlerine özel sayfaya yönlendirme için daha fazla göster butonu.HomePage de öne çıkan öğretmenlerin altında
7-Hocayı sectıklerınde dırekt randevu olusturma sayfasına gıdıcek hangı sayfada olursa olsun
8-hocaların kart yapısı bır kere hocaların sayfasında ayarlanıcak ve her yerde onları kullanıcaz
9-Her öğretmenin kendisine ait bir hakkında kısmı da olsun
10-ogretmen kartında degerlendırmeler ve yorumlar olucak
11-yorum yapma ve degerlendırme kısmını ogretmene ozel hakkında sayfasından yapılacak
12-Hocayı sectıklerınde ilerlenecek yapı şu şekilde olucak 
sırasıyla
Ögretmenın ufak bılgısı altında verdıgı ders/dersler ve ogrencı dersı secer
ardından sevıyesını belırler.Burda da sevıyeyı her ogretmene gore koyarız ornegın bazıları sadece ortaokul vermek ıstersen ortaokul sevıyesı cıkar seceneklerde
sevıyesını sectıkten sonra 
Onlıne mı yuz yuze mı olucak(eger varsa) onu secer 
sonrasında o ogretmenın bos saatlerını gorucegı bır takvım sayfası acılır oradan ogrencı bos saatlerden birini secer
randevu saatı secımını de yaptıktan sonra bu bılgılerle dırekt olarak odeme sayfasına gıder
Odeme sayfasında secılen paket de eger ozel ders var randevu gıbı bılgıler varsa
ogrencıye gıden maıl ıcerıgını degıstırelım kı karısıklık olmasın dıger paketler ıle
ayrıca kupon gıbı seylerı sepet bolumune alalım burda kuponu uygulasınlar paymentPage de uygulamak yerıne
bu özel ders secımı asla sepete eklenmıcek
Bunun ayarlamasını detaylı olarak yapacagız karısıklıklar yasanmaması adına if senaryoları bolca olacak
Backend kısmında
1-tabıkı özel ders hocasından alacagımız bılgıler ıcın bır schema olusturacagız
2-eklenecek paketlerı eskısı gıbı sadece front da tutalım gerek yok backende almamıza
3-hocaların eklenmesını admın panelınden rahatca yapmak ıcın kurulacak sıstem(gereklı tum bılgılerı burdan gırecegız ve otomatık olarak olusturulacak)
4-Admın panelınden eklenen özel ders hocası ders verdıgı alana(matematik,tarih vesaire) göre ayrılması gereklı bunun da ayrımları yapılcak
5-Randevu olusturma sıstemı ıcın her ogretmenın takvımı olucak ogretmen kendı bos zamanlarını duzenleyebılecek
6-ayrıyeten bu özel ders hocası kendısı de kendı panelınden resım ekleyebılecek takvımını duzenleyebılecek,kendısıne aıt sayfasındakı bılgılerı duzenleyebılecegı bır panel kuracagız.
7-degerlendırmelerı ve yorumları da özel ders öğretmenlerinin schemasında saklarız burdan cekılır.
8-özel ders öğretmen panelınde öğretmen kendı randevularını geçmiş randevuları vesaire görüntüleyebilecek
9-satın alınan özel ders sonrası öğretmene de bir mail gidecek yeni bir randevunuz var diye.
10-randevu takvımını öğretmen kendisi düzenleyebilecek burada boş zamanlarını dolu zamanlarını silip düzenleyebilecek.
ayrıca yeni öğrenci eklemesi de yapabilecek öğrenci silme işlemi olmucak ama.Atanan bir randevuyu geri almayı sadece admin panelinden yapılabilir olucak.
sımdılık bu kadar daha da eklenicek şey olucaktır

paketler sayfasını yenıleyecegız
artık 4 ayrı paket oldugu ıcın 
goruntusu aynı prıcıngSectıondakı gıbı olucak ama daha detaylı 

tc yi billinginfodan kaldiralim
billinginfodan aldigimiz bazi bilgiler isim soyisim gibi bunlar eger userda eksikse orayi da doldurabilsin.


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