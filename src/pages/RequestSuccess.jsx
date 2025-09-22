import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../cssFiles/requestSuccess.css";

export default function RequestSuccess() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastRequestSummary");
      if (raw) setSummary(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const ids = Array.isArray(summary?.requestIds) ? summary.requestIds : [];
  const count = ids.length || 1;

  return (
    <div className="reqsucc-page">
      <div className="reqsucc-card">
        <div className="reqsucc-icon">🎉</div>
        <h1>Talebiniz oluşturuldu!</h1>
        <p>
          {count} ders saati için talebiniz öğretmene iletildi.
          {summary?.teacherName ? <> <b>{summary.teacherName}</b> öğretmenle</> : null} en kısa sürede eşleşeceksiniz.
        </p>

        {summary?.slots?.length ? (
          <div className="reqsucc-slots">
            <div className="reqsucc-slots-title">Seçtiğiniz saatler:</div>
            <ul>
              {summary.slots.map((s, i) => (
                <li key={i}>
                  {new Date(s.start).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })} – {s.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="reqsucc-actions">
          <Link to="/profil/taleplerim" className="reqsucc-btn">Taleplerimi Gör</Link>
          <Link to="/orders" className="reqsucc-link">Siparişlerim</Link>
        </div>
      </div>
    </div>
  );
}
