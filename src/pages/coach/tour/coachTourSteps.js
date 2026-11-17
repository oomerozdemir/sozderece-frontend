// Koç Paneli Turu — 9 çekirdek adım (Welcome ve Bitiş ayrı, özel fazlar
// olarak useCoachTour.js'te ele alınıyor, bu listeye dahil değil). İlk 3 adım
// CoachDashboard.jsx'te, kalan 6'sı StudentWorkspace.jsx'te yaşıyor — `page`
// alanı hangi mount noktasının bu adımı "sahiplendiğini" belirtir (bkz.
// onaylı plan K5). Metinler gerçek davranışla doğrulandı (bkz. plan
// "Doğrulanmış Gerçekler") — uydurma özellik anlatılmıyor.
export const COACH_TOUR_STEPS = [
  {
    id: "student-list",
    page: "dashboard",
    tab: null,
    targets: ['[data-tour="coach-student-list"]'],
    title: "Öğrencilerin burada",
    text: "Sana atanmış tüm öğrencileri bu alanda görebilirsin. Öğrencinin detayına girmek için \"Öğrenciye Git\" butonunu kullan.",
  },
  {
    id: "status-cards",
    page: "dashboard",
    tab: null,
    targets: ['[data-tour="coach-status-cards"]'],
    title: "Öncelik vermen gereken öğrencileri hızlıca gör",
    text: "Bu kartlar, hangi öğrencinin daha fazla ilgiye ihtiyaç duyduğunu anlamanı kolaylaştırır.",
  },
  {
    id: "open-student",
    page: "dashboard",
    tab: null,
    targets: ['[data-tour="open-student"]'],
    title: "Şimdi öğrencinin çalışma alanını görelim",
    text: "Bir öğrencinin detayına girince programını, denemelerini ve takibini buradan yöneteceksin.",
    isNavigationStep: true,
    nextLabel: "Öğrenciyi Aç",
  },
  {
    id: "overview",
    page: "workspace",
    tab: "overview",
    targets: ['[data-tour="student-overview"]'],
    title: "Öğrencinin genel durumunu buradan takip edebilirsin",
    text: "Bugünkü görevlerini ve temel öğrenci bilgilerini ilk olarak burada görürsün.",
  },
  {
    id: "program",
    page: "workspace",
    tab: "program",
    targets: ['[data-tour="student-program"]'],
    title: "Haftalık programını buradan oluştur",
    text: "Öğrencinin haftalık görevlerini gün gün ekleyebilir, ya da \"AI ile Program Aktar\" ile bir görseli/PDF'i doğrudan programa dönüştürebilirsin.",
  },
  {
    id: "exams",
    page: "workspace",
    tab: "exams",
    targets: ['[data-tour="student-exams"]'],
    title: "Deneme sonuçlarını burada takip et",
    text: "Öğrencinin deneme sonuçlarını, branş bazlı netlerini ve önceki denemelerini buradan görebilir, yeni bir deneme sonucu da ekleyebilirsin.",
  },
  {
    id: "tracking",
    page: "workspace",
    tab: "tracking",
    targets: ['[data-tour="student-tracking"]'],
    title: "Öğrencinin ilerleme sinyallerini burada incele",
    text: "\"Tarihçe\"de son günlerin özetini, \"İçgörüler\"de tekrar eden hataları, \"Konu Ağacı\"nda konu ustalık durumunu görebilirsin.",
  },
  {
    id: "resources",
    page: "workspace",
    tab: "resources",
    targets: ['[data-tour="student-resources"]'],
    title: "Öğrenciye kaynaklarını buradan ata",
    text: "Kitap, deneme, branş denemesi ve diğer çalışma kaynaklarını \"Kaynak Ekle\" ile buradan yönetebilirsin.",
  },
  {
    id: "notes",
    page: "workspace",
    tab: "notes",
    targets: ['[data-tour="student-notes"]'],
    title: "Öğrenciyle günlük temasını burada güçlendir",
    text: "Yazılı veya sesli kısa notlar bırakabilir, geçmiş notlarını görebilirsin.",
  },
];

export const WELCOME_STEP = {
  title: "Koç Paneline Hoş Geldin 👋",
  text: "Öğrencilerini takip edeceğin ve tüm süreci yöneteceğin alan burası. Sana paneli kısaca gösterelim.",
  cta: "Başlayalım",
};

export const FINISH_STEP = {
  title: "Hazırsın 🎉",
  text: "Artık öğrencinin planını oluşturabilir, ilerlemesini takip edebilir ve süreci tek panelden yönetebilirsin. İstersen bu turu Yardım bölümünden tekrar başlatabilirsin.",
  cta: "Panele Başla",
  destinationTab: "overview",
};

// Koçun hiç öğrencisi yokken dashboard bölümü (1-2) bitince gösterilen
// uyarlanmış Bitiş — workspace bölümü (3-9) BEKLEMEDE kalır, ilk öğrenci
// atandıktan sonra o öğrencinin workspace'ine ilk girişte otomatik devam
// eder (bkz. useCoachTour.js, plan K6).
export const FINISH_STEP_NO_STUDENTS = {
  title: "Hazırsın 🎉",
  text: "Henüz sana atanmış bir öğrenci olmadığı için öğrenci çalışma alanını şimdi gösteremiyoruz. İlk öğrencin atandığında, onun çalışma alanına ilk girişinde tur buradan devam edecek.",
  cta: "Panele Başla",
};
