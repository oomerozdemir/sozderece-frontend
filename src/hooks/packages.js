
export const PACKAGES = {
  /* 1) ÖZEL DERS – dinamik fiyat (öğretmen belirler) */
  "ozel-ders-paketi": {
    slug: "ozel-ders-paketi",
    title: "Özel Ders Paketi",
    hidden: true,
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
  "ozel-ders-plus-hazir-2026": {
    slug: "ozel-ders-plus-hazir-2026",
    title: "Özel Ders + Seviyenize Göre Çalışma Programı",
    hidden: true,

    unitPrice: 170000,                      
    priceText: "1700₺ / ay",
    subtitle:
      "Koçluk paketine uygun bütçeli ara çözüm: hazır aylık program + 2 haftada bir 40 dk görüşme + 1 ücretsiz özel ders hakkı.",
    type: "hybrid_light",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=ozel-ders-plus-hazir-2026" },
    features: [
      { label: "Seçtiğiniz Öğretmenden Ücretsiz 1 Özel Ders Hakkı", included: true },
      { label: "Sana özel 2 haftalık koçluk programı(2.hafta durum analizi sonrası yenilenir)", included: true },
      { label: "2 Haftada Bir Koçunla Görüşme Ve Durum Analizi", included: true },
      { label: "Özel Ders Paket İçeriği", included: true },
      { label: "Kişiye Özel Tam Koçluk", included: false },
    ],
    images: [
      "/images/ozeldersimage1.webp",
      "/images/paketlerImage1.webp",
    ],
    faq: [
      { title: "Programım nasıl hazırlanır?", content: "İlk görüşmede hedefine ve seviyene göre koçlarımız tarafından hazırlanır." },
      { title: "İstediğim öğretmenden özel ders alabilir miyim?", content: "Evet istediğiniz öğretmenden ders alabilirsiniz." },
      { title: "Koç ile görüşmemde neler konuşuluyor?", content: "Size verilen programa ne kadar uyduğunuz,gelişim gösterip göstermediğiniz ve kalan 2 haftada neler yapılabilir bunlar konuşuluyor." },
      { title: "WhatsApp üzerinden hiç soru sorma hakkım olmayacak mı?", content: "Aklınıza takılan her soruyu whatsapp üzerinden sizinle iletişime geçecek olan koçunuza sorabileceksiniz." },


    ],
    note: "Bu pakette size özel bir program hazırlanır ve 2 haftada bir durum analizi yapılır.Günlük takip yoktur.",
    freeLessons: 1,
    freeLessonsPeriod: "monthly",
  },

  /* 3) SADECE KOÇLUK (mevcut ana paket) */
  "kocluk-2026": {
    slug: "kocluk-2026",
    title: "YKS/LGS Tam Kapsamlı Koçluk Paketi",
    hidden: false,
    unitPrice: 250000,                       // 2500 TL (kuruş)
    priceText: "2150₺ / ay",
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
    hidden: true,
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
  "ozel-ders-plus-hazir-2026",
  "kocluk-2026",
  "kocluk-ozel-ders-2026",
];
