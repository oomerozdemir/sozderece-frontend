import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";
import "../cssFiles/slot-select.css";

export default function SlotSelect() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ sabit referans
  const qs = new URLSearchParams(location.search);

  // İlk iki adımdan gelen tüm veriler
  const slug         = qs.get("slug") || "";
  const subject      = qs.get("subject") || "";
  const grade        = qs.get("grade") || "";
  const mode         = (qs.get("mode") || "ONLINE").toUpperCase();
  const city         = qs.get("city") || "";
  const district     = qs.get("district") || "";
  const locationNote = qs.get("locationNote") || "";
  const note         = qs.get("note") || "";
  const qty          = Math.max(1, Number(qs.get("qty") || 1));

  const packageSlug   = qs.get("packageSlug") || qs.get("pkg") || ""; // OrdersPage'den gelebilir
  const packageTitle  = qs.get("packageTitle") || "Özel ders paketi";
  const unitPrice     = Number(qs.get("unitPrice") || 0);       // kuruş
  const discountRate  = Number(qs.get("discountRate") || 0);    // %

  // TutorPackage bayrakları
  const itemType = qs.get("itemType") || "tutoring";
  const source   = qs.get("source")   || "TutorPackage";

  const token = localStorage.getItem("token");
  const [teacher, setTeacher] = useState(null);

  const todayISO = new Date().toISOString().slice(0,10);
  const weekAheadISO = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10);

  const [range, setRange] = useState({ from: todayISO, to: weekAheadISO });

  // normalize’lı diziler
  const [slots, setSlots] = useState([]);                // müsait
  const [busyPending, setBusyPending] = useState([]);    // dolu - bekleyen
  const [busyConfirmed, setBusyConfirmed] = useState([]);// dolu - onaylı

  // kullanıcı seçimleri
  const [picked, setPicked] = useState([]); // {start, end, mode?}
  const params = new URLSearchParams(location.search);
  const useFreeRight = params.get("useFreeRight") === "1"; // ✅ ücretsiz hak modu

  // --- Auth ---
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      // login sonrası geri dönebilmesi için query’yi koru
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      const back = new URLSearchParams({
        slug, subject, grade, mode, city, district, locationNote, note,
        qty: String(qty), packageSlug, packageTitle, unitPrice: String(unitPrice), discountRate: String(discountRate),
        itemType, source,
      });
      navigate(`/login?next=/saat-sec?${back.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- Öğretmen bilgisi (fiyat meta’sı için) ---
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

  /* ============================
     ZAMAN NORMALİZASYONU
     ============================ */

  const toIsoMinute = (v) => {
    const d = new Date(v);
    d.setSeconds(0, 0);
    return d.toISOString();
  };
  const keyOf = (s) => `${new Date(s.start).getTime()}|${new Date(s.end).getTime()}`;

  const normalizeArr = (arr = [], fallbackMode) =>
    arr.map((x) => ({
      start: toIsoMinute(x.start || x.startsAt),
      end:   toIsoMinute(x.end   || x.endsAt),
      mode:  (x.mode || fallbackMode || mode || "ONLINE").toUpperCase(),
    }));

  // Slotları getir (müsait + dolular)
  const fetchSlots = async () => {
    if (!slug) {
      alert("Öğretmen slug bulunamadı.");
      return;
    }
    try {
      const { data } = await axios.get(
        `/api/v1/ogretmenler/${encodeURIComponent(slug)}/slots`,
        {
          params: {
            from: range.from,      // YYYY-MM-DD
            to: range.to,          // YYYY-MM-DD
            mode,                  // "ONLINE" | "FACE_TO_FACE"
            durationMin: 60
          },
        }
      );
      setSlots(normalizeArr(data?.slots || [], mode));
      setBusyPending(normalizeArr(data?.busy?.pending || [], mode));
      setBusyConfirmed(normalizeArr(data?.busy?.confirmed || [], mode));
    } catch (e) {
      console.error("slots error:", e?.response?.data || e.message);
      alert(e?.response?.data?.message || "Uygun saatler getirilemedi.");
    }
  };

  const busyKeys = useMemo(() => {
    const s = new Set();
    for (const x of busyPending)   s.add(keyOf(x));
    for (const x of busyConfirmed) s.add(keyOf(x));
    return s;
  }, [busyPending, busyConfirmed]);

  const pickedKeys = useMemo(
    () => new Set((picked || []).map(keyOf)),
    [picked]
  );

  const isBusy = (s) => busyKeys.has(keyOf(s));

  const togglePick = (s) => {
    if (isBusy(s)) return; // doluysa seçilmez
    const k = keyOf(s);
    setPicked((arr) => {
      if (arr.find((x) => keyOf(x) === k)) {
        return arr.filter((x) => keyOf(x) !== k);
      }
      if (arr.length >= qty) return arr;
      return [...arr, s];
    });
  };

  const groupByDayISO = (arr) => {
    const map = {};
    for (const it of arr || []) {
      const d = new Date(it.start);
      d.setHours(0,0,0,0);
      const iso = d.toISOString().slice(0,10);
      (map[iso] ||= []).push(it);
    }
    return map;
  };

  const daysInRange = useMemo(() => {
    const out = [];
    const startIso = (range.from < todayISO) ? todayISO : range.from;
    const from = new Date(startIso);
    const to   = new Date(range.to);
    from.setHours(0,0,0,0); to.setHours(0,0,0,0);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      out.push(new Date(d).toISOString().slice(0,10));
    }
    return out;
  }, [range, todayISO]);

  const byAvail = useMemo(() => groupByDayISO(slots), [slots]);
  const byPend  = useMemo(() => groupByDayISO(busyPending), [busyPending]);
  const byConf  = useMemo(() => groupByDayISO(busyConfirmed), [busyConfirmed]);

  const fmtDay = (iso) =>
    new Date(iso).toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric", weekday:"long" });
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" });

  /* ============================
     KAYDET → (Ücretsiz ise) DOĞRUDAN TALEP | (Normal) TALEP + SEPET
     ============================ */
  const saveCreateAndGoCart = async () => {
    // Ortak doğrulama
    if (picked.length !== qty) {
      alert(`Lütfen ${qty} adet ders saati seçiniz.`);
      return;
    }

     // ✅ ÜCRETSİZ HAK MODU: ödeme yok → doğrudan talep + başarı sayfası
    if (useFreeRight) {
      try {
        const { data: createRes } = await axios.post(
          "/api/v1/student-requests",
          {
            teacherSlug: slug,
            subject, grade, mode, city, district, locationNote, note,
            slots: picked,               // {start,end,mode}
            packageSlug: packageSlug || undefined, // OrdersPage'den gelmiş olabilir
            packageTitle,                // opsiyonel
            unitPrice: 0,                // ücretsiz
            useFreeRight: true,          // 🔑 backende sinyal
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

     const requestIds = Array.isArray(createRes?.requestIds)
       ? createRes.requestIds
       : (createRes?.id ? [createRes.id] : []);
     localStorage.setItem("activeRequestIds", JSON.stringify(requestIds));
     // küçük özet → başarı sayfası
     localStorage.setItem("lastRequestSummary", JSON.stringify({
       requestIds,
       teacherName: teacher ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() : null,
       slots: picked,
     }));
     navigate("/talep-basarili", { replace: true });
      return;
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.message || "Talep oluşturulamadı. Ücretsiz haklarınızı kontrol edin.");
        return;
      }
    }

    // 💳 NORMAL MOD: sepete/ödeme akışı
    if (!packageSlug || !packageTitle || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      alert("Paket bilgisi eksik. Lütfen paket seçiminden yeniden başlayın.");
      return;
    }

    try {
      // 1) Tek POST ile talep + randevular
      const { data: createRes } = await axios.post(
        "/api/v1/student-requests",
        {
          teacherSlug: slug,
          subject, grade, mode, city, district, locationNote, note,
          slots: picked,               // {start,end,mode}
          packageSlug,
          packageTitle,
          unitPrice,                   // kuruş
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 1.a) Dönen id’leri normalize et (geriye uyum: tekil id de olabilir)
      const ids =
        Array.isArray(createRes?.requestIds) ? createRes.requestIds :
        Array.isArray(createRes?.items) ? createRes.items.map(x => x.id).filter(Boolean) :
        (createRes?.id ? [createRes.id] : []);

      if (!ids.length) {
        alert("Talep oluşturulamadı (requestIds bulunamadı).");
        return;
      }

      // localStorage’a yaz (geriye uyum için ilkini ayrıca kaydet)
      localStorage.setItem("activeRequestIds", JSON.stringify(ids));
      localStorage.setItem("activeRequestId", String(ids[0]));

      // 2) Sepete ekle (meta ile birlikte)
      const baseTL =
        mode === "ONLINE"
          ? (teacher?.priceOnline ?? teacher?.priceF2F ?? 0)
          : (teacher?.priceF2F   ?? teacher?.priceOnline ?? 0);
      const baseKurus = Math.round((baseTL || 0) * 100);

      await axios.post("/api/cart/items", {
        slug: packageSlug,
        title: packageTitle,
        name: packageTitle,
        unitPrice: Number(unitPrice),
        quantity: 1,
        itemType,
        source,
        meta: {
          // çoklu talep desteği
          requestIds: ids,
          // geriye uyum (backend hâlâ tekil okuyorsa)
          requestId: ids[0],

          teacherSlug: slug,
          mode,
          lessonsCount: qty,
          discountRate,
          basePrice: baseKurus,
          pickedSlots: picked,
          itemType,
          source,
        },
      }, { headers: { Authorization: `Bearer ${token}` }});

      // 3) Sepete git
      navigate("/sepet", { replace: true });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Seçimler sepete eklenemedi.");
    }
  };

  const any =
    Object.keys(byAvail).length ||
    Object.keys(byPend).length ||
    Object.keys(byConf).length;

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Ders Saatlerini Seç</h1>

      <div className="slot-legend">
        <span className="legend-item"><i className="legend-dot legend-free" /> Müsait</span>
        <span className="legend-item"><i className="legend-dot legend-busy" /> Onay bekliyor</span>
        <span className="legend-item"><i className="legend-dot legend-confirmed" /> Dolu</span>
        <span className="legend-item"><i className="legend-dot legend-picked" /> Seçili</span>
      </div>

      <div className="tp-grid-2">
        <div>
          <label className="tp-sublabel">Başlangıç</label>
          <input
            type="date"
            value={range.from}
            onChange={(e)=>setRange(r=>({...r, from: e.target.value}))}
            min={todayISO}
          />
        </div>
        <div>
          <label className="tp-sublabel">Bitiş</label>
          <input
            type="date"
            value={range.to}
            onChange={(e)=>setRange(r=>({...r, to: e.target.value}))}
            min={todayISO}
          />
        </div>
      </div>

      <div className="tp-actions">
        <button type="button" onClick={fetchSlots}>Uygun Saatleri Göster</button>
      </div>

      {!any ? (
        <div className="tp-empty">Bu aralıkta kayıt bulunamadı.</div>
      ) : (
        daysInRange.map((d) => {
          const avail = byAvail[d] || [];
          const pend  = byPend[d] || [];
          const conf  = byConf[d] || [];
          if (!avail.length && !pend.length && !conf.length) return null;

          return (
            <div key={d} className="tp-slot-group">
              <div className="tp-slot-group-head">
                <span className="tp-badge">{fmtDay(d)}</span>
              </div>

              {/* ONAYLI → DOLU */}
              {conf.length > 0 && (
                <div className="tp-slots-grid">
                  {conf.map(c => (
                    <div key={keyOf(c)} className="tp-slot-card slot-busy" title="Dolu">
                      <div className="tp-slot-time">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                      <div className="tp-slot-mode">Dolu</div>
                    </div>
                  ))}
                </div>
              )}

              {/* BEKLEYEN → DOLU */}
              {pend.length > 0 && (
                <div className="tp-slots-grid">
                  {pend.map(c => (
                    <div key={keyOf(c)} className="tp-slot-card slot-busy" title="Onay bekliyor">
                      <div className="tp-slot-time">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                      <div className="tp-slot-mode">Onay bekliyor</div>
                    </div>
                  ))}
                </div>
              )}

              {/* MÜSAİT → SEÇİLEBİLİR */}
              {avail.length > 0 && (
                <div className="tp-slots-grid">
                  {avail.map(s => {
                    const k = keyOf(s);
                    const chosen = pickedKeys.has(k);
                    const disabled = isBusy(s);
                    return (
                      <button
                        key={k}
                        className={`tp-slot-card ${chosen ? "is-selected" : ""} ${disabled ? "slot-busy" : ""}`}
                        onClick={()=>!disabled && togglePick(s)}
                        type="button"
                        disabled={disabled}
                        title={disabled ? "Dolu" : ""}
                      >
                        <div className="tp-slot-time">{fmtTime(s.start)} – {fmtTime(s.end)}</div>
                        <div className="tp-slot-mode">{s.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="pkc-actions">
        <div className="tp-sublabel">Seçili: {picked.length} / {qty}</div>
        <button
          className="pkc-btn"
          disabled={
            picked.length !== qty ||
            (!useFreeRight && (!packageSlug || !unitPrice)) // ✅ freeRight'ta zorlamıyoruz
          }
          onClick={saveCreateAndGoCart}
        >
          {useFreeRight ? "Talebi gönder" : "Sepete devam et"}
        </button>
      </div>
    </div>
  );
}
