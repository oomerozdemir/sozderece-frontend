import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";

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

  // normalize'lı diziler
  const [slots, setSlots] = useState([]);                // müsait
  const [busyPending, setBusyPending] = useState([]);    // dolu - bekleyen
  const [busyConfirmed, setBusyConfirmed] = useState([]);// dolu - onaylı

  // kullanıcı seçimleri
  const [picked, setPicked] = useState([]); // {start, end, mode?}
  const params = new URLSearchParams(location.search);
  const useFreeRight = params.get("useFreeRight") === "1"; // ✅ ücretsiz hak modu


  // --- Öğretmen bilgisi (fiyat meta'sı için) ---
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

    let guestEmail = localStorage.getItem("guestCartEmail");
    if (!token && !guestEmail) {
      guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@guest.sozderece.com`;
      localStorage.setItem("guestCartEmail", guestEmail);
    }
    const authHeaders = token && isTokenValid(token) 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : undefined;

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
            email: token ? undefined : guestEmail,
          },
          authHeaders
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
          email: token ? undefined : guestEmail,
        },
        authHeaders
      );

      // 1.a) Dönen id'leri normalize et (geriye uyum: tekil id de olabilir)
      const ids =
        Array.isArray(createRes?.requestIds) ? createRes.requestIds :
        Array.isArray(createRes?.items) ? createRes.items.map(x => x.id).filter(Boolean) :
        (createRes?.id ? [createRes.id] : []);

      if (!ids.length) {
        alert("Talep oluşturulamadı (requestIds bulunamadı).");
        return;
      }

      // localStorage'a yaz (geriye uyum için ilkini ayrıca kaydet)
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
        email: token ? undefined : guestEmail,
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
      }, authHeaders);

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

  const inputDateCls = "w-full h-10 border border-[#e5e7eb] rounded-xl px-3 bg-white outline-none transition-all focus:border-[#6366f1] focus:shadow-[0_0_0_4px_rgba(99,102,241,.15)]";
  const busyBg = "repeating-linear-gradient(135deg, rgba(245, 158, 11, 0.10) 0 8px, rgba(245, 158, 11, 0.16) 8px 16px), #fff7ed";
  const slotGridCls = "grid grid-cols-4 gap-[10px] p-3 max-[1024px]:grid-cols-3 max-[720px]:grid-cols-2 max-[460px]:grid-cols-1";
  const slotCardBaseCls = "relative grid content-center gap-[6px] min-h-[64px] p-[10px_12px] text-left rounded-[14px] transition-all";
  const busyBadgeCls = "absolute top-2 right-[10px] w-[22px] h-[22px] grid place-items-center font-black text-[.86rem] text-white bg-[#f59e0b] rounded-full shadow-[0_4px_10px_rgba(245,158,11,.35)]";

  return (
    <div className="max-w-[1080px] mx-auto my-7 px-4 pb-6 text-[#0f172a]">
      <h1 className="m-0 mb-[14px] text-[1.75rem] font-black tracking-[-0.01em] bg-gradient-to-r from-[#02095f] to-[#0ea5e9] bg-clip-text text-transparent">
        Ders Saatlerini Seç
      </h1>

      {/* Legend */}
      <div className="flex gap-3 items-center my-[6px] mb-[10px] text-[0.95rem]">
        <span className="inline-flex items-center gap-[6px]">
          <i className="w-3 h-3 rounded-full inline-block border border-[#e5e7eb] bg-white" /> Müsait
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <i className="w-3 h-3 rounded-full inline-block border" style={{ background: '#fff7ed', borderColor: '#fdba74' }} /> Onay bekliyor
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <i className="w-3 h-3 rounded-full inline-block border" style={{ background: '#fee2e2', borderColor: '#fca5a5' }} /> Dolu
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <i className="w-3 h-3 rounded-full inline-block border" style={{ background: '#eef2ff', borderColor: '#3730a3' }} /> Seçili
        </span>
      </div>

      {/* Tarih aralığı formu */}
      <div className="grid grid-cols-2 gap-3 my-[10px] mb-2 max-[640px]:grid-cols-1">
        <div>
          <label className="block text-[.88rem] text-[#6b7280] mb-[6px]">Başlangıç</label>
          <input
            type="date"
            value={range.from}
            onChange={(e)=>setRange(r=>({...r, from: e.target.value}))}
            min={todayISO}
            className={inputDateCls}
          />
        </div>
        <div>
          <label className="block text-[.88rem] text-[#6b7280] mb-[6px]">Bitiş</label>
          <input
            type="date"
            value={range.to}
            onChange={(e)=>setRange(r=>({...r, to: e.target.value}))}
            min={todayISO}
            className={inputDateCls}
          />
        </div>
      </div>

      {/* Aksiyon satırı */}
      <div className="flex items-center gap-[10px] my-1 mb-3">
        <button
          type="button"
          onClick={fetchSlots}
          className="h-10 px-[14px] rounded-xl border border-[#e5e7eb] bg-gradient-to-b from-[#111827] to-[#0b1220] text-white font-bold cursor-pointer transition-all hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(2,9,95,.18)]"
        >
          Uygun Saatleri Göster
        </button>
      </div>

      {!any ? (
        <div
          className="mt-[10px] p-[18px] border border-dashed border-[#e5e7eb] rounded-[14px] text-[#64748b] text-center"
          style={{ background: "radial-gradient(600px 220px at 5% -10%, #eef2ff 0%, transparent 60%), radial-gradient(600px 220px at 105% 10%, #ecfeff 0%, transparent 60%), #fff" }}
        >
          Bu aralıkta kayıt bulunamadı.
        </div>
      ) : (
        daysInRange.map((d) => {
          const avail = byAvail[d] || [];
          const pend  = byPend[d] || [];
          const conf  = byConf[d] || [];
          if (!avail.length && !pend.length && !conf.length) return null;

          return (
            <div key={d} className="my-[14px] border border-[#eef2ff] rounded-[16px] bg-white overflow-hidden shadow-[0_6px_22px_rgba(2,9,95,0.06)]">
              <div className="sticky top-0 z-[2] bg-gradient-to-r from-[rgba(99,102,241,0.06)] to-[rgba(14,165,233,0.06)] p-[10px_12px] border-b border-[#eef2ff]">
                <span className="inline-block text-[.92rem] font-extrabold text-[#02095f] bg-[#eef2ff] border border-[#e0e7ff] px-[10px] py-[6px] rounded-full">
                  {fmtDay(d)}
                </span>
              </div>

              {/* ONAYLI → DOLU */}
              {conf.length > 0 && (
                <div className={slotGridCls}>
                  {conf.map(c => (
                    <div
                      key={keyOf(c)}
                      className={`${slotCardBaseCls} border border-[#f59e0b] text-[#9a3412] cursor-not-allowed pointer-events-none`}
                      style={{ background: busyBg }}
                      title="Dolu"
                    >
                      <span className={busyBadgeCls}>!</span>
                      <div className="font-extrabold tracking-[.2px]">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                      <div className="text-[.85rem] text-[#475569]">Dolu</div>
                    </div>
                  ))}
                </div>
              )}

              {/* BEKLEYEN → DOLU */}
              {pend.length > 0 && (
                <div className={slotGridCls}>
                  {pend.map(c => (
                    <div
                      key={keyOf(c)}
                      className={`${slotCardBaseCls} border border-[#f59e0b] text-[#9a3412] cursor-not-allowed pointer-events-none`}
                      style={{ background: busyBg }}
                      title="Onay bekliyor"
                    >
                      <span className={busyBadgeCls}>!</span>
                      <div className="font-extrabold tracking-[.2px]">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                      <div className="text-[.85rem] text-[#475569]">Onay bekliyor</div>
                    </div>
                  ))}
                </div>
              )}

              {/* MÜSAİT → SEÇİLEBİLİR */}
              {avail.length > 0 && (
                <div className={slotGridCls}>
                  {avail.map(s => {
                    const k = keyOf(s);
                    const chosen = pickedKeys.has(k);
                    const disabled = isBusy(s);
                    return (
                      <button
                        key={k}
                        className={`${slotCardBaseCls} border ${
                          chosen
                            ? "border-[#6366f1] shadow-[0_12px_36px_rgba(99,102,241,.25)] -translate-y-[1px] text-[#111827] cursor-pointer"
                            : disabled
                            ? "border-[#f59e0b] text-[#9a3412] cursor-not-allowed pointer-events-none"
                            : "border-[#e5e7eb] text-[#111827] cursor-pointer hover:-translate-y-[1px] hover:border-[#c7d2fe] hover:shadow-[0_10px_30px_rgba(2,9,95,0.09)]"
                        }`}
                        style={
                          chosen
                            ? { background: "linear-gradient(180deg, rgba(99,102,241,.10), rgba(99,102,241,.06)), #ffffff" }
                            : disabled
                            ? { background: busyBg }
                            : { background: "radial-gradient(260px 120px at 20% -20%, #f5f7ff 0%, transparent 60%), #ffffff" }
                        }
                        onClick={()=>!disabled && togglePick(s)}
                        type="button"
                        disabled={disabled}
                        title={disabled ? "Dolu" : ""}
                      >
                        {chosen && (
                          <span className="absolute top-2 right-[10px] w-[22px] h-[22px] grid place-items-center font-black text-[.86rem] text-white bg-[#16a34a] rounded-full shadow-[0_4px_10px_rgba(22,163,74,.35)]">✓</span>
                        )}
                        {disabled && !chosen && (
                          <span className={busyBadgeCls}>!</span>
                        )}
                        <div className="font-extrabold tracking-[.2px]">{fmtTime(s.start)} – {fmtTime(s.end)}</div>
                        <div className="text-[.85rem] text-[#475569]">{s.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Alt aksiyonlar */}
      <div className="flex items-center justify-between gap-3 mt-[14px] pt-[10px] border-t border-dashed border-[#e5e7eb]">
        <div className="text-[.88rem] text-[#334155] font-semibold">Seçili: {picked.length} / {qty}</div>
        <button
          className="h-[42px] px-4 rounded-xl border border-[#02095f] bg-gradient-to-b from-[#02095f] to-[#07136f] text-white font-black tracking-[.2px] cursor-pointer transition-all hover:-translate-y-[1px] hover:shadow-[0_10px_26px_rgba(2,9,95,.25)] disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none"
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
