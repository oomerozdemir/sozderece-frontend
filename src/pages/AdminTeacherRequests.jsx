import { useEffect, useState } from "react";
import axios from "../utils/axios";


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
    <div className="p-5 text-[#1f2937]">
      <h2 className="text-xl font-bold m-0 mb-4">👩‍🏫 Öğretmen Bazlı Talep Özeti</h2>
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
                  <div className="font-semibold">{r.teacher.name}</div>
                  <div className="text-[#6b7280] text-xs">{r.teacher.email}</div>
                </td>
                <td>{r.requests.SUBMITTED || 0}</td>
                <td>{r.requests.PACKAGE_SELECTED || 0}</td>
                <td>{r.requests.PAID || 0}</td>
                <td>{r.requests.CANCELLED || 0}</td>
                <td>{r.requests.ACCEPTED || 0}</td>
                <td><span className="inline-block min-w-[24px] py-0.5 px-1.5 text-center rounded-md bg-[#f3f4f6] text-[#111827] text-xs font-semibold">{r.appointments.confirmed}</span></td>
                <td><span className="inline-block min-w-[24px] py-0.5 px-1.5 text-center rounded-md bg-[#f3f4f6] text-[#111827] text-xs font-semibold">{r.appointments.pending}</span></td>
                <td><span className="inline-block min-w-[24px] py-0.5 px-1.5 text-center rounded-md bg-[#f3f4f6] text-[#111827] text-xs font-semibold">{r.appointments.cancelled}</span></td>
                <td><span className="inline-block min-w-[24px] py-0.5 px-1.5 text-center rounded-md bg-[#f3f4f6] text-[#111827] text-xs font-semibold">{r.appointments.completed}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
