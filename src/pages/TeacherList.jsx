import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import "../cssFiles/teacher.css";

const SUBJECTS = ["Matematik","Fen Bilimleri","Türkçe","Tarih","Coğrafya","Fizik","Kimya","Biyoloji","İngilizce","Almanca","Geometri","Edebiyat","Bilgisayar"];
const GRADES   = ["İlkokul","Ortaokul","Lise","Üniversite","Mezun"];
const MODES    = [{value:"",label:"Hepsi"},{value:"ONLINE",label:"Online"},{value:"FACE_TO_FACE",label:"Yüz yüze"},{value:"BOTH",label:"Her ikisi"}];
const SORTS    = [
  { value:"most_viewed", label:"En çok görüntülenen" },
  { value:"top_rated", label:"En yüksek puanlı" },
  { value:"priceOnline_asc", label:"Online fiyat ↑" },
  { value:"priceOnline_desc", label:"Online fiyat ↓" },
  { value:"priceF2F_asc", label:"Yüz yüze fiyat ↑" },
  { value:"priceF2F_desc", label:"Yüz yüze fiyat ↓" }
];

export default function TeachersList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const districts = useMemo(() => TR_DISTRICTS[filters.city] || [], [filters.city]);

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

  const onChange = (k, v) => setFilters((s)=>({ ...s, [k]: v, page: 1 }));

  return (
    <div className="teachers-page">
      {/* Filtre barı */}
      <div className="filters">
        <select value={filters.city} onChange={(e)=>onChange("city", e.target.value)}>
          <option value="">İl (hepsi)</option>
          {TR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.district}
          onChange={(e)=>onChange("district", e.target.value)}
          disabled={!filters.city || districts.length === 0}
        >
          <option value="">
            {!filters.city ? "Önce il seçin" : (districts.length ? "İlçe (hepsi)" : "İlçe verisi yok")}
          </option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={filters.subject} onChange={(e)=>onChange("subject", e.target.value)}>
          <option value="">Ders (hepsi)</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filters.grade} onChange={(e)=>onChange("grade", e.target.value)}>
          <option value="">Sınıf (hepsi)</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={filters.mode} onChange={(e)=>onChange("mode", e.target.value)}>
          {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        <input type="number" inputMode="numeric" placeholder="Min ₺" value={filters.minPrice} onChange={(e)=>onChange("minPrice", e.target.value)} />
        <input type="number" inputMode="numeric" placeholder="Max ₺" value={filters.maxPrice} onChange={(e)=>onChange("maxPrice", e.target.value)} />

        <select value={filters.sort} onChange={(e)=>onChange("sort", e.target.value)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Kart grid */}
      {loading ? <div className="loading">Yükleniyor…</div> : (
        <>
          <div className="grid">
            {items.map(t => <TeacherCard key={t.id} t={t} />)}
          </div>

          {/* Sayfalama */}
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
         <button onClick={() => navigate(`/ogretmenler/${t.slug}/talep`)}>
              Ders talebi oluştur
            </button>
      </div>
    </Link>
  );
}
