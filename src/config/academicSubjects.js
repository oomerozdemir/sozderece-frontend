// Gerçek müfredat ders taksonomisi — seeded Topic.subject verisinden
// doğrulanmıştır (bkz. konular/topicHelpers.js'in orijinal analizinde
// yapılan canlı DB sorgusu). examConfig.js (Deneme Merkezi) ile KASITLI
// olarak farklı: o, sınav-planı-doğru bir taksonomi (Tarih-1/Tarih-2,
// "Temel Matematik" gibi birleşik/ayrık kategoriler) kullanırken, burası
// gerçek seeded konu verisiyle birebir örtüşen, daha basit taksonomiyi
// kullanır — Konu Ağacı ve koçun öğrenciye kaynak ataması gibi "gerçek
// müfredat" ile çalışan özellikler bunu paylaşır.
//
// Birden fazla özellik (Konu Ağacı, Koç→Öğrenci Kaynak Atama) bu dosyayı
// tüketir; feature-to-feature import yerine tek paylaşılan kaynak burası.

export const TYT_SUBJECTS = [
  "Türkçe",
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
];

export const LGS_SUBJECTS = [
  "Türkçe",
  "Matematik",
  "Fen Bilimleri",
  "İnkılap Tarihi",
  "Din Kültürü",
  "İngilizce",
];

// AYT alan (track) filtresi. ÖNEMLİ SINIR: DB'deki Topic.subject alanı
// Tarih/Coğrafya için Tarih-1/Tarih-2 veya Coğrafya-1/Coğrafya-2 şeklinde
// ayrılmıyor — tek bir "Tarih"/"Coğrafya" değeri var. Bu yüzden bu eşleme
// ders (subject) seviyesinde best-effort'tur, konu seviyesinde değil
// (örn. bir Sözel öğrencisi Tarih dersinin TÜM konularını görür, yalnızca
// kendi alanına giren alt-konuları değil). Gerçek ayrım için Topic şemasına
// bir taksonomi migration'ı gerekir — bu task kapsamında yapılmıyor.
export const AYT_SUBJECTS_BY_TRACK = {
  "Sayısal": ["Matematik", "Fizik", "Kimya", "Biyoloji"],
  "Eşit Ağırlık": ["Matematik", "Edebiyat", "Tarih", "Coğrafya"],
  "Sözel": ["Edebiyat", "Tarih", "Coğrafya", "Felsefe Grubu"],
  "Dil": [],
};

// Tüm track'lerin birleşimi (distinct) — track null/tanınmayan olduğunda
// "hiçbir şeyi gizleme, hepsini göster" fallback'i için (K5).
export const AYT_SUBJECTS_ALL = [...new Set(Object.values(AYT_SUBJECTS_BY_TRACK).flat())];

export const RECOGNIZED_TRACKS = Object.keys(AYT_SUBJECTS_BY_TRACK);
