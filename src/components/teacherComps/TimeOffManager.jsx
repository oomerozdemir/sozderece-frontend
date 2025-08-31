// src/components/teacher/TimeOffManager.jsx
export default function TimeOffManager({
  creatingOff,
  setCreatingOff,
  timeOffs,
  addTimeOff,
  delTimeOff,
}) {
  return (
    <div className="tp-section">
      <div className="tp-section-title">Tatil / Blokaj</div>

      <div className="tp-grid-2">
        <input
          type="datetime-local"
          value={creatingOff.startsAt}
          onChange={(e) => setCreatingOff((o) => ({ ...o, startsAt: e.target.value }))}
        />
        <input
          type="datetime-local"
          value={creatingOff.endsAt}
          onChange={(e) => setCreatingOff((o) => ({ ...o, endsAt: e.target.value }))}
        />
      </div>
      <input
        placeholder="Açıklama (ops.)"
        value={creatingOff.reason}
        onChange={(e) => setCreatingOff((o) => ({ ...o, reason: e.target.value }))}
        style={{ marginTop: 8 }}
      />

      <div className="tp-actions">
        <button type="button" onClick={addTimeOff}>Ekle</button>
      </div>

      <div className="tp-timeoffs">
        {timeOffs.map((off) => (
          <div key={off.id} className="tp-timeoff">
            <span>
              {new Date(off.startsAt).toLocaleString()} – {new Date(off.endsAt).toLocaleString()}
            </span>
            <span className="muted">{off.reason || ""}</span>
            <button type="button" onClick={() => delTimeOff(off.id)}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}
