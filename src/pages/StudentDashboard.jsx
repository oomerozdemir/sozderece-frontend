import { useEffect, useState } from "react";
import axios from "../utils/axios";
import LegacyStudentDashboard from "./panel/LegacyStudentDashboard";
import StudentPanel from "./panel/StudentPanel";

// /student/dashboard rotasının gösterdiği tek nokta — yeni öğrenci paneli
// (StudentPanel) inşa halindeyken gerçek öğrenciler görmesin diye,
// User.panelBetaAccess bayrağı açık OLMAYAN her öğrenci eski paneli
// (LegacyStudentDashboard) görmeye devam ediyor. Bayrak admin panelden
// (Kullanıcılar → düzenle → "Yeni Öğrenci Paneli (Beta)") açılıp kapanabilir,
// hiçbir yeni URL/giriş akışı yok.
export default function StudentDashboard() {
  const [betaAccess, setBetaAccess] = useState(null); // null = henüz bilinmiyor

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/v1/ogrenci/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBetaAccess(!!res.data?.panelBetaAccess))
      .catch(() => setBetaAccess(false));
  }, []);

  if (betaAccess === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-nunito text-[#94a3b8] text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return betaAccess ? <StudentPanel /> : <LegacyStudentDashboard />;
}
