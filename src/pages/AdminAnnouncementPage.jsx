import { useEffect, useState } from "react";
import axios from "../utils/axios";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all bg-white";

const emptyForm = { title: "", body: "", targetTrack: "", targetGrade: "", expiresAt: "", hidden: false };

const AdminAnnouncementPage = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);

  const token = () => localStorage.getItem("token");
  const showMsg = (m) => { setMessage(m); setTimeout(() => setMessage(null), 3000); };

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/admin/announcements", { headers: { Authorization: `Bearer ${token()}` } });
      setItems(res.data.announcements || []);
    } catch (err) {
      console.error("Duyurular alınamadı:", err);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title, body: a.body,
      targetTrack: a.targetTrack || "", targetGrade: a.targetGrade || "",
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : "", hidden: a.hidden || false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.body) return showMsg("Başlık ve içerik zorunludur.");
    try {
      if (editing) {
        await axios.put(`/api/admin/announcements/${editing.id}`, form, { headers: { Authorization: `Bearer ${token()}` } });
        showMsg("Duyuru güncellendi.");
      } else {
        await axios.post("/api/admin/announcements", form, { headers: { Authorization: `Bearer ${token()}` } });
        showMsg("Duyuru yayınlandı.");
      }
      setShowForm(false);
      fetchItems();
    } catch {
      showMsg("İşlem başarısız.");
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`"${a.title}" duyurusunu silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/admin/announcements/${a.id}`, { headers: { Authorization: `Bearer ${token()}` } });
      showMsg("Duyuru silindi.");
      fetchItems();
    } catch {
      showMsg("Silinemedi.");
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-sm font-semibold">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#0f172a]">📣 Gündem / Duyurular</h2>
          <p className="text-xs text-[#64748b] mt-0.5">Öğrenci panelinde "Gündem" sekmesinde görünen kısa duyuru akışı</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-gradient-to-r from-brand-navy to-[#2563eb] text-white rounded-xl text-sm font-bold hover:shadow-[0_6px_16px_rgba(16,4,129,0.3)] transition-all">
          ➕ Yeni Duyuru
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((a) => (
          <div key={a.id} className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-start justify-between gap-4 flex-wrap ${a.hidden ? "border-[#fecaca] opacity-60" : "border-[#f1f5f9]"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-black text-[#0f172a] text-sm">{a.title}</span>
                {a.hidden && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b]">Gizli</span>}
                {a.expiresAt && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#92400e]">Bitiş: {new Date(a.expiresAt).toLocaleDateString("tr-TR")}</span>}
              </div>
              <p className="text-xs text-[#64748b] mb-1 whitespace-pre-wrap">{a.body}</p>
              <p className="text-[11px] text-[#94a3b8]">
                {a.targetTrack ? a.targetTrack.toUpperCase() : "YKS+LGS"} · {a.targetGrade || "Tüm sınıflar"} · {new Date(a.publishedAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(a)} className="px-3 py-1.5 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded-xl text-xs font-bold hover:bg-[#dbeafe] transition-all">✏️ Düzenle</button>
              <button onClick={() => handleDelete(a)} className="px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-xl text-xs font-bold hover:bg-[#fee2e2] transition-all">🗑</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-10 text-center text-[#94a3b8] text-sm">Henüz duyuru yayınlanmamış.</div>
        )}
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" onClick={() => setShowForm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[560px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] z-[1001]">
            <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9]">
              <h3 className="font-black text-[#0f172a]">{editing ? "Duyuruyu Düzenle" : "Yeni Duyuru"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] text-lg">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">Başlık *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">İçerik *</label>
                <textarea className={`${inputCls} resize-none`} rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Sınav Türü</label>
                  <select className={inputCls} value={form.targetTrack} onChange={(e) => setForm({ ...form, targetTrack: e.target.value })}>
                    <option value="">YKS + LGS (hepsi)</option>
                    <option value="yks">Sadece YKS</option>
                    <option value="lgs">Sadece LGS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Sınıf</label>
                  <input className={inputCls} placeholder="Örn: 11 (boş = tüm sınıflar)" value={form.targetGrade} onChange={(e) => setForm({ ...form, targetGrade: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">Bitiş Tarihi (opsiyonel)</label>
                <input type="date" className={inputCls} value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                <input type="checkbox" id="ann-hidden" checked={form.hidden} onChange={(e) => setForm({ ...form, hidden: e.target.checked })} className="w-4 h-4 accent-brand-navy" />
                <label htmlFor="ann-hidden" className="text-sm font-semibold text-[#475569] cursor-pointer">Gizle (öğrenciler göremez)</label>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-[#f1f5f9]">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-brand-navy to-[#2563eb] text-white rounded-xl text-sm font-black">
                {editing ? "💾 Güncelle" : "➕ Yayınla"}
              </button>
              <button onClick={() => setShowForm(false)} className="py-2.5 px-4 bg-[#f1f5f9] text-[#475569] rounded-xl text-sm font-bold">İptal</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnnouncementPage;
