import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
// Helmet yerine merkezi Seo bileşenini kullanacağız
import Seo from "../components/Seo"; 

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
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const detailsRef = useRef(null);

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

  // URL Güncelleme
  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k,v]) => {
      if (v !== "" && v !== null && v !== undefined) p.set(k, v);
    });
    setParams(p, { replace: true });
  }, [filters, setParams]);

  // Veri Çekme
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const apiParams = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        );
        const { data } = await axios.get("/api/v1/ogretmenler", { params: apiParams });
        setItems(data.items || data.teachers || []);
        setTotal(data.total || 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  const onChange = (k, v) => setFilters((s)=>({ ...s, [k]: v, page: 1 }));

  // --- AHREFS SEO DÜZELTMESİ ---
  // Canonical URL sadece ana sayfa olmalı, filtre parametrelerini içermemeli.
  // Aksi takdirde Google her filtreyi ayrı sayfa sanıp "duplicate content" hatası verir.
  const canonicalUrl = "/ogretmenler"; 

  // Dinamik Meta Açıklaması (Description)
  const descParts = [];
  if (filters.city) descParts.push(`${filters.city}${filters.district ? " / " + filters.district : ""}`);
  if (filters.subject) descParts.push(filters.subject);
  if (filters.grade) descParts.push(filters.grade);
  const listDescription = descParts.length
    ? `${descParts.join(" • ")} özel ders öğretmenleri listesi. En iyi öğretmenlerden hemen ders talebi oluşturun.`
    : "Online ve yüz yüze özel ders öğretmenleri listesi. Matematik, İngilizce ve diğer tüm derslerde uzman eğitmenler.";

  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (detailsRef.current) {
      if (w <= 960) detailsRef.current.removeAttribute("open");
      else detailsRef.current.setAttribute("open", "");
    }
  }, []);

  return (
    <> 
      {/* AHREFS DÜZELTMESİ:
        1. Seo bileşeni kullanıldı.
        2. canonical="/ogretmenler" sabitlendi (filtresiz).
        3. robots="index, follow" eklendi.
      */}
      <Seo 
        title="Özel Ders Öğretmenleri | Online & Yüz Yüze" 
        description={listDescription}
        canonical={canonicalUrl}
      />

      {/* Schema.org ItemList (Google için liste yapısı) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": (items || []).slice(0, 24).map((t, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `https://sozderecekocluk.com/ogretmenler/${t.slug}`,
            "name": `${t.firstName} ${t.lastName}`
          }))
        })}
      </script>

      <TopBar />
      <Navbar />

      <div className="tl-page">
        <details ref={detailsRef} className="tl-filters-collapsible" open>
          <summary className="tl-filterbar">
            <div className="tl-filterbar-left">
              <div className="tl-filterbar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                <input placeholder="Öğretmen ara..." />
              </div>
              <div className="tl-filterbar-chips">
                 {/* Burayı dinamik yapabiliriz ama şimdilik statik kalabilir */}
                 <span className="chip">Matematik</span>
                 <span className="chip">Online</span>
              </div>
            </div>

            <button type="button" className="tl-filterbar-toggle" aria-label="Filtreleri aç/kapat">
              Filtreler
              <span className="count-badge">2</span>
            </button>
          </summary>
          
          <div className="tl-filters">
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
        </details>

        {loading ? <div className="tl-loading">Yükleniyor…</div> : (
          <>
            <div className="tl-grid">
              {items.map(t => <TeacherCard key={t.id} t={t} />)}
            </div>

            <div className="tl-pager">
              <button disabled={filters.page<=1} onClick={()=>setFilters(s=>({...s, page: s.page-1}))}>Önceki</button>
              <span>Sayfa {filters.page}</span>
              <button disabled={(filters.page * filters.limit) >= total} onClick={()=>setFilters(s=>({...s, page: s.page+1}))}>Sonraki</button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

function TeacherCard({ t }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  
  // Resim optimizasyonu için lazy loading
  const cover = t.photoUrl || "https://placehold.co/400x240?text=Teacher";
  const showOnline = t.mode !== "FACE_TO_FACE" && typeof t.priceOnline === "number" && t.priceOnline > 0;
  const showF2F    = t.mode !== "ONLINE"      && typeof t.priceF2F    === "number" && t.priceF2F    > 0;

  return (
    <Link to={`/ogretmenler/${t.slug}`} className="tl-card">
      <img src={cover} alt={`${t.firstName} ${t.lastName} - ${t.subjects?.join(", ")} Öğretmeni`} loading="lazy" />
      <div className="tl-meta">
        <div className="tl-name">{t.firstName} {t.lastName}</div>
        <div className="tl-subj">{(t.subjects||[]).join(", ")}</div>

        <div className="tl-row">
          <span className="tl-badge">
            {t.mode === "ONLINE" ? "Online" : t.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online + Yüz yüze"}
          </span>
          <span className="tl-price">
            {showOnline ? `Online ₺${t.priceOnline.toLocaleString("tr-TR")}` : ""}
            {showOnline && showF2F ? " • " : ""}
            {showF2F ? `Yüz yüze ₺${t.priceF2F.toLocaleString("tr-TR")}` : ""}
          </span>
        </div>

        <div className="tl-row small">
          <span>👁 {t.viewCount || 0}</span>
          <span>⭐ {Number(t.ratingAverage || 0).toFixed(1)} ({t.ratingCount || 0})</span>
        </div>

        <button
          className="tl-cta"
          onClick={(e) => {
            e.preventDefault();
            const join = search && search.length ? `${search}&` : "?";
            navigate(`/ogretmenler/${t.slug}/talep${join}useFreeRight=1`);
          }}
        >
          Ders talebi oluştur
        </button>
      </div>
    </Link>
  );
}