// Panel Turu — 7 çekirdek adım (Welcome ve Bitiş ayrı, özel fazlar olarak
// usePanelTour.js'te ele alınıyor, bu listeye dahil değil). Her adım gerçekte
// panelde var olan bir `data-tour` hedefine bağlanıyor (bkz. onaylı plan).
// Konu Ağacı gibi ikincil alanlar turu gereksiz uzatmamak için v1'de yok —
// ileride eklenmek istenirse tek satırlık bir girdi yeterli olur.
export const PANEL_TOUR_STEPS = [
  {
    id: "navigation",
    tab: null,
    targets: ['[data-tour="sidebar-navigation"]', '[data-tour="mobile-navigation"]'],
    title: "Tüm alanlara buradan ulaşırsın",
    text: "Program, deneme, takip ve diğer araçlar arasında buradan geçiş yapabilirsin.",
  },
  {
    id: "today",
    tab: "genel",
    targets: ['[data-tour="today-summary"]'],
    title: "Bugün ne yapacağını buradan gör",
    text: "Günün görevlerini ve ilerlemeni burada takip edebilirsin. Tamamladığın çalışmaları işaretledikçe gün içindeki ilerlemen güncellenir.",
  },
  {
    id: "program",
    tab: "program",
    targets: ['[data-tour="weekly-program"]'],
    title: "Haftalık programın burada",
    text: "Koçunla oluşturulan çalışma planını gün gün burada görebilir, hangi ders ve konulara çalışacağını takip edebilirsin. Tamamladığın görevleri buradan işaretleyebilirsin.",
  },
  {
    id: "exams",
    tab: "deneme",
    targets: ['[data-tour="exams"]'],
    title: "Denemelerini burada takip et",
    text: "Deneme sonuçlarını, gelişimini ve kendi deneme analizlerini bu alanda görebilirsin. Yeni deneme başlatabilir, sonuçlarını girebilir ve deneme sonrası kendi analizini yapabilirsin.",
  },
  {
    id: "ai-assistant",
    tab: "ai-asistan",
    targets: ['[data-tour="ai-assistant-upload"]'],
    title: "Takıldığın soruyu buraya gönder",
    text: "Çözemediğin bir sorunun fotoğrafını yükleyebilirsin. AI Soru Asistanı sana yalnızca cevabı değil, çözüm mantığını da adım adım açıklar. Her gün belirli bir soru hakkın var, tam sayıyı bu ekranda görebilirsin.",
  },
  {
    id: "coach",
    tab: "kocum",
    targets: ['[data-tour="coach"]'],
    title: "Koçluk sürecin panelle sınırlı değil",
    text: "Koçunun bıraktığı notları ve süreçle ilgili bilgileri burada görebilirsin.",
  },
  {
    id: "tour-restart",
    tab: null,
    targets: ['[data-tour="tour-restart"]'],
    requiresMobileSheet: true, // mobilde bu buton yalnızca "Diğer" sheet'i açıkken DOM'da var
    title: "Panel turunu istediğin zaman tekrar aç",
    text: "Panel turunu daha sonra yeniden başlatmak istersen, bu butonu buradan açabilirsin.",
  },
];

export const WELCOME_STEP = {
  title: "Sözderece paneline hoş geldin 👋",
  text: "Programını takip etmekten deneme sonuçlarına, günlük ilerlemenden AI Soru Asistanına kadar sınav sürecindeki temel araçlarını burada kullanacaksın. Sana paneli kısaca göstereyim.",
  cta: "Başlayalım",
};

export const FINISH_STEP = {
  title: "Hazırsın 🎯",
  text: "Artık panelde nereden başlayacağını biliyorsun. İlk olarak bugünkü görevlerine göz atıp çalışmaya başlayabilirsin.",
  cta: "Paneli Kullanmaya Başla",
  destinationTab: "genel",
};
