import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";

export default function TeacherPanel() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("/api/v1/ogretmen/me/profil").then(({data}) => setProfile(data.profile)).catch(()=>{});
  }, []);

  if (!profile) return (<><Navbar /><div className="login-container"><h2>Yükleniyor…</h2></div></>);

  const onChange = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
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
        isPublic: !!profile.isPublic
      };
      await axios.put("/api/v1/ogretmen/me/profil", payload);
      setMsg("Kaydedildi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <form className="login-form" onSubmit={save}>
          <h2>Öğretmen Paneli</h2>
          {!!msg && <p>{msg}</p>}

          <p><strong>{profile.firstName} {profile.lastName}</strong> — <small>slug: {profile.slug}</small></p>

          <div className="grid-two">
            <input placeholder="İl" value={profile.city||""} onChange={(e)=>onChange("city", e.target.value)} />
            <input placeholder="İlçe" value={profile.district||""} onChange={(e)=>onChange("district", e.target.value)} />
          </div>

          <label>Mod</label>
          <select value={profile.mode} onChange={(e)=>onChange("mode", e.target.value)}>
            <option value="ONLINE">ONLINE</option>
            <option value="FACE_TO_FACE">FACE_TO_FACE</option>
            <option value="BOTH">BOTH</option>
          </select>

          <div className="grid-two">
            <input type="number" placeholder="Online Fiyat" value={profile.priceOnline ?? ""} onChange={(e)=>onChange("priceOnline", e.target.value ? Number(e.target.value) : null)} />
            <input type="number" placeholder="Yüzyüze Fiyat" value={profile.priceF2F ?? ""} onChange={(e)=>onChange("priceF2F", e.target.value ? Number(e.target.value) : null)} />
          </div>

          <label>Bio</label>
          <textarea value={profile.bio ?? ""} onChange={(e)=>onChange("bio", e.target.value)} />

          <label className="remember-me">
            <input type="checkbox" checked={!!profile.isPublic} onChange={(e)=>onChange("isPublic", e.target.checked)} />
            Profili yayında göster
          </label>

          <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </form>
      </div>
    </>
  );
}
