import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "../../../utils/axios";

// Öğrenci workspace'i (/coach/students/:studentId VEYA /head-coach/students/:studentId)
// için "bu studentId kim" sorusunu çözer. Tekil öğrenci-by-id endpoint'i yok
// (bkz. plan §3) — bu yüzden backend'e dokunmadan iki yol:
//  1) Listeden "Öğrenciye Git" ile geldiyse router state'inde student objesi
//     zaten var → anında, network'süz render.
//  2) Direkt URL/refresh/yer imi ile geldiyse: coach için mevcut
//     GET /api/coach/my-students, head_coach için GET /api/head-coach/students?id=
//     (aynı liste endpoint'inin dar bir id filtresi) çekilip client-side id
//     ile bulunur.
// Güvenlik notu: bu client-side filtre bir güvenlik sınırı değil — her sekmenin
// gerçek fetch'i zaten sunucu tarafında (assertOwnStudent/assertHeadCoachOwnsStudent) kontrol ediliyor.
export default function useStudentContext(apiPrefix = "coach") {
  const { studentId } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(location.state?.student || null);
  const [loading, setLoading] = useState(!location.state?.student);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (location.state?.student) return; // yol 1: zaten var, fetch'e gerek yok

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const request =
      apiPrefix === "head-coach"
        ? axios.get("/api/head-coach/students", { headers, params: { id: studentId } }).then((res) => res.data?.items || [])
        : axios.get("/api/coach/my-students", { headers }).then((res) => res.data?.students || []);

    request
      .then((list) => {
        if (cancelled) return;
        const found = list.find((s) => s.id === Number(studentId));
        if (found) setStudent(found);
        else setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, apiPrefix]);

  return { student, loading, notFound };
}
