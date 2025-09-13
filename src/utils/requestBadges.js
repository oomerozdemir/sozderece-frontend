export const getRequestBadge = (req) => {
  const s = (req?.status || "").toUpperCase();
  if (s === "PAID") return { label: "Ödendi", tone: "success" };
  if (s === "PACKAGE_SELECTED") return { label: "Sepette", tone: "warning" };
  if (s === "SUBMITTED") return { label: "Gönderildi", tone: "info" };
  if (s === "CANCELLED") return { label: "İptal", tone: "neutral" };
  return { label: "Taslak", tone: "neutral" }; // DRAFT vb.
};

// (opsiyonel) basit rozet bileşeni:
export const RequestBadge = ({ req }) => {
  const b = getRequestBadge(req);
  const toneClass =
    b.tone === "success" ? "bg-green-100 text-green-700"
    : b.tone === "warning" ? "bg-yellow-100 text-yellow-700"
    : b.tone === "info" ? "bg-blue-100 text-blue-700"
    : "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {b.label}
    </span>
  );
};
