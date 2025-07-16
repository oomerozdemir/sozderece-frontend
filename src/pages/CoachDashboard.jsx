import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/CoachDashboard.css";

const CoachDashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/coach/my-students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudents(res.data.students);
      } catch (err) {
        console.error("Öğrenciler alınamadı:");
      }
    };

    fetchStudents();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2 className="dashboard-title">📚 Atanmış Öğrenciler</h2>

        {students.length > 0 ? (
          <div className="student-grid">
            {students.map((student) => {
              const latestOrder = student.orders?.[0];

              return (
                <div key={student.id} className="student-card">
                  <p><strong>👤 İsim:</strong> {student.name}</p>
                  <p><strong>📧 Email:</strong> {student.email}</p>
                  <p><strong>📞 Telefon:</strong> {student.phone || "Yok"}</p>
                  <p><strong>🎓 Sınıf:</strong> {student.grade || "Belirtilmemiş"}</p>
                  {["9", "10", "11", "12", "Mezun"].includes(student.grade) && (
                    <p><strong>📚 Alan:</strong> {student.track || "Belirtilmemiş"}</p>
                  )}
                  <p><strong>📅 Atanma Tarihi:</strong> {new Date(student.createdAt).toLocaleDateString("tr-TR")}</p>

                  {latestOrder ? (
                    <div className="order-info">
                      <p><strong>📦 Paket:</strong> {latestOrder.package}</p>
                      <p><strong>🟢 Başlangıç:</strong> {new Date(latestOrder.startDate).toLocaleDateString("tr-TR")}</p>
                      <p><strong>📆 Bitiş:</strong> {new Date(latestOrder.endDate).toLocaleDateString("tr-TR")}</p>
                      <p><strong>🔄 Durum:</strong> {latestOrder.status}</p>
                    </div>
                  ) : (
                    <p className="no-order">📭 Sipariş bilgisi bulunamadı.</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">Henüz size atanmış öğrenci bulunmamaktadır.</p>
        )}
      </div>
    </>
  );
};

export default CoachDashboard;
