import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";

export default function TutorPackageSelect() {
  const navigate = useNavigate();
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);

  const useFreeRight = qs.get("useFreeRight") === "1";
  const pkg = qs.get("pkg") || "";
  const slug = qs.get("slug") || ""; // varsa öğretmen slug
  const subject = qs.get("subject") || "";
  const grade = qs.get("grade") || "";
  const mode = qs.get("mode") || "ONLINE";
  const city = qs.get("city") || "";
  const district = qs.get("district") || "";
  const locationNote = qs.get("locationNote") || "";
  const note = qs.get("note") || "";

  // --- Ücretsiz hak kontrol state'leri
  const [frChecking, setFrChecking] = useState(useFreeRight); // sadece freeRight varsa kontrol yapıyoruz
  const [frCanSkip, setFrCanSkip] = useState(false);          // hak varsa true

  // --- Paket listesi state'leri (senin mevcut kodundaki isimlerle değiştir)
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);

  // 1) ÜCRETSİZ HAK KONTROLÜ
  useEffect(() => {
    if (!useFreeRight) {
      // ücretsiz akış değil → kontrol yok
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

        if (ok) {
          setFrCanSkip(true);
        }
      } catch (e) {
        // Hata olsa bile sayfa açılsın; sadece skip etmeyiz.
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
      if (!pass.get("qty")) pass.set("qty", "1"); // emniyet
      navigate(`/saat-sec?${pass.toString()}`, { replace: true });
    }
  }, [frChecking, frCanSkip]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Paketleri getir (skip etmiyorsak)
  useEffect(() => {
    if (frChecking || frCanSkip) return; // skip edilecekse paket yüklemeye gerek yok

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // 🔽 Burayı kendi paket API'na göre uyarlayın
        const { data } = await axios.get("/api/v1/paketler"); // örnek
        if (cancelled) return;
        setPackages(Array.isArray(data?.items) ? data.items : (data?.packages || []));
      } catch (e) {
        console.error("packages fetch failed:", e?.message || e);
        setPackages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [frChecking, frCanSkip]);

  // --- Render ---
  // 1) Free-right kontrol sürerken basit bir ekran
  if (frChecking) {
    return (
      <div className="pkg-page">
        <div className="pkg-loading">Ücretsiz hak kontrol ediliyor…</div>
      </div>
    );
  }

  // 2) Kontrol bitti ve skip edilecekse, yukarıdaki effect zaten navigate edecektir.
  // Bu durumda kısa bir "yönlendiriliyor" mesajı gösterebiliriz (opsiyonel).
  if (frCanSkip) {
    return (
      <div className="pkg-page">
        <div className="pkg-loading">Uygun ücretsiz hakkın bulundu, saat seçimine yönlendiriliyorsun…</div>
      </div>
    );
  }

  // 3) Skip edilmeyecek → normal paket sayfası
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
              <div className="pkg-title">{p.title || p.name}</div>
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
                      packageTitle: p.title || p.name || "",
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
