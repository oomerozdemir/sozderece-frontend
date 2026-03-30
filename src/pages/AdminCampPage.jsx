import { useEffect, useState } from "react";
import axios from "../utils/axios";

const inp = "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] placeholder:text-[#9ca3af] focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";
const Label = ({ children }) => <label className="block text-xs font-semibold text-[#374151] mb-1">{children}</label>;
const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm space-y-4">
    <h3 className="font-black text-[#0f172a] text-sm uppercase tracking-wide border-b border-[#f1f5f9] pb-3">{title}</h3>
    {children}
  </div>
);
const AddBtn = ({ onClick, label = "Ekle" }) => (
  <button type="button" onClick={onClick}
    className="mt-2 px-3 py-1.5 text-xs font-bold bg-[#eff6ff] text-[#1d4ed8] rounded-lg hover:bg-[#dbeafe] transition-all border border-[#bfdbfe]">
    + {label}
  </button>
);
const DelBtn = ({ onClick }) => (
  <button type="button" onClick={onClick}
    className="px-2 py-1 text-xs font-bold bg-[#fef2f2] text-[#991b1b] rounded-lg hover:bg-[#fee2e2] transition-all border border-[#fecaca] flex-shrink-0">
    Sil
  </button>
);

export default function AdminCampPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState({ total: 0, maxQuota: 10, remainingQuota: 10 });
  const [tab, setTab] = useState("general");

  const token = localStorage.getItem("token");
  const authH = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get("/api/camp-page").then((r) => setContent(r.data)).catch(() => {}).finally(() => setLoading(false));
    axios.get("/api/admin/camp-applications", authH)
      .then((r) => { setApplications(r.data.applications || []); setQuotaInfo({ total: r.data.total, maxQuota: r.data.maxQuota, remainingQuota: r.data.remainingQuota }); })
      .catch(() => {}).finally(() => setAppsLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await axios.put("/api/admin/camp-page", content, authH);
      setMsg({ ok: true, text: "İçerik kaydedildi." });
    } catch (err) {
      setMsg({ ok: false, text: err?.response?.data?.message || "Kaydedilemedi." });
    } finally { setSaving(false); }
  };

  // Generic deep-set by dot-path
  const set = (path, value) => {
    const keys = path.split(".");
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Array helpers
  const arrSet = (arrPath, idx, key, value) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = arrPath.split(".");
      let obj = next;
      for (const k of keys) obj = obj[k];
      obj[idx][key] = value;
      return next;
    });
  };
  const arrAdd = (arrPath, template) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = arrPath.split(".");
      let obj = next;
      for (const k of keys) obj = obj[k];
      obj.push({ ...template });
      return next;
    });
  };
  const arrDel = (arrPath, idx) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = arrPath.split(".");
      let obj = next;
      for (const k of keys) obj = obj[k];
      obj.splice(idx, 1);
      return next;
    });
  };
  const getArr = (arrPath) => {
    const keys = arrPath.split(".");
    let obj = content;
    for (const k of keys) obj = obj?.[k];
    return Array.isArray(obj) ? obj : [];
  };

  const handleExport = () => {
    fetch(`${axios.defaults.baseURL}/api/admin/camp-applications/export`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "camp-applications.csv"; a.click();
        URL.revokeObjectURL(url);
      }).catch(() => alert("İndirme hatası"));
  };

  if (loading) return <div className="text-center py-20 text-[#64748b]">Yükleniyor...</div>;
  if (!content) return <div className="text-center py-20 text-[#64748b]">İçerik yüklenemedi.</div>;

  const TABS = [
    { key: "general",       label: "⚙️ Genel" },
    { key: "hero",          label: "🎯 Hero" },
    { key: "painPoints",    label: "😟 Sorunlar" },
    { key: "camp",          label: "🏕 Program" },
    { key: "testimonials",  label: "⭐ Yorumlar" },
    { key: "offer",         label: "💰 Teklif" },
    { key: "form",          label: "📝 Form" },
    { key: "applications",  label: `📋 Başvurular${quotaInfo.total > 0 ? ` (${quotaInfo.total})` : ""}` },
  ];
  const tabCls = (k) => `px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${tab === k ? "bg-[#100481] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">🏕 {content.name || "Kamp"} Yönetimi</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Landing page içeriğini düzenle</p>
        </div>
        <div className="flex gap-2">
          <a href={`/${content.slug || "deneme-kampi"}`} target="_blank" rel="noreferrer"
            className="px-4 py-2 rounded-xl border border-[#e5e7eb] text-sm font-bold text-[#374151] hover:bg-[#f8fafc] transition-all">
            🔗 Sayfayı Gör
          </a>
          {tab !== "applications" && (
            <button onClick={save} disabled={saving}
              className="px-5 py-2 bg-[#100481] text-white rounded-xl text-sm font-bold hover:bg-[#0a0260] transition-all disabled:opacity-50">
              {saving ? "Kaydediliyor..." : "💾 Kaydet"}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${msg.ok ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef2f2] text-[#991b1b]"}`}>
          {msg.text}
        </div>
      )}

      {/* Tab nav */}
      <div className="bg-white rounded-2xl p-2 border border-[#f1f5f9] shadow-sm flex flex-wrap gap-1">
        {TABS.map((t) => <button key={t.key} className={tabCls(t.key)} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {/* ═══ GENEL ═══ */}
      {tab === "general" && (
        <Card title="⚙️ Genel Ayarlar">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!content.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-5 h-5 accent-[#100481]" />
            <div>
              <span className="font-bold text-[#0f172a] text-sm">Kampanya Aktif</span>
              <p className="text-xs text-[#64748b]">Kapalıysa "Kamp şu an aktif değil" mesajı gösterilir.</p>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <div>
              <Label>Sayfa Adı</Label>
              <input className={inp} placeholder="Deneme Kampı" value={content.name || ""} onChange={(e) => set("name", e.target.value)} />
              <p className="text-xs text-[#9ca3af] mt-1">Admin menüsünde gözükür</p>
            </div>
            <div>
              <Label>URL Slug</Label>
              <div className="flex">
                <span className="px-3 py-2.5 bg-[#f1f5f9] border border-r-0 border-[#e5e7eb] rounded-l-xl text-xs text-[#64748b] whitespace-nowrap flex items-center">sozderecekocluk.com/</span>
                <input
                  className="flex-1 px-3 py-2.5 rounded-r-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] placeholder:text-[#9ca3af] focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white"
                  placeholder="deneme-kampi"
                  value={content.slug || ""}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                />
              </div>
              <p className="text-xs text-[#9ca3af] mt-1">Kaydettikten sonra yeni URL aktif olur</p>
            </div>
          </div>
        </Card>
      )}

      {/* ═══ HERO ═══ */}
      {tab === "hero" && (
        <Card title="🎯 Hero Bölümü">
          <div>
            <Label>Başlık</Label>
            <input className={inp} value={content.hero?.title || ""} onChange={(e) => set("hero.title", e.target.value)} />
            <p className="text-xs text-[#9ca3af] mt-1">İpucu: "Kontrol Altında" ifadesi otomatik turuncu renk alır.</p>
          </div>
          <div>
            <Label>Alt Başlık</Label>
            <textarea className={`${inp} resize-none`} rows={3} value={content.hero?.subtitle || ""} onChange={(e) => set("hero.subtitle", e.target.value)} />
          </div>
          <div>
            <Label>Turuncu Vurgulanan İfade (başlık veya alt başlıkta)</Label>
            <input className={inp} placeholder="Sözderece ile" value={content.hero?.highlightPhrase || ""} onChange={(e) => set("hero.highlightPhrase", e.target.value)} />
            <p className="text-xs text-[#9ca3af] mt-1">Bu ifade başlıkta ve alt başlıkta turuncu renkte gösterilir.</p>
          </div>
          <div>
            <Label>Video URL (YouTube embed veya boş bırak)</Label>
            <input className={inp} placeholder="https://www.youtube.com/embed/..." value={content.hero?.videoUrl || ""} onChange={(e) => set("hero.videoUrl", e.target.value)} />
          </div>
          <div>
            <Label>CTA Buton Metni</Label>
            <input className={inp} placeholder="Yerini Ayırt" value={content.hero?.buttonText || ""} onChange={(e) => set("hero.buttonText", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <div>
              <Label>Chip 1 Metni</Label>
              <input className={inp} placeholder="✅ Sınava Kadar Takip" value={content.hero?.chip1 || ""} onChange={(e) => set("hero.chip1", e.target.value)} />
            </div>
            <div>
              <Label>Chip 2 Metni</Label>
              <input className={inp} placeholder="🎯 Kontenjan Dolmadan Kayıt Ol" value={content.hero?.chip2 || ""} onChange={(e) => set("hero.chip2", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Sosyal Kanıt Metni (butonun altı)</Label>
            <input className={inp} placeholder="+124 Mutlu Öğrenci" value={content.hero?.socialProofText || ""} onChange={(e) => set("hero.socialProofText", e.target.value)} />
          </div>
        </Card>
      )}

      {/* ═══ PAIN POINTS ═══ */}
      {tab === "painPoints" && (
        <div className="space-y-4">
          <Card title="😟 Sorunlar Bölümü — Başlık">
            <div>
              <Label>Bölüm Başlığı</Label>
              <input className={inp} placeholder="Bu sen misin?" value={content.painPoints?.title || ""} onChange={(e) => set("painPoints.title", e.target.value)} />
            </div>
          </Card>

          <Card title="😟 Sorun Kartları">
            {getArr("painPoints.items").map((item, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Kart {i + 1}</span>
                  <DelBtn onClick={() => arrDel("painPoints.items", i)} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label>İkon</Label>
                    <input className={inp} placeholder="📉" value={item.icon || ""} onChange={(e) => arrSet("painPoints.items", i, "icon", e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <Label>Başlık</Label>
                    <input className={inp} value={item.title || ""} onChange={(e) => arrSet("painPoints.items", i, "title", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <textarea className={`${inp} resize-none`} rows={2} value={item.desc || ""} onChange={(e) => arrSet("painPoints.items", i, "desc", e.target.value)} />
                </div>
              </div>
            ))}
            <AddBtn onClick={() => arrAdd("painPoints.items", { icon: "📌", title: "", desc: "" })} label="Sorun Kartı Ekle" />
          </Card>
        </div>
      )}

      {/* ═══ PROGRAM (CAMP) ═══ */}
      {tab === "camp" && (
        <div className="space-y-4">
          <Card title="🏕 Kamp Bölümü — Başlık & Açıklama">
            <div>
              <Label>Bölüm Başlığı</Label>
              <input className={inp} value={content.camp?.title || ""} onChange={(e) => set("camp.title", e.target.value)} />
            </div>
            <div>
              <Label>Açıklama</Label>
              <textarea className={`${inp} resize-none`} rows={3} value={content.camp?.description || ""} onChange={(e) => set("camp.description", e.target.value)} />
            </div>
          </Card>

          <Card title="📅 Haftalık Program">
            {getArr("camp.weeks").map((week, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Hafta {i + 1}</span>
                  <DelBtn onClick={() => arrDel("camp.weeks", i)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Hafta Etiketi</Label>
                    <input className={inp} placeholder="1. Hafta" value={week.week || ""} onChange={(e) => arrSet("camp.weeks", i, "week", e.target.value)} />
                  </div>
                  <div>
                    <Label>Başlık</Label>
                    <input className={inp} value={week.title || ""} onChange={(e) => arrSet("camp.weeks", i, "title", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <textarea className={`${inp} resize-none`} rows={2} value={week.desc || ""} onChange={(e) => arrSet("camp.weeks", i, "desc", e.target.value)} />
                </div>
              </div>
            ))}
            <AddBtn onClick={() => arrAdd("camp.weeks", { week: "", title: "", desc: "" })} label="Hafta Ekle" />
          </Card>

          <Card title="📊 Karşılaştırma Tablosu — Başlık & CTA">
            <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
              <div>
                <Label>Tablo Başlığı</Label>
                <input className={inp} placeholder="Neden Sözderece?" value={content.camp?.comparisonTitle || ""} onChange={(e) => set("camp.comparisonTitle", e.target.value)} />
              </div>
              <div>
                <Label>Altındaki Buton Metni</Label>
                <input className={inp} placeholder="Hemen Kayıt Ol" value={content.camp?.comparisonCTAText || ""} onChange={(e) => set("camp.comparisonCTAText", e.target.value)} />
              </div>
              <div>
                <Label>Rating Metni (butonun altı)</Label>
                <input className={inp} placeholder="★★★★★ 4.7" value={content.camp?.comparisonRating || ""} onChange={(e) => set("camp.comparisonRating", e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="📊 Karşılaştırma Satırları">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f1f5f9]">
                    <th className="text-left px-3 py-2 font-bold text-[#374151] rounded-l-lg">Özellik</th>
                    <th className="px-3 py-2 font-bold text-[#374151] text-center">Sözderece</th>
                    <th className="px-3 py-2 font-bold text-[#374151] text-center">Dershane</th>
                    <th className="px-3 py-2 font-bold text-[#374151] text-center">Tek Öğretmen</th>
                    <th className="px-3 py-2 rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {getArr("camp.comparison").map((row, i) => (
                    <tr key={i} className="border-t border-[#f1f5f9]">
                      <td className="px-2 py-2">
                        <input className={inp} value={row.feature || ""} onChange={(e) => arrSet("camp.comparison", i, "feature", e.target.value)} />
                      </td>
                      {["sozderece", "dershane", "tekli"].map((col) => (
                        <td key={col} className="px-2 py-2 text-center">
                          <input type="checkbox" checked={!!row[col]} onChange={(e) => arrSet("camp.comparison", i, col, e.target.checked)} className="w-4 h-4 accent-[#100481]" />
                        </td>
                      ))}
                      <td className="px-2 py-2"><DelBtn onClick={() => arrDel("camp.comparison", i)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AddBtn onClick={() => arrAdd("camp.comparison", { feature: "", sozderece: true, dershane: false, tekli: false })} label="Satır Ekle" />
          </Card>
        </div>
      )}

      {/* ═══ TESTIMONIALS ═══ */}
      {tab === "testimonials" && (
        <div className="space-y-4">
          <Card title="⭐ Bölüm Başlığı">
            <div>
              <Label>Başlık</Label>
              <input className={inp} placeholder="Kanıtlanmış Sonuçlar" value={content.testimonials?.title || ""} onChange={(e) => set("testimonials.title", e.target.value)} />
            </div>
          </Card>

          <Card title="📈 İstatistik Kutuları">
            {getArr("testimonials.stats").map((stat, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">İstatistik {i + 1}</span>
                  <DelBtn onClick={() => arrDel("testimonials.stats", i)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Sayı / Değer</Label>
                    <input className={inp} placeholder="59→70" value={stat.number || ""} onChange={(e) => arrSet("testimonials.stats", i, "number", e.target.value)} />
                  </div>
                  <div>
                    <Label>Etiket</Label>
                    <input className={inp} placeholder="Net artışı" value={stat.label || ""} onChange={(e) => arrSet("testimonials.stats", i, "label", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <AddBtn onClick={() => arrAdd("testimonials.stats", { number: "", label: "" })} label="İstatistik Ekle" />
          </Card>

          <Card title="💬 Öğrenci Yorumları">
            {getArr("testimonials.items").map((item, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Yorum {i + 1}</span>
                  <DelBtn onClick={() => arrDel("testimonials.items", i)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ad</Label>
                    <input className={inp} placeholder="Sevval" value={item.name || ""} onChange={(e) => arrSet("testimonials.items", i, "name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Rozet</Label>
                    <input className={inp} placeholder="+17.5 net" value={item.badge || ""} onChange={(e) => arrSet("testimonials.items", i, "badge", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Yorum Metni</Label>
                  <textarea className={`${inp} resize-none`} rows={3} value={item.text || ""} onChange={(e) => arrSet("testimonials.items", i, "text", e.target.value)} />
                </div>
              </div>
            ))}
            <AddBtn onClick={() => arrAdd("testimonials.items", { name: "", text: "", badge: "" })} label="Yorum Ekle" />
          </Card>
        </div>
      )}

      {/* ═══ OFFER ═══ */}
      {tab === "offer" && (
        <Card title="💰 Teklif & Fiyat">
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <div>
              <Label>Bölüm Başlığı</Label>
              <input className={inp} value={content.offer?.title || ""} onChange={(e) => set("offer.title", e.target.value)} />
            </div>
            <div>
              <Label>Fiyat (₺)</Label>
              <input className={inp} type="number" value={content.offer?.price || ""} onChange={(e) => set("offer.price", e.target.value)} />
            </div>
            <div>
              <Label>Kontenjan (kişi)</Label>
              <input className={inp} type="number" value={content.offer?.maxQuota || ""} onChange={(e) => set("offer.maxQuota", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>YKS Tarihi (geri sayım için)</Label>
              <input className={inp} type="date" value={content.offer?.yksDate || ""} onChange={(e) => set("offer.yksDate", e.target.value)} />
            </div>
          </div>

          {/* Plan tabs */}
          <div>
            <Label>Fiyat Planları (sekme olarak gösterilir, birden fazla eklenirse)</Label>
            {getArr("offer.plans").map((plan, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] mb-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Plan {i + 1}</span>
                  <DelBtn onClick={() => arrDel("offer.plans", i)} />
                </div>
                <div className="grid grid-cols-2 gap-2 max-[500px]:grid-cols-1">
                  <div>
                    <Label>Sekme Etiketi</Label>
                    <input className={inp} placeholder="Aylık" value={plan.label || ""} onChange={(e) => arrSet("offer.plans", i, "label", e.target.value)} />
                  </div>
                  <div>
                    <Label>Fiyat (₺)</Label>
                    <input className={inp} type="number" placeholder="850" value={plan.price || ""} onChange={(e) => arrSet("offer.plans", i, "price", e.target.value)} />
                  </div>
                  <div>
                    <Label>Fiyat Metni (/ ay, toplam...)</Label>
                    <input className={inp} placeholder="/ ay" value={plan.priceText || ""} onChange={(e) => arrSet("offer.plans", i, "priceText", e.target.value)} />
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <input className={inp} placeholder="Esnek, iptal edilebilir" value={plan.desc || ""} onChange={(e) => arrSet("offer.plans", i, "desc", e.target.value)} />
                  </div>
                  <div className="col-span-2 max-[500px]:col-span-1">
                    <Label>Rozet (boş bırakılabilir)</Label>
                    <input className={inp} placeholder="En İyi Değer" value={plan.badge || ""} onChange={(e) => arrSet("offer.plans", i, "badge", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <AddBtn onClick={() => arrAdd("offer.plans", { label: "", price: "", priceText: "", desc: "", badge: "" })} label="Plan Ekle" />
          </div>

          <div>
            <Label>Pakete Dahil Olanlar</Label>
            {(content.offer?.includes || []).map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className={inp}
                  value={item}
                  onChange={(e) => {
                    const next = [...(content.offer?.includes || [])];
                    next[i] = e.target.value;
                    set("offer.includes", next);
                  }}
                />
                <DelBtn onClick={() => set("offer.includes", (content.offer?.includes || []).filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddBtn onClick={() => set("offer.includes", [...(content.offer?.includes || []), ""])} label="Madde Ekle" />
          </div>

          <div>
            <Label>Garantiler</Label>
            {(content.offer?.guarantees || []).map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className={inp}
                  value={item}
                  onChange={(e) => {
                    const next = [...(content.offer?.guarantees || [])];
                    next[i] = e.target.value;
                    set("offer.guarantees", next);
                  }}
                />
                <DelBtn onClick={() => set("offer.guarantees", (content.offer?.guarantees || []).filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddBtn onClick={() => set("offer.guarantees", [...(content.offer?.guarantees || []), ""])} label="Garanti Ekle" />
          </div>
        </Card>
      )}

      {/* ═══ FORM ═══ */}
      {tab === "form" && (
        <Card title="📝 Başvuru Formu">
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <div>
              <Label>Form Başlığı</Label>
              <input className={inp} placeholder="Yerini Şimdi Ayırt" value={content.form?.title || ""} onChange={(e) => set("form.title", e.target.value)} />
            </div>
            <div>
              <Label>Form Alt Başlığı</Label>
              <input className={inp} placeholder="Kontenjan dolmadan..." value={content.form?.subtitle || ""} onChange={(e) => set("form.subtitle", e.target.value)} />
            </div>
            <div>
              <Label>Ücretsiz Buton Metni</Label>
              <input className={inp} placeholder="🆓 Ücretsiz Görüşme" value={content.form?.freeButtonText || ""} onChange={(e) => set("form.freeButtonText", e.target.value)} />
            </div>
            <div>
              <Label>Ücretsiz Buton Alt Metni</Label>
              <input className={inp} placeholder="Tanışalım, ihtiyacını anlayalım" value={content.form?.freeButtonSub || ""} onChange={(e) => set("form.freeButtonSub", e.target.value)} />
            </div>
            <div>
              <Label>Ücretli Buton Metni</Label>
              <input className={inp} placeholder="💳 Hemen Başla" value={content.form?.paidButtonText || ""} onChange={(e) => set("form.paidButtonText", e.target.value)} />
            </div>
            <div>
              <Label>Başarı Başlığı</Label>
              <input className={inp} placeholder="Başvurun Alındı!" value={content.form?.successTitle || ""} onChange={(e) => set("form.successTitle", e.target.value)} />
            </div>
            <div className="col-span-2 max-[500px]:col-span-1">
              <Label>Başarı Alt Metni</Label>
              <input className={inp} placeholder="En kısa sürede seninle iletişime geçeceğiz." value={content.form?.successText || ""} onChange={(e) => set("form.successText", e.target.value)} />
            </div>
          </div>
        </Card>
      )}

      {/* ═══ APPLICATIONS ═══ */}
      {tab === "applications" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 max-[500px]:grid-cols-1">
            <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm text-center">
              <div className="text-2xl font-black text-[#100481]">{quotaInfo.total}</div>
              <div className="text-xs text-[#64748b] mt-1">Toplam Başvuru</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm text-center">
              <div className="text-2xl font-black text-[#f39c12]">{quotaInfo.remainingQuota}</div>
              <div className="text-xs text-[#64748b] mt-1">Kalan Kontenjan</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm text-center">
              <div className="text-2xl font-black text-[#22c55e]">{applications.filter((a) => a.type === "paid").length}</div>
              <div className="text-xs text-[#64748b] mt-1">Ücretli Başvuru</div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleExport} className="px-4 py-2 text-sm font-bold bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f8fafc] transition-all text-[#374151]">
              📥 CSV İndir
            </button>
          </div>
          {appsLoading ? (
            <div className="text-center py-10 text-[#64748b] text-sm">Yükleniyor...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-[#64748b] text-sm">Henüz başvuru yok.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-sm overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#374151] text-xs font-bold uppercase tracking-wide border-b border-[#f1f5f9]">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Ad Soyad</th>
                    <th className="px-4 py-3 text-left">Telefon</th>
                    <th className="px-4 py-3 text-left">E-posta</th>
                    <th className="px-4 py-3 text-left">Sınıf</th>
                    <th className="px-4 py-3 text-left">Tür</th>
                    <th className="px-4 py-3 text-left">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => (
                    <tr key={a.id} className={i % 2 === 0 ? "" : "bg-[#f8fafc]"}>
                      <td className="px-4 py-3 text-[#9ca3af]">{a.id}</td>
                      <td className="px-4 py-3 font-semibold text-[#0f172a]">{a.firstName} {a.lastName}</td>
                      <td className="px-4 py-3 text-[#374151]">{a.phone}</td>
                      <td className="px-4 py-3 text-[#374151]">{a.email}</td>
                      <td className="px-4 py-3 text-[#374151]">{a.grade}. Sınıf</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${a.type === "paid" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#eff6ff] text-[#1d4ed8]"}`}>
                          {a.type === "paid" ? "Ücretli" : "Ücretsiz"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{new Date(a.createdAt).toLocaleDateString("tr-TR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
