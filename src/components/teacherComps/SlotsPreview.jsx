import { useMemo } from "react";

export default function SlotsPreview({ range, setRange, slots, fetchSlots }) {
  const groups = useMemo(() => {
    const g = {};
    for (const s of slots || []) {
      const d = new Date(s.start);
      const key = d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
      (g[key] ||= []).push(s);
    }
    return g;
  }, [slots]);

  const hasAny = Object.keys(groups).length > 0;

  return (
    <div className="tp-section">
      <div className="tp-section-head">
        <div className="tp-section-title">Takvim Önizleme</div>
        <div className="tp-section-sub">Seçili tarih aralığında rezervasyona açık saatler.</div>
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
        <div className="tp-empty">Bu aralıkta uygun slot bulunamadı.</div>
      ) : (
        Object.entries(groups).map(([label, list]) => (
          <div key={label} className="tp-slot-group">
            <div className="tp-slot-group-head">
              <span className="tp-badge">{label}</span>
            </div>
            <div className="tp-slots-grid">
              {list.map((s) => {
                const st = new Date(s.start);
                const et = new Date(s.end);
                return (
                  <div key={s.start} className="tp-slot-card">
                    <div className="tp-slot-time">
                      {st.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} – {et.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="tp-slot-mode">{s.mode === "FACE_TO_FACE" ? "Yüz yüze" : s.mode === "ONLINE" ? "Online" : "Her ikisi"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
