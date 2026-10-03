// AI Soru Asistanı — paylaşılan yardımcılar.

export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "";
}

export function fmtDateTime(d) {
  return d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
}

// Backend status -> Türkçe rozet. PROCESSING normalde hiç görünmez (istek
// senkron tamamlanır) ama savunmacı olarak eklendi.
export const STATUS_LABELS = {
  PROCESSING: { label: "İşleniyor", bg: "#eff6ff", color: "#1d4ed8" },
  COMPLETED: { label: "Çözüldü", bg: "var(--color-brand-light)", color: "var(--color-brand)" },
  MULTIPLE_QUESTIONS: { label: "Birden Fazla Soru", bg: "#fff7ed", color: "#c2410c" },
  UNREADABLE: { label: "Okunamadı", bg: "#fef3c7", color: "var(--color-warning)" },
  NOT_A_QUESTION: { label: "Soru Değil", bg: "#f1f5f9", color: "#64748b" },
  INVALID_IMAGE: { label: "Geçersiz Dosya", bg: "#fef2f2", color: "#dc2626" },
  ERROR: { label: "Hata", bg: "#fef2f2", color: "#dc2626" },
};

export const FOLLOWUP_TYPE_LABELS = {
  EXPLAIN_SIMPLER: "Daha basit anlat",
  EXPLAIN_STEP: "Bu adımı açıkla",
  SIMILAR_EXAMPLE: "Benzer bir örnek göster",
};

// V2 — öğrenme sinyali etiketleri. Yargılayıcı/sert dil YOK (plan madde 21):
// "zayıf olduğun konu" değil "üzerinde çalıştığın konu" / "daha fazla pratik
// gerektirebilir".
export const LEARNING_SIGNAL_LABELS = {
  NEEDS_PRACTICE: "Daha fazla pratik gerektirebilir",
  IMPROVING: "Gelişim gösteriyorsun",
  VERIFIED_ONCE: "Bir kez doğruladın",
};

export const QUESTION_TYPE_LABELS = {
  KNOWLEDGE: "Bilgi",
  CALCULATION: "Hesaplama",
  INTERPRETATION: "Yorumlama",
  REASONING: "Akıl Yürütme",
  GRAPH: "Grafik",
  PROBLEM_SOLVING: "Problem Çözme",
  PARAGRAPH: "Paragraf",
  FORMULA_APPLICATION: "Formül Uygulama",
  OTHER: "Diğer",
};

export const DIFFICULTY_LABELS = {
  EASY: "Kolay",
  MEDIUM: "Orta",
  HARD: "Zor",
};

export const UNDERSTANDING_LABELS = {
  SELF_REPORTED_UNDERSTOOD: "Anladım",
  NEEDS_MORE_HELP: "Daha fazla açıklama istedi",
  REQUESTED_PRACTICE: "Pratik sorusu istedi",
};
