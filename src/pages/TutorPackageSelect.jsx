import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { PACKAGE_CATALOG } from "../utils/packageCatalog"; // ⬅️ FE fallback

export default function TutorPackageSelect() {
  const navigate = useNavigate();
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);

  const useFreeRight = qs.get("useFreeRight") === "1";
  const pkg = qs.get("pkg") || "";
  const slug = qs.get("slug") || "";
  const subject = qs.get("subject") || "";
  const grade = qs.get("grade") || "";
  const mode = qs.get("mode") || "ONLINE";
  const city = qs.get("city") || "";
  const district = qs.get("district") || "";
  const locationNote = qs.get("locationNote") || "";
  const note = qs.get("note") || "";

  // Ücretsiz hak kontrol state'leri
  const [frChecking, setFrChecking] = useState(useFreeRight);
  const [frCanSkip, setFrCanSkip] = useState(false);

  // Paket listesi state
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);

  // 1) ÜCRETSİZ HAK KONTROLÜ
  useEffect(() => {
    if (!useFreeRight) {
      setFrChecking(false);
      return;
    }

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

  // 2) HAK VARSA anında SlotSelect'e geç
  useEffect(() => {
    if (!frChecking && frCanSkip) {
      const pass = new URLSearchParams(qs);
      pass.set("useFreeRight", "1");
      if (pkg) pass.set("pkg", pkg);
      if (!pass.get("qty")) pass.set("qty", "1");
      navigate(`/saat-sec?${pass.toString()}`, { replace: true });
    }
  }, [frChecking, frCanSkip]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Paketleri getir (skip etmiyorsak). 404 → FE fallback
  useEffect(() => {
    if (frChecking || frCanSkip) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/v1/paketler");
        if (cancelled) return;

        const items = Array.isArray(data?.items) ? data.items : (data?.packages || []);
        if (items.length) {
          // BE şekli: { slug, title, description, price? }
          setPackages(items);
        } else {
          // BE boş döndüyse fallback’e düş
          setPackages(PACKAGE_CATALOG.map(toUiPkg));
        }
      } catch (e) {
        // 404/ ağ hatası → FE fallback
        console.error("packages fetch failed:", e?.message || e);
        setPackages(PACKAGE_CATALOG.map(toUiPkg));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [frChecking, frCanSkip]);

  // FE catalog → UI objesi
  function toUiPkg(p) {
    return {
      slug: p.key,                               // UI "packageSlug"
      title: p.aliases?.[0] || p.key,            // görünen isim
      description:
        p.period === "monthly"
          ? `Aylık paket – ücretsiz ders hakkı: ${p.freeLessons}`
          : `Tek seferlik – ücretsiz ders hakkı: ${p.freeLessons}`,
      price: null,
    };
  }

  // --- Render ---
  if (frChecking) {
    return (
      <div className="pkg-page">
        <div className="pkg-loading">Ücretsiz hak kontrol ediliyor…</div>
      </div>
    );
  }

  if (frCanSkip) {
    return (
      <div className="pkg-page">
        <div className="pkg-loading">Uygun ücretsiz hakkın bulundu, saat seçimine yönlendiriliyorsun…</div>
      </div>
    );
  }

  return (
    <div className="pkg-page">
      <h1>Paket Seçimi</h1>

      {loading ? (
        <div className="pkg-loading">Yükleniyor…</div>
      ) : packages.length === 0 ? (
        <div className="pkg-empty">Şu an görüntülenecek paket bulunamadı.</div>
      ) : (
        <ul className="pkg-list">
          {packages.map((p) => (
            <li key={p.slug} className="pkg-card">
              <div className="pkg-title">{p.title}</div>
              {p.description ? <div className="pkg-desc">{p.description}</div> : null}
              <div className="pkg-actions">
                <button
                  onClick={() => {
                    const pass = new URLSearchParams({
                      slug,
                      subject,
                      grade,
                      mode,
                      city,
                      district,
                      locationNote,
                      note,
                      packageSlug: p.slug,
                      packageTitle: p.title || "",
                    });
                    navigate(`/saat-sec?${pass.toString()}`);
                  }}
                >
                  Bu paketle devam et
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
