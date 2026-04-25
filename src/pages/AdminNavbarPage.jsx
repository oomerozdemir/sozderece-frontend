import { useState, useEffect } from "react";
import axios from "../utils/axios";

const empty = {
  name: "",
  path: "",
  visible: true,
  isExternal: false,
  openInNew: false,
};

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

const token = () => localStorage.getItem("token");
const auth = () => ({ headers: { Authorization: `Bearer ${token()}` } });

export default function AdminNavbarPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // item being edited (or null = new)
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/admin/navbar", auth());
      setItems(res.data);
    } catch {
      flash("❌ Navbar öğeleri alınamadı.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, order: items.length });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      path: item.path,
      visible: item.visible,
      isExternal: item.isExternal,
      openInNew: item.openInNew,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(empty);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.path.trim()) {
      flash("❌ İsim ve yol zorunludur.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await axios.put(`/api/admin/navbar/${editing.id}`, form, auth());
        setItems((prev) => prev.map((i) => (i.id === editing.id ? res.data : i)));
        flash("✅ Bağlantı güncellendi.");
      } else {
        const res = await axios.post("/api/admin/navbar", { ...form, order: items.length }, auth());
        setItems((prev) => [...prev, res.data]);
        flash("✅ Bağlantı eklendi.");
      }
      closeForm();
    } catch {
      flash("❌ Kaydedilemedi.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.name}" bağlantısını silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/admin/navbar/${item.id}`, auth());
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      flash("✅ Bağlantı silindi.");
    } catch {
      flash("❌ Silinemedi.", "error");
    }
  };

  const handleToggleVisible = async (item) => {
    try {
      const res = await axios.put(
        `/api/admin/navbar/${item.id}`,
        { ...item, visible: !item.visible },
        auth()
      );
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.data : i)));
    } catch {
      flash("❌ Görünürlük değiştirilemedi.", "error");
    }
  };

  const move = async (index, direction) => {
    const next = [...items];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const reordered = next.map((item, i) => ({ ...item, order: i }));
    setItems(reordered);
    try {
      await axios.put(
        "/api/admin/navbar/reorder",
        { items: reordered.map(({ id, order }) => ({ id, order })) },
        auth()
      );
    } catch {
      flash("❌ Sıralama kaydedilemedi.", "error");
      fetchItems(); // geri al
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {msg && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold animate-fade-in ${
            msg.type === "success"
              ? "bg-[#1e293b] text-white"
              : "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Başlık + Ekle */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-[#0f172a]">🔗 Navbar Bağlantıları</h2>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-[#100481] text-white rounded-xl text-sm font-bold hover:bg-[#1d4ed8] transition-all"
        >
          + Yeni Bağlantı
        </button>
      </div>

      {/* Canlı Önizleme */}
      <div className="bg-[#0D0A2E] rounded-2xl px-6 py-4 flex items-center gap-6 overflow-x-auto border border-white/10">
        <span className="font-fredoka text-[#D8FF4F] text-xl tracking-wide select-none flex-shrink-0">
          SÖZDERECE
        </span>
        {items
          .filter((i) => i.visible)
          .map((item) => (
            <span
              key={item.id}
              className="text-white/70 font-nunito font-bold text-sm whitespace-nowrap"
            >
              {item.name}
            </span>
          ))}
        <span className="ml-auto bg-[#D8FF4F] text-[#0D0A2E] font-black text-xs py-1.5 px-4 rounded-full flex-shrink-0">
          Ücretsiz Görüşme →
        </span>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-[#94a3b8] text-sm">
            Henüz bağlantı yok. "+ Yeni Bağlantı" ile başlayın.
          </div>
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-[#f8fafc] transition-all"
              >
                {/* Sıra butonları */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="w-6 h-6 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] disabled:opacity-30 text-xs flex items-center justify-center font-bold text-[#475569] transition-all"
                    title="Yukarı taşı"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="w-6 h-6 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] disabled:opacity-30 text-xs flex items-center justify-center font-bold text-[#475569] transition-all"
                    title="Aşağı taşı"
                  >
                    ▼
                  </button>
                </div>

                {/* İsim + path */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0f172a] text-sm truncate">{item.name}</p>
                  <p className="text-xs text-[#64748b] font-mono truncate">{item.path}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.isExternal && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]">
                        Dış Link
                      </span>
                    )}
                    {item.openInNew && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                        Yeni Sekme
                      </span>
                    )}
                  </div>
                </div>

                {/* Görünürlük toggle */}
                <button
                  onClick={() => handleToggleVisible(item)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                    item.visible ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={item.visible ? "Gizle" : "Göster"}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      item.visible ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-xs text-[#94a3b8] w-10 text-right flex-shrink-0">
                  {item.visible ? "Görünür" : "Gizli"}
                </span>

                {/* Düzenle / Sil */}
                <button
                  onClick={() => openEdit(item)}
                  className="px-3 py-1.5 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded-xl text-xs font-bold hover:bg-[#dbeafe] transition-all flex-shrink-0"
                >
                  ✏️ Düzenle
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-xl text-xs font-bold hover:bg-[#fee2e2] transition-all flex-shrink-0"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            onClick={closeForm}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[480px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] z-[1001]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9]">
              <h3 className="font-black text-[#0f172a] text-base">
                {editing ? "Bağlantıyı Düzenle" : "Yeni Bağlantı Ekle"}
              </h3>
              <button
                onClick={closeForm}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] text-lg font-bold transition-all"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Görünen İsim <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="örn. YKS Koçluğu"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Yol / URL <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="örn. /deneme-kampi veya https://..."
                  value={form.path}
                  onChange={(e) => setForm({ ...form, path: e.target.value })}
                />
                <p className="text-[11px] text-[#94a3b8] mt-1">
                  İç sayfa için <code>/deneme-kampi</code>, dış link için tam URL girin.
                </p>
              </div>

              {/* Toggle grup */}
              <div className="space-y-3 p-4 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                {[
                  { key: "visible",    label: "Navbarda görünür",         desc: "Kapalıysa link menüde gizlenir." },
                  { key: "isExternal", label: "Dış bağlantı",             desc: "React Router yerine <a> etiketi kullanılır." },
                  { key: "openInNew",  label: "Yeni sekmede aç",          desc: "target=\"_blank\" eklenir." },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#334155]">{label}</p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, [key]: !form[key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                        form[key] ? "bg-[#100481]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                          form[key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#100481] to-[#2563eb] text-white rounded-xl text-sm font-black hover:shadow-[0_6px_16px_rgba(16,4,129,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : editing ? "💾 Güncelle" : "➕ Ekle"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="py-2.5 px-4 bg-[#f1f5f9] text-[#475569] rounded-xl text-sm font-bold hover:bg-[#e2e8f0] transition-all"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
