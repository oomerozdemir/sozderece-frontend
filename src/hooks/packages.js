// src/hooks/packages.js

export const PACKAGES = {
  /* 1) ÖZEL DERS – dinamik fiyat (öğretmen belirler) */
  "ozel-ders-paketi": {
    slug: "ozel-ders-paketi",
    title: "Özel Ders Paketi",
    unitPrice: null,                         // ← sabit fiyat yok
    priceText: "500₺'den başlayan öğretmen ücretleri",
    subtitle:
      "Alanında uzman öğretmenlerle birebir özel ders. Soru çözümü, konu anlatımı ve ödev desteği.",
    type: "tutoring_only",
    cta: { label: "Öğretmen seç ve ders al", href: "/ogretmenler" },
    features: [
      { label: "Alanında uzman öğretmen", included: true },
      { label: "Seçtiğin dersten birebir ders", included: true },
      { label: "Soru çözümü ve ödev desteği", included: true },
      { label: "Aylık koçluk programı", included: false },
      { label: "2 haftada bir 40 dk görüşme", included: false },
      { label: "7/24 WhatsApp desteği", included: false },
    ],
  },

  /* 2) ÖZEL DERS + HAZIR PAKET (ara paket) */
  "ozel-ders-plus-hazir-2026": {
    slug: "ozel-ders-plus-hazir-2026",
    title: "Özel Ders + Hazır YKS/LGS",
    unitPrice: 150000,                       // 1500 TL (kuruş)
    priceText: "1500₺ / ay",
    subtitle:
      "Koçluk paketine uygun bütçeli ara çözüm: hazır aylık program + 2 haftada bir 40 dk görüşme + 1 özel ders.",
    type: "hybrid_light",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=ozel-ders-plus-hazir-2026" },
    features: [
      { label: "Seçtiğin öğretmenden 1 özel ders/ay", included: true },
      { label: "Hazır aylık koçluk programı", included: true },
      { label: "2 haftada bir 40 dk görüşme", included: true },
      { label: "7/24 WhatsApp desteği", included: false },
      { label: "Kişiye özel tam koçluk", included: false },
    ],
  },

  /* 3) SADECE KOÇLUK (mevcut ana paket) */
  "kocluk-2026": {
    slug: "kocluk-2026",
    title: "Koçluk Paketi",
    unitPrice: 250000,                       // 2500 TL (kuruş)
    priceText: "2500₺ / ay",
    subtitle:
      "Sadece koçluk: kişiye özel program, hedef takibi, düzenli görüşmeler ve performans raporları.",
    type: "coaching_only",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=kocluk-2026" },
    features: [
      { label: "Kişiye özel koçluk programı", included: true },
      { label: "Haftalık/İki haftada bir görüşme", included: true },
      { label: "Performans takibi & rapor", included: true },
      { label: "7/24 WhatsApp desteği", included: true },
      { label: "Özel ders hakkı", included: false },
    ],
  },

  /* 4) KOÇLUK + ÖZEL DERS (tam paket) */
  "kocluk-ozel-ders-2026": {
    slug: "kocluk-ozel-ders-2026",
    title: "Koçluk + Özel Ders",
    unitPrice: 350000,                       // 3500 TL (kuruş)
    priceText: "3500₺ / ay",
    subtitle:
      "Koçluk + her ay 1 özel ders: hem düzenli takip hem de eksik konularda birebir destek.",
    type: "coaching_plus_tutoring",
    cta: { label: "Paketi seç", href: "/pre-auth?slug=kocluk-ozel-ders-2026" },
    features: [
      { label: "Kişiye özel koçluk programı", included: true },
      { label: "Haftalık/İki haftada bir görüşme", included: true },
      { label: "7/24 WhatsApp desteği", included: true },
      { label: "Performans takibi & rapor", included: true },
      { label: "Seçtiğin öğretmenden 1 özel ders/ay", included: true },
    ],
  },
};

/* Vitrinde gösterim sırası */
export const PACKAGES_ORDER = [
  "ozel-ders-paketi",
  "ozel-ders-plus-hazir-2026",
  "kocluk-2026",
  "kocluk-ozel-ders-2026",
];
