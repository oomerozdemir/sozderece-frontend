// Deneme Merkezi — paylaşılan yardımcılar. Backend'deki
// utils/examCalculations.js ile aynı net formülünü kullanır (client-side
// önizleme için); otorite her zaman sunucuda, burası yalnızca anlık
// gösterim.

import { comparisonKey, comparisonLabel } from "./examConfig";

export function netDivisor(examType, track) {
  if (examType === "LGS") return 3;
  if (examType === "BRANS") return track === "lgs" ? 3 : 4;
  return 4; // TYT, AYT
}

// Negatif net matematiksel olarak geçerli — sıfıra kırpılmıyor, olduğu gibi
// gösteriliyor.
export function computeSubjectNet(correct, wrong, divisor) {
  const c = Number(correct) || 0;
  const w = Number(wrong) || 0;
  return c - w / divisor;
}

export function formatNet(net) {
  if (net == null || Number.isNaN(net)) return "—";
  return net.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Öğrenci yalnızca correct/wrong girer — blank her zaman buradan türetilir,
// hiçbir satır state'inde ayrı bir "blank" alanı tutulmaz.
export function computeBlank(questionCount, correct, wrong) {
  const qc = Number(questionCount) || 0;
  const c = Number(correct) || 0;
  const w = Number(wrong) || 0;
  return Math.max(0, qc - c - w);
}

// Tek bir satırın submit'i engelleyecek hatasını döner (yoksa null). Backend
// validateExamResultPayload ile aynı kuralları uygular — otorite yine de
// backend'dedir, bu yalnızca erken/anlık geri bildirim içindir.
export function subjectRowError(row) {
  const qc = row.questionCount !== "" && row.questionCount != null ? Number(row.questionCount) : null;
  if (qc == null || !Number.isFinite(qc) || qc < 0) return "Soru sayısı girilmeli.";
  const c = Number(row.correct) || 0;
  const w = Number(row.wrong) || 0;
  if (c + w > qc) return "Doğru ve yanlış toplamı soru sayısını geçemez.";
  return null;
}

// ExamResultForm ve ManualExamForm'un submit öncesi ortaklaşa kullandığı
// kapı — ikisinde de aynı satır listesi aynı kurallarla kontrol edilir.
export function validateSubjectRows(rows) {
  for (const r of rows) {
    const err = subjectRowError(r);
    if (err) return { valid: false, message: `${r.subject}: ${err}` };
  }
  return { valid: true, message: null };
}

// Eksik/legacy veri kuralı: null/undefined değerler "0" değil "—" olarak
// gösterilir — hiçbir component kendi başına `?? 0` kısayoluna başvurmaz.
export function formatMetric(value, unit = "") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value}${unit}`;
}

export function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function fmtDurationMinutes(durationSeconds) {
  if (durationSeconds == null) return "—";
  const minutes = Math.round(durationSeconds / 60);
  return `${minutes} dk`;
}

export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "";
}

export function fmtDateLong(d) {
  return d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "";
}

// ─── Deneme Merkezi: gelişim dashboard'u helper'ları ───
// Hepsi saf/null-safe — null totalNet/targetNet/durationSeconds hiçbir
// zaman 0 gibi kullanılmaz, eksik veri grafikten dışlanır veya null bırakılır.

const PERIOD_DAYS = { "30d": 30, "3m": 90, "6m": 180 };

// IN_PROGRESS/RESULT_PENDING (sonuç henüz girilmemiş) kayıtlar hiçbir
// KPI/grafik/hareketli-ortalama/ders-trendi hesabına girmez. Eski koç-girişli
// kayıtlarda status hiç set edilmez (bkz. addStudentExamResult) — Prisma
// şemasındaki `status String @default("COMPLETED")` bunları güvenle
// COMPLETED yapar; null-guard yine de savunma amaçlı tutulur.
export function isReportableExam(r) {
  return !!r && (r.status == null || r.status === "COMPLETED" || r.status === "ANALYSIS_PENDING");
}

export function filterResultsByPeriod(results, period) {
  const days = PERIOD_DAYS[period];
  if (!days) return results; // "all" veya tanınmayan değer — filtrelenmez
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return results.filter((r) => r.examDate && new Date(r.examDate).getTime() >= cutoff);
}

// Mutasyon yok — her zaman yeni bir dizi döner.
export function sortResultsChronologically(results) {
  return [...results].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
}

// TYT/AYT/LGS/BRANS:{branch} ayrımının tek kaynağı examConfig#comparisonKey —
// burada tekrarlanmaz, yalnızca sarmalanır.
export function getAvailableComparisonFilters(results) {
  const seen = new Map();
  for (const r of results) {
    const key = comparisonKey(r);
    if (!seen.has(key)) seen.set(key, comparisonLabel(r));
  }
  return [...seen.entries()];
}

export function filterResultsByComparisonKey(results, key) {
  if (key == null) return results;
  return results.filter((r) => comparisonKey(r) === key);
}

// En güncel (tarihçe olarak en yeni) reportable kaydın comparisonKey'i —
// varsayılan tip filtresi bunu kullanır, öğrenci paneli açtığında doğrudan
// en güncel çalıştığı sınavın gelişimini görür.
export function getMostRecentComparisonKey(results) {
  if (!results.length) return null;
  const chronological = sortResultsChronologically(results);
  return comparisonKey(chronological[chronological.length - 1]);
}

// input: kronolojik sıralı sonuç dizisi. Çıktı AYNI uzunlukta/sırada —
// null totalNet'li kayıtlar diziden silinmez, yalnızca ortalama penceresine
// dahil edilmez (chart x-ekseniyle index hizası bu yüzden korunur).
export function calculateMovingAverage(results, windowSize = 3) {
  const validWindow = [];
  return results.map((r) => {
    const rawNet = r.totalNet != null ? r.totalNet : null;
    let movingAverage = null;
    if (rawNet != null) {
      validWindow.push(rawNet);
      if (validWindow.length > windowSize) validWindow.shift();
      if (validWindow.length >= windowSize) {
        movingAverage = validWindow.reduce((sum, v) => sum + v, 0) / validWindow.length;
      }
    }
    return { examId: r.id, examDate: r.examDate, rawNet, movingAverage };
  });
}

// input: kronolojik sıralı sonuç dizisi (zaten reportable+filtrelenmiş).
export function calculateDevelopmentSummary(results) {
  const totalExams = results.length;
  const valid = results.filter((r) => r.totalNet != null);
  if (valid.length === 0) {
    return { firstNet: null, latestNet: null, change: null, recentAverage: null, recentAverageCount: 0, bestNet: null, totalExams };
  }
  const firstNet = valid[0].totalNet;
  const latestNet = valid[valid.length - 1].totalNet;
  const change = valid.length >= 2 ? latestNet - firstNet : null; // tek kayıtta karşılaştırma anlamsız — null
  const recentAverageCount = Math.min(5, valid.length);
  const recentSlice = valid.slice(-recentAverageCount);
  const recentAverage = recentSlice.reduce((sum, r) => sum + r.totalNet, 0) / recentAverageCount;
  const bestNet = valid.reduce((best, r) => (best == null || r.totalNet > best ? r.totalNet : best), null);
  return { firstNet, latestNet, change, recentAverage, recentAverageCount, bestNet, totalExams };
}

export function getAvailableSubjects(results) {
  return [...new Set(results.flatMap((r) => (Array.isArray(r.subjectNets) ? r.subjectNets.map((s) => s.subject) : [])))];
}

// input: kronolojik sıralı sonuç dizisi. Çıktı chart x-ekseniyle index hizalı.
export function buildSubjectTrend(results, subject) {
  return results.map((r) => {
    const row = (r.subjectNets || []).find((s) => s.subject === subject);
    return { examId: r.id, examDate: r.examDate, net: row && row.net != null ? row.net : null };
  });
}

// Her ders için KENDİ ilk ve son geçerli (net mevcut) görülme noktası
// karşılaştırılır (sınavın ilk/son kaydı değil) — delta = son - ilk.
// En az 2 geçerli noktası olmayan dersler elenir. Yalnızca en yüksek delta
// POZİTİFSE sonuç döner; tüm dersler sabit/düşüşteyse null (AI kullanılmaz,
// tamamen deterministic).
export function calculateMostImprovedSubject(results) {
  const subjects = getAvailableSubjects(results);
  let best = null;
  for (const subject of subjects) {
    const points = [];
    for (const r of results) {
      const row = (r.subjectNets || []).find((s) => s.subject === subject);
      if (row && row.net != null) points.push(row.net);
    }
    if (points.length < 2) continue;
    const delta = points[points.length - 1] - points[0];
    if (delta > 0 && (best == null || delta > best.delta)) {
      best = { subject, delta };
    }
  }
  return best;
}
