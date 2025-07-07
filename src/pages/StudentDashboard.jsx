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
      <div className="coach-card">
  <h3>Atanmış Koçunuz</h3>
  <p><strong>Ad:</strong> {student.assignedCoach.name}</p>
  <p><strong>Email:</strong> {student.assignedCoach.email}</p>
  <p><strong>Telefon:</strong> {student.assignedCoach.phone}</p>

  {/* 💬 Koçtan alıntı */}
  <blockquote className="coach-quote">
    “Her öğrenci parlamayı bekleyen bir yıldızdır.”
  </blockquote>

  {/* 📞 İletişim Butonları */}
  <div className="coach-card-actions">
    <a href={`mailto:${student.assignedCoach.email}`} className="contact-btn">E-Posta Gönder</a>
    <a
      href={`https://wa.me/${student.assignedCoach.phone.replace(/\D/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="contact-btn"
    >
      WhatsApp
    </a>
  </div>
</div>
    </>
  );
};

export default StudentDashboard;