// Konu Ağacım — konu listesini gruplama/filtreleme/istatistik için pure
// yardımcı fonksiyonlar. Backend'e dokunmaz; sadece /me/topics'ten gelen
// ham listeyi ekranın ihtiyacı olan şekle sokar.

import { AYT_SUBJECTS_BY_TRACK, RECOGNIZED_TRACKS } from "../../../../config/academicSubjects";

export const STAGE_ORDER = ["none", "studied", "practiced", "mastered"];

// Semantik renkler: nötr gri / soft mavi / marka turkuazı / soft yeşil —
// neon/lime/mor yok, 2026 design token'larıyla (--color-brand, --color-success)
// tutarlı. Aynı etiketler coach tarafında statusMeta.js#MASTERY_META'da da
// kullanılıyor (backend enum'ları değişmiyor, yalnızca görünen metin ortak).
export const STAGE_META = {
  none: { label: "Başlanmadı", bg: "#f1f5f9", border: "#e2e8f0", color: "#94a3b8" },
  studied: { label: "Çalışıldı", bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8" },
  practiced: { label: "Pratik Yapıldı", bg: "#E4F7F8", border: "#0E7C88", color: "#0E7C88" },
  mastered: { label: "Güçlü", bg: "#ecfdf5", border: "#059669", color: "#059669" },
};

// Türkçe İ/i, I/ı karakterlerini doğru küçülten normalize — "tr-TR" locale'i
// olmadan "İstanbul".toLowerCase() === "i̇stanbul" gibi hatalı sonuçlar çıkar.
export function normalizeSearchText(text) {
  return String(text || "").toLocaleLowerCase("tr-TR").trim();
}

// AYT'de track filtresi uygular; TYT'de (veya examType olmayan LGS
// konularında) hiçbir filtre uygulamadan döner. Track null/boş/tanınmayan
// ise güvenli fallback: filtresiz tüm AYT konuları + isUnknownTrack:true
// (çağıran taraf bununla açıklayıcı bir banner gösterir — konular ASLA
// sessizce gizlenmez).
export function filterTopicsByTrack(topics, studentTrack, examType) {
  if (examType !== "AYT") return { topics, isUnknownTrack: false };
  if (!RECOGNIZED_TRACKS.includes(studentTrack)) {
    return { topics, isUnknownTrack: true };
  }
  const allowedSubjects = AYT_SUBJECTS_BY_TRACK[studentTrack];
  if (allowedSubjects.length === 0) return { topics: [], isUnknownTrack: false };
  return { topics: topics.filter((t) => allowedSubjects.includes(t.subject)), isUnknownTrack: false };
}

export function groupTopicsBySubject(topics) {
  const map = new Map();
  for (const t of topics) {
    if (!map.has(t.subject)) map.set(t.subject, []);
    map.get(t.subject).push(t);
  }
  return map;
}

function emptyStats() {
  return { total: 0, none: 0, studied: 0, practiced: 0, mastered: 0 };
}

export function getSubjectStats(topics) {
  const stats = emptyStats();
  for (const t of topics) {
    stats.total += 1;
    const stage = STAGE_ORDER.includes(t.stage) ? t.stage : "none";
    stats[stage] += 1;
  }
  return stats;
}

// Üst özet de aynı şekle ihtiyaç duyuyor (R5 — zaten TYT/AYT+track
// filtresinden geçmiş "görünür evren" üzerinden çağrılır).
export const getOverallStats = getSubjectStats;

// Ağırlıklı/uydurma bir yüzde ÜRETMEZ — yalnızca iki basit türetilmiş sayı.
export function getProgressCounts(stats) {
  return { advanced: stats.studied + stats.practiced + stats.mastered, mastered: stats.mastered };
}

export function filterTopicsByStage(topics, stage) {
  if (!stage || stage === "all") return topics;
  return topics.filter((t) => t.stage === stage);
}

export function filterTopicsBySearch(topics, query) {
  const q = normalizeSearchText(query);
  if (!q) return topics;
  return topics.filter((t) => normalizeSearchText(t.name).includes(q));
}
