import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import "../cssFiles/teacher.css"; // ✅ doğru CSS

export default function LessonRequest() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [teacher, setTeacher] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    mode: "ONLINE",
    city: "",
    district: "",
    locationNote: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/ogretmenler/${slug}`);
        setTeacher(data.teacher);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug]);

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Ders türü değiştiğinde yüz yüze -> online geçişte konum alanlarını temizle
  const onChangeMode = (v) => {
    if (v === "ONLINE") {
      setForm((s) => ({ ...s, mode: v, city: "", district: "", locationNote: "" }));
    } else {
      setForm((s) => ({ ...s, mode: v }));
    }
  };

  const handleSubmit = async () => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/ogretmenler/${slug}/talep`, { replace: true });
      return;
    }

    // basit doğrulama
    if (!form.subject || !form.grade) {
      alert("Lütfen ders ve seviye seçiniz.");
      return;
    }
    if (form.mode === "FACE_TO_FACE" && !form.city) {
      alert("Yüz yüze ders için il seçiniz.");
      return;
    }

    try {
      setSaving(true);
      const { data } = await axios.post(
        "/api/v1/student-requests",
        { ...form, teacherSlug: slug },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // → Paket seçimi
      navigate(`/paket-sec?requestId=${data.id}&slug=${slug}`, { replace: true });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Talep kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const availableDistricts = TR_DISTRICTS[form.city] || [];
  const canSubmit = !!form.subject && !!form.grade && !(saving);

  return (
    <div className="lr-page">
      <h1>Ders Talebi Oluştur</h1>

      {!teacher ? (
        <div className="lr-loading">Yükleniyor…</div>
      ) : (
        <div className="lr-form">
          <label>
            Ders
            <select value={form.subject} onChange={(e) => onChange("subject", e.target.value)}>
              <option value="">Seçiniz</option>
              {(teacher.subjects || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            Seviye
            <select value={form.grade} onChange={(e) => onChange("grade", e.target.value)}>
              <option value="">Seçiniz</option>
              {(teacher.grades || []).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label>
            Ders Türü
            <select value={form.mode} onChange={(e) => onChangeMode(e.target.value)}>
              <option value="ONLINE">Online</option>
              <option value="FACE_TO_FACE">Yüz yüze</option>
            </select>
          </label>

          {form.mode === "FACE_TO_FACE" && (
            <>
              <label>
                İl
                <select value={form.city} onChange={(e) => onChange("city", e.target.value)}>
                  <option value="">Seçiniz</option>
                  {TR_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label>
                İlçe
                <select
                  value={form.district}
                  onChange={(e) => onChange("district", e.target.value)}
                  disabled={!form.city}
                >
                  <option value="">{!form.city ? "Önce il seçiniz" : "Seçiniz"}</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>

              <label>
                Adres / Konum Notu
                <input
                  type="text"
                  value={form.locationNote}
                  onChange={(e) => onChange("locationNote", e.target.value)}
                  placeholder="Adres veya semt bilgisi"
                />
              </label>
            </>
          )}

          <label>
            Not (isteğe bağlı)
            <textarea
              value={form.note}
              onChange={(e) => onChange("note", e.target.value)}
              placeholder="Özel istek veya beklentilerinizi yazabilirsiniz"
            />
          </label>

          <button className="lr-btn" disabled={!canSubmit} onClick={handleSubmit}>
            {saving ? "Gönderiliyor…" : "Devam Et"}
          </button>
        </div>
      )}
    </div>
  );
}
