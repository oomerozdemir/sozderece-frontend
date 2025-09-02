import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";

export default function LessonRequest() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [t, setT] = useState(null);     // teacher
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    mode: "ONLINE", // ONLINE | FACE_TO_FACE
    city: "",
    district: "",
    locationNote: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 1) Öğretmeni yükle
  useEffect(()=> {
    (async ()=>{
      try {
        const { data } = await axios.get(`/api/v1/ogretmenler/${slug}`);
        setT(data.teacher);
        // default'ları öğretmenin verdiği sınırlar içinde ayarla
        const allowedModes = data.teacher.mode === "BOTH" ? ["ONLINE","FACE_TO_FACE"] : [data.teacher.mode];
        setForm(s=>({ ...s, mode: allowedModes[0] || "ONLINE" }));
      } catch (e) {
        setError("Öğretmen bulunamadı.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const subjects = useMemo(()=> t?.subjects || [], [t]);
  const grades   = useMemo(()=> t?.grades || [], [t]);
  const allowedModes = useMemo(()=> t ? (t.mode === "BOTH" ? ["ONLINE","FACE_TO_FACE"] : [t.mode]) : [], [t]);

  const onChange = (k,v)=> setForm(s=>({ ...s, [k]: v }));

  const submit = async () => {
    setError("");

    // Giriş kontrolü – yoksa PreCartAuth benzeri OTP akışına yönlendirelim
    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      // login sonrası bu sayfaya geri dönmek için işaret bırak
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/ogretmen/${slug}/talep`, { replace: true });
      return;
    }

    // yüz yüze ise şehir/ilçe zorunlu
    if (form.mode === "FACE_TO_FACE" && (!form.city || !form.district)) {
      setError("Yüz yüze için şehir ve ilçe seçmelisin.");
      return;
    }

    try {
      setSaving(true);
      const { data } = await axios.post("/api/student-requests", {
        teacherSlug: slug,
        ...form,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Talep oluşturuldu; paket seçimine git
      navigate(`/paket-sec?requestId=${data.request.id}&slug=${slug}`, { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || "Talep kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{padding:24}}>Yükleniyor…</div>;
  if (error)   return <div style={{padding:24, color:"crimson"}}>{error}</div>;
  if (!t)      return null;

  return (
    <div style={{maxWidth: 960, margin:"24px auto", padding:"0 16px"}}>
      <h1>{t.firstName} {t.lastName} için ders talebi</h1>

      <div className="form">
        <label>Ders</label>
        <select value={form.subject} onChange={e=>onChange("subject", e.target.value)}>
          <option value="">Seç</option>
          {subjects.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>

        <label>Seviye</label>
        <select value={form.grade} onChange={e=>onChange("grade", e.target.value)}>
          <option value="">Seç</option>
          {grades.map(g=> <option key={g} value={g}>{g}</option>)}
        </select>

        <label>Ders Modu</label>
        <select value={form.mode} onChange={e=>onChange("mode", e.target.value)}>
          {allowedModes.map(m=> <option key={m} value={m}>{m==="ONLINE"?"Online":"Yüz yüze"}</option>)}
        </select>

        {form.mode==="FACE_TO_FACE" && (
          <>
            <label>İl</label>
            <input value={form.city} onChange={e=>onChange("city", e.target.value)} />

            <label>İlçe</label>
            <input value={form.district} onChange={e=>onChange("district", e.target.value)} />

            <label>Adres / Konum Notu (opsiyonel)</label>
            <input value={form.locationNote} onChange={e=>onChange("locationNote", e.target.value)} />
          </>
        )}

        <label>İstek ve beklentiler (opsiyonel)</label>
        <textarea value={form.note} onChange={e=>onChange("note", e.target.value)} rows={5} />

        {!!error && <div style={{color:"crimson", marginTop:8}}>{error}</div>}

        <button onClick={submit} disabled={saving || !form.subject || !form.grade}>
          {saving ? "Kaydediliyor..." : "Devam Et"}
        </button>
      </div>
    </div>
  );
}
