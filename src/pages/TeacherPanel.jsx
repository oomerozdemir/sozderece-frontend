import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/teacher-panel.css";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import useTeacherScheduling from "../hooks/useTeacherScheduling";
import AvailabilityEditor from "../components/teacherComps/AvailabilityEditor";
import SlotsPreview from "../components/teacherComps/SlotsPreview";
import TimeOffManager from "../components/teacherComps/TimeOffManager";

export default function TeacherPanel() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const [pwd, setPwd] = useState({ current: "", next: "", next2: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  const {
    avail, setAvail,
    slots,
    range, setRange,
    timeOffs,
    creatingOff, setCreatingOff,
    minToStr, strToMin, onAvailChange,
    saveAvailability, fetchSlots, addTimeOff, delTimeOff,
  } = useTeacherScheduling(setMsg);

  // Sekme durumu
  const [tab, setTab] = useState("availability"); // availability | slots | timeoff

  useEffect(() => {
    axios
      .get("/api/v1/ogretmen/me/profil")
      .then(({ data }) => setProfile(data.profile))
      .catch(() => {});
  }, []);

  const onChange = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  // Şehre göre ilçeler
  const districts = useMemo(() => {
    if (!profile?.city) return [];
    return TR_DISTRICTS[profile.city] || [];
  }, [profile?.city]);

  // Şehir değişince, mevcut district geçerliyse dokunma; boş/uyuşmuyorsa ilk ilçeyi ata
  useEffect(() => {
    if (!profile?.city) return;
    setProfile((p) => {
      const current = p?.district || "";
      if (current && districts.includes(current)) return p;
      return { ...p, district: districts[0] || "" };
    });
  }, [profile?.city, districts]);

  const save = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        city: profile.city,
        district: profile.district,
        mode: profile.mode,
        priceOnline: profile.priceOnline ?? null,
        priceF2F: profile.priceF2F ?? null,
        bio: profile.bio ?? "",
        isPublic: !!profile.isPublic,
        subjects: selectedSubjects,
        grades: selectedGrades,
      };
      await axios.put("/api/v1/ogretmen/me/profil", payload);
      setMsg("Kaydedildi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  // --- FOTOĞRAF YÜKLEME ---
  const onPickPhoto = () => fileRef.current?.click();
  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg("Dosya boyutu en fazla 5MB olmalı.");
      return;
    }

    const fd = new FormData();
    fd.append("photo", file);

    try {
      setMsg("Fotoğraf yükleniyor…");
      const { data } = await axios.post("/api/v1/ogretmen/me/photo", fd);
      if (data?.profile?.photoUrl) {
        setProfile((p) => ({ ...p, photoUrl: data.profile.photoUrl }));
        setMsg("Fotoğraf güncellendi.");
      } else {
        setMsg("Yükleme tamamlandı, ancak URL alınamadı.");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "Fotoğraf yüklenemedi.");
    }
  };

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="tpanel">
          <div className="tp-wrap">
            <div className="tp-loading">Yükleniyor…</div>
          </div>
        </div>
      </>
    );
  }

  const modeKey = String(profile.mode || "").toUpperCase();
  const isOnlineOnly = modeKey === "ONLINE";
  const isFaceOnly = modeKey === "FACE_TO_FACE";
  const both = modeKey === "BOTH";

  // Ad & baş harf
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initial = (profile.firstName?.[0] || "").toUpperCase();


  // Sifre Degis

  const changePassword = async (e) => {
  e?.preventDefault?.();
  setMsg("");
  if (!pwd.next || !pwd.next2) {
    setMsg("Yeni şifre ve doğrulama zorunludur.");
    return;
  }
  if (pwd.next !== pwd.next2) {
    setMsg("Şifreler uyuşmuyor.");
    return;
  }
  if (pwd.next.length < 8) {
    setMsg("Yeni şifre en az 8 karakter olmalı.");
    return;
  }
  setPwdLoading(true);
  try {
    const body = {
      currentPassword: pwd.current || undefined, // mevcut yoksa undefined gönder
      newPassword: pwd.next,
      confirmPassword: pwd.next2,
    };
    const { data } = await axios.put("/api/v1/ogretmen/me/password", body);
    setMsg(data?.message || "Şifre güncellendi.");
    setPwd({ current: "", next: "", next2: "" });
  } catch (err) {
    setMsg(err?.response?.data?.message || "Şifre güncellenemedi.");
  } finally {
    setPwdLoading(false);
  }
};


// Panelde seçim için sabit listeler 
const SUBJECTS = [
  "Matematik","Fen Bilimleri","Türkçe","Tarih","Coğrafya",
  "Fizik","Kimya","Biyoloji","İngilizce","Almanca","Geometri","Edebiyat","Bilgisayar"
];
const GRADES = ["İlkokul","Ortaokul","Lise","Üniversite","Mezun"];

// güvenli başlangıç
const safeArr = (v) => Array.isArray(v) ? v : [];

// chips için toggle/add/remove yardımcıları
const toggleInArray = (key, value) => {
  setProfile((p) => {
    const arr = new Set(safeArr(p?.[key]));
    arr.has(value) ? arr.delete(value) : arr.add(value);
    return { ...p, [key]: Array.from(arr) };
  });
};
const addOne = (key, value) => {
  if (!value) return;
  setProfile((p) => {
    const arr = new Set(safeArr(p?.[key]));
    arr.add(value);
    return { ...p, [key]: Array.from(arr) };
  });
};
const removeOne = (key, value) => {
  setProfile((p) => {
    const arr = new Set(safeArr(p?.[key]));
    arr.delete(value);
    return { ...p, [key]: Array.from(arr) };
  });
};


const selectedSubjects = safeArr(profile?.subjects);
const selectedGrades   = safeArr(profile?.grades);

const availableSubjects = useMemo(
  () => SUBJECTS.filter(s => !selectedSubjects.includes(s)),
  [selectedSubjects]
);
const availableGrades = useMemo(
  () => GRADES.filter(g => !selectedGrades.includes(g)),
  [selectedGrades]
);


  return (
    <>
      <Navbar />
      <div className="tpanel">
        <div className="tp-wrap">
          <header className="tp-header">
            <h1>Öğretmen Paneli</h1>
            <p>Profil bilgilerini düzenle ve yayın durumunu yönet.</p>
          </header>

          {!!msg && <div className="tp-message">{msg}</div>}

          <div className="tp-layout">
            {/* Sol özet kartı */}
            <aside className="tp-card tp-side">
              <div className="tp-avatar">
                <div className="tp-avatar-wrapper">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={fullName || "Profil"}
                      className="tp-avatar-img"
                    />
                  ) : (
                    <div className="tp-avatar-circle">{initial}</div>
                  )}

                  <button
                    type="button"
                    className="tp-avatar-edit"
                    onClick={onPickPhoto}
                    title="Profil fotoğrafını değiştir"
                    aria-label="Profil fotoğrafını değiştir"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5" fill="currentColor"/>
                      <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                    </svg>
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="tp-hidden-file"
                    onChange={onPhotoChange}
                  />
                </div>
              </div>

              <div className="tp-name">{fullName || "İsimsiz"}</div>
              <div className="tp-slug">
                kullanıcı id: <code>{profile.slug}</code>
              </div>

              <label className="tp-switch">
                <input
                  type="checkbox"
                  checked={!!profile.isPublic}
                  onChange={(e) => onChange("isPublic", e.target.checked)}
                />
                <span>Profili yayında göster</span>
              </label>

              <div className="tp-hint">
                Öğrenciler sadece <b>yayında</b> olan profilleri görebilir.
              </div>
            </aside>

            {/* Sağ ana form */}
            <section className="tp-card">
                {/* Ders Alanları & Seviyeler */}
<div className="tp-section">
  <div className="tp-section-title">Ders Alanları & Seviyeler</div>

  {/* Ders Alanları */}
  <label className="tp-label">Ders Alanların</label>
  <div className="tp-chips">
    {selectedSubjects.length === 0 && <span className="tp-chip ghost">Henüz eklenmedi</span>}
    {selectedSubjects.map((s) => (
      <span key={s} className="tp-chip">
        {s}
        <button type="button" className="tp-chip-x" onClick={() => removeOne("subjects", s)} aria-label={`${s} sil`}>×</button>
      </span>
    ))}
  </div>

  <div className="tp-grid-2 tp-mt8">
    <div>
      <label className="tp-sublabel">Ders Alanı Ekle</label>
      <div className="tp-inline">
        <select id="add-subject-select" defaultValue="">
          <option value="">Seçiniz</option>
          {availableSubjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const sel = document.getElementById("add-subject-select")?.value;
            addOne("subjects", sel);
          }}
        >
          Ekle
        </button>
      </div>
    </div>

    {/* Seviyeler */}
    <div>
      <label className="tp-sublabel">Seviye (Sınıf) Ekle</label>
      <div className="tp-inline">
        <select id="add-grade-select" defaultValue="">
          <option value="">Seçiniz</option>
          {availableGrades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const sel = document.getElementById("add-grade-select")?.value;
            addOne("grades", sel);
          }}
        >
          Ekle
        </button>
      </div>
    </div>
  </div>

  {/*  hızlı seçim alanı */}
  <div className="tp-mt8">
    <label className="tp-label small">Hızlı Seçim</label>
    <div className="tp-chips">
      {SUBJECTS.map((s) => (
        <button
          type="button"
          key={s}
          className={`tp-chip ${selectedSubjects.includes(s) ? "active" : ""}`}
          onClick={() => toggleInArray("subjects", s)}
        >
          {s}
        </button>
      ))}
    </div>
  </div>

  <div className="tp-mt8">
    <label className="tp-label small">Seviye Hızlı Seçim</label>
    <div className="tp-chips">
      {GRADES.map((g) => (
        <button
          type="button"
          key={g}
          className={`tp-chip ${selectedGrades.includes(g) ? "active" : ""}`}
          onClick={() => toggleInArray("grades", g)}
        >
          {g}
        </button>
      ))}
    </div>
  </div>
</div>

              <form className="tp-form" onSubmit={save}>
                {/* Lokasyon */}
                <div className="tp-section">
                  <div className="tp-section-title">Lokasyon</div>
                  <div className="tp-grid-2">
                    <div>
                      <label className="tp-label">İl</label>
                      <select
                        value={profile.city || ""}
                        onChange={(e) => onChange("city", e.target.value)}
                      >
                        <option value="">İl seçin</option>
                        {TR_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="tp-label">İlçe</label>
                      <select
                        value={districts.includes(profile.district) ? profile.district : ""}
                        onChange={(e) => onChange("district", e.target.value)}
                        disabled={!profile.city || districts.length === 0}
                      >
                        <option value="">
                          {!profile.city
                            ? "Önce il seçin"
                            : districts.length
                            ? "İlçe seçin"
                            : "Bu il için ilçe listesi yakında"}
                        </option>
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ders Modu & Fiyat */}
                <div className="tp-section">
                  <div className="tp-section-title">Ders Modu & Fiyat</div>
                  <label className="tp-label">Ders Modu</label>
                  <select
                    value={profile.mode}
                    onChange={(e) => onChange("mode", e.target.value)}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="FACE_TO_FACE">Yüz yüze</option>
                    <option value="BOTH">Her ikisi</option>
                  </select>

                  <div className="tp-grid-2 tp-mt8">
                    {(isOnlineOnly || both) && (
                      <div>
                        <label className="tp-sublabel">Online Fiyat (₺)</label>
                        <input
                          type="number"
                          placeholder="Online ders ücreti"
                          value={profile.priceOnline ?? ""}
                          onChange={(e) =>
                            onChange(
                              "priceOnline",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          min={0}
                          required={isOnlineOnly}
                        />
                      </div>
                    )}

                    {(isFaceOnly || both) && (
                      <div>
                        <label className="tp-sublabel">Yüz Yüze Fiyat (₺)</label>
                        <input
                          type="number"
                          placeholder="Yüz yüze ders ücreti"
                          value={profile.priceF2F ?? ""}
                          onChange={(e) =>
                            onChange(
                              "priceF2F",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          min={0}
                          required={isFaceOnly}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="tp-section">
                  <div className="tp-section-title">Kısa Tanıtım</div>
                  <textarea
                    placeholder="Kendinden ve tecrübenden kısaca bahset..."
                    value={profile.bio ?? ""}
                    onChange={(e) => onChange("bio", e.target.value)}
                    rows={5}
                  />
                </div>

                <div className="tp-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            </section>

            <section className="tp-card" style={{ marginTop: 16 }}>
  <form className="tp-form" onSubmit={changePassword}>
    <div className="tp-section">
      <div className="tp-section-title">Şifre Değiştir</div>
      <div className="tp-grid-2">
        <div>
          <label className="tp-label">Mevcut Şifre</label>
          <input
            type="password"
            placeholder="Mevcut şifreniz"
            value={pwd.current}
            onChange={(e) => setPwd((s) => ({ ...s, current: e.target.value }))}
          />
        </div>
        <div>
          <label className="tp-label">Yeni Şifre</label>
          <input
            type="password"
            placeholder="En az 8 karakter"
            value={pwd.next}
            onChange={(e) => setPwd((s) => ({ ...s, next: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="tp-grid-2 tp-mt8" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <label className="tp-label">Yeni Şifre (Tekrar)</label>
          <input
            type="password"
            placeholder="Yeni şifrenizi tekrar yazın"
            value={pwd.next2}
            onChange={(e) => setPwd((s) => ({ ...s, next2: e.target.value }))}
            required
          />
        </div>
      </div>
    </div>

    <div className="tp-actions">
      <button type="submit" disabled={pwdLoading}>
        {pwdLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </button>
    </div>
  </form>
</section>


            {/* Scheduling: Sekmeli görünüm */}
            <section className="tp-card" style={{ marginTop: 16 }}>
              <div className="tp-tabs">
                <button
                  type="button"
                  className={`tp-tab ${tab === "availability" ? "active" : ""}`}
                  onClick={() => setTab("availability")}
                >
                  Uygunluk
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "slots" ? "active" : ""}`}
                  onClick={() => setTab("slots")}
                >
                  Takvim Önizleme
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "timeoff" ? "active" : ""}`}
                  onClick={() => setTab("timeoff")}
                >
                  Tatil / Blokaj
                </button>
              </div>

              {tab === "availability" && (
                <AvailabilityEditor
                  avail={avail}
                  setAvail={setAvail}
                  onAvailChange={onAvailChange}
                  minToStr={minToStr}
                  strToMin={strToMin}
                  onSave={saveAvailability}
                />
              )}

              {tab === "slots" && (
                <SlotsPreview
                  range={range}
                  setRange={setRange}
                  slots={slots}
                  fetchSlots={fetchSlots}
                />
              )}

              {tab === "timeoff" && (
                <TimeOffManager
                  creatingOff={creatingOff}
                  setCreatingOff={setCreatingOff}
                  timeOffs={timeOffs}
                  addTimeOff={addTimeOff}
                  delTimeOff={delTimeOff}
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
