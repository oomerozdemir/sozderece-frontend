import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";
import "../cssFiles/slot-select.css";

export default function SlotSelect() {
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const requestId = qs.get("requestId");
  const slug = qs.get("slug");
  const qty = Number(qs.get("qty") || 1);

  const token = localStorage.getItem("token");
  const [teacher, setTeacher] = useState(null);
  const [reqData, setReqData] = useState(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const weekAheadISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [range, setRange] = useState({ from: todayISO, to: weekAheadISO });
  const [slots, setSlots] = useState([]);        // BOŞ (müsait)
  const [confirmed, setConfirmed] = useState([]); // DOLU (onaylı)
  const [picked, setPicked] = useState([]);      // [{start,end,mode}]

  // Auth guard
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(
        `/login?next=/saat-sec?requestId=${requestId}&slug=${slug}&qty=${qty}`,
        { replace: true }
      );
    }
  }, [token, requestId, slug, qty, navigate]);

  // Öğretmen + Talep bilgisi
  useEffect(() => {
    (async () => {
      try {
        const [tRes, rRes] = await Promise.all([
          axios.get(`/api/v1/ogretmenler/${slug}`),
          axios.get(`/api/v1/student-requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTeacher(tRes.data.teacher);
        setReqData(rRes.data.request);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug, requestId, token]);

  // Slotları getir (hem boş hem dolu)
  const fetchSlots = async () => {
    if (!reqData) return;
    try {
      const { data } = await axios.get(`/api/v1/ogretmenler/${slug}/slots`, {
        params: {
          from: range.from,
          to: range.to,
          mode: reqData.mode,  // ONLINE | FACE_TO_FACE
          duration: 60,        // BE tarafı 'duration' bekliyor (60 dk)
          // tz isteğe bağlı eklenebilir: tz: "Europe/Istanbul"
        },
      });
      setSlots(data?.slots || []);
      setConfirmed(data?.confirmed || []);

      // güvenlik: artık boş olmayan (confirmed ile çakışan) seçili slot varsa düşür
      setPicked((arr) =>
        arr.filter(
          (p) =>
            !(data?.confirmed || []).some(
              (c) => c.startsAt === p.start && c.endsAt === p.end
            )
        )
      );
    } catch (e) {
      console.error(e);
      alert("Uygun saatler getirilemedi.");
    }
  };

  // Gün bazında grupla
  const groupByDay = (list, keySelector) => {
    const map = {};
    for (const it of list || []) {
      const keyDate = new Date(keySelector(it));
      const key = keyDate.toISOString().slice(0, 10); // YYYY-MM-DD
      (map[key] ||= []).push(it);
    }
    return map;
  };

  const byDayAvailable = useMemo(
    () => groupByDay(slots, (s) => s.start),
    [slots]
  );
  const byDayConfirmed = useMemo(
    () => groupByDay(confirmed, (c) => c.startsAt),
    [confirmed]
  );

  const dayList = useMemo(() => {
    if (!range.from || !range.to) return [];
    const days = [];
    const start = new Date(range.from);
    const end = new Date(range.to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().slice(0, 10));
    }
    return days;
  }, [range]);

  const fmtDayTitle = (isoDay) =>
    new Date(isoDay).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const togglePick = (s) => {
    const k = s.start + "|" + s.end;
    setPicked((arr) => {
      const exists = arr.find((x) => x.start + "|" + x.end === k);
      if (exists) return arr.filter((x) => x.start + "|" + x.end !== k);
      if (arr.length >= qty) return arr; // limit
      return [...arr, s];
    });
  };

  const saveAndGoCart = async () => {
    if (picked.length !== qty) {
      alert(`Lütfen ${qty} adet ders saati seçiniz.`);
      return;
    }
    try {
      // 1) Slotları PENDING randevu olarak kaydet
      await axios.post(
        `/api/v1/student-requests/${requestId}/slots`,
        { slots: picked }, // [{start,end,mode}]
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2) Talebi tekrar çek
      const { data: rData } = await axios.get(
        `/api/v1/student-requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const req = rData.request;

      // 3) Sepete ekle (toplam paket kuruş → packageUnitPrice)
      const { data: tData } = await axios.get(`/api/v1/ogretmenler/${slug}`);
      const tch = tData.teacher;

      const lessonsCount =
        req.packageSlug === "paket-6" ? 6 :
        req.packageSlug === "paket-3" ? 3 : 1;
      const discountRate = req.packageSlug === "tek-ders" ? 0 : 5;

      const baseTL =
        req.mode === "ONLINE"
          ? tch.priceOnline ?? tch.priceF2F ?? 0
          : tch.priceF2F ?? tch.priceOnline ?? 0;
      const baseKurus = Math.round(baseTL * 100);

      await axios.post(
        "/api/cart/items",
        {
          slug: req.packageSlug,
          title: req.packageTitle || "Özel ders paketi",
          name: req.packageTitle || "Özel ders paketi",
          unitPrice: Number(req.packageUnitPrice), // toplam paket fiyatı (kuruş)
          quantity: 1,
          meta: {
            requestId,
            teacherSlug: slug,
            mode: req.mode,
            lessonsCount,
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

  const hasAny =
    (slots && slots.length > 0) || (confirmed && confirmed.length > 0);

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Ders Saatlerini Seç</h1>

      {/* Legend */}
      <div className="slot-legend">
        <span className="legend-item">
          <span className="legend-dot legend-free" /> Müsait
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-booked" /> Onaylı (Dolu)
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-picked" /> Seçili
        </span>
      </div>

      <div className="tp-grid-2">
        <div>
          <label className="tp-sublabel">Başlangıç</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          />
        </div>
        <div>
          <label className="tp-sublabel">Bitiş</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          />
        </div>
      </div>

      <div className="tp-actions">
        <button type="button" onClick={fetchSlots}>
          Uygun Saatleri Göster
        </button>
      </div>

      {!hasAny ? (
        <div className="tp-empty">Bu aralıkta veri bulunamadı.</div>
      ) : (
        <div className="tp-slot-group-wrap">
          {dayList.map((dayISO) => {
            const confirmedList = byDayConfirmed[dayISO] || [];
            const availableList = byDayAvailable[dayISO] || [];
            if (confirmedList.length === 0 && availableList.length === 0)
              return null;

            return (
              <div key={dayISO} className="tp-slot-group">
                <div className="tp-slot-group-head">
                  <span className="tp-badge">{fmtDayTitle(dayISO)}</span>
                </div>

                {/* DOLU (onaylı) – tıklanamaz */}
                {confirmedList.length > 0 && (
                  <div className="tp-slots-grid">
                    {confirmedList.map((c) => (
                      <div
                        key={c.id}
                        className="tp-slot-card slot-confirmed"
                        title="Bu saat onaylanmış (dolu)"
                      >
                        <div className="tp-slot-time">
                          {fmtTime(c.startsAt)} – {fmtTime(c.endsAt)}
                        </div>
                        <div className="tp-slot-mode">Dolu</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* BOŞ (müsait) – tıklanabilir */}
                {availableList.length > 0 && (
                  <div className="tp-slots-grid">
                    {availableList.map((s) => {
                      const key = `${s.start}|${s.end}`;
                      const chosen = picked.find(
                        (x) => `${x.start}|${x.end}` === key
                      );
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`tp-slot-card ${
                            chosen ? "slot-picked" : ""
                          }`}
                          onClick={() => togglePick(s)}
                        >
                          <div className="tp-slot-time">
                            {fmtTime(s.start)} – {fmtTime(s.end)}
                          </div>
                          <div className="tp-slot-mode">
                            {s.mode === "FACE_TO_FACE"
                              ? "Yüz yüze"
                              : s.mode === "ONLINE"
                              ? "Online"
                              : "Her ikisi"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pkc-actions">
        <div className="tp-sublabel">
          Seçili: {picked.length} / {qty}
        </div>
        <button
          className="pkc-btn"
          disabled={picked.length !== qty}
          onClick={saveAndGoCart}
        >
          Sepete devam et
        </button>
      </div>
    </div>
  );
}
