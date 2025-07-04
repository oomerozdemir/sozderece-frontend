import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import axios from "axios";

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
        console.log("Gelen öğrenci listesi:", res.data.students);

      } catch (err) {
        console.error("Öğrenciler alınamadı:", err);
      }
    };

    fetchStudents();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">📚 Atanmış Öğrenciler</h2>

        {students.length > 0 ? (
          <ul className="space-y-4">
            {students.map((student) => (
              <li
                key={student.id}
                className="border border-gray-300 bg-gray-50 rounded-md p-4 shadow-sm"
              >
                <p><strong>👤 İsim:</strong> {student.name}</p>
                <p><strong>📧 Email:</strong> {student.email}</p>
                <p><strong>📞 Telefon:</strong> {student.phone || "Yok"}</p>
                <p><strong>🎓 Sınıf:</strong> {student.grade || "Belirtilmemiş"}</p>
                {["9", "10", "11", "12", "Mezun"].includes(student.grade) && (
                  <p><strong>📚 Alan:</strong> {student.track || "Belirtilmemiş"}</p>
                )}
                <p><strong>📅 Oluşturulma:</strong> {new Date(student.createdAt).toLocaleDateString("tr-TR")}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Henüz size atanmış öğrenci bulunmamaktadır.</p>
        )}
      </div>
    </>
  );
};

export default CoachDashboard;
