import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";
import "../cssFiles/slot-select.css";

export default function SlotSelect() {
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);

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

  const packageSlug   = qs.get("packageSlug") || "";
  const packageTitle  = qs.get("packageTitle") || "Özel ders paketi";
  const unitPrice     = Number(qs.get("unitPrice") || 0);       // kuruş
  const discountRate  = Number(qs.get("discountRate") || 0);    // %

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

  // --- Auth ---
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      // login sonrası geri dönebilmesi için query’yi koru
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      const back = new URLSearchParams({
        slug, subject, grade, mode, city, district, locationNote, note,
        qty: String(qty), packageSlug, packageTitle, unitPrice: String(unitPrice), discountRate: String(discountRate),
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
     ZAMAN NORMALİZASYONU (KRİTİK)
     ============================ */

  // Her şeyi dakikaya indirip UTC ISO üretir -> karşılaştırmalar birebir tutar
  const toIsoMinute = (v) => {
    const d = new Date(v);
    d.setSeconds(0, 0);
    return d.toISOString();
  };
  // slot anahtarı (hızlı membership)
  const keyOf = (s) => `${new Date(s.start).getTime()}|${new Date(s.end).getTime()}`;

  // API farklı alan isimleri döndürebilir → tek tipe çevir
  const normalizeArr = (arr = [], fallbackMode) =>
    arr.map((x) => ({
      start: toIsoMinute(x.start || x.startsAt),
      end:   toIsoMinute(x.end   || x.endsAt),
      mode:  (x.mode || fallbackMode || mode || "ONLINE").toUpperCase(),
    }));

  // Slotları getir (müsait + dolular)
  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(`/api/v1/ogretmenler/${slug}/slots`, {
        params: {
          from: range.from,
          to: range.to,
          mode,
          durationMin: 60,
        },
      });

// Şimdiki zaman (dakikaya hizalanmış)
const now = new Date();
now.setSeconds(0,0);
const futureOnly = (arr=[]) => arr.filter(x => new Date(x.start) >= now); 

const avail = normalizeArr(data?.slots || [], mode);
const pend  = normalizeArr(data?.busy?.pending || [], mode);
const conf  = normalizeArr(data?.busy?.confirmed || [], mode);

      setSlots(futureOnly(avail));            
      setBusyPending(futureOnly(pend));       
      setBusyConfirmed(futureOnly(conf)); 
    } catch (e) {
      console.error(e);
      alert("Uygun saatler getirilemedi.");
    }
  };

  // Hızlı membership set’leri
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

  // seçim kuralları
  const isBusy = (s) => busyKeys.has(keyOf(s));

  const togglePick = (s) => {
    if (isBusy(s)) return; // doluysa asla seçilmez
    const k = keyOf(s);
    setPicked((arr) => {
      // seçiliyse kaldır
      if (arr.find((x) => keyOf(x) === k)) {
        return arr.filter((x) => keyOf(x) !== k);
      }
      // kapasite sınırı
      if (arr.length >= qty) return arr;
      return [...arr, s];
    });
  };

  // Günlere gruplama (normalize edilmiş start alanına göre)
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

  // Range gün listesi
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
  // Gruplar
  const byAvail = useMemo(() => groupByDayISO(slots), [slots]);
  const byPend  = useMemo(() => groupByDayISO(busyPending), [busyPending]);
  const byConf  = useMemo(() => groupByDayISO(busyConfirmed), [busyConfirmed]);

  // Görüntüleme yardımcıları
  const fmtDay = (iso) =>
    new Date(iso).toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric", weekday:"long" });
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" });

  /* ============================
     KAYDET → TALEP + SEPET
     ============================ */
  const saveCreateAndGoCart = async () => {
    // Zorunlu alan kontrolleri
    if (!packageSlug || !packageTitle || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      alert("Paket bilgisi eksik. Lütfen paket seçiminden yeniden başlayın.");
      return;
    }
    if (picked.length !== qty) {
      alert(`Lütfen ${qty} adet ders saati seçiniz.`);
      return;
    }

    try {
      // 1) Tek POST ile talep + randevular
      const { data: createRes } = await axios.post(
        "/api/v1/student-requests",
        {
          teacherSlug: slug,
          subject, grade, mode, city, district, locationNote, note,
          slots: picked,               // normalize edilmiş {start,end,mode}
          packageSlug,
          packageTitle,
          unitPrice,                   // kuruş
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const requestId = createRes?.id;

      // 2) Sepete ekle (meta ile birlikte)
      const baseTL =
        mode === "ONLINE"
          ? (teacher?.priceOnline ?? teacher?.priceF2F ?? 0)
          : (teacher?.priceF2F   ?? teacher?.priceOnline ?? 0);
      const baseKurus = Math.round((baseTL || 0) * 100);

      await axios.post(
        "/api/cart/items",
        {
          slug: packageSlug,
          title: packageTitle,
          name: packageTitle,
          unitPrice: Number(unitPrice), // kuruş
          quantity: 1,                  // paketler tekil
          meta: {
            requestId,
            teacherSlug: slug,
            mode,
            lessonsCount: qty,
            discountRate,
            basePrice: baseKurus,
            pickedSlots: picked,        // seçilen saatler
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
          disabled={picked.length !== qty || !packageSlug || !unitPrice}
          onClick={saveCreateAndGoCart}
        >
          Sepete devam et
        </button>
      </div>
    </div>
  );
}
