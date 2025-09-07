import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";

export default function TutorPackageSelect() {
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);

  // İlk sayfadan gelen veriler
  const slug         = qs.get("slug") || "";
  const subject      = qs.get("subject") || "";
  const grade        = qs.get("grade") || "";
  const mode         = qs.get("mode") || "ONLINE";
  const city         = qs.get("city") || "";
  const district     = qs.get("district") || "";
  const locationNote = qs.get("locationNote") || "";
  const note         = qs.get("note") || "";

  const token = localStorage.getItem("token");
  const [teacher, setTeacher] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/paket-sec?${qs.toString()}`, { replace: true });
    }
  }, [token]); // eslint-disable-line

  // Öğretmeni getir
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/ogretmenler/${slug}`);
        setTeacher(data.teacher);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug]);

  // Paketleri öğretmen fiyatına + mode'a göre hazırla
  const packages = useMemo(() => {
    if (!teacher) return [];

    const baseTL =
      mode === "ONLINE"
        ? (teacher.priceOnline ?? teacher.priceF2F ?? 0)
        : (teacher.priceF2F ?? teacher.priceOnline ?? 0);

    const mkPkg = (qty, discount = 0, slug) => {
      const totalTL = Math.max(0, Math.round(baseTL * qty * (1 - discount)));
      const perLessonTL = qty > 0 ? Math.round(totalTL / qty) : 0;
      const totalKurus = totalTL * 100; // sepette unitPrice kuruş bekleniyor

      return {
        slug,
        qty,
        discountRate: Math.round(discount * 100),
        title: qty === 1 ? "Tek Ders" : `${qty} Ders Paketi`,
        subtitle:
          qty === 1
            ? (mode === "ONLINE" ? "Online tek ders" : "Yüz yüze tek ders")
            : (mode === "ONLINE" ? "Online çoklu ders" : "Yüz yüze çoklu ders"),
        displayPriceTL: totalTL,
        displayPerLesson: perLessonTL,
        unitPrice: totalKurus, // (kuruş) — SlotSelect'te /cart/items'a gönderilecek
        badge: discount > 0 ? `%${Math.round(discount * 100)} indirim` : null,
      };
    };

    return [
      mkPkg(1, 0, "tek-ders"),
      mkPkg(3, 0.05, "paket-3"),
      mkPkg(6, 0.05, "paket-6"),
    ];
  }, [teacher, mode]);

  // Paket seçildi → saat seçime TÜM verilerle geç (sepete EKLEME YOK)
  const goSlotSelect = () => {
    if (!selected) return;

    const pass = new URLSearchParams({
      slug,
      subject,
      grade,
      mode,
      city,
      district,
      locationNote,
      note,
      qty: String(selected.qty),
      packageSlug: selected.slug,
      packageTitle: selected.title,
      unitPrice: String(selected.unitPrice),        // kuruş
      discountRate: String(selected.discountRate),  // %
    });

    setSaving(true);
    navigate(`/saat-sec?${pass.toString()}`, { replace: true });
    setSaving(false);
  };

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Özel Ders Paketleri</h1>

      {!teacher ? (
        <div className="pkc-empty">Yükleniyor…</div>
      ) : packages.length === 0 ? (
        <div className="pkc-empty">Bu öğretmen için paket oluşturulamadı.</div>
      ) : (
        <>
          <div className="pkc-grid">
            {packages.map((p) => (
              <label
                key={p.slug}
                className={`pkc-card ${selected?.slug === p.slug ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="pkg"
                  value={p.slug}
                  checked={selected?.slug === p.slug}
                  onChange={() => setSelected(p)}
                />
                <div className="pkc-body">
                  <div className="pkc-card-title">
                    {p.title} {p.badge ? <span className="tl-badge" style={{ marginLeft: 8 }}>{p.badge}</span> : null}
                  </div>
                  <div className="pkc-subtitle">{p.subtitle}</div>
                  <div className="pkc-price">
                    {p.displayPriceTL.toLocaleString("tr-TR")} ₺
                    <span className="pkc-price-text">
                      {" "}
                      ({p.displayPerLesson.toLocaleString("tr-TR")} ₺ / ders)
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="pkc-actions">
            <button className="pkc-btn" disabled={!selected || saving} onClick={goSlotSelect}>
              {saving ? "Devam ediliyor..." : "Ders Saatlerini Seç"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
