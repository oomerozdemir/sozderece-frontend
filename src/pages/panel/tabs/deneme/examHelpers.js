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
