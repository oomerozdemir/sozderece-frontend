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
        <div className="student-dashboard-grid">
          <div className="studentPage-coach-card">
            <h3>Atanmış Koçunuz</h3>

            {!student.assignedCoach ? (
              <>
                <p>Hoş geldiniz! 👋</p>
                <p>Henüz bir koç atamanız yapılmadı.Aşşağıdaki butonları kullanarak paketlerimizi inceleyebilir,detaylı bilgi almak için ücretsiz ön görüşme yapabilir veya whatsapp üzerinden destek alabilirsiniz.</p>
                <div className="studentPage-button-group">
                  <a href="/paket-detay" className="studentPage-button">📦 Paketleri İncele</a>
                  <a href="/ucretsiz-on-gorusme" className="studentPage-button">🗓️ Ücretsiz Ön Görüşme</a>
                  <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="studentPage-button whatsapp">
                    💬 WhatsApp Destek
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="student-welcome">Hoş geldiniz! 👋</p>
                <img src={student.assignedCoach.image} alt={student.assignedCoach.name} className="student-dashboard-coach-image" />
                <p className="student-info-item"><strong>👨‍🏫 Koç Adı:</strong> {student.assignedCoach.name}</p>
                <p className="student-info-item"><strong>📘 Üniversite:</strong> {student.assignedCoach.subject}</p>
                <p className="student-info-item"><strong>📝 Alanı ve Derecesi:</strong> {student.assignedCoach.description}</p>
                <p className="student-info-item"><strong>📧 Email:</strong> {student.assignedCoach.user?.email}</p>
                <p className="student-info-item"><strong>📞 Telefon:</strong> {student.assignedCoach.user?.phone || "Belirtilmemiş"}</p>
                <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="studentPage-button whatsapp">
                  💬 WhatsApp Destek
                </a>
              </>
            )}
          </div>

          <div className="studentPage-side-info">
            <span className="badge-upcoming">Yeni!</span>
            <h4>🎉 Yeni Özellikler Çok Yakında!</h4>
            <p>Şu anda bu sayfada sadece atanmış koçunuzu ve bilgilerinizi görüyorsunuz.</p>
            <p>Koçunuz sizinle <strong>WhatsApp</strong> üzerinden iletişime geçecektir.</p>
            <p className="studentPage-info-note">
              İlerleyen zamanlarda bu sayfa daha interaktif hale gelecek: 📈 Deneme takibi, 📝 Haftalık planlar, 🎯 Hedef takibi ve daha fazlası burada olacak!
            </p>

            <h4>🧭 İlk Adımlar</h4>
            <ul>
              <li>✅ Koçunuzla WhatsApp'tan tanışın</li>
              <li>📅 İlk görüşmenizi planlayın</li>
              <li>📘 Haftalık hedeflerinizi not edin</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
