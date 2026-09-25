import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "../../../utils/axios";

// Öğrenci workspace'i (/coach/students/:studentId) için "bu studentId kim"
// sorusunu çözer. Tekil öğrenci-by-id endpoint'i yok (bkz. plan §3) — bu
// yüzden backend'e dokunmadan iki yol:
//  1) Listeden "Öğrenciye Git" ile geldiyse router state'inde student objesi
//     zaten var → anında, network'süz render.
//  2) Direkt URL/refresh/yer imi ile geldiyse mevcut GET /api/coach/my-students
//     (dashboard'un zaten çektiği aynı uç) çekilip client-side id ile filtrelenir.
// Güvenlik notu: bu client-side filtre bir güvenlik sınırı değil — her sekmenin
// gerçek fetch'i zaten assertOwnStudent() ile sunucu tarafında kontrol ediliyor.
export default function useStudentContext() {
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
    axios
      .get("/api/coach/my-students", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        const found = (res.data?.students || []).find((s) => s.id === Number(studentId));
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
  }, [studentId]);

  return { student, loading, notFound };
}
