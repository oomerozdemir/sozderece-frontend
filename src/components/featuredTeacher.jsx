import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/teacher.css"; 

function FeaturedTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        // TeacherList ile aynı endpoint – ilk 4 öğretmen
        const { data } = await axios.get("/api/v1/ogretmenler", {
          params: { sort: "most_viewed", page: 1, limit: 4 },
        });
        setTeachers(data.items || data.teachers || []);
      } catch (err) {
        console.error("Öğretmenler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) {
    return <div className="tl-loading">Yükleniyor...</div>;
  }

  return (
    <section className="featured-section">
      <h2 className="section-title">Öne Çıkan Öğretmenler</h2>
      <p className="section-description">
        En çok görüntülenen öğretmenlerden dört tanesi
      </p>

      <div className="tl-grid">
        {teachers.map((t) => (
          <a key={t.id} href={`/ogretmenler/${t.slug}`} className="tl-card">
            <img
              src={t.photoUrl || "https://placehold.co/400x240?text=Teacher"}
              alt={`${t.firstName} ${t.lastName}`}
            />
            <div className="tl-meta">
              <div className="tl-name">
                {t.firstName} {t.lastName}
              </div>
              <div className="tl-subj">
                {(t.subjects || []).join(", ")}
              </div>
              <div className="tl-rating">⭐ {t.rating || "5.0"}</div>
              <div className="tl-price">
                {t.price ? `${t.price} ₺ / saat` : ""}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default FeaturedTeachers;
