import { useEffect, useState } from "react";
import axios from "../utils/axios";
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
        console.error("Öğrenci verisi alınamadı:");
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
      <div className="student-page-wrapper">
        <div className="studentPage-coach-card">
          <h3>Atanmış Koçunuz</h3>

          {student.assignedCoach ? (
            <>
              <img
                src={student.assignedCoach.image}
                alt="Koç Fotoğrafı"
                className="studentPage-coach-card-image"
              />
              <p>{student.assignedCoach.subject}</p>
              <p><strong>Ad:</strong> {student.assignedCoach.name}</p>
              <p><strong>Email:</strong> {student.assignedCoach?.user?.email}</p>
              <p><strong>Telefon:</strong> {student.assignedCoach?.user?.phone}</p>
              <blockquote className="studentPage-coach-quote">
                “Her öğrenci parlamayı bekleyen bir yıldızdır.”
              </blockquote>
            </>
          ) : (
            <>
              <p>Hoş geldiniz! 👋</p>
              <p>Henüz bir koç atamanız yapılmadı.</p>
              <p>Koçunuz atandığında burada görüntülenecektir.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
