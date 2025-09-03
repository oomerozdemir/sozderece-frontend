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

  // 1) Auth guard (login değilse slug ile geri dön)
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/paket-sec?slug=${encodeURIComponent(slug || "")}`, { replace: true });
    }
  }, [token, slug, navigate]);

  // 2) Öğretmeni getir
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

  // 3) requestId varsa talebi getir
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

  // 4) requestId YOKSA: öğretmen yüklendikten sonra DRAFT talep oluştur ve URL'i güncelle
  useEffect(() => {
    (async () => {
      if (!teacher) return;
      if (requestId) return; // zaten var
      if (!token || !isTokenValid(token)) return; // login guard yönlendirdi

      try {
        // Teacher.mode BOTH ise varsayılan ONLINE
        const defaultMode =
          teacher.mode === "ONLINE" ? "ONLINE" :
          teacher.mode === "FACE_TO_FACE" ? "FACE_TO_FACE" :
          "ONLINE";

        const { data } = await axios.post(
          "/api/v1/student-requests",
          {
            teacherSlug: slug,
            subject: "",
            grade: "",
            mode: defaultMode,
            city: "",
            district: "",
            locationNote: "",
            note: "",
            status: "DRAFT",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const s = new URLSearchParams(location.search);
        s.set("requestId", data.id);
        navigate(`/paket-sec?${s.toString()}`, { replace: true });
      } catch (e) {
        console.error(e);
        alert("Paket seçimi için ön talep oluşturulamadı.");
      }
    })();
  }, [teacher, requestId, token, slug, navigate, location.search]);

  // 5) Paketleri öğretmenin fiyatına göre oluştur
 const packages = useMemo(() => {
  if (!teacher || !reqData) return [];

    // base price (kuruş) – öğretmenin belirlediği
   const base =
    reqData.mode === "ONLINE"
      ? (teacher.priceOnline ?? teacher.priceF2F ?? 0)
      : (teacher.priceF2F ?? teacher.priceOnline ?? 0);

     const mkPkg = (qty, discount = 0, slug) => {
    const total = Math.round(base * qty * (1 - discount));
    const perLesson = Math.round(total / qty);
    return {
      slug,
      qty,
      discountRate: Math.round(discount * 100),
      title: qty === 1 ? "Tek Ders" : `${qty} Ders Paketi`,
      subtitle:
        qty === 1
          ? (reqData.mode === "ONLINE" ? "Online tek ders" : "Yüz yüze tek ders")
          : (reqData.mode === "ONLINE" ? "Online çoklu ders" : "Yüz yüze çoklu ders"),
      unitPrice: total,
      priceText: `${(perLesson / 100).toLocaleString("tr-TR")} ₺ / ders`,
      badge: discount > 0 ? `%${Math.round(discount * 100)} indirim` : null,
    };
  };

    return [
      mkPkg(1, 0, "tek-ders"),
      mkPkg(3, 0.05, "paket-3"),
      mkPkg(6, 0.05, "paket-6"),
    ];
  }, [teacher, reqData]);

  // 6) Paketi talebe yaz + sepete ekle
  const attachAndGoToCart = async () => {
    if (!selected || !requestId) return;
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
