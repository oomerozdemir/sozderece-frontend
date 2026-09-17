import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import StudentPanelEditor from "./coach/StudentPanelEditor";
import StreakBadge from "./panel/StreakBadge";
import {
  FaExclamationTriangle, FaClock, FaBrain, FaUsers,
  FaLifeRing, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";

const readCoachName = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    return stored?.name || localStorage.getItem("userName") || "Koç";
  } catch {
    return localStorage.getItem("userName") || "Koç";
  }
};

const initialsOf = (name) =>
  (name || "K")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

// Koç paneli — öğrenci panelindeki app-shell dilinin (sabit koyu sol menü +
// beyaz üst app-bar) koça uyarlanmış hali. Sitenin Navbar'ı burada da YOK.
// Şu an tek gerçek görünüm olduğu için sidebar tek bir "Öğrencilerim"
// öğesi taşıyor — ileride yeni koç özellikleri eklendiğinde doğal bir yuva.
const CoachDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const coachName = useMemo(readCoachName, []);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
    <div className="min-h-screen bg-[#F5F4FB] md:h-screen md:overflow-hidden flex flex-col md:flex-row font-nunito">
      {/* ── Sol menü (masaüstü) ── */}
      <aside
        className="hidden md:flex md:flex-col w-64 flex-shrink-0 h-screen sticky top-0"
        style={{ background: "linear-gradient(180deg, #1C1B8A 0%, #14136f 100%)" }}
      >
        <div className="px-6 py-7 flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-fredoka font-bold text-sm flex-shrink-0"
            style={{ background: "#D8FF4F", color: "#1C1B8A" }}
          >
            S
          </div>
          <div className="min-w-0">
            <p className="font-fredoka font-bold text-white text-base leading-tight truncate">Sözderece</p>
            <p className="text-white/40 text-[10px] font-nunito font-bold uppercase truncate" style={{ letterSpacing: 1.5 }}>
              Koç Paneli
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <div
            className="relative flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.09)", color: "#ffffff" }}
          >
            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: "#D8FF4F" }} />
            <FaUsers size={15} style={{ color: "#D8FF4F", flexShrink: 0 }} />
            Öğrencilerim
          </div>
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/10 flex flex-col gap-1 flex-shrink-0">
          <a
            href="https://wa.me/905312546701"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 no-underline transition-colors"
          >
            <FaLifeRing size={15} /> Yardım
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 text-left transition-colors"
          >
            <FaSignOutAlt size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Ana sütun ── */}
      <div className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#ece9f7] px-4 md:px-9 py-3.5 md:py-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-fredoka font-bold text-page-navy text-lg md:text-xl truncate">
              Merhaba, {coachName.split(" ")[0]} 👋
            </h1>
            <p className="font-nunito text-[#8b87a6] text-xs mt-0.5 truncate">
              {students.length > 0 ? `${students.length} öğrenci sana atanmış` : "Henüz atanmış öğrencin yok"}
            </p>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 flex-shrink-0">
            {sosAlerts.length > 0 && (
              <span
                className="inline-flex items-center gap-1.5 font-fredoka font-bold text-xs px-3.5 py-2 rounded-full"
                style={{ background: "#fef2f2", color: "#b91c1c" }}
              >
                <FaExclamationTriangle size={11} /> {sosAlerts.length} SOS
              </span>
            )}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-fredoka font-bold text-sm flex-shrink-0"
              style={{ background: "#D8FF4F", color: "#1C1B8A" }}
            >
              {initialsOf(coachName)}
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menü"
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-page-navy bg-[#f1f0fa]"
            >
              <FaBars size={15} />
            </button>
          </div>
        </header>

        <main className="px-4 md:px-9 py-5 md:py-7 max-w-[1400px] mx-auto">
          {sosAlerts.length > 0 && (
            <div className="mb-6 rounded-[24px] p-5" style={{ background: "#fef2f2", border: "2px solid #fecaca" }}>
              <p className="flex items-center gap-2 font-fredoka font-bold text-sm mb-3" style={{ color: "#b91c1c" }}>
                <FaExclamationTriangle /> {sosAlerts.length} acil durum bildirimi bekliyor
              </p>
              <div className="flex flex-col gap-2">
                {sosAlerts.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3 bg-white rounded-xl px-4 py-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-nunito font-bold text-sm text-page-navy">{a.student?.name || "Öğrenci"}</p>
                      {a.message && <p className="font-nunito text-xs text-[#64748b] mt-0.5">"{a.message}"</p>}
                      <p className="font-nunito text-[11px] text-[#94a3b8] mt-1">{new Date(a.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                    <button
                      onClick={() => resolveSos(a.id)}
                      disabled={resolvingId === a.id}
                      className="flex-shrink-0 px-4 py-2 rounded-full font-fredoka font-bold text-xs text-white transition-opacity disabled:opacity-60"
                      style={{ background: "#dc2626" }}
                    >
                      {resolvingId === a.id ? "…" : "Gördüm, Çözüldü"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: "#FF6B35" }} />
            <span className="font-fredoka font-bold text-[11px] uppercase text-accent-orange" style={{ letterSpacing: 3 }}>
              Öğrencilerim
            </span>
          </div>
          <h2 className="font-fredoka font-bold text-page-navy text-xl mb-5">Atanmış Öğrenciler</h2>

          {students.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <TriageTile value={triage.struggling} label="Bugün Zorlandı" emoji="😓" color="#dc2626" bg={triage.struggling > 0 ? "#fef2f2" : "#ffffff"} />
              <TriageTile value={triage.partial} label="Yarıda Kaldı" emoji="⏳" color="#c2410c" bg={triage.partial > 0 ? "#fff7ed" : "#ffffff"} />
              <TriageTile value={triage.inactive3Days} label="Seri Yok / Pasif" emoji="💤" color="#475569" bg={triage.inactive3Days > 0 ? "#f8fafc" : "#ffffff"} />
              <TriageTile value={triage.weaknesses} label="Tekrar Eden Hata" emoji="🧠" color="#7340C8" bg={triage.weaknesses > 0 ? "#f5f3ff" : "#ffffff"} />
            </div>
          )}

          {students.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
              {students.map((student) => {
                const latestOrder = student.orders?.[0];
                const progress = student.todayProgress || { done: 0, total: 0 };

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-[24px] p-6 border shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
                    style={{
                      borderColor: student.strugglingToday ? "#fca5a5" : student.partialToday ? "#fcd34d" : "#f1f5f9",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {(student.strugglingToday || student.partialToday) && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-nunito font-bold text-xs"
                          style={
                            student.strugglingToday
                              ? { background: "#fef2f2", color: "#dc2626" }
                              : { background: "#fff7ed", color: "#c2410c" }
                          }
                        >
                          {student.strugglingToday ? "😓 Bugün zorlandı — kontrol et" : "⏳ Bugün yarıda kaldı"}
                        </span>
                      )}
                      {student.streak?.current > 0 && <StreakBadge current={student.streak.current} compact />}
                      {student.recurringWeaknessCount > 0 && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-nunito font-bold text-xs"
                          style={{ background: "#f5f3ff", color: "#7340C8" }}
                        >
                          <FaBrain size={10} /> {student.recurringWeaknessCount} tekrar eden hata
                        </span>
                      )}
                    </div>

                    {/* Bugünkü ilerleme + gerçek çalışma süresi — modalı açmadan tek bakış */}
                    {progress.total > 0 && (
                      <div className="mb-3 rounded-xl px-3.5 py-2.5" style={{ background: "#f8fafc" }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-nunito font-bold text-xs text-[#334155]">Bugünkü İlerleme</span>
                          <span className="font-nunito font-bold text-xs text-page-navy">{progress.done}/{progress.total}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(progress.done > 0 ? 6 : 0, Math.round((progress.done / progress.total) * 100))}%`,
                              background: "linear-gradient(90deg, #1C1B8A, #FF6B35)",
                            }}
                          />
                        </div>
                        {student.actualStudyMinutesToday > 0 && (
                          <p className="flex items-center gap-1 font-nunito font-semibold text-[11px] text-[#64748b] mt-1.5">
                            <FaClock size={9} /> {student.actualStudyMinutesToday} dk gerçek çalışma (Pomodoro)
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5 mb-1">
                      <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">👤 İsim:</strong> {student.name}</p>
                      <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">📧 Email:</strong> {student.email}</p>
                      <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">📞 Telefon:</strong> {student.phone || "Yok"}</p>
                      <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">🎓 Sınıf:</strong> {student.grade || "Belirtilmemiş"}</p>
                      {["9", "10", "11", "12", "Mezun"].includes(student.grade) && (
                        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">📚 Alan:</strong> {student.track || "Belirtilmemiş"}</p>
                      )}
                      <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">📅 Atanma Tarihi:</strong> {new Date(student.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>

                    {latestOrder ? (
                      <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "#f8fafc", borderLeft: "4px solid #22c55e" }}>
                        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">📦 Paket:</strong> {latestOrder.package}</p>
                        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">🟢 Başlangıç:</strong> {latestOrder.startDate ? new Date(latestOrder.startDate).toLocaleDateString("tr-TR") : "—"}</p>
                        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">📆 Bitiş:</strong> {latestOrder.endDate ? new Date(latestOrder.endDate).toLocaleDateString("tr-TR") : "—"}</p>
                        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">🔄 Durum:</strong> {latestOrder.status}</p>
                      </div>
                    ) : (
                      <p className="mt-2 font-nunito italic text-sm text-[#94a3b8]">📭 Sipariş bilgisi bulunamadı.</p>
                    )}

                    <button
                      onClick={() => setEditingStudent(student)}
                      className="mt-4 w-full py-3 rounded-full font-fredoka font-bold text-sm text-white transition-transform hover:scale-[1.02]"
                      style={{ background: "#1C1B8A" }}
                    >
                      🗓️ Program / Deneme Girişi
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-nunito italic text-[#94a3b8] text-sm">Henüz size atanmış öğrenci bulunmamaktadır.</p>
          )}
        </main>
      </div>

      {/* ── Mobil menü (Yardım / Çıkış) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-[24px] px-4 pt-4 pb-2 animate-[sdSheetUp_0.18s_ease-out]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="font-fredoka font-bold text-page-navy text-base">Menü</p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b]"
                aria-label="Kapat"
              >
                <FaTimes size={13} />
              </button>
            </div>
            <a
              href="https://wa.me/905312546701"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 mb-2 no-underline"
              style={{ background: "#f8fafc", color: "#334155" }}
            >
              <FaLifeRing size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Yardım</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              <FaSignOutAlt size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}

      {editingStudent && (
        <StudentPanelEditor student={editingStudent} onClose={() => setEditingStudent(null)} />
      )}
    </div>
  );
};

function TriageTile({ value, label, emoji, color, bg }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: bg, borderColor: bg === "#ffffff" ? "#f1f5f9" : "transparent" }}>
      <p className="font-fredoka font-bold text-2xl" style={{ color }}>{value}</p>
      <p className="font-nunito font-bold text-xs text-[#64748b] mt-0.5">{emoji} {label}</p>
    </div>
  );
}

export default CoachDashboard;
