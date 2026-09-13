import Navbar from "../components/navbar";
import { useEffect, useState, useCallback } from "react";
import axios from "../utils/axios";
import StudentPanelEditor from "./coach/StudentPanelEditor";
import { FaExclamationTriangle } from "react-icons/fa";

const CoachDashboard = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/coach/my-students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Dikkat isteyenler (zorlanan > yarıda kalan) listenin başına gelsin —
        // koç kartı açmadan kimin bugün takıldığını hemen görsün.
        const sorted = [...res.data.students].sort((a, b) => {
          const score = (s) => (s.strugglingToday ? 2 : s.partialToday ? 1 : 0);
          return score(b) - score(a);
        });
        setStudents(sorted);
      } catch (err) {
        console.error("Öğrenciler alınamadı:");
      }
    };

    fetchStudents();
  }, []);

  const fetchSosAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/coach/sos-alerts", { headers: { Authorization: `Bearer ${token}` } });
      setSosAlerts(res.data?.alerts || []);
    } catch {
      // sessizce yut
    }
  }, []);

  // Sayfa açıkken de yeni SOS bildirimleri düşerse görünsün diye 30sn'de bir yenile.
  useEffect(() => {
    fetchSosAlerts();
    const t = setInterval(fetchSosAlerts, 30000);
    return () => clearInterval(t);
  }, [fetchSosAlerts]);

  const resolveSos = async (id) => {
    setResolvingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/coach/sos-alerts/${id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSosAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // sessizce yut
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-50 min-h-screen">
        {sosAlerts.length > 0 && (
          <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-2xl p-5">
            <p className="flex items-center gap-2 text-red-700 font-black text-sm mb-3">
              <FaExclamationTriangle /> {sosAlerts.length} acil durum bildirimi bekliyor
            </p>
            <div className="flex flex-col gap-2">
              {sosAlerts.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 bg-white rounded-xl px-4 py-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{a.student?.name || "Öğrenci"}</p>
                    {a.message && <p className="text-xs text-slate-600 mt-0.5">"{a.message}"</p>}
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                  <button
                    onClick={() => resolveSos(a.id)}
                    disabled={resolvingId === a.id}
                    className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-black hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {resolvingId === a.id ? "…" : "Gördüm, Çözüldü"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-slate-800 mb-8">📚 Atanmış Öğrenciler</h2>

        {students.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            {students.map((student) => {
              const latestOrder = student.orders?.[0];

              return (
                <div
                  key={student.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                    student.strugglingToday ? "border-red-300" : student.partialToday ? "border-amber-300" : "border-slate-200"
                  }`}
                >
                  {(student.strugglingToday || student.partialToday) && (
                    <span
                      className={`inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full text-xs font-bold ${
                        student.strugglingToday ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {student.strugglingToday ? "😓 Bugün zorlandı — kontrol et" : "⏳ Bugün yarıda kaldı"}
                    </span>
                  )}
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
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">🟢 Başlangıç:</strong> {latestOrder.startDate ? new Date(latestOrder.startDate).toLocaleDateString("tr-TR") : "—"}</p>
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">📆 Bitiş:</strong> {latestOrder.endDate ? new Date(latestOrder.endDate).toLocaleDateString("tr-TR") : "—"}</p>
                      <p className="my-2 text-sm text-slate-600"><strong className="text-slate-900">🔄 Durum:</strong> {latestOrder.status}</p>
                    </div>
                  ) : (
                    <p className="mt-2 italic text-gray-400">📭 Sipariş bilgisi bulunamadı.</p>
                  )}

                  <button
                    onClick={() => setEditingStudent(student)}
                    className="mt-4 w-full py-2.5 bg-brand-navy text-white rounded-xl text-xs font-black hover:opacity-90 transition-opacity"
                  >
                    🗓️ Program / Deneme Girişi
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 italic">Henüz size atanmış öğrenci bulunmamaktadır.</p>
        )}
      </div>

      {editingStudent && (
        <StudentPanelEditor student={editingStudent} onClose={() => setEditingStudent(null)} />
      )}
    </>
  );
};

export default CoachDashboard;
