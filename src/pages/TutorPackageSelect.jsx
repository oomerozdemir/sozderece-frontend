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
  const mode         = qs.get("mode") || "ONLINE";
  const city         = qs.get("city") || "";
  const district     = qs.get("district") || "";
  const locationNote = qs.get("locationNote") || "";
  const note         = qs.get("note") || "";
  const qty          = Number(qs.get("qty") || 1);

  const packageSlug   = qs.get("packageSlug") || "";
  const packageTitle  = qs.get("packageTitle") || "Özel ders paketi";
  const unitPrice     = Number(qs.get("unitPrice") || 0);       // kuruş
  const discountRate  = Number(qs.get("discountRate") || 0);    // %

  const token = localStorage.getItem("token");
  const [teacher, setTeacher] = useState(null);

  const todayISO = new Date().toISOString().slice(0,10);
  const weekAheadISO = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10);

  const [range, setRange] = useState({ from: todayISO, to: weekAheadISO });
  const [slots, setSlots] = useState([]);                // müsait
  const [busyPending, setBusyPending] = useState([]);    // dolu - bekleyen
  const [busyConfirmed, setBusyConfirmed] = useState([]);// dolu - onaylı
  const [picked, setPicked] = useState([]); // {start, end, mode?}

  // Auth
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      const back = new URLSearchParams({
        slug, subject, grade, mode, city, district, locationNote, note,
        qty: String(qty), packageSlug, packageTitle, unitPrice: String(unitPrice), discountRate: String(discountRate),
      });
      navigate(`/login?next=/saat-sec?${back.toString()}`, { replace: true });
    }
  }, [token]); // eslint-disable-line

  // Öğretmen
  useEffect(() => {
    (async () => {
      try {
        const tRes = await axios.get(`/api/v1/ogretmenler/${slug}`);
        setTeacher(tRes.data.teacher);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug]);

  // Slotları getir (dolu alanlar dahil)
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
      setSlots(data?.slots || []);
      setBusyPending(data?.busy?.pending || []);
      setBusyConfirmed(data?.busy?.confirmed || []);
    } catch (e) {
      console.error(e);
      alert("Uygun saatler getirilemedi.");
    }
  };

  const groupByDayISO = (arr, key) => {
    const map = {};
    for (const it of arr || []) {
      const d = new Date(it[key]);
      d.setHours(0,0,0,0);
      const iso = d.toISOString().slice(0,10);
      (map[iso] ||= []).push(it);
    }
    return map;
  };

  const daysInRange = useMemo(() => {
    const out = [];
    const from = new Date(range.from);
    const to   = new Date(range.to);
    from.setHours(0,0,0,0); to.setHours(0,0,0,0);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      out.push(new Date(d).toISOString().slice(0,10));
    }
    return out;
  }, [range]);

  const byAvail = useMemo(() => groupByDayISO(slots, "start"), [slots]);
  const byPend  = useMemo(() => groupByDayISO(busyPending, "start"), [busyPending]);
  const byConf  = useMemo(() => groupByDayISO(busyConfirmed, "start"), [busyConfirmed]);

  // seçim
  const isBusy = (s) => {
    const k = s.start + "|" + s.end;
    return [...busyPending, ...busyConfirmed].some(x => (x.start + "|" + x.end) === k);
  };

  const togglePick = (s) => {
    if (isBusy(s)) return; // doluysa seçme
    const k = s.start + "|" + s.end;
    setPicked((arr) => {
      const exists = arr.find((x) => (x.start + "|" + x.end) === k);
      if (exists) return arr.filter((x) => (x.start + "|" + x.end) !== k);
      if (arr.length >= qty) return arr;
      return [...arr, s];
    });
  };

  const fmtDay = (iso) =>
    new Date(iso).toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric", weekday:"long" });
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" });

  // Kaydet + Talep oluştur + Sepete ekle
  const saveCreateAndGoCart = async () => {
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
          slots: picked,
          packageSlug,
          packageTitle,
          unitPrice, // kuruş
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const requestId = createRes?.id;

      // 2) Sepete ekle (toplam fiyat = unitPrice, adet = 1; meta'da seçilen slotlar)
      // base price (öğretmenin tek ders TL) sadece analitik/özet için meta’ya
      const baseTL = mode === "ONLINE"
        ? (teacher?.priceOnline ?? teacher?.priceF2F ?? 0)
        : (teacher?.priceF2F ?? teacher?.priceOnline ?? 0);
      const baseKurus = Math.round((baseTL || 0) * 100);

      await axios.post(
        "/api/cart/items",
        {
          slug: packageSlug,
          title: packageTitle || "Özel ders paketi",
          name: packageTitle || "Özel ders paketi",
          unitPrice: Number(unitPrice),
          quantity: 1,
          meta: {
            requestId,
            teacherSlug: slug,
            mode,
            lessonsCount: qty,
            discountRate,
            basePrice: baseKurus,
            pickedSlots: picked,
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

      <div className="tp-grid-2">
        <div>
          <label className="tp-sublabel">Başlangıç</label>
          <input type="date" value={range.from} onChange={(e)=>setRange(r=>({...r, from: e.target.value}))}/>
        </div>
        <div>
          <label className="tp-sublabel">Bitiş</label>
          <input type="date" value={range.to} onChange={(e)=>setRange(r=>({...r, to: e.target.value}))}/>
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

              {/* Onaylı (gri/yeşil) */}
              {conf.length > 0 && (
                <div className="tp-slots-grid">
                  {conf.map(c => (
                    <div key={`${c.start}-${c.end}`} className="tp-slot-card slot-confirmed">
                      <div className="tp-slot-time">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                      <div className="tp-slot-mode">Onaylı</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bekleyen (kırmızımsı) */}
              {pend.length > 0 && (
                <div className="tp-slots-grid">
                  {pend.map(c => (
                    <div key={`${c.start}-${c.end}`} className="tp-slot-card slot-busy">
                      <div className="tp-slot-time">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                      <div className="tp-slot-mode">Onay bekliyor</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Müsait (seçilebilir) */}
              {avail.length > 0 && (
                <div className="tp-slots-grid">
                  {avail.map(s => {
                    const key = s.start + "|" + s.end;
                    const chosen = picked.find(x => (x.start + "|" + x.end) === key);
                    return (
                      <button
                        key={key}
                        className={`tp-slot-card ${chosen ? "is-selected" : ""}`}
                        onClick={()=>togglePick(s)}
                        type="button"
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
        <button className="pkc-btn" disabled={picked.length !== qty} onClick={saveCreateAndGoCart}>
          Sepete devam et
        </button>
      </div>
    </div>
  );
}
