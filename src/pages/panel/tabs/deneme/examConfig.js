// Deneme Merkezi — data-driven sınav türü tanımı. ExamSetupForm/
// ExamResultForm/ManualExamForm bu config'e bakarak render olur; sınav
// türüne özel ayrı component YAZILMAZ.
//
// Gerçek `User.track` değerleri (AccountPage.jsx/CoachingWizardAlan.jsx'ten
// doğrulandı): "Sayısal" | "Eşit Ağırlık" | "Sözel" | "Dil" — slug değil,
// birebir bu Türkçe string'ler. AYT ders dağılımı bu değerlerle anahtarlanır.
//
// Aşağıdaki ders/soru sayıları yalnızca VARSAYILAN — kullanıcı satır
// ekleyip/silip/soru sayısını değiştirebilir, hiçbir ders zorla sabit değil.
// Ders bazlı gelişim analizinin granülerliğini korumak için hiçbir ders UI
// kolaylığı uğruna birleştirilmedi (Tarih-1/Tarih-2/Coğrafya-1/Coğrafya-2/
// Felsefe Grubu gerçek sınavda ayrı olduğu için burada da ayrı satır).

export const EXAM_TYPE_LABELS = {
  TYT: "TYT",
  AYT: "AYT",
  LGS: "LGS",
  BRANS: "Branş Denemesi",
};

export const EXAM_TYPE_DEFAULTS = {
  TYT: {
    subjects: [
      { subject: "Türkçe", questionCount: 40 },
      { subject: "Sosyal Bilimler", questionCount: 20 },
      { subject: "Temel Matematik", questionCount: 40 },
      { subject: "Fen Bilimleri", questionCount: 20 },
    ],
  },
  AYT: {
    subjectsByTrack: {
      "Sayısal": [
        { subject: "Matematik", questionCount: 40 },
        { subject: "Fizik", questionCount: 14 },
        { subject: "Kimya", questionCount: 13 },
        { subject: "Biyoloji", questionCount: 13 },
      ],
      "Eşit Ağırlık": [
        { subject: "Matematik", questionCount: 40 },
        { subject: "Türk Dili ve Edebiyatı", questionCount: 24 },
        { subject: "Tarih-1", questionCount: 10 },
        { subject: "Coğrafya-1", questionCount: 6 },
      ],
      "Sözel": [
        { subject: "Türk Dili ve Edebiyatı", questionCount: 24 },
        { subject: "Tarih-1", questionCount: 10 },
        { subject: "Coğrafya-1", questionCount: 6 },
        { subject: "Tarih-2", questionCount: 11 },
        { subject: "Coğrafya-2", questionCount: 11 },
        { subject: "Felsefe Grubu", questionCount: 12 },
        { subject: "Din Kültürü", questionCount: 6 },
      ],
      "Dil": [{ subject: "Yabancı Dil", questionCount: 80 }], // YDT gerçekten tek bloklu
    },
  },
  LGS: {
    subjects: [
      { subject: "Türkçe", questionCount: 20 },
      { subject: "Matematik", questionCount: 20 },
      { subject: "Fen Bilimleri", questionCount: 20 },
      { subject: "İnkılap Tarihi", questionCount: 10 },
      { subject: "Din Kültürü", questionCount: 10 },
      { subject: "İngilizce", questionCount: 10 },
    ],
  },
  BRANS: {
    subjectOptions: [
      "Matematik", "Türkçe", "Fen Bilimleri", "Sosyal Bilimler",
      "Fizik", "Kimya", "Biyoloji", "Türk Dili ve Edebiyatı",
      "Tarih", "Coğrafya", "İngilizce",
    ],
  },
};

// Varsayılan ders satırlarını döner (AYT için track'e göre). Bulunamazsa boş
// dizi — kullanıcı kendi ekler.
export function getDefaultSubjects(examType, track) {
  const cfg = EXAM_TYPE_DEFAULTS[examType];
  if (!cfg) return [];
  if (examType === "AYT") return cfg.subjectsByTrack[track] || [];
  if (examType === "BRANS") return [];
  return cfg.subjects || [];
}

export function defaultTotalQuestions(examType, track) {
  return getDefaultSubjects(examType, track).reduce((sum, s) => sum + (s.questionCount || 0), 0) || null;
}

export const FOCUS_AREA_OPTIONS = [
  { value: "sure_yonetimi", label: "Süre yönetimi" },
  { value: "dikkat", label: "Dikkat" },
  { value: "islem_hatalari", label: "İşlem hataları" },
  { value: "turlama", label: "Turlama tekniği" },
  { value: "zor_soruda_takilmama", label: "Zor soruda takılmama" },
  { value: "odak", label: "Odak" },
  { value: "diger", label: "Diğer" },
];

export const DIFFICULTY_REASON_OPTIONS = [
  { value: "bilgi_eksikligi", label: "Bilgi eksikliği" },
  { value: "sure_yetmedi", label: "Süre yetişmedi" },
  { value: "dikkat_hatasi", label: "Dikkat hatası" },
  { value: "islem_hatasi", label: "İşlem hatası" },
  { value: "soruyu_yanlis_okudum", label: "Soruyu yanlış okudum" },
  { value: "iki_secenek_arasinda_kaldim", label: "İki seçenek arasında kaldım" },
  { value: "zor_soruda_fazla_zaman", label: "Zor soruda fazla zaman harcadım" },
  { value: "stres_odak", label: "Stres / odak problemi" },
  { value: "diger", label: "Diğer" },
];

// Aynı kategorideki denemeler yalnızca birbiriyle karşılaştırılır — TYT'yi
// AYT ile ya da farklı branş denemelerini birbiriyle KARIŞTIRMAMAK için.
export function comparisonKey(exam) {
  return exam.examType === "BRANS" ? `BRANS:${exam.branch || "?"}` : exam.examType;
}

export function comparisonLabel(exam) {
  return exam.examType === "BRANS" ? `Branş: ${exam.branch || "?"}` : EXAM_TYPE_LABELS[exam.examType] || exam.examType;
}
