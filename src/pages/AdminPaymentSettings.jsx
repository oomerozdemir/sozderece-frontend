import { useState, useEffect } from "react";
import axios from "../utils/axios";

const DEFAULT = {
  logoUrl: "/images/hero-logo.webp",
  slogan: "Başarıya giden yol buradan geçiyor",
  socialProofText: "+200 Mutlu Öğrenci",
  socialProofStars: 5,
  avatars: [
    { initials: "AY", color: "#f39c12" },
    { initials: "MK", color: "#100481" },
    { initials: "ZD", color: "#e74c3c" },
  ],
  includes: [
    "Rehberlik Videoları",
    "Adım Adım Belgeler ve Şablonlar",
    "Özel Topluluğa Erişim",
    "Kurs Güncellemelerine Ömür Boyu Erişim",
  ],
  guaranteeText: "Siparişinizi teslim aldıktan sonra 5 gün içinde koşulsuz cayma hakkınız bulunmaktadır.",
  ctaButtonText: "Güvenli Ödemeye Geç",
};

const TABS = [
  { key: "general", label: "⚙️ Genel" },
  { key: "social", label: "👥 Sosyal Kanıt" },
  { key: "includes", label: "✅ Dahil Olanlar" },
  { key: "trust", label: "🛡️ Güven" },
];

const inp = "w-full border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:border-[#f35900] placeholder:text-[#9ca3af] bg-white";
const Label = ({ children }) => <p className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1">{children}</p>;
const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 space-y-4">
    {title && <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wide border-b border-[#f1f5f9] pb-3">{title}</h3>}
    {children}
  </div>
);

const DelBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] transition-colors text-lg font-bold">×</button>
);
const AddBtn = ({ onClick, label }) => (
  <button type="button" onClick={onClick} className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:border-[#f35900] hover:text-[#f35900] transition-colors">
    + {label}
  </button>
);

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState(DEFAULT);
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get("/api/settings/payment-page")
      .then((r) => setSettings({ ...DEFAULT, ...r.data }))
      .catch(() => {});
  }, []);

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const setAvatarField = (i, field, value) => {
    const next = [...(settings.avatars || [])];
    next[i] = { ...next[i], [field]: value };
    set("avatars", next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/admin/settings/payment-page", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const tabCls = (key) =>
    tab === key
      ? "px-3 py-2 rounded-xl text-xs font-bold bg-[#f35900] text-white shadow transition-all"
      : "px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-all";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">💳 Ödeme Sayfası Ayarları</h2>
          <p className="text-xs text-[#64748b] mt-0.5">Ödeme sayfasındaki tüm içerikleri buradan düzenleyin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#f35900] hover:bg-[#d44e00] text-white font-bold text-sm transition-colors disabled:opacity-60 shadow-[0_4px_12px_rgba(243,89,0,0.3)]"
        >
          {saving ? "Kaydediliyor..." : saved ? "✅ Kaydedildi" : "💾 Kaydet"}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-2 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tabCls(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GENEL ── */}
      {tab === "general" && (
        <div className="space-y-4">
          <Card title="🖼️ Logo & Marka">
            <div>
              <Label>Logo URL</Label>
              <input className={inp} value={settings.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="/images/hero-logo.webp" />
              {settings.logoUrl && (
                <div className="mt-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] inline-block">
                  <img src={settings.logoUrl} alt="Logo önizleme" className="h-10 object-contain" />
                </div>
              )}
            </div>
            <div>
              <Label>Slogan (navbar altında görünür)</Label>
              <input className={inp} value={settings.slogan || ""} onChange={(e) => set("slogan", e.target.value)} placeholder="Başarıya giden yol buradan geçiyor" />
            </div>
          </Card>
          <Card title="🖱️ CTA Butonu">
            <div>
              <Label>Buton Metni</Label>
              <input className={inp} value={settings.ctaButtonText || ""} onChange={(e) => set("ctaButtonText", e.target.value)} placeholder="Güvenli Ödemeye Geç" />
            </div>
          </Card>
        </div>
      )}

      {/* ── SOSYAL KANIT ── */}
      {tab === "social" && (
        <div className="space-y-4">
          <Card title="📊 Sayaç & Yıldız">
            <div>
              <Label>Sosyal Kanıt Metni</Label>
              <input className={inp} value={settings.socialProofText || ""} onChange={(e) => set("socialProofText", e.target.value)} placeholder="+200 Mutlu Öğrenci" />
            </div>
            <div>
              <Label>Yıldız Sayısı (1–5)</Label>
              <input
                className={inp}
                type="number"
                min={1}
                max={5}
                value={settings.socialProofStars ?? 5}
                onChange={(e) => set("socialProofStars", Math.min(5, Math.max(1, parseInt(e.target.value) || 5)))}
              />
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < (settings.socialProofStars || 5) ? "text-[#f39c12] text-xl" : "text-[#d1d5db] text-xl"}>★</span>
                ))}
              </div>
            </div>
          </Card>

          <Card title="👤 Avatarlar">
            {(settings.avatars || []).map((av, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 border-2 border-white shadow"
                  style={{ backgroundColor: av.color || "#100481" }}
                >
                  {av.initials || "?"}
                </div>
                <div className="flex gap-2 flex-1">
                  <div className="flex-1">
                    <Label>Harf</Label>
                    <input
                      className={inp}
                      maxLength={3}
                      value={av.initials || ""}
                      onChange={(e) => setAvatarField(i, "initials", e.target.value.toUpperCase())}
                      placeholder="AY"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Renk</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={av.color || "#100481"}
                        onChange={(e) => setAvatarField(i, "color", e.target.value)}
                        className="w-10 h-9 rounded-lg border border-[#e2e8f0] cursor-pointer p-0.5"
                      />
                      <input
                        className={`${inp} flex-1`}
                        value={av.color || ""}
                        onChange={(e) => setAvatarField(i, "color", e.target.value)}
                        placeholder="#f39c12"
                      />
                    </div>
                  </div>
                </div>
                <DelBtn onClick={() => set("avatars", (settings.avatars || []).filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddBtn
              onClick={() => set("avatars", [...(settings.avatars || []), { initials: "?", color: "#100481" }])}
              label="Avatar Ekle"
            />
          </Card>
        </div>
      )}

      {/* ── DAHİL OLANLAR ── */}
      {tab === "includes" && (
        <Card title="✅ Dahil Olanlar Listesi">
          <p className="text-xs text-[#64748b]">Sepet özeti bölümünde "Dahil Olanlar" başlığı altında gösterilir.</p>
          {(settings.includes || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#f35900]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                className={inp}
                value={item}
                onChange={(e) => {
                  const next = [...(settings.includes || [])];
                  next[i] = e.target.value;
                  set("includes", next);
                }}
                placeholder="Özellik açıklaması"
              />
              <DelBtn onClick={() => set("includes", (settings.includes || []).filter((_, j) => j !== i))} />
            </div>
          ))}
          <AddBtn onClick={() => set("includes", [...(settings.includes || []), ""])} label="Madde Ekle" />
        </Card>
      )}

      {/* ── GÜVEN ── */}
      {tab === "trust" && (
        <Card title="🛡️ Güven Bildirimi">
          <div>
            <Label>Garanti Metni (sepet özeti altında görünür)</Label>
            <textarea
              className={`${inp} h-24 resize-none`}
              value={settings.guaranteeText || ""}
              onChange={(e) => set("guaranteeText", e.target.value)}
              placeholder="Siparişinizi teslim aldıktan sonra 5 gün içinde koşulsuz cayma hakkınız bulunmaktadır."
            />
          </div>
          {/* Önizleme */}
          {settings.guaranteeText && (
            <div className="flex items-start gap-2 p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0]">
              <svg className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs text-[#065f46] leading-relaxed">{settings.guaranteeText}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
