// Deneme Merkezi — paylaşılan yardımcılar. Backend'deki
// utils/examCalculations.js ile aynı net formülünü kullanır (client-side
// önizleme için); otorite her zaman sunucuda, burası yalnızca anlık
// gösterim.

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
