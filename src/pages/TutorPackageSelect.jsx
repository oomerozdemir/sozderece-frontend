import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";

export default function TutorPackageSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);

  const requestId = qs.get("requestId");
  const slug = qs.get("slug");

  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const [teacher, setTeacher] = useState(null);
  const [reqData, setReqData] = useState(null);

  const token = localStorage.getItem("token");

  // Auth guard
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/paket-sec?slug=${encodeURIComponent(slug || "")}`, { replace: true });
    }
  }, [token, slug, navigate]);

  // Öğretmen
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const tRes = await axios.get(`/api/v1/ogretmenler/${slug}`);
        setTeacher(tRes.data.teacher);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug]);

  // Talep (varsa)
  useEffect(() => {
    if (!requestId || !token) return;
    (async () => {
      try {
        const rRes = await axios.get(
          `/api/v1/student-requests/${requestId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReqData(rRes.data.request);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [requestId, token]);

  // Paketleri öğretmenin fiyatına göre oluştur (TL bazlı, sepete kuruş gider)
  const packages = useMemo(() => {
    if (!teacher || !reqData) return [];

    const baseTL =
      reqData.mode === "ONLINE"
        ? (teacher.priceOnline ?? teacher.priceF2F ?? 0)
        : (teacher.priceF2F ?? teacher.priceOnline ?? 0);

    const mkPkg = (qty, discount = 0, slug) => {
      const totalTL = Math.round(baseTL * qty * (1 - discount));
      const perLessonTL = Math.round(totalTL / qty);
      const totalKurus = totalTL * 100;

      return {
        slug,
        qty,
        discountRate: Math.round(discount * 100),
        title: qty === 1 ? "Tek Ders" : `${qty} Ders Paketi`,
        subtitle:
          qty === 1
            ? (reqData.mode === "ONLINE" ? "Online tek ders" : "Yüz yüze tek ders")
            : (reqData.mode === "ONLINE" ? "Online çoklu ders" : "Yüz yüze çoklu ders"),
        displayPriceTL: totalTL,
        displayPerLesson: perLessonTL,
        unitPrice: totalKurus,
        badge: discount > 0 ? `%${Math.round(discount * 100)} indirim` : null,
      };
    };

    return [
      mkPkg(1, 0, "tek-ders"),
      mkPkg(3, 0.05, "paket-3"),
      mkPkg(6, 0.05, "paket-6"),
    ];
  }, [teacher, reqData]);

  // Paketi talebe yaz + saat seçim sayfasına yönlendir
  const attachAndGoToSlotSelect = async () => {
    if (!selected || !requestId) return;
    try {
      setSaving(true);

      await axios.put(
        `/api/v1/student-requests/${requestId}/package`,
        {
          packageSlug: selected.slug,
          packageTitle: selected.title,
          unitPrice: Number(selected.unitPrice), // kuruş
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 👉 saat seçim sayfasına yönlendir
      navigate(`/saat-sec?requestId=${requestId}&slug=${slug}&qty=${selected.qty}`, { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || "Paket eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Özel Ders Paketleri</h1>

      {!teacher || (!reqData && !!requestId) ? (
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
            <button className="pkc-btn" disabled={!selected || saving} onClick={attachAndGoToSlotSelect}>
              {saving ? "Kaydediliyor..." : "Ders Saatlerini Seç"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
