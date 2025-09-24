import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";

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

  // 3) Paketleri getir (skip etmiyorsak) — BE: /api/packages
  useEffect(() => {
    if (frChecking || frCanSkip) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/packages");
        if (cancelled) return;
        const items = Array.isArray(data?.packages) ? data.packages : [];
        // BE → FE mapping: { id, name, description, price } → { slug, title, description, unitPrice }
        const mapped = items.map(p => ({
          slug: (p.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), // basit slug
          title: p.name || "",
          description: p.description || "",
          unitPrice: typeof p.price === "number" ? Math.round(p.price * 100) : null, // varsayım: BE 'price' TL; kuruşa çevir
        }));
        setPackages(mapped);
      } catch (e) {
        console.error("packages fetch failed:", e?.message || e);
        setPackages([]); // fallback: boş göster
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [frChecking, frCanSkip]);

  return (
    <div className="pkg-page">
      <h1>Paket Seçimi</h1>

      {frChecking ? (
        <div className="pkg-loading">Ücretsiz hak kontrol ediliyor…</div>
      ) : frCanSkip ? (
        <div className="pkg-loading">Uygun ücretsiz hakkın bulundu, saat seçimine yönlendiriliyorsun…</div>
      ) : loading ? (
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
                      packageSlug: p.slug || "",       // FE slug
                      packageTitle: p.title || "",      // görünen isim (BE name)
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
