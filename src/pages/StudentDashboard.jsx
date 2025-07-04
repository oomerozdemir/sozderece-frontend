import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import "../cssFiles/studentPage.css";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/student/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudent(res.data);
      } catch (error) {
        console.error("Öğrenci verisi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  if (loading) return <p>Yükleniyor...</p>;

  if (!student) return <p>Öğrenci verisi bulunamadı.</p>;

  return (
    <>
      <Navbar />
      <div className="student-dashboard">
        <h1>🎓 Hoş geldin, {student.name}!</h1>

        <section style={{ marginTop: "20px" }}>
          <h2>📘 Atanmış Koçun</h2>
          {student.assignedCoach ? (
            <div className="coach-card-container">
              <img
                src={`http://localhost:5000${student.assignedCoach.image}`}
                alt="Koç Fotoğrafı"
                className="coach-card-image"
              />
              <div className="coach-card-info">
                <h3>{student.assignedCoach.name}</h3>
                <p className="subject">{student.assignedCoach.subject || "Belirtilmemiş"}</p>
              </div>
            </div>
          ) : (
            <p>Şu anda atanmış bir koçun yok.</p>
          )}
        </section>
      </div>
    </>
  );
};

export default StudentDashboard;