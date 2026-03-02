import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import axios from "../utils/axios";

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
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">📚 Atanmış Öğrenciler</h2>

        {students.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            {students.map((student) => {
              const latestOrder = student.orders?.[0];

              return (
                <div
                  key={student.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">👤 İsim:</strong> {student.name}</p>
                  <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📧 Email:</strong> {student.email}</p>
                  <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📞 Telefon:</strong> {student.phone || "Yok"}</p>
                  <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">🎓 Sınıf:</strong> {student.grade || "Belirtilmemiş"}</p>
                  {["9", "10", "11", "12", "Mezun"].includes(student.grade) && (
                    <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📚 Alan:</strong> {student.track || "Belirtilmemiş"}</p>
                  )}
                  <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📅 Atanma Tarihi:</strong> {new Date(student.createdAt).toLocaleDateString("tr-TR")}</p>

                  {latestOrder ? (
                    <div className="mt-3 bg-gray-50 border-l-4 border-green-500 px-4 py-2 rounded-md">
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📦 Paket:</strong> {latestOrder.package}</p>
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">🟢 Başlangıç:</strong> {new Date(latestOrder.startDate).toLocaleDateString("tr-TR")}</p>
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📆 Bitiş:</strong> {new Date(latestOrder.endDate).toLocaleDateString("tr-TR")}</p>
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">🔄 Durum:</strong> {latestOrder.status}</p>
                    </div>
                  ) : (
                    <p className="mt-2 italic text-gray-400">📭 Sipariş bilgisi bulunamadı.</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 italic">Henüz size atanmış öğrenci bulunmamaktadır.</p>
        )}
      </div>
    </>
  );
};

export default CoachDashboard;
