import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../utils/axios";
import "../cssFiles/teacher.css";

const modes = [
  { value: "", label: "Hepsi" },
  { value: "ONLINE", label: "Online" },
  { value: "FACE_TO_FACE", label: "Yüz yüze" },
  { value: "BOTH", label: "Her ikisi" },
];

const sorts = [
  { value: "most_viewed", label: "En çok görüntülenen" },
  { value: "top_rated", label: "En yüksek puanlı" },
  { value: "priceOnline_asc", label: "Online fiyat ↑" },
  { value: "priceOnline_desc", label: "Online fiyat ↓" },
  { value: "priceF2F_asc", label: "Yüz yüze fiyat ↑" },
  { value: "priceF2F_desc", label: "Yüz yüze fiyat ↓" },
];

export default function TeachersList() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // URL paramlarını oku
  const [filters, setFilters] = useState({
    city: params.get("city") || "",
    district: params.get("district") || "",
    subject: params.get("subject") || "",
    grade: params.get("grade") || "",
    mode: params.get("mode") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    sort: params.get("sort") || "most_viewed",
    page: Number(params.get("page") || 1),
    limit: Number(params.get("limit") || 12),
  });

  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k,v]) => {
      if (v !== "" && v !== null && v !== undefined) p.set(k, v);
    });
    setParams(p, { replace: true });
  }, [filters, setParams]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/v1/ogretmenler", { params: filters });
        setItems(data.items || []);
        setTotal(data.total || 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  const onChange = (k, v) => setFilters(s => ({ ...s, [k]: v, page: 1 }));

  return (
    <div className="teachers-page">
      {/* Filtre barı */}
      <div className="filters">
        <input placeholder="Şehir" value={filters.city} onChange={e=>onChange("city", e.target.value)} />
        <input placeholder="İlçe" value={filters.district} onChange={e=>onChange("district", e.target.value)} />
        <input placeholder="Ders (örn: matematik)" value={filters.subject} onChange={e=>onChange("subject", e.target.value)} />
        <input placeholder="Sınıf (örn: lise)" value={filters.grade} onChange={e=>onChange("grade", e.target.value)} />

        <select value={filters.mode} onChange={e=>onChange("mode", e.target.value)}>
          {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        <input type="number" inputMode="numeric" placeholder="Min ₺" value={filters.minPrice} onChange={e=>onChange("minPrice", e.target.value)} />
        <input type="number" inputMode="numeric" placeholder="Max ₺" value={filters.maxPrice} onChange={e=>onChange("maxPrice", e.target.value)} />

        <select value={filters.sort} onChange={e=>onChange("sort", e.target.value)}>
          {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Kart grid */}
      {loading ? <div className="loading">Yükleniyor…</div> : (
        <>
          <div className="grid">
            {items.map(t => <TeacherCard key={t.id} t={t} />)}
          </div>

          {/* Basit sayfalama */}
          <div className="pager">
            <button disabled={filters.page<=1} onClick={()=>setFilters(s=>({...s, page: s.page-1}))}>Önceki</button>
            <span>Sayfa {filters.page}</span>
            <button disabled={(filters.page * filters.limit) >= total} onClick={()=>setFilters(s=>({...s, page: s.page+1}))}>Sonraki</button>
          </div>
        </>
      )}
    </div>
  );
}

function TeacherCard({ t }) {
  const cover = t.photoUrl || "https://placehold.co/400x240?text=Teacher";
  return (
    <Link to={`/ogretmenler/${t.slug}`} className="teacher-card">
      <img src={cover} alt={`${t.firstName} ${t.lastName}`} />
      <div className="meta">
        <div className="name">{t.firstName} {t.lastName}</div>
        <div className="subj">{(t.subjects||[]).join(", ")}</div>
        <div className="row">
          <span className="badge">{t.mode === "ONLINE" ? "Online" : t.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online + Yüz yüze"}</span>
          <span className="price">
            {t.priceOnline ? `Online ₺${t.priceOnline}` : ""}{t.priceOnline && t.priceF2F ? " • " : ""}{t.priceF2F ? `YY ₺${t.priceF2F}` : ""}
          </span>
        </div>
        <div className="row small">
          <span>👁 {t.viewCount || 0}</span>
          <span>⭐ {t.ratingAverage?.toFixed?.(1) || "0.0"} ({t.ratingCount || 0})</span>
        </div>
      </div>
    </Link>
  );
}
