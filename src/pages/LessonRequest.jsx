import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import "../cssFiles/teacher.css";

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

  // ⬇️ Yeni: slotlar
  const [slots, setSlots] = useState([]);
  const [draft, setDraft] = useState({ start: "", end: "" });

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

  // Ders türü değişince: ONLINE'a dönünce konum alanlarını temizle
  const onChangeMode = (v) => {
    if (v === "ONLINE") {
      setForm((s) => ({ ...s, mode: v, city: "", district: "", locationNote: "" }));
    } else {
      setForm((s) => ({ ...s, mode: v }));
    }
  };

  // Slot ekleme/silme
  const addSlot = () => {
    if (!draft.start || !draft.end) return alert("Başlangıç ve bitiş saatini seçin.");
    const start = new Date(draft.start);
    const end = new Date(draft.end);
    if (!(+start) || !(+end) || start >= end) return alert("Geçersiz saat aralığı.");
    setSlots((arr) => [...arr, { start: start.toISOString(), end: end.toISOString() }]);
    setDraft({ start: "", end: "" });
  };
  const removeSlot = (idx) => setSlots((arr) => arr.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/ogretmenler/${slug}/talep`, { replace: true });
      return;
    }

    if (!form.subject || !form.grade) return alert("Lütfen ders ve seviye seçiniz.");
    if (form.mode === "FACE_TO_FACE" && !form.city) return alert("Yüz yüze ders için il seçiniz.");
    if (!slots.length) return alert("Lütfen en az bir ders saati ekleyiniz.");

    try {
      setSaving(true);
      await axios.post(
        "/api/v1/student-requests", // tek adım: talep + randevular
        { ...form, teacherSlug: slug, slots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // başarı → öğrenci paneline
      navigate(`/ogrenci/panel?ok=talep-olusturuldu`, { replace: true });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Talep kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const availableDistricts = TR_DISTRICTS[form.city] || [];
  const canSubmit = !!form.subject && !!form.grade && !!slots.length && !saving;

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
              placeholder="Kısaca kendinizden ve dersten beklentilerinizden bahsedin."
            />
          </label>

          {/* ⬇️ Yeni: Saat seçimi */}
          <div className="lr-section">
            <div className="lr-section-title">Saat Seçimi</div>
            <div className="lr-slots-grid">
              <div className="lr-slot-input">
                <label>Başlangıç</label>
                <input
                  type="datetime-local"
                  value={draft.start}
                  onChange={(e) => setDraft((s) => ({ ...s, start: e.target.value }))}
                />
              </div>
              <div className="lr-slot-input">
                <label>Bitiş</label>
                <input
                  type="datetime-local"
                  value={draft.end}
                  onChange={(e) => setDraft((s) => ({ ...s, end: e.target.value }))}
                />
              </div>
              <button type="button" className="lr-btn ghost" onClick={addSlot}>
                + Ekle
              </button>
            </div>

            {slots.length > 0 && (
              <ul className="lr-slots-list">
                {slots.map((s, i) => {
                  const st = new Date(s.start);
                  const et = new Date(s.end);
                  return (
                    <li key={i} className="lr-slot-row">
                      <span>
                        {st.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                        {" — "}
                        {et.toLocaleString("tr-TR", { timeStyle: "short" })}
                      </span>
                      <button type="button" className="lr-btn small" onClick={() => removeSlot(i)}>
                        Kaldır
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button className="lr-btn" disabled={!canSubmit} onClick={handleSubmit}>
            {saving ? "Gönderiliyor…" : "Talebi Gönder"}
          </button>
        </div>
      )}
    </div>
  );
}
