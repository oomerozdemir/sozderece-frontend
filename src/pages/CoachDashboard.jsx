import Navbar from "../components/navbar";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../utils/axios";
import StudentPanelEditor from "./coach/StudentPanelEditor";
import { FaExclamationTriangle, FaFire, FaClock, FaBrain } from "react-icons/fa";

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
        // Dikkat isteyenler (zorlanan > yarıda kalan > tekrar eden hata)
        // listenin başına gelsin — koç kartı açmadan kimin bugün takıldığını
        // hemen görsün.
        const sorted = [...res.data.students].sort((a, b) => {
          const score = (s) => (s.strugglingToday ? 3 : s.partialToday ? 2 : s.recurringWeaknessCount > 0 ? 1 : 0);
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

  // "Dikkat Gerektirenler" özeti — koçun 10-20 öğrencisine tek satırda göz
  // gezdirip nereye bakması gerektiğini anlaması için.
  const triage = useMemo(() => {
    const struggling = students.filter((s) => s.strugglingToday).length;
    const partial = students.filter((s) => s.partialToday).length;
    const inactive3Days = students.filter((s) => (s.streak?.current ?? 0) === 0 && s.todayProgress?.total === 0).length;
    const weaknesses = students.filter((s) => s.recurringWeaknessCount > 0).length;
    return { struggling, partial, inactive3Days, weaknesses };
  }, [students]);

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
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

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-5">📚 Atanmış Öğrenciler</h2>

        {students.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className={`rounded-2xl p-4 border ${triage.struggling > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
              <p className="text-2xl font-black text-red-600">{triage.struggling}</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">😓 Bugün Zorlandı</p>
            </div>
            <div className={`rounded-2xl p-4 border ${triage.partial > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
              <p className="text-2xl font-black text-amber-600">{triage.partial}</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">⏳ Yarıda Kaldı</p>
            </div>
            <div className={`rounded-2xl p-4 border ${triage.inactive3Days > 0 ? "bg-slate-100 border-slate-300" : "bg-white border-slate-200"}`}>
              <p className="text-2xl font-black text-slate-600">{triage.inactive3Days}</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">💤 Seri Yok / Pasif</p>
            </div>
            <div className={`rounded-2xl p-4 border ${triage.weaknesses > 0 ? "bg-purple-50 border-purple-200" : "bg-white border-slate-200"}`}>
              <p className="text-2xl font-black text-purple-600">{triage.weaknesses}</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">🧠 Tekrar Eden Hata</p>
            </div>
          </div>
        )}

        {students.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            {students.map((student) => {
              const latestOrder = student.orders?.[0];
              const progress = student.todayProgress || { done: 0, total: 0 };

              return (
                <div
                  key={student.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                    student.strugglingToday ? "border-red-300" : student.partialToday ? "border-amber-300" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {(student.strugglingToday || student.partialToday) && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          student.strugglingToday ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {student.strugglingToday ? "😓 Bugün zorlandı — kontrol et" : "⏳ Bugün yarıda kaldı"}
                      </span>
                    )}
                    {student.streak?.current > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">
                        <FaFire size={10} /> {student.streak.current} günlük seri
                      </span>
                    )}
                    {student.recurringWeaknessCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                        <FaBrain size={10} /> {student.recurringWeaknessCount} tekrar eden hata
                      </span>
                    )}
                  </div>

                  {/* Bugünkü ilerleme + gerçek çalışma süresi — modalı açmadan tek bakış */}
                  {progress.total > 0 && (
                    <div className="mb-3 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-600">Bugünkü İlerleme</span>
                        <span className="text-xs font-black text-slate-800">{progress.done}/{progress.total}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                          style={{ width: `${Math.max(progress.done > 0 ? 6 : 0, Math.round((progress.done / progress.total) * 100))}%` }}
                        />
                      </div>
                      {student.actualStudyMinutesToday > 0 && (
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1.5">
                          <FaClock size={9} /> {student.actualStudyMinutesToday} dk gerçek çalışma (Pomodoro)
                        </p>
                      )}
                    </div>
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
