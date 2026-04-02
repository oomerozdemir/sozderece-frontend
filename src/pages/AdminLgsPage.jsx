import { useState, useEffect } from "react";
import axios from "../utils/axios";

const TABS = [
  { key: "applications", label: "📋 Başvurular" },
  { key: "settings", label: "⚙️ Ayarlar" },
];

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminLgsPage() {
  const [tab, setTab] = useState("applications");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxQuota, setMaxQuota] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get("/api/admin/lgs-applications", { headers: authHeaders() })
      .then((r) => {
        setData(r.data);
        setMaxQuota(r.data.maxQuota || 10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleExport = () => {
    const token = localStorage.getItem("token");
    window.open(`/api/admin/lgs-applications/export?token=${token}`, "_blank");
  };

  const handleSaveQuota = async () => {
    setSaving(true);
    try {
      await axios.put("/api/admin/settings/lgs", { maxQuota }, { headers: authHeaders() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      load();
    } catch {
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const tabCls = (key) =>
    tab === key
      ? "px-3 py-2 rounded-xl text-xs font-bold bg-[#100481] text-white shadow transition-all"
      : "px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-all";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">📚 LGS Hazırlık Başvuruları</h2>
          <p className="text-xs text-[#64748b] mt-0.5">/lgs-hazirlik sayfasından gelen başvurular</p>
        </div>
        {data && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-[#3b82f6] font-semibold">Toplam</p>
              <p className="text-xl font-black text-[#1d4ed8]">{data.total}</p>
            </div>
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-[#059669] font-semibold">Kalan</p>
              <p className="text-xl font-black text-[#065f46]">{data.remainingQuota}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-2 flex gap-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tabCls(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BAŞVURULAR ── */}
      {tab === "applications" && (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
            <p className="text-sm font-bold text-[#0f172a]">
              {data ? `${data.total} başvuru` : "Yükleniyor..."}
            </p>
            <button
              onClick={handleExport}
              className="text-xs font-bold bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:text-[#0f172a] px-3 py-1.5 rounded-lg transition-colors"
            >
              ⬇ CSV İndir
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
          ) : !data?.applications?.length ? (
            <div className="py-12 text-center text-[#94a3b8] text-sm">Henüz başvuru yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-xs font-bold text-[#64748b] uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Ad Soyad</th>
                    <th className="px-4 py-3 text-left">Telefon</th>
                    <th className="px-4 py-3 text-left">Sınıf</th>
                    <th className="px-4 py-3 text-left">Mesaj</th>
                    <th className="px-4 py-3 text-left">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((app, i) => (
                    <tr key={app.id} className={`border-t border-[#f1f5f9] ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} hover:bg-[#eff6ff] transition-colors`}>
                      <td className="px-4 py-3 text-[#94a3b8] text-xs">{app.id}</td>
                      <td className="px-4 py-3 font-semibold text-[#0f172a]">{app.name}</td>
                      <td className="px-4 py-3 text-[#475569]">
                        <a href={`tel:${app.phone}`} className="hover:text-[#100481]">{app.phone}</a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold px-2 py-0.5 rounded-full">{app.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-[#64748b] max-w-[200px] truncate">{app.message || "—"}</td>
                      <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── AYARLAR ── */}
      {tab === "settings" && (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 space-y-5 max-w-sm">
          <div>
            <p className="text-sm font-black text-[#0f172a] mb-1">Maksimum Kontenjan</p>
            <p className="text-xs text-[#64748b] mb-3">
              Sayfada "🔥 Sadece X yer kaldı" olarak gösterilir. Kalan = Maksimum − Başvuru sayısı.
            </p>
            <input
              type="number"
              min={1}
              max={100}
              value={maxQuota}
              onChange={(e) => setMaxQuota(parseInt(e.target.value) || 10)}
              className="w-full border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:border-[#100481]"
            />
            {data && (
              <p className="text-xs text-[#64748b] mt-2">
                Şu an {data.total} başvuru var → kalan: <strong>{Math.max(0, maxQuota - data.total)}</strong>
              </p>
            )}
          </div>
          <button
            onClick={handleSaveQuota}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#100481] hover:bg-[#0a0357] text-white font-bold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : saved ? "✅ Kaydedildi" : "💾 Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}
