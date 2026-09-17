import { useState, useEffect, useMemo } from "react";
import axios from "../utils/axios";
import Button from "../components/ui/Button";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminWaitlistPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEntries = () => {
    setLoading(true);
    axios
      .get("/api/admin/waitlist", { headers: authHeaders() })
      .then((res) => setEntries(res.data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter(
      (e) => e.name?.toLowerCase().includes(term) || e.email?.toLowerCase().includes(term) || e.phone?.toLowerCase().includes(term)
    );
  }, [entries, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu bekleme listesi kaydını silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`/api/admin/waitlist/${id}`, { headers: authHeaders() });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Silinemedi.");
    }
  };

  const exportCsv = () => {
    const rows = [["Ad Soyad", "E-posta", "Telefon", "Kaynak", "Tarih"]];
    filtered.forEach((e) => rows.push([e.name, e.email, e.phone || "", e.source, new Date(e.createdAt).toLocaleString("tr-TR")]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bekleme-listesi.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">🔔 Bekleme Listesi</h2>
          <p className="text-xs text-[#64748b] mt-0.5">Kayıtları kapanan atölye/teklif sayfalarından bırakılan "haber ver" kayıtları</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-[#3b82f6] font-semibold">Toplam</p>
            <p className="text-xl font-black text-[#1d4ed8]">{entries.length}</p>
          </div>
          <Button onClick={exportCsv} variant="secondary" size="sm">⬇ CSV İndir</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, e-posta veya telefon ara..."
            className="w-full max-w-sm px-3 py-2 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
        ) : !filtered.length ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">
            {entries.length ? "Aramayla eşleşen kayıt yok." : "Henüz bekleme listesi kaydı yok."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs font-bold text-[#64748b] uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 py-3 text-left">İletişim</th>
                  <th className="px-4 py-3 text-left">Kaynak</th>
                  <th className="px-4 py-3 text-left">Oluşturulma</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} className={`border-t border-[#f1f5f9] ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} hover:bg-[#eff6ff] transition-colors`}>
                    <td className="px-4 py-3 text-[#94a3b8] text-xs">{e.id}</td>
                    <td className="px-4 py-3 font-semibold text-[#0f172a]">{e.name}</td>
                    <td className="px-4 py-3 text-[#475569]">
                      <a href={`mailto:${e.email}`} className="hover:text-brand-navy block">{e.email}</a>
                      {e.phone && <a href={`tel:${e.phone}`} className="hover:text-brand-navy text-xs text-[#94a3b8]">{e.phone}</a>}
                    </td>
                    <td className="px-4 py-3 text-[#64748b] text-xs max-w-[220px] truncate">{e.source}</td>
                    <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button onClick={() => handleDelete(e.id)} variant="danger" size="sm">Sil</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWaitlistPage;
