// src/pages/AdminLessonRequests.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/adminLessonRequest.css";

export default function AdminLessonRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/admin/lesson-requests/health", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(data.items || []);
      } catch (err) {
        console.error("lesson-requests fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="admin-lesson-requests">
      <h2>🧾 Ders Talepleri – Sağlık Kontrolü</h2>
      {items.length === 0 ? (
        <p>Kayıt bulunamadı.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Öğrenci</th>
              <th>Öğretmen</th>
              <th>Ders/Seviye</th>
              <th>İstek Durumu</th>
              <th>Ödeme/Ücretsiz?</th>
              <th>Randevular</th>
              <th>Uyarı</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const warnPayNoConf = it.mismatch?.paymentButNoConfirm;
              const warnConfNoPay = it.mismatch?.confirmButNoPayment;
              const rowStyle =
                warnPayNoConf || warnConfNoPay ? { background: "#fff3cd" } : {};
              return (
                <tr key={it.requestId} style={rowStyle}>
                  <td>{new Date(it.createdAt).toLocaleString("tr-TR")}</td>
                  <td>
                    {it.student?.name} <br />
                    <small>{it.student?.email}</small>
                  </td>
                  <td>
                    {it.teacher?.name} <br />
                    <small>{it.teacher?.email}</small>
                  </td>
                  <td>
                    {it.subject} / {it.grade}
                  </td>
                  <td>
                    {it.requestStatus}
                    {it.orderStatus ? ` / order:${it.orderStatus}` : ""}
                  </td>
                  <td>{it.hasPaymentOrFree ? "✅ Var" : "—"}</td>
                  <td>
                    {it.counts.confirmed} onaylı / {it.counts.pending} bekleyen
                  </td>
                  <td>
                    {warnPayNoConf && (
                      <div>⚠️ Ödeme/Ücretsiz var ama CONFIRMED yok</div>
                    )}
                    {warnConfNoPay && (
                      <div>⚠️ CONFIRMED var ama ödeme/ücretsiz yok</div>
                    )}
                    {!warnPayNoConf && !warnConfNoPay && <div>✅ Uyumlu</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
