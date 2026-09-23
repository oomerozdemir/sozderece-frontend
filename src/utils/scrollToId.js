// Sabit navbar (h-16) altında kalmasın diye bölümler scroll-mt ile değil, burada
// ofset hesaplanarak kaydırılıyor — hedef bölümlerin class'ına bağımlı değil.
export function scrollToId(id, offset = 72) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
  return true;
}
