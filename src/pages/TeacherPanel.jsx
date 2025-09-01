// src/pages/TeacherPanel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/teacher-panel.css";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import useTeacherScheduling from "../hooks/useTeacherScheduling";
import AvailabilityEditor from "../components/teacherComps/AvailabilityEditor";
import SlotsPreview from "../components/teacherComps/SlotsPreview";
import TimeOffManager from "../components/teacherComps/TimeOffManager";
import TeacherLessons from "../components/teacherComps/TeacherLessons";

export default function TeacherPanel() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  // Şifre değiştir alanı (duruyor)
  const [pwd, setPwd] = useState({ current: "", next: "", next2: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Scheduling hook
  const {
    avail, setAvail,
    slots,
    range, setRange,
    timeOffs,
    creatingOff, setCreatingOff,
    minToStr, strToMin, onAvailChange,
    saveAvailability, fetchSlots, addTimeOff, delTimeOff,
  } = useTeacherScheduling(setMsg);

  // Sekmeler: availability | slots | timeoff | lessons
  const [tab, setTab] = useState("lessons");

  // Profil çek
  useEffect(() => {
    axios
      .get("/api/v1/ogretmen/me/profil")
      .then(({ data }) => setProfile(data.profile))
      .catch(() => {});
  }, []);

  // Genel değişim handler
  const onChange = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  // Şehre göre ilçeler (HOOK — early return'dan ÖNCE)
  const districts = useMemo(() => {
    if (!profile?.city) return [];
    return TR_DISTRICTS[profile.city] || [];
  }, [profile?.city]);

  // Şehir değişince district doğrula
  useEffect(() => {
    if (!profile?.city) return;
    setProfile((p) => {
      const current = p?.district || "";
      if (current && districts.includes(current)) return p;
      return { ...p, district: districts[0] || "" };
    });
  }, [profile?.city, districts]);

  // Sadece lokasyon kaydı
  const saveLocation = async () => {
    if (!profile) return;
    setSaving(true);
    setMsg("");
    try {
      await axios.put("/api/v1/ogretmen/me/profil", {
        city: profile.city,
        district: profile.district,
      });
      setMsg("Lokasyon güncellendi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Lokasyon kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  // Fotoğraf yükleme
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

  // Şifre değiştir
  const changePassword = async (e) => {
    e?.preventDefault?.();
    setMsg("");
    if (!pwd.next || !pwd.next2) return setMsg("Yeni şifre ve doğrulama zorunludur.");
    if (pwd.next !== pwd.next2) return setMsg("Şifreler uyuşmuyor.");
    if (pwd.next.length < 8) return setMsg("Yeni şifre en az 8 karakter olmalı.");

    setPwdLoading(true);
    try {
      const body = {
        currentPassword: pwd.current || undefined,
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

  // ---- Early return (hook yok aşağıda)
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

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initial = (profile.firstName?.[0] || "").toUpperCase();

  // Derslerim sekmesinde profil.mode'u güncelleyen handler (TeacherLessons kullanıyor)
  const updateMode = async (nextMode) => {
    try {
      await axios.put("/api/v1/ogretmen/me/profil", { mode: nextMode });
      setProfile((p) => ({ ...p, mode: nextMode }));
      setMsg("Ders modu güncellendi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Ders modu güncellenemedi.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="tpanel">
        <div className="tp-wrap">
          <header className="tp-header">
            <h1>Öğretmen Paneli</h1>
            <p>Profil bilgilerini düzenle, randevularını ve derslerini yönet.</p>
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

            {/* Sağ: ÜSTTE sekmeler + LOKASYON satırı + içerik */}
            <section className="tp-card">
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
                <button
                  type="button"
                  className={`tp-tab ${tab === "lessons" ? "active" : ""}`}
                  onClick={() => setTab("lessons")}
                >
                  Derslerim
                </button>
              </div>

              {/* LOKASYON — sekmelerin hemen altında, satır içi */}
              <div
                className="tp-grid-2"
                style={{
                  gap: 12,
                  alignItems: "end",
                  margin: "12px 0 16px 0"
                }}
              >
                <div>
                  <label className="tp-label">İl</label>
                  <select
                    value={profile.city || ""}
                    onChange={(e) => onChange("city", e.target.value)}
                  >
                    <option value="">İl seçin</option>
                    {TR_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="tp-label">İlçe</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={districts.includes(profile.district) ? profile.district : ""}
                      onChange={(e) => onChange("district", e.target.value)}
                      disabled={!profile.city || districts.length === 0}
                      style={{ flex: 1 }}
                    >
                      <option value="">
                        {!profile.city
                          ? "Önce il seçin"
                          : districts.length
                          ? "İlçe seçin"
                          : "Bu il için ilçe listesi yakında"}
                      </option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    <button type="button" onClick={saveLocation} disabled={saving}>
                      {saving ? "Kaydediliyor…" : "Konumu Kaydet"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SEKME İÇERİKLERİ */}
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

              {tab === "lessons" && (
                <TeacherLessons
                  profile={profile}
                  onModeChange={updateMode}
                />
              )}
            </section>

            {/* ŞİFRE DEĞİŞTİR — duruyor */}
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
          </div>
        </div>
      </div>
    </>
  );
}
