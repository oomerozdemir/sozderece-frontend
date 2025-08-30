import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/teacher-panel.css";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";

export default function TeacherPanel() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
    // districts'i dependency'ye ekleyerek ESLint uyarısını da önlüyoruz
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
      };
      await axios.put("/api/v1/ogretmen/me/profil", payload);
      setMsg("Kaydedildi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kaydedilemedi.");
    } finally {
      setSaving(false);
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
                <div className="tp-avatar-circle">
                  {(profile.firstName?.[0] || "").toUpperCase()}
                </div>
              </div>
              <div className="tp-name">
                {profile.firstName} {profile.lastName}
              </div>
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
          </div>
        </div>
      </div>
    </>
  );
}
