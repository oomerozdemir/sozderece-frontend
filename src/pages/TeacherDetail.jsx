import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../cssFiles/teacher.css";

export default function TeacherDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [t, setT] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/ogretmenler/${slug}`);
        setT(data.teacher);
        axios.post(`/api/v1/ogretmenler/${slug}/view`).catch(() => {});
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug]);

  if (!t) return <div className="tl-loading">Yükleniyor…</div>;

  return (
    <div className="td-page">
      <div className="td-header">
        <img
          className="td-photo"
          src={t.photoUrl || "https://placehold.co/200x200?text=Teacher"}
          alt={`${t.firstName} ${t.lastName}`}
          loading="lazy"
        />
        <div className="td-meta">
          <h1>{t.firstName} {t.lastName}</h1>
          <div>{t.city} / {t.district} • {t.mode}</div>
          <div>{(t.subjects || []).join(", ")} — {(t.grades || []).join(", ")}</div>
          <div>
            👁 {t.viewCount} • ⭐ {t.ratingAverage?.toFixed?.(1) || "0.0"} ({t.ratingCount})
          </div>
        </div>
      </div>

      {t.bio && <p style={{ marginTop: 12 }}>{t.bio}</p>}

      <button
        className="td-cta"
        onClick={() => navigate(`/ogretmenler/${slug}/talep`)}
      >
        Ders talebi oluştur
      </button>
    </div>
  );
}
