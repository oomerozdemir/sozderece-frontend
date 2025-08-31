export default function AvailabilityEditor({
  avail,
  setAvail,
  onAvailChange,
  minToStr,
  strToMin,
  onSave,
}) {
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  const getItem = (i) => avail.items.find((x) => x.weekday === i) || {};

  return (
    <div className="tp-section">
      <div className="tp-section-title">Haftalık Uygunluk</div>

      <div className="tp-grid-2" style={{ gridTemplateColumns: "1fr" }}>
        <label className="tp-label">Zaman Dilimi</label>
        <input
          placeholder="Europe/Istanbul"
          value={avail.timeZone}
          onChange={(e) => setAvail((a) => ({ ...a, timeZone: e.target.value }))}
        />
      </div>

      <div className="tp-availability-table">
        {days.map((d, i) => {
          const item = getItem(i);
          const active = !!item.isActive;
          return (
            <div key={i} className="tp-availability-row">
              <div className="day">{d}</div>
              <label className="tp-switch">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => onAvailChange(i, "isActive", e.target.checked)}
                />
                <span>Açık</span>
              </label>
              <input
                type="time"
                value={minToStr(item.startMin ?? 9 * 60)}
                onChange={(e) => onAvailChange(i, "startMin", strToMin(e.target.value))}
                disabled={!active}
              />
              <span>–</span>
              <input
                type="time"
                value={minToStr(item.endMin ?? 17 * 60)}
                onChange={(e) => onAvailChange(i, "endMin", strToMin(e.target.value))}
                disabled={!active}
              />
              <select
                value={item.mode || "BOTH"}
                onChange={(e) => onAvailChange(i, "mode", e.target.value)}
                disabled={!active}
              >
                <option value="ONLINE">Online</option>
                <option value="FACE_TO_FACE">Yüz yüze</option>
                <option value="BOTH">Her ikisi</option>
              </select>
            </div>
          );
        })}
      </div>

      <div className="tp-actions">
        <button type="button" onClick={onSave}>Uygunluğu Kaydet</button>
      </div>
    </div>
  );
}
