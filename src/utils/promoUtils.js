export function isPromoActive(pkg) {
  if (!pkg || !pkg.promoPrice || !pkg.promoEndDate) return false;
  return new Date(pkg.promoEndDate) > new Date();
}

export function formatPromoEndDate(isoString) {
  return new Date(isoString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
