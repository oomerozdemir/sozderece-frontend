import { useEffect, useState } from "react";
import axios from "../utils/axios";

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] placeholder:text-[#9ca3af] focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

export default function AdminCampPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState({ total: 0, maxQuota: 10, remainingQuota: 10 });
  const [tab, setTab] = useState("content"); // "content" | "applications"

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get("/api/camp-page")
      .then((r) => setContent(r.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));

    axios.get("/api/admin/camp-applications", authHeader)
      .then((r) => {
        setApplications(r.data.applications || []);
        setQuotaInfo({ total: r.data.total, maxQuota: r.data.maxQuota, remainingQuota: r.data.remainingQuota });
      })
      .catch(() => {})
      .finally(() => setAppsLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await axios.put("/api/admin/camp-page", content, authHeader);
      setMsg({ type: "success", text: "İçerik kaydedildi." });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Kaydedilemedi." });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const url = `${axios.defaults.baseURL}/api/admin/camp-applications/export`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "camp-applications.csv";
    // Pass auth via query not possible easily, use fetch instead
    fetch(`${axios.defaults.baseURL}/api/admin/camp-applications/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "camp-applications.csv";
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert("İndirme hatası"));
  };

  const set = (path, value) => {
    const keys = path.split(".");
    setContent((prev) => {
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  if (loading) return <div className="text-center py-20 text-[#64748b]">Yükleniyor...</div>;
  if (!content) return <div className="text-center py-20 text-[#64748b]">İçerik yüklenemedi.</div>;

  const tabCls = (k) => `px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === k ? "bg-[#100481] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">🏕 Deneme Kampı Yönetimi</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Landing page içeriğini düzenle, başvuruları görüntüle</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/${content.slug || "deneme-kampi"}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl border border-[#e5e7eb] text-sm font-bold text-[#374151] hover:bg-[#f8fafc] transition-all"
          >
            🔗 Sayfayı Gör
          </a>
          {tab === "content" && (
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2 bg-[#100481] text-white rounded-xl text-sm font-bold hover:bg-[#0a0260] transition-all disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "💾 Kaydet"}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${msg.type === "success" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef2f2] text-[#991b1b]"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 border border-[#f1f5f9] shadow-sm">
        <button className={tabCls("content")} onClick={() => setTab("content")}>✏️ İçerik</button>
        <button className={tabCls("applications")} onClick={() => setTab("applications")}>
          📋 Başvurular {quotaInfo.total > 0 && <span className="ml-1 bg-[#f39c12] text-white text-xs px-2 py-0.5 rounded-full">{quotaInfo.total}</span>}
        </button>
      </div>

      {/* ─── CONTENT TAB ─── */}
      {tab === "content" && (
        <div className="space-y-5">
          {/* Genel Ayarlar */}
          <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm space-y-4">
            <h3 className="font-black text-[#0f172a] text-sm uppercase tracking-wide">Genel Ayarlar</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!content.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="w-5 h-5 accent-[#100481]"
              />
              <div>
                <span className="font-bold text-[#0f172a] text-sm">Kampanya Aktif</span>
                <p className="text-xs text-[#64748b]">Kapalıysa sayfada "Kamp şu an aktif değil" mesajı gösterilir.</p>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">Sayfa Adı</label>
                <input
                  className={inputCls}
                  placeholder="Deneme Kampı"
                  value={content.name || ""}
                  onChange={(e) => set("name", e.target.value)}
                />
                <p className="text-xs text-[#9ca3af] mt-1">Admin menüsündeki görünen isim</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">URL Slug</label>
                <div className="flex items-center gap-0">
                  <span className="px-3 py-2.5 bg-[#f1f5f9] border border-r-0 border-[#e5e7eb] rounded-l-xl text-xs text-[#64748b] whitespace-nowrap">sozderecekocluk.com/</span>
                  <input
                    className="flex-1 px-3 py-2.5 rounded-r-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] placeholder:text-[#9ca3af] focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white"
                    placeholder="deneme-kampi"
                    value={content.slug || ""}
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  />
                </div>
                <p className="text-xs text-[#9ca3af] mt-1">Kaydetdikten sonra yeni URL aktif olur</p>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm space-y-3">
            <h3 className="font-black text-[#0f172a] text-sm uppercase tracking-wide">Hero Bölümü</h3>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Başlık</label>
              <input className={inputCls} value={content.hero?.title || ""} onChange={(e) => set("hero.title", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Alt Başlık</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={content.hero?.subtitle || ""} onChange={(e) => set("hero.subtitle", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Video URL (YouTube embed veya boş)</label>
              <input className={inputCls} placeholder="https://www.youtube.com/embed/..." value={content.hero?.videoUrl || ""} onChange={(e) => set("hero.videoUrl", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Buton Metni</label>
              <input className={inputCls} value={content.hero?.buttonText || ""} onChange={(e) => set("hero.buttonText", e.target.value)} />
            </div>
          </div>

          {/* Camp */}
          <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm space-y-3">
            <h3 className="font-black text-[#0f172a] text-sm uppercase tracking-wide">Kamp Bölümü</h3>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Başlık</label>
              <input className={inputCls} value={content.camp?.title || ""} onChange={(e) => set("camp.title", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Açıklama</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={content.camp?.description || ""} onChange={(e) => set("camp.description", e.target.value)} />
            </div>
          </div>

          {/* Offer */}
          <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm space-y-3">
            <h3 className="font-black text-[#0f172a] text-sm uppercase tracking-wide">Teklif & Fiyat</h3>
            <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">Fiyat (₺)</label>
                <input className={inputCls} type="number" value={content.offer?.price || ""} onChange={(e) => set("offer.price", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">Kontenjan</label>
                <input className={inputCls} type="number" value={content.offer?.maxQuota || ""} onChange={(e) => set("offer.maxQuota", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">YKS Tarihi (Geri sayım)</label>
                <input className={inputCls} type="date" value={content.offer?.yksDate || ""} onChange={(e) => set("offer.yksDate", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">Başlık</label>
                <input className={inputCls} value={content.offer?.title || ""} onChange={(e) => set("offer.title", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Dahil olanlar (her satır bir madde)</label>
              <textarea
                className={`${inputCls} resize-none font-mono text-xs`}
                rows={6}
                value={(content.offer?.includes || []).join("\n")}
                onChange={(e) => set("offer.includes", e.target.value.split("\n").filter(Boolean))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Garantiler (her satır bir madde)</label>
              <textarea
                className={`${inputCls} resize-none font-mono text-xs`}
                rows={3}
                value={(content.offer?.guarantees || []).join("\n")}
                onChange={(e) => set("offer.guarantees", e.target.value.split("\n").filter(Boolean))}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── APPLICATIONS TAB ─── */}
      {tab === "applications" && (
        <div className="space-y-4">
          {/* Quota */}
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
