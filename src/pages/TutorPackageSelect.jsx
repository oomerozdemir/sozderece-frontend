import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";

export default function TutorPackageSelect() {
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const requestId = qs.get("requestId");
  const slug = qs.get("slug");

  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const [teacher, setTeacher] = useState(null);
  const [reqData, setReqData] = useState(null);

  const token = localStorage.getItem("token");

  // 1) Auth guard
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/paket-sec?requestId=${requestId}&slug=${slug}`, { replace: true });
    }
  }, [token, requestId, slug, navigate]);

  // 2) Öğretmen & talep bilgisini çek
  useEffect(() => {
    (async () => {
      try {
        const [tRes, rRes] = await Promise.all([
          axios.get(`/api/v1/ogretmenler/${slug}`),
          axios.get(`/api/v1/student-requests/${requestId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setTeacher(tRes.data.teacher);
        setReqData(rRes.data.request);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug, requestId, token]);

  // 3) Paketleri öğretmenin fiyatına göre oluştur
  const packages = useMemo(() => {
    if (!teacher || !reqData) return [];

    // base price (kuruş) – öğretmenin belirlediği
    const base =
      reqData.mode === "ONLINE"
        ? (teacher.priceOnline ?? teacher.priceF2F ?? 0)
        : (teacher.priceF2F ?? teacher.priceOnline ?? 0);

    const mkPkg = (qty, discount = 0, slug) => {
      const total = Math.round(base * qty * (1 - discount)); // kuruş
      const perLesson = Math.round((total / qty));           // kuruş
      return {
        slug,
        qty,
        discountRate: Math.round(discount * 100), // %
        title: qty === 1 ? "Tek Ders" : `${qty} Ders Paketi`,
        subtitle:
          qty === 1
            ? (reqData.mode === "ONLINE" ? "Online tek ders" : "Yüz yüze tek ders")
            : (reqData.mode === "ONLINE" ? "Online çoklu ders" : "Yüz yüze çoklu ders"),
        unitPrice: total, // toplam paket fiyatı (kuruş)
        priceText: `${(perLesson / 100).toLocaleString("tr-TR")} ₺ / ders`,
        badge: discount > 0 ? `%${Math.round(discount * 100)} indirim` : null,
      };
    };

    // 1 ders (indirimsiz), 5/15/30 ders (%5 indirim)
    return [
      mkPkg(1, 0, "tek-ders"),
      mkPkg(5, 0.05, "paket-5"),
      mkPkg(15, 0.05, "paket-15"),
      mkPkg(30, 0.05, "paket-30"),
    ];
  }, [teacher, reqData]);

  const attachAndGoToCart = async () => {
    if (!selected) return;
    try {
      setSaving(true);

      // Talebe seçilen paketi yaz
      await axios.put(
        `/api/v1/student-requests/${requestId}/package`,
        {
          packageSlug: selected.slug,
          packageTitle: selected.title,
          unitPrice: Number(selected.unitPrice), // toplam paket kuruş
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Sepete ekle (toplam paket fiyatı ile)
      await axios.post(
        "/api/cart/items",
        {
          slug: selected.slug,
          title: selected.title,
          name: selected.title,
          unitPrice: Number(selected.unitPrice), // toplam paket kuruş
          quantity: 1, // paket tek kalem
          meta: {
            requestId,
            teacherSlug: slug,
            mode: reqData?.mode,
            lessonsCount: selected.qty,
            discountRate: selected.discountRate, // %
            basePrice: reqData?.mode === "ONLINE" ? teacher?.priceOnline : teacher?.priceF2F, // kuruş
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/sepet", { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || "Paket eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Özel Ders Paketleri</h1>

      {!teacher || !reqData ? (
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
                    {(p.unitPrice / 100).toLocaleString("tr-TR")} ₺
                    <span className="pkc-price-text"> ({p.priceText})</span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="pkc-actions">
            <button className="pkc-btn" disabled={!selected || saving} onClick={attachAndGoToCart}>
              {saving ? "Ekleniyor..." : "Devam et"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
