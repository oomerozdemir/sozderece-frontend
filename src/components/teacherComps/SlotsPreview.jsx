// src/components/teacherComps/SlotsPreview.jsx
import { useMemo } from "react";

export default function SlotsPreview({ range, setRange, slots, confirmed, fetchSlots }) {
  // ---- helpers ----
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const fmtDayTitle = (isoDay) =>
    new Date(isoDay).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  const toDayISO = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    // YYYY-MM-DD
    return dt.toISOString().slice(0, 10);
  };

  const daysInRange = (r) => {
    const days = [];
    if (!r?.from || !r?.to) return days;
    const start = new Date(r.from);
    const end = new Date(r.to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().slice(0, 10)); // YYYY-MM-DD
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
  // slots: {start,end,mode}
  const byDayAvailable = useMemo(
    () => groupByDay(slots, (s) => s.start),
    [slots]
  );

  // confirmed: {id,startsAt,endsAt,mode,notes}
  const byDayConfirmed = useMemo(
    () => groupByDay(confirmed, (c) => c.startsAt),
    [confirmed]
  );

  const dayList = useMemo(() => daysInRange(range), [range]);
  const hasAny =
    (slots && slots.length > 0) || (confirmed && confirmed.length > 0);

  return (
    <div className="tp-section">
      <div className="tp-section-head">
        <div className="tp-section-title">Takvim Önizleme</div>
        <div className="tp-section-sub">
          Seçili tarih aralığında <b>onaylı</b> (yeşil) ve <b>müsait</b> saatler.
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

                {/* Onaylı randevular — YEŞİL */}
                {confirmedList.length > 0 && (
                  <div className="tp-slots-grid">
                    {confirmedList.map((c) => (
                      <div key={c.id} className="tp-slot-card slot-confirmed">
                        <div className="tp-slot-time">
                          {fmtTime(c.startsAt)} – {fmtTime(c.endsAt)}
                        </div>
                        <div className="tp-slot-mode">Onaylı</div>
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
