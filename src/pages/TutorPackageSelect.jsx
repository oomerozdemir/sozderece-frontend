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

  // Ücretsiz hak akışı parametreleri
  const useFreeRight = qs.get("useFreeRight") === "1";
  const pkg          = qs.get("pkg") || "";

  // Öğretmen bilgisi (fiyatlar için)
  const [teacher, setTeacher] = useState(null);

  // Ücretsiz hak kontrol state’leri
  const [frChecking, setFrChecking] = useState(useFreeRight);
  const [frCanSkip, setFrCanSkip]   = useState(false);

  // Seçilen paket
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]     = useState(false);

  // Öğretmeni getir
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/ogretmenler/${encodeURIComponent(slug)}`);
        setTeacher(data?.teacher || null);
      } catch (e) {
        console.error("teacher fetch failed:", e?.message || e);
        setTeacher(null);
      }
    })();
  }, [slug]);

  // ÜCRETSİZ HAK kontrolü (varsa SlotSelect’e atla)
  useEffect(() => {
    if (!useFreeRight) { setFrChecking(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/ogrenci/free-rights");
        if (cancelled) return;

        const totalRem = Number(data?.remaining || 0);
        let ok = totalRem > 0;
        if (pkg) {
          const row = (data?.items || []).find((x) => x.packageSlug === pkg);
          ok = row ? Number(row.remaining || 0) > 0 : false;
        }
        if (ok) setFrCanSkip(true);
      } catch (e) {
        console.warn("free-right check failed:", e?.message || e);
      } finally {
        if (!cancelled) setFrChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [useFreeRight, pkg]);

  // HAK VARSA → anında SlotSelect’e yönlendir
  useEffect(() => {
    if (!frChecking && frCanSkip) {
      const pass = new URLSearchParams({
        slug, subject, grade, mode, city, district, locationNote, note,
        useFreeRight: "1",
        qty: "1",
        // free-right akışında fiyat = 0 (kuruş)
        unitPrice: "0",
        packageSlug: pkg || "free-right",
        packageTitle: pkg ? "Ücretsiz hak" : "Ücretsiz özel ders",
      });
      navigate(`/saat-sec?${pass.toString()}`, { replace: true });
    }
  }, [frChecking, frCanSkip]); // eslint-disable-line react-hooks/exhaustive-deps

  // Yardımcı: sayıyı TL (float) olarak normalize et
  const toTL = (v) => {
    if (v == null) return null;
    const n = Number(v);
    if (!isFinite(n)) return null;
    // öğretmen profilinde TL saklandığını varsayıyoruz
    return n;
  };

  // Seçili ders + mod için baz TL fiyatı (ders özel → profil → karşı mod fallback)
  const basePriceTL = useMemo(() => {
    if (!teacher) return 0;

    // 1) Ders bazlı fiyat (subject eşleşmesi)
    const lessons = Array.isArray(teacher.lessons) ? teacher.lessons : [];
    const match   = lessons.find((l) => l.subject === subject);

    const lessonOnlineTL = toTL(match?.priceOnline);
    const lessonF2FTL    = toTL(match?.priceF2F);

    // 2) Profil fiyatları (genel)
    const profileOnlineTL = toTL(teacher.priceOnline);
    const profileF2FTL    = toTL(teacher.priceF2F);

    // 3) Mod önceliği + fallback
    if (String(mode).toUpperCase() === "ONLINE") {
      return (
        lessonOnlineTL ??
        profileOnlineTL ??
        lessonF2FTL ??
        profileF2FTL ??
        0
      );
    } else {
      return (
        lessonF2FTL ??
        profileF2FTL ??
        lessonOnlineTL ??
        profileOnlineTL ??
        0
      );
    }
  }, [teacher, subject, mode]);

  // ⬇️ Paketleri hazırla (YALNIZCA 1/3/6 ders)
  const packages = useMemo(() => {
    if (!teacher) return [];

    const mk = (qty, discount = 0, slug) => {
      const totalTL     = Math.max(0, Math.round(basePriceTL * qty * (1 - discount)));
      const perLessonTL = qty > 0 ? Math.round(totalTL / qty) : 0;
      const totalKurus  = totalTL * 100;

      return {
        itemType: "tutoring",
        source: "TutorPackage",
        slug,
        qty,
        discountRate: Math.round(discount * 100),      // %
        title: qty === 1 ? "Tek Ders" : `${qty} Ders Paketi`,
        subtitle:
          qty === 1
            ? (mode === "ONLINE" ? "Online tek ders" : "Yüz yüze tek ders")
            : (mode === "ONLINE" ? "Online çoklu ders" : "Yüz yüze çoklu ders"),
        displayPriceTL: totalTL,
        displayPerLesson: perLessonTL,
        unitPrice: totalKurus,                          // kuruş
        badge: discount > 0 ? `%${Math.round(discount * 100)} indirim` : null,
      };
    };

    // İstediğin gibi SADECE 3 seçenek
    return [
      mk(1, 0,    "tek-ders"),
      mk(3, 0.05, "paket-3"),
      mk(6, 0.05, "paket-6"),
    ];
  }, [teacher, basePriceTL, mode]);

  // Paket seçildi → saat seçime TÜM verilerle geç (sepete ekleme burada yok)
  const goSlotSelect = async () => {
    if (!selected) return;

    // Auth check (giriş değilse login’e yönlendir, geri dönüş için query’yi koru)
    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      const back = new URLSearchParams({
        slug, subject, grade, mode, city, district, locationNote, note,
        qty: String(selected.qty),
        packageSlug: selected.slug,
        packageTitle: selected.title,
        unitPrice: String(selected.unitPrice),        // kuruş
        discountRate: String(selected.discountRate),  // %
        itemType: "tutoring",
        source: "TutorPackage",
      });
      navigate(`/login?next=/saat-sec?${back.toString()}`, { replace: true });
      return;
    }

    // Doğrudan Slot seçime
    const pass = new URLSearchParams({
      slug, subject, grade, mode, city, district, locationNote, note,
      itemType: "tutoring",
      source: "TutorPackage",
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

  const noPrice = teacher && basePriceTL <= 0;

  // --- Render ---
  if (frChecking) {
    return (
      <div className="pkc-container">
        <h1 className="pkc-title">Özel Ders Paketleri</h1>
        <div className="pkc-empty">Ücretsiz hak kontrol ediliyor…</div>
      </div>
    );
  }
  if (frCanSkip) {
    return (
      <div className="pkc-container">
        <h1 className="pkc-title">Özel Ders Paketleri</h1>
        <div className="pkc-empty">Uygun ücretsiz hakkın var. Saat seçimine yönlendiriliyorsun…</div>
      </div>
    );
  }

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Özel Ders Paketleri</h1>

      {!teacher ? (
        <div className="pkc-empty">Yükleniyor…</div>
      ) : noPrice ? (
        <div className="pkc-empty">
          Bu öğretmen için {subject ? `"${subject}"` : "seçili"} ders/mode fiyatı bulunamadı.
          Lütfen farklı bir ders seçin veya öğretmenle iletişime geçin.
        </div>
      ) : (
        <>
          <div className="pkc-grid">
            {packages.map((p) => (
              <label
                key={p.slug}
                className={`pkc-card ${selected?.slug === p.slug ? "selected" : ""}`}
                onClick={() => setSelected(p)}
              >
                <input
                  type="radio"
                  name="pk"
                  checked={selected?.slug === p.slug}
                  onChange={() => setSelected(p)}
                />
                <div className="pkc-card-body">
                  {p.badge ? <div className="pkc-badge">{p.badge}</div> : null}
                  <div className="pkc-title-sm">{p.title}</div>
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
