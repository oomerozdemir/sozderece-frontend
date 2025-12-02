
export const PACKAGES = {
  /* 1) ÖZEL DERS – dinamik fiyat (öğretmen belirler) */
  "ozel-ders-paketi": {
    slug: "ozel-ders-paketi",
    title: "Özel Ders Paketi",
    hidden: false,
    unitPrice: null,                         // ← sabit fiyat yok
    priceText: "500₺'den başlayan öğretmen ücretleri",
    subtitle:
      "Alanında uzman öğretmenlerle birebir özel ders. Soru çözümü, konu anlatımı ve ödev desteği.",
    type: "tutoring_only",
    cta: { label: "Öğretmen seç ve ders al", href: "/ogretmenler" },
    features: [
      { label: "Alanında Uzman Öğretmenlerden Her Seviyeye Özel Ders", included: true },
      { label: "Seçtiğin Dersten Tercihine Göre Online/Yüz Yüze Ders", included: true },
      { label: "Soru Çözümü Ve Ödev Desteği", included: true },
      { label: "Kişiye Özel Tam Koçluk", included: false },
    ],
    images: [
      "/images/ozeldersimage1.webp",
      "/images/ozeldersimage2.webp",
    ],
    faq: [
      { title: "Özel dersler ne kadar sürüyor?", content: "Özel derslerimizin süresi 1 saattir." },
    ],
    note: "Öğretmen ücreti öğretmene göre değişir."
  },

  /* 2) ÖZEL DERS + HAZIR PAKET (ara paket) */
  "tek-ders-kocluk-2026": {
    slug: "tek-ders-kocluk-2026",
    title: "Tek Derse Özel Koçluk",
    hidden: false,
    // oldPriceText: "1700₺",
    unitPrice: 150000,                      
    priceText: "1500₺ / ay",
    subtitle:
      "Tam kapsamlı koçluktan tek farkı gelişmek istediğiniz tek bir derse uzman koçunuzla hazırlanın!",
    type: "hybrid_light",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=tek-ders-kocluk-2026" },
    features: [
      { label: "Kişiye Özel Seçtiği Dersten Koçluk Programı", included: true },
      { label: "7/24 WhatsApp Desteği", included: true },
      { label: "Günlük Takip Ve Durum Analizi ", included: true },
      { label: "Haftada Bir Koçunla Görüşme Ve Durum Analizi", included: true },
      { label: "Özel Ders Paket İçeriği", included: false },
    ],
    images: [
      "/images/ozeldersimage1.webp",
      "/images/paketlerImage1.webp",
    ],
    faq: [
      { title: "Programım nasıl hazırlanır?", content: "İlk görüşmede hedefine ve seviyene göre koçlarımız tarafından hazırlanır." },
      { title: "İstediğim koçtan koçluk alabilir miyim?", content: "Evet kendi koçunuzu seçebilirsiniz." },
    ],
    note: "Sadece tek bir derse özel koçluk.Seçtiğiniz dersten size özel tam kapsamlı koçluk imkanı",
  },

  /* 3) SADECE KOÇLUK (mevcut ana paket) */
  "kocluk-2026": {
    slug: "kocluk-2026",
    title: "YKS/LGS Tam Kapsamlı Koçluk Paketi",
    hidden: false,
    unitPrice: 250000,                       
    // oldPriceText: "2500₺",
    priceText: "2500₺ / ay",
    subtitle:
      "Sadece koçluk: kişiye özel program, hedef takibi, düzenli görüşmeler ve performans raporları.",
    type: "coaching_only",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=kocluk-2026" },
    features: [
      { label: "Kişiye Özel Tam Kapsamlı Koçluk Programı", included: true },
      { label: "Haftada Bir Koçunla Online Görüşme", included: true },
      { label: "7/24 WhatsApp Desteği", included: true },
      { label: "Günlük Takip Ve Durum Analizi ", included: true },
      { label: "Özel Ders Paket İçeriği", included: false },
    ],
     images: [
      "/images/paketlerImage5.webp",
      "/images/paketlerImage2.webp",
      "/images/paketlerImage3.webp",
    ],
    faq: [
      { title: "Hazırladığınız program tek seferlik mi?", content: "Hayır,hazırladığımız programları öğrencinin özel hayatına, gelişimine ve en önemlisi hedefine en doğru şekilde hazırlamak için sürekli güncelliyoruz ve günlük olarak takip ediyoruz." },
      { title: "Veli bilgilendirmeleri ne sıklıkla oluyor?", content: "Velilerimizi günlük/haftalık olarak öğrencinin durumu ve gelişimi hakkında bilgilendiriyoruz." },
      

    ],
    note: "Bu pakette tam kapsamlı koçluk vardır.Özel ders hakkı tanınmamaktadır.Dilerseniz ayrı olarak satın alabilirsiniz."
  },


  /* 4) KOÇLUK + ÖZEL DERS (tam paket) */
  "kocluk-ozel-ders-2026": {
    slug: "kocluk-ozel-ders-2026",
    title: "YKS/LGS Tam Kapsamlı Koçluk + Özel Ders Paketi",
    hidden: false,
    unitPrice: 380000,                      
    priceText: "3800₺ / ay",
    subtitle:
      "Tam kapsamlı koçluk + her ay ücretsiz 2 özel ders hakkı: hem düzenli takip hem de eksik konularda birebir destek.",
    type: "coaching_plus_tutoring",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=kocluk-ozel-ders-2026" },
    features: [
      { label: "Kişiye Özel Tam Kapsamlı Koçluk Programı", included: true },
      { label: "Haftada Bir Koçunla Görüşme", included: true },
      { label: "7/24 WhatsApp Desteği", included: true },
      { label: "Günlük Takip Ve Durum Analizi ", included: true },
      { label: "Seçtiğin Öğretmenden Ücretsiz 2 Özel Ders Hakkı", included: true },
      { label: "Özel Ders Paket İçeriği", included: true },

    ],
     images: [
      "/images/ozeldersimage1.webp",
      "/images/paketlerImage4.webp",
      "/images/ozeldersimage2.webp",

    ],
    faq: [
      { title: "Bu paketin diğerlerinden farkı nedir?", content: "Bu paketimiz diğer paketlerde gördüğünüz tüm özellikleri içermektedir." },
      { title: "Özel ders hakkımı sadece tek bir öğretmende mi kullanabiliyorum?", content: "Hayır, isterseniz farklı öğretmenlerden toplamda 3 ders olacak şekilde ücretsiz olarak faydalanabilirsiniz." },
      

    ],
    note: "Bu pakette tam kapsamlı koçluk + ücretsiz 3 özel ders hakkı tanınmaktadır.",
    freeLessons: 2,
    freeLessonsPeriod: "monthly",
  }, 
};


/* Vitrinde gösterim sırası */
export const PACKAGES_ORDER = [
  "ozel-ders-paketi",
  "tek-ders-kocluk-2026",
  "kocluk-2026",
  "kocluk-ozel-ders-2026",
];
