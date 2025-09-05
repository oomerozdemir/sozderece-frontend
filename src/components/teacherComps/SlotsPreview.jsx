// src/components/teacherComps/SlotsPreview.jsx
import { useMemo } from "react";

/**
 * @param {Array} slots      - müsait slotlar [{start,end,mode}]
 * @param {Array} confirmed  - onaylı randevular [{id,startsAt,endsAt,mode,student?}]
 * @param {Function} fetchSlots
 */
export default function SlotsPreview({ range, setRange, slots, confirmed = [], fetchSlots }) {
  // ---- helpers ----
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const fmtDayTitle = (isoDay) =>
    new Date(isoDay).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  const studentLabel = (stu) => {
    if (!stu) return "Onaylandı";
    if (stu.name) return stu.name;
    if (stu.email) return stu.email;
    return "Onaylandı";
  };

  const toDayISO = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const daysInRange = (r) => {
    const days = [];
    if (!r?.from || !r?.to) return days;
    const start = new Date(r.from);
    const end = new Date(r.to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().slice(0, 10));
    }
    return days;
  };

  const groupByDay = (list, keyGetter) => {
    const map = {};
    for (const it of list || []) {
      const keyISO = toDayISO(keyGetter(it));
      (map[keyISO] ||= []).push(it);
    }
    return map;
  };

  // ---- groups ----
  const byDayAvailable = useMemo(
    () => groupByDay(slots, (s) => s.start),
    [slots]
  );

  const byDayConfirmed = useMemo(
    () => groupByDay(confirmed, (c) => c.startsAt),
    [confirmed]
  );

  const dayList = useMemo(() => daysInRange(range), [range]);
  const hasAny = (slots?.length || 0) > 0 || (confirmed?.length || 0) > 0;

  return (
    <div className="tp-section">
      <div className="tp-section-head">
        <div className="tp-section-title">Takvim Önizleme</div>
        <div className="tp-section-sub">
          Seçili aralıkta <b>onaylı</b> (yeşil, öğrenci adıyla) ve <b>müsait</b> saatler.
        </div>
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
        <button type="button" onClick={fetchSlots}>Slotları Göster</button>
      </div>

      {!hasAny ? (
        <div className="tp-empty">Bu aralıkta veri bulunamadı.</div>
      ) : (
        <div className="tp-slot-group-wrap">
          {dayList.map((dayISO) => {
            const confirmedList = byDayConfirmed[dayISO] || [];
            const availableList = byDayAvailable[dayISO] || [];
            if (confirmedList.length === 0 && availableList.length === 0) return null;

            return (
              <div key={dayISO} className="tp-slot-group">
                <div className="tp-slot-group-head">
                  <span className="tp-badge">{fmtDayTitle(dayISO)}</span>
                </div>

                {/* Onaylı randevular — YEŞİL (öğrenci ismiyle) */}
{confirmedList.length > 0 && (
  <div className="tp-slots-grid">
    {confirmedList.map((c) => (
      <div key={c.id} className="tp-slot-card slot-confirmed">
        <div className="tp-slot-time">
          {fmtTime(c.startsAt)} – {fmtTime(c.endsAt)}
        </div>
        <div className="tp-slot-mode">
          Onaylı {c.student?.name ? <>• <b>{c.student.name}</b></> : null}
        </div>
      </div>
    ))}
  </div>
)}

                {/* Müsait slotlar — NORMAL */}
                {availableList.length > 0 && (
                  <div className="tp-slots-grid">
                    {availableList.map((s) => (
                      <div key={`${s.start}-${s.end}`} className="tp-slot-card">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
