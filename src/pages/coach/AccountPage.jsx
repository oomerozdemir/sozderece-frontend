import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import {
  FaUsers, FaUserCircle, FaLifeRing, FaSignOutAlt, FaBars, FaTimes, FaCamera,
} from "react-icons/fa";

const readCoachName = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    return stored?.name || localStorage.getItem("userName") || "Koç";
  } catch {
    return localStorage.getItem("userName") || "Koç";
  }
};

const initialsOf = (name) =>
  (name || "K")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // middleware/upload.js ile aynı sınır
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Koç Paneli "Hesabım" — koçun kendi adını/uzmanlığını/açıklamasını/
// fotoğrafını düzenlediği sayfa. Fotoğraf aynı Coach.image alanına yazılır,
// bu yüzden öğrencinin "Koçum" sekmesinde (getStudentProfile →
// assignedCoach.image) ayrı bir senkronizasyon gerekmeden otomatik güncellenir.
export default function CoachAccountPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [coachName, setCoachName] = useState(readCoachName);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ name: "", subject: "", description: "" });
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/coach/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const coach = res.data?.coach;
        if (!coach) return;
        setForm({ name: coach.name || "", subject: coach.subject || "", description: coach.description || "" });
        setCurrentImage(coach.image || null);
        setEmail(coach.user?.email || "");
      })
      .catch(() => setError("Profil yüklenemedi, lütfen sayfayı yenile."))
      .finally(() => setLoading(false));
  }, []);

  // Seçilen dosya değiştikçe önizleme URL'i oluşturup eskisini serbest bırak.
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Sadece JPG, PNG, WEBP veya GIF yükleyebilirsin.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Fotoğraf en fazla 5 MB olabilir.");
      return;
    }
    setError("");
    setImageFile(file);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("İsim boş olamaz.");
      return;
    }
    setError("");
    setSavedMessage("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("subject", form.subject);
      data.append("description", form.description);
      if (imageFile) data.append("image", imageFile);

      const res = await axios.put("/api/coach/me", data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      const updated = res.data?.coach;
      if (updated) {
        setCurrentImage(updated.image || currentImage);
        setForm({ name: updated.name || "", subject: updated.subject || "", description: updated.description || "" });
      }
      setImageFile(null);
      setImagePreview(null);

      // Sidebar'daki ad anında güncellensin — localStorage'daki "user" objesi
      // de güncel kalsın diye (ör. sayfa yenilenirse readCoachName hâlâ doğru olsun).
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "null");
        if (stored) localStorage.setItem("user", JSON.stringify({ ...stored, name: updated?.name || form.name }));
        localStorage.setItem("userName", updated?.name || form.name);
      } catch {
        /* localStorage kullanılamıyorsa sorun değil, sadece sidebar bir sonraki girişte güncellenir */
      }
      setCoachName(updated?.name || form.name);
      setSavedMessage("Değişiklikler kaydedildi.");
    } catch {
      setError("Değişiklikler kaydedilemedi, lütfen tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  const displayedImage = imagePreview || currentImage;

  return (
    <div className="min-h-screen bg-cream md:h-screen md:overflow-hidden flex flex-col md:flex-row font-nunito">
      {/* ── Sol menü (masaüstü) ── */}
      <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 h-screen sticky top-0 bg-page-navy">
        <div className="px-6 py-7 flex items-center gap-2.5 flex-shrink-0">
          <img src="/images/logo-bee.png" alt="" aria-hidden="true" className="w-9 h-9 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-fredoka font-bold text-white text-base leading-tight truncate">Sözderece</p>
            <p className="text-white/40 text-[10px] font-nunito font-bold uppercase truncate" style={{ letterSpacing: 1.5 }}>
              Koç Paneli
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <Link
            to="/coach/dashboard"
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 no-underline transition-colors"
          >
            <FaUsers size={15} /> Öğrencilerim
          </Link>
          <div
            className="relative flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.09)", color: "#ffffff" }}
          >
            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand-on-dark" />
            <FaUserCircle size={15} style={{ color: "var(--color-brand-on-dark)", flexShrink: 0 }} />
            Hesabım
          </div>
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/10 flex flex-col gap-1 flex-shrink-0">
          <a
            href="https://wa.me/905312546701"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 no-underline transition-colors"
          >
            <FaLifeRing size={15} /> Yardım
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 font-nunito font-bold text-sm px-3.5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/5 text-left transition-colors"
          >
            <FaSignOutAlt size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Ana sütun ── */}
      <div className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#ece9f7] px-4 md:px-9 py-3.5 md:py-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-fredoka font-bold text-page-navy text-lg md:text-xl truncate">Hesabım</h1>
            <p className="font-nunito text-[#8b87a6] text-xs mt-0.5 truncate">Profil bilgilerini ve fotoğrafını buradan düzenle</p>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-fredoka font-bold text-sm flex-shrink-0 overflow-hidden"
              style={{ background: "var(--color-brand-light)", color: "var(--color-brand)" }}
            >
              {displayedImage ? (
                <img src={displayedImage} alt="" className="w-full h-full object-cover" />
              ) : (
                initialsOf(coachName)
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menü"
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-page-navy bg-[#f1f0fa]"
            >
              <FaBars size={15} />
            </button>
          </div>
        </header>

        <main className="px-4 md:px-9 py-5 md:py-7 max-w-[640px] mx-auto">
          {loading ? (
            <p className="font-nunito text-sm text-[#94a3b8]">Yükleniyor…</p>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-fredoka font-bold text-2xl flex-shrink-0 overflow-hidden border-2 border-[#f1f5f9]"
                  style={{ background: "var(--color-brand-light)", color: "var(--color-brand)" }}
                >
                  {displayedImage ? (
                    <img src={displayedImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initialsOf(form.name || coachName)
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 font-fredoka font-bold text-xs px-4 py-2.5 rounded-full text-white bg-brand-navy"
                  >
                    <FaCamera size={12} /> Fotoğraf Değiştir
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <p className="font-nunito text-[11px] text-[#94a3b8] mt-2">JPG, PNG, WEBP veya GIF — en fazla 5 MB.</p>
                </div>
              </div>

              <div>
                <label className="block font-nunito font-bold text-xs text-[#475569] mb-1.5">İsim</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-nunito focus:outline-none focus:border-page-navy"
                />
              </div>

              <div>
                <label className="block font-nunito font-bold text-xs text-[#475569] mb-1.5">Uzmanlık Alanı</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Örn. YKS Koçu"
                  className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-nunito focus:outline-none focus:border-page-navy"
                />
              </div>

              <div>
                <label className="block font-nunito font-bold text-xs text-[#475569] mb-1.5">Hakkında</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-nunito focus:outline-none focus:border-page-navy resize-none"
                />
              </div>

              <div>
                <label className="block font-nunito font-bold text-xs text-[#475569] mb-1.5">E-posta</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-nunito text-[#94a3b8] bg-[#f8fafc] cursor-not-allowed"
                />
              </div>

              {error && <p className="font-nunito text-sm text-[#dc2626]">{error}</p>}
              {savedMessage && <p className="font-nunito text-sm text-[#059669]">{savedMessage}</p>}

              <button
                type="submit"
                disabled={saving}
                className="self-start px-6 py-3 rounded-full font-fredoka font-bold text-sm text-white bg-brand-navy disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </form>
          )}
        </main>
      </div>

      {/* ── Mobil menü ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-[24px] px-4 pt-4 pb-2 animate-[sdSheetUp_0.18s_ease-out]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="font-fredoka font-bold text-page-navy text-base">Menü</p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b]"
                aria-label="Kapat"
              >
                <FaTimes size={13} />
              </button>
            </div>
            <Link
              to="/coach/dashboard"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 mb-2 no-underline"
              style={{ background: "#f8fafc", color: "#334155" }}
            >
              <FaUsers size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Öğrencilerim</span>
            </Link>
            <a
              href="https://wa.me/905312546701"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 mb-2 no-underline"
              style={{ background: "#f8fafc", color: "#334155" }}
            >
              <FaLifeRing size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Yardım</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              <FaSignOutAlt size={15} className="flex-shrink-0" />
              <span className="font-nunito font-bold text-sm">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
