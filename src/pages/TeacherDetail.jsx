import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../cssFiles/teacher.css";

export default function TeacherDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [t, setT] = useState(null);
  const [reviews, setReviews] = useState([]);

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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/ogretmenler/${slug}/reviews`);
        setReviews(data?.reviews || []);
      } catch (e) {
        setReviews([]);
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

      {/* Yorumlar */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Öğrenci Yorumları</h2>
        {reviews.length === 0 ? (
          <div className="tp-empty">Bu öğretmen için henüz yorum bulunmuyor.</div>
        ) : (
          <div className="tp-reviews">
            {reviews.map((rv) => (
              <div key={rv.id} className="tp-review">
                <div className="tp-review-head">
                  <div className="tp-stars">
                    {"★★★★★".slice(0, rv.rating)}
                    <span className="tp-stars-muted">{"★★★★★".slice(rv.rating)}</span>
                  </div>
                  <div className="tp-review-date">{new Date(rv.createdAt).toLocaleDateString("tr-TR")}</div>
                </div>
                {rv.comment ? <div className="tp-review-body">{rv.comment}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="td-cta"
        onClick={() => navigate(`/ogretmenler/${slug}/talep`)}
      >
        Ders talebi oluştur
      </button>
    </div>
  );
}
