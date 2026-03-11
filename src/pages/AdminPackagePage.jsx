import { useEffect, useState } from "react";
import axios from "../utils/axios";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

const PACKAGE_TYPES = [
  { value: "tutoring_only", label: "Özel Ders" },
  { value: "hybrid_light", label: "Hibrit (Hafif)" },
  { value: "coaching_only", label: "Sadece Koçluk" },
  { value: "coaching_plus_tutoring", label: "Koçluk + Özel Ders" },
];

const emptyForm = {
  slug: "",
  name: "",
  description: "",
  price: "",
  unitPrice: "",
  priceText: "",
  oldPriceText: "",
  subtitle: "",
  type: "coaching_only",
  hidden: false,
  displayOrder: 0,
  ctaLabel: "Paketi seç",
  ctaHref: "",
  features: [],
  note: "",
  freeLessons: "",
};

const AdminPackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [editingPkg, setEditingPkg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newFeature, setNewFeature] = useState({ label: "", included: true });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = () => localStorage.getItem("token");

  const fetchPackages = async () => {
    try {
      const res = await axios.get("/api/admin/packages", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setPackages(res.data.packages || []);
    } catch (err) {
      console.error("Paketler alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const openCreate = () => {
    setEditingPkg(null);
    setForm({ ...emptyForm, features: [] });
    setShowForm(true);
  };

  const openEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      slug: pkg.slug || "",
      name: pkg.name || "",
      description: pkg.description || "",
      price: pkg.price || "",
      unitPrice: pkg.unitPrice || "",
      priceText: pkg.priceText || "",
      oldPriceText: pkg.oldPriceText || "",
      subtitle: pkg.subtitle || "",
      type: pkg.type || "coaching_only",
      hidden: pkg.hidden || false,
      displayOrder: pkg.displayOrder || 0,
      ctaLabel: pkg.ctaLabel || "",
      ctaHref: pkg.ctaHref || "",
      features: Array.isArray(pkg.features) ? [...pkg.features] : [],
      note: pkg.note || "",
      freeLessons: pkg.freeLessons || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.name) {
      showMsg("❌ Slug ve isim zorunludur.");
      return;
    }
    setLoading(true);
    try {
      if (editingPkg) {
        await axios.put(`/api/admin/packages/${editingPkg.id}`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        showMsg("✅ Paket güncellendi.");
      } else {
        await axios.post("/api/admin/packages", form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        showMsg("✅ Paket oluşturuldu.");
      }
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      console.error(err);
      showMsg("❌ İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (pkg) => {
    try {
      await axios.patch(`/api/admin/packages/${pkg.id}/toggle-visibility`, {}, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showMsg(`✅ "${pkg.name}" ${pkg.hidden ? "vitrinde gösteriliyor" : "vitrinden kaldırıldı"}.`);
      fetchPackages();
    } catch (err) {
      console.error(err);
      showMsg("❌ Görünürlük değiştirilemedi.");
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`"${pkg.name}" paketini silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/admin/packages/${pkg.id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showMsg("✅ Paket silindi.");
      fetchPackages();
    } catch (err) {
      console.error(err);
      showMsg("❌ Paket silinemedi.");
    }
  };

  const addFeature = () => {
    if (!newFeature.label.trim()) return;
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { label: newFeature.label, included: newFeature.included }],
    }));
    setNewFeature({ label: "", included: true });
  };

  const removeFeature = (idx) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-sm font-semibold">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#0f172a]">📦 Paket Yönetimi</h2>
          <p className="text-xs text-[#64748b] mt-0.5">Vitrine gösterilecek paketleri yönetin</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-[#100481] to-[#2563eb] text-white rounded-xl text-sm font-bold hover:shadow-[0_6px_16px_rgba(16,4,129,0.3)] hover:-translate-y-0.5 transition-all"
        >
          ➕ Yeni Paket
        </button>
      </div>

      {/* Package List */}
      <div className="grid gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all ${
              pkg.hidden ? "border-[#fecaca] opacity-60" : "border-[#f1f5f9]"
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-black text-[#0f172a] text-sm">{pkg.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569]">
                    {pkg.slug}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.hidden
                        ? "bg-[#fef2f2] text-[#991b1b]"
                        : "bg-[#ecfdf5] text-[#065f46]"
                    }`}
                  >
                    {pkg.hidden ? "Gizli" : "Vitrinde"}
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mb-2">{pkg.subtitle || pkg.description}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-black text-[#100481]">{pkg.priceText || `${pkg.price}₺`}</span>
                  {pkg.oldPriceText && (
                    <span className="text-xs text-[#94a3b8] line-through">{pkg.oldPriceText}</span>
                  )}
                  <span className="text-xs text-[#94a3b8]">Sıra: {pkg.displayOrder}</span>
                  <span className="text-xs text-[#94a3b8]">Tür: {pkg.type || "—"}</span>
                </div>
                {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {pkg.features.map((f, i) => (
                      <li key={i} className={`text-xs flex items-center gap-1 ${f.included ? "text-[#065f46]" : "text-[#94a3b8] line-through"}`}>
                        <span>{f.included ? "✓" : "✗"}</span> {f.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleVisibility(pkg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    pkg.hidden
                      ? "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] hover:bg-[#d1fae5]"
                      : "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa] hover:bg-[#ffedd5]"
                  }`}
                >
                  {pkg.hidden ? "👁 Göster" : "🙈 Gizle"}
                </button>
                <button
                  onClick={() => openEdit(pkg)}
                  className="px-3 py-1.5 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded-xl text-xs font-bold hover:bg-[#dbeafe] transition-all"
                >
                  ✏️ Düzenle
                </button>
                <button
                  onClick={() => handleDelete(pkg)}
                  className="px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-xl text-xs font-bold hover:bg-[#fee2e2] transition-all"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-10 text-center text-[#94a3b8] text-sm">
            Henüz paket eklenmemiş.
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[680px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] z-[1001]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9] sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-black text-[#0f172a]">
                {editingPkg ? "Paketi Düzenle" : "Yeni Paket Oluştur"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] text-lg font-bold transition-all"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Slug *</label>
                  <input
                    className={inputCls}
                    placeholder="kocluk-paketi-2026"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Paket Adı *</label>
                  <input
                    className={inputCls}
                    placeholder="Tam Kapsamlı Koçluk"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2 max-[560px]:col-span-1">
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Alt Başlık</label>
                  <input
                    className={inputCls}
                    placeholder="Kısa açıklama..."
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>
                <div className="col-span-2 max-[560px]:col-span-1">
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Açıklama</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Fiyat */}
              <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Fiyat (₺)</label>
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="2500"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Unit Price (kuruş)</label>
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="250000"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Fiyat Metni</label>
                  <input
                    className={inputCls}
                    placeholder="2500₺ / ay"
                    value={form.priceText}
                    onChange={(e) => setForm({ ...form, priceText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Eski Fiyat (üstü çizili)</label>
                  <input
                    className={inputCls}
                    placeholder="3000₺"
                    value={form.oldPriceText}
                    onChange={(e) => setForm({ ...form, oldPriceText: e.target.value })}
                  />
                </div>
              </div>

              {/* Tip & Sıra */}
              <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Paket Türü</label>
                  <select
                    className={inputCls}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {PACKAGE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Görüntüleme Sırası</label>
                  <input
                    className={inputCls}
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Buton Yazısı</label>
                  <input
                    className={inputCls}
                    placeholder="Paketi seç"
                    value={form.ctaLabel}
                    onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Buton Linki</label>
                  <input
                    className={inputCls}
                    placeholder="/pre-auth?slug=..."
                    value={form.ctaHref}
                    onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                  />
                </div>
              </div>

              {/* Not & Ücretsiz Ders */}
              <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Not</label>
                  <input
                    className={inputCls}
                    placeholder="Dipnot..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Ücretsiz Ders Hakkı</label>
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="2"
                    value={form.freeLessons}
                    onChange={(e) => setForm({ ...form, freeLessons: e.target.value })}
                  />
                </div>
              </div>

              {/* Görünürlük */}
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                <input
                  type="checkbox"
                  id="hidden-toggle"
                  checked={form.hidden}
                  onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
                  className="w-4 h-4 accent-[#100481]"
                />
                <label htmlFor="hidden-toggle" className="text-sm font-semibold text-[#475569] cursor-pointer">
                  Vitrinde gizle (müşteriler göremez)
                </label>
              </div>

              {/* Özellikler */}
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-2">Özellikler</label>
                <div className="space-y-2 mb-3">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-xs flex-shrink-0 ${f.included ? "text-[#065f46]" : "text-[#94a3b8]"}`}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      <span className={`text-xs flex-1 ${!f.included ? "line-through text-[#94a3b8]" : "text-[#334155]"}`}>
                        {f.label}
                      </span>
                      <button
                        onClick={() => removeFeature(i)}
                        className="text-[#ef4444] text-xs font-bold hover:text-[#dc2626] flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={`${inputCls} flex-1`}
                    placeholder="Özellik yazısı..."
                    value={newFeature.label}
                    onChange={(e) => setNewFeature({ ...newFeature, label: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  />
                  <select
                    className="px-3 py-2.5 rounded-xl border border-[#e5e7eb] text-xs font-bold outline-none bg-white"
                    value={newFeature.included ? "true" : "false"}
                    onChange={(e) => setNewFeature({ ...newFeature, included: e.target.value === "true" })}
                  >
                    <option value="true">✓ Var</option>
                    <option value="false">✗ Yok</option>
                  </select>
                  <button
                    onClick={addFeature}
                    className="px-3 py-2 bg-[#100481] text-white rounded-xl text-xs font-bold hover:bg-[#1d4ed8] transition-all"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 p-5 border-t border-[#f1f5f9] sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#100481] to-[#2563eb] text-white rounded-xl text-sm font-black hover:shadow-[0_6px_16px_rgba(16,4,129,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : editingPkg ? "💾 Güncelle" : "➕ Oluştur"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="py-2.5 px-4 bg-[#f1f5f9] text-[#475569] rounded-xl text-sm font-bold hover:bg-[#e2e8f0] transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPackagePage;
