import { useCallback, useEffect, useState } from "react";
import axios from "../utils/axios";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm text-[#0f172a] focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all bg-white";

const emptyForm = { email: "", phone: "", unitPriceTL: "", label: "", note: "", active: true };

const AdminPriceLocksPage = () => {
  const [locks, setLocks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [q, setQ] = useState("");

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
  const showMsg = (m) => {
    setMessage(m);
    setTimeout(() => setMessage(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/price-locks", { headers: headers() });
      setLocks(res.data.locks || []);
    } catch {
      showMsg("Liste alınamadı.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (l) => {
    setEditingId(l.id);
    setForm({
      email: l.email || "",
      phone: l.phone || "",
      unitPriceTL: String(l.unitPrice / 100),
      label: l.label || "",
      note: l.note || "",
      active: l.active,
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`/api/admin/price-locks/${editingId}`, form, { headers: headers() });
      else await axios.post("/api/admin/price-locks", form, { headers: headers() });
      setShowForm(false);
      showMsg("Kaydedildi.");
      load();
    } catch (err) {
      showMsg(err?.response?.data?.message || "Kaydedilemedi.");
    }
  };

  const remove = async (l) => {
    if (!window.confirm(`${l.email || l.phone} kaydı silinsin mi? Bu kişi artık devam fiyatından ödeme yapamaz.`)) return;
    try {
      await axios.delete(`/api/admin/price-locks/${l.id}`, { headers: headers() });
      load();
    } catch {
      showMsg("Silinemedi.");
    }
  };

  const toggleActive = async (l) => {
    try {
      await axios.put(
        `/api/admin/price-locks/${l.id}`,
        { email: l.email, phone: l.phone, unitPriceTL: l.unitPrice / 100, label: l.label, note: l.note, active: !l.active },
        { headers: headers() }
      );
      load();
    } catch {
      showMsg("Güncellenemedi.");
    }
  };

  const term = q.trim().toLowerCase();
  const shown = term
    ? locks.filter((l) => [l.email, l.phone, l.label, l.note].some((v) => (v || "").toLowerCase().includes(term)))
    : locks;

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <h2 className="font-fredoka font-bold text-xl text-[#0f172a]">Kilitli Fiyatlar</h2>
          <p className="text-sm text-[#64748b] mt-1 max-w-[560px]">
            Koçluğa başladığı fiyatı koruyacak öğrenciler. Kaydı olan kişi{" "}
            <span className="font-semibold">/mevcut-ogrenci-devam</span> sayfasından kendi fiyatıyla ödeme yapar; liste fiyatı değişse bile
            bu fiyat sabit kalır.
          </p>
        </div>
        <button onClick={startNew} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1C1B8A" }}>
          + Yeni Kayıt
        </button>
      </div>

      {message && <p className="text-sm text-[#059669] mb-3">{message}</p>}

      {showForm && (
        <form onSubmit={save} className="bg-white border border-[#e5e7eb] rounded-2xl p-5 my-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-[#475569]">E-posta</label>
            <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569]">Telefon</label>
            <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569]">Aylık fiyat (TL)</label>
            <input className={inputCls} type="number" min="1" step="1" value={form.unitPriceTL} onChange={(e) => setForm({ ...form, unitPriceTL: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569]">Grup etiketi</label>
            <input className={inputCls} placeholder="3.000 TL grubu" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[#475569]">Not</label>
            <input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#334155] sm:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1C1B8A" }}>
              Kaydet
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm border border-[#e5e7eb]">
              Vazgeç
            </button>
          </div>
        </form>
      )}

      <input className={`${inputCls} my-3 max-w-[320px]`} placeholder="Ara: e-posta, telefon, etiket" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#64748b] border-b border-[#e5e7eb]">
              <th className="p-3">Kişi</th>
              <th className="p-3">Aylık</th>
              <th className="p-3">Grup</th>
              <th className="p-3">Durum</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[#94a3b8]">Kayıt yok.</td>
              </tr>
            )}
            {shown.map((l) => (
              <tr key={l.id} className="border-b border-[#f1f5f9] last:border-0">
                <td className="p-3">
                  <div className="font-semibold text-[#0f172a]">{l.email || "—"}</div>
                  <div className="text-xs text-[#94a3b8]">{l.phone || ""}</div>
                </td>
                <td className="p-3 font-semibold">{(l.unitPrice / 100).toLocaleString("tr-TR")} ₺</td>
                <td className="p-3 text-[#475569]">{l.label || "—"}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(l)} className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.active ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                    {l.active ? "Aktif" : "Pasif"}
                  </button>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(l)} className="text-xs underline text-[#1C1B8A] mr-3">Düzenle</button>
                  <button onClick={() => remove(l)} className="text-xs underline text-[#dc2626]">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPriceLocksPage;
