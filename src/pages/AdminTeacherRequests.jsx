import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/adminLessonRequest.css";


export default function AdminTeacherRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/admin/lesson-requests/teacher-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(data?.items || []);
      } catch (e) {
        console.error("teacher-summary fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Yükleniyor…</div>;

  return (
    <div className="admin-lesson-requests">
      <h2>👩‍🏫 Öğretmen Bazlı Talep Özeti</h2>
      {rows.length === 0 ? (
        <p>Kayıt bulunamadı.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Öğretmen</th>
              <th>Talep (SUBMITTED)</th>
              <th>Paket Seçildi</th>
              <th>Öd./Ücretsiz (PAID)</th>
              <th>Reddedildi</th>
              <th>✅ Kabul (≥1 CONFIRMED)</th>
              <th>📅 CONFIRMED</th>
              <th>⏳ PENDING</th>
              <th>❌ CANCELLED</th>
              <th>🎓 Tamamlanan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.teacher.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.teacher.name}</div>
                  <div className="muted">{r.teacher.email}</div>
                </td>
                <td>{r.requests.SUBMITTED || 0}</td>
                <td>{r.requests.PACKAGE_SELECTED || 0}</td>
                <td>{r.requests.PAID || 0}</td>
                <td>{r.requests.CANCELLED || 0}</td>
                <td>{r.requests.ACCEPTED || 0}</td>
                <td><span className="count-badge">{r.appointments.confirmed}</span></td>
                <td><span className="count-badge">{r.appointments.pending}</span></td>
                <td><span className="count-badge">{r.appointments.cancelled}</span></td>
                <td><span className="count-badge">{r.appointments.completed}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
