// Haftalık Program — paylaşılan saf yardımcılar. HaftalikProgram.jsx'teki
// "Bugünkü Rotam" bloğu bunlardan bağımsız kalmaya devam ediyor (fmtToday/
// fmtClock orada kalıyor); burada yalnızca hafta/gün bazlı hesaplamalar var.
// Tamamı null-safe.

export const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
export const DAY_LABELS_SHORT = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

export function toMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// d.toISOString() UTC'ye çevirir — İstanbul (+3) yerel gece yarısı bir
// önceki güne kayar. Bu yüzden yerel takvim bileşenlerinden elle string
// kuruyoruz (mevcut HaftalikProgram.jsx'teki yöntemle birebir aynı).
export function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts = { day: "numeric", month: "long" };
  return `${monday.toLocaleDateString("tr-TR", opts)} — ${sunday.toLocaleDateString("tr-TR", opts)}`;
}

export function fmtMinutes(mins) {
  const m = Math.max(0, Math.round(mins || 0));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} sa ${rem} dk` : `${h} sa`;
}

export function dayDateForIndex(weekStart, dayIdx) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIdx);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function groupTasksByDay(planItems) {
  const map = Array.from({ length: 7 }, () => []);
  (planItems || []).forEach((it) => {
    if (it.dayOfWeek >= 0 && it.dayOfWeek <= 6) map[it.dayOfWeek].push(it);
  });
  return map;
}

// K2: "tamamlanma" her yerde yalnızca status==="done"/total oranı — partial/
// stuck ana orana hiç karışmaz, yalnızca ayrı bir sayaç olarak (ikincil rozet
// için) döner.
export function getDayStats(items) {
  const list = items || [];
  const total = list.length;
  const completed = list.filter((i) => i.status === "done").length;
  const partialOrStuck = list.filter((i) => i.status === "partial" || i.status === "stuck").length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, remaining, percentage, partialOrStuck };
}

export function getWeekStats(weekDays) {
  return getDayStats((weekDays || []).flat());
}

// K2b: MISSED yalnızca KESİN geçmiş günlerde — bugün, tamamlanmamış görevi
// olsa bile asla MISSED sayılmaz.
export function getDayStatus(items, dayDate, todayDate) {
  const { total, completed } = getDayStats(items);
  if (total === 0) return "EMPTY";
  if (completed === total) return "COMPLETED";
  if (completed > 0) return "IN_PROGRESS";

  const todayStart = new Date(todayDate);
  todayStart.setHours(0, 0, 0, 0);
  const dStart = new Date(dayDate);
  dStart.setHours(0, 0, 0, 0);
  const isPast = dStart.getTime() < todayStart.getTime();
  return isPast ? "MISSED" : "PLANNED";
}

// Güncel hafta ise bugünü seç; geçmiş/gelecek haftaysa görevi olan ilk günü;
// hiç görev yoksa Pazartesi (0).
export function getDefaultSelectedDay(weekStart, weekDays, todayDate) {
  const isCurrentWeek = toISO(weekStart) === toISO(toMonday(todayDate));
  if (isCurrentWeek) {
    const day = todayDate.getDay();
    return day === 0 ? 6 : day - 1; // JS getDay(): 0=Pazar -> bizim index'te 6
  }
  const firstWithTasks = (weekDays || []).findIndex((items) => (items || []).length > 0);
  return firstWithTasks >= 0 ? firstWithTasks : 0;
}
