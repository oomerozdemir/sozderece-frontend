import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

export default function TeacherDetail() {
  const { slug } = useParams();
  const navigate = useNavigate(); 
  const [t, setT] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`/api/v1/ogretmenler/${slug}`);
      setT(data.teacher);
      axios.post(`/api/v1/ogretmenler/${slug}/view`).catch(() => {});
    })();
  }, [slug]);

  if (!t) return <div style={{ padding: 24 }}>Yükleniyor…</div>;

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h1>{t.firstName} {t.lastName}</h1>
      <p>{t.city} / {t.district} • {t.mode}</p>
      <p>{(t.subjects || []).join(", ")} — {(t.grades || []).join(", ")}</p>
      <p>👁 {t.viewCount} • ⭐ {t.ratingAverage?.toFixed?.(1) || "0.0"} ({t.ratingCount})</p>
      <p>{t.bio}</p>

      <button onClick={() => navigate(`/ogretmenler/${slug}/talep`)}> {/* ✅ path düzeltilmiş */}
        Ders talebi oluştur
      </button>
    </div>
  );
}
