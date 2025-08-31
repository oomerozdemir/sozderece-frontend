export default function SlotsPreview({ range, setRange, slots, fetchSlots }) {
  return (
    <div className="tp-section">
      <div className="tp-section-title">Takvim Önizleme</div>
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

      {!!slots.length && (
        <div className="tp-slots">
          {slots.map((s) => (
            <div key={s.start} className="tp-slot">
              {new Date(s.start).toLocaleString()} – {new Date(s.end).toLocaleTimeString()} ({s.mode})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
