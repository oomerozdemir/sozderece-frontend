import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../cssFiles/teacher.css";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";

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

  const modeLabel = t.mode === "FACE_TO_FACE" ? "Yüz yüze" : "ONLINE";
  const subjects = Array.isArray(t.subjects) ? t.subjects : [];
  const grades = Array.isArray(t.grades) ? t.grades : [];

  return (
    <>
      <TopBar />
      <Navbar />
      <div className="td-page">
        {/* HEADER CARD */}
        <section className="td-header-card">
    <div className="td-header">
      <img
        className="td-photo"
        src={t.photoUrl || "https://placehold.co/200x200?text=Teacher"}
        alt={`${t.firstName} ${t.lastName}`}
        loading="lazy"
      />

      <div className="td-meta">
        <h1 className="td-title">{t.firstName} {t.lastName}</h1>

        <div className="td-row">
          <span className="td-icon" aria-hidden>📍</span>
          <span className="td-label">Konum</span>
          <span className="td-value">
            {t.city || "—"}{t.district ? ` / ${t.district}` : ""}
          </span>
        </div>

        <div className="td-row">
          <span className="td-icon" aria-hidden>📚</span>
          <span className="td-label">Verdiği dersler</span>
          <span className="td-value">
            {(Array.isArray(t.subjects) ? t.subjects : []).join(", ") || "—"}
          </span>
        </div>

        <div className="td-row">
          <span className="td-icon" aria-hidden>🎓</span>
          <span className="td-label">Seviyeler</span>
          <span className="td-value">
            {(Array.isArray(t.grades) ? t.grades : []).join(", ") || "—"}
          </span>
        </div>

        <div className="td-row">
          <span className="td-icon" aria-hidden>{t.mode === "FACE_TO_FACE" ? "🤝" : "💻"}</span>
          <span className="td-label">Ders tipi</span>
          <span className="td-value">
            <span className={`td-chip ${t.mode === "FACE_TO_FACE" ? "chip-face" : "chip-online"}`}>
              {t.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}
            </span>
          </span>
        </div>

        <div className="td-row td-stats">
          <span>👁 {t.viewCount ?? 0}</span>
          <span className="sep">•</span>
          <span>⭐ {t.ratingAverage?.toFixed?.(1) || "0.0"} ({t.ratingCount ?? 0})</span>
        </div>
      </div>
    </div>

    <div className="td-header-cta">
      <button className="td-cta" onClick={() => navigate(`/ogretmenler/${slug}/talep`)}>
        Ders talebi oluştur
      </button>
    </div>
  </section>


        {/* HAKKIMDA */}
        {t.bio && (
          <section className="td-section">
            <h2 className="td-section-title">Hakkımda</h2>
            <div className="td-card">
              <p className="td-paragraph">{t.bio}</p>
            </div>
          </section>
        )}

        {/* NEDEN BEN */}
        {t.whyMe && (
          <section className="td-section">
            <div className="td-card td-whyme">
              <h2 className="td-section-title">Neden benden ders almalısınız?</h2>
              <p className="td-paragraph">{t.whyMe}</p>
            </div>
          </section>
        )}

        {/* YORUMLAR */}
        <section className="td-section">
          <h2 className="td-section-title">Öğrenci Yorumları</h2>
          {reviews.length === 0 ? (
            <div className="td-empty">Bu öğretmen için henüz yorum bulunmuyor.</div>
          ) : (
            <div className="td-reviews">
              {reviews.map((rv) => (
                <div key={rv.id} className="td-review">
                  <div className="td-review-head">
                    <div className="td-stars">
                      {"★★★★★".slice(0, rv.rating)}
                      <span className="td-stars-muted">{"★★★★★".slice(rv.rating)}</span>
                    </div>
                    <div className="td-review-date">
                      {new Date(rv.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  {rv.comment ? <div className="td-review-body">{rv.comment}</div> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
