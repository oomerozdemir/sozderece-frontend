import { useEffect, useState } from "react";
import axios from "../utils/axios";
import LegacyStudentDashboard from "./panel/LegacyStudentDashboard";
import StudentPanel from "./panel/StudentPanel";
import OnboardingResumeBanner from "../components/OnboardingResumeBanner";

// /student/dashboard rotasının gösterdiği tek nokta. Yeni öğrenci paneli
// (StudentPanel) artık VARSAYILAN OLARAK herkese açık (User.panelBetaAccess
// şema varsayılanı artık true) — ama admin "Kullanıcılar" sekmesinden
// bireysel bir öğrenci için bunu KAPATIP eski panele (LegacyStudentDashboard)
// döndürebilsin diye kontrol AYNEN korunuyor; artık "izin ver" değil
// "devre dışı bırak" anlamına geliyor.
export default function StudentDashboard() {
  const [betaAccess, setBetaAccess] = useState(null); // null = henüz bilinmiyor

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/v1/ogrenci/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBetaAccess(!!res.data?.panelBetaAccess))
      .catch(() => setBetaAccess(true)); // ağ hatasında fail-open: şimdiki varsayılan zaten "açık"
  }, []);

  if (betaAccess === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-nunito text-[#94a3b8] text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      {betaAccess ? <StudentPanel /> : <LegacyStudentDashboard />}
      <OnboardingResumeBanner />
    </>
  );
}
