import React, { useState, useEffect, useMemo } from "react";
import axios from "../utils/axios";
import Button from "../components/ui/Button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchContacts = () => {
    setLoading(true);
    axios
      .get("/api/admin/contacts", { headers: authHeaders() })
      .then((res) => setContacts(res.data.contacts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [contacts, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu randevu talebini silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`/api/admin/contacts/${id}`, { headers: authHeaders() });
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Silinemedi.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">Ücretsiz Görüşme Talepleri</h2>
          <p className="text-xs text-[#64748b] mt-0.5">"Ücretsiz ön görüşme" formundan gelen randevu talepleri</p>
        </div>
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-[#3b82f6] font-semibold">Toplam</p>
          <p className="text-xl font-black text-[#1d4ed8]">{contacts.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, telefon veya e-posta ara..."
            className="w-full max-w-sm px-3 py-2 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
        ) : !filtered.length ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">
            {contacts.length ? "Aramayla eşleşen kayıt yok." : "Henüz randevu talebi yok."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs font-bold text-[#64748b] uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 py-3 text-left">Durum</th>
                  <th className="px-4 py-3 text-left">İletişim</th>
                  <th className="px-4 py-3 text-left">Randevu</th>
                  <th className="px-4 py-3 text-left">Mesaj</th>
                  <th className="px-4 py-3 text-left">Oluşturulma</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const hasProfile = c.role || c.examType || (c.challenges && c.challenges.length) || c.goal || (c.supportAreas && c.supportAreas.length) || c.studyRoutine || c.lastExamResult;
                  const isOpen = expandedId === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      <tr className={`border-t border-[#f1f5f9] ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} hover:bg-[#eff6ff] transition-colors`}>
                        <td className="px-4 py-3 text-[#94a3b8] text-xs">{c.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#0f172a]">{c.name}</td>
                        <td className="px-4 py-3">
                          {c.role || c.examType || c.gradeStatus ? (
                            <span className="bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              {[c.role, c.examType, c.gradeStatus].filter(Boolean).join(" · ")}
                            </span>
                          ) : (
                            <span className="bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold px-2 py-0.5 rounded-full">{c.userType || "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#475569]">
                          <a href={`tel:${c.phone}`} className="hover:text-brand-navy block">{c.phone}</a>
                          {c.email && <a href={`mailto:${c.email}`} className="hover:text-brand-navy text-xs text-[#94a3b8]">{c.email}</a>}
                        </td>
                        <td className="px-4 py-3 text-[#475569] whitespace-nowrap">
                          {c.meetingDate || "—"} {c.meetingTime && <span className="text-xs text-[#94a3b8]">{c.meetingTime}</span>}
                        </td>
                        <td className="px-4 py-3 text-[#64748b] max-w-[200px] truncate">{c.message || "—"}</td>
                        <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {hasProfile && (
                              <button
                                onClick={() => setExpandedId(isOpen ? null : c.id)}
                                className="w-7 h-7 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] flex-shrink-0"
                                aria-label={isOpen ? "Detayı gizle" : "Rota Sistemi profilini göster"}
                              >
                                {isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                              </button>
                            )}
                            <Button onClick={() => handleDelete(c.id)} variant="danger" size="sm">Sil</Button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && hasProfile && (
                        <tr className="border-t border-[#f1f5f9] bg-[#fafaff]">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              {c.studyRoutine && (
                                <DetailField label="Çalışma Düzeni" value={c.studyRoutine} />
                              )}
                              {c.lastExamResult && (
                                <DetailField label="Son Deneme Sonucu" value={c.lastExamResult} />
                              )}
                              {c.challenges?.length > 0 && (
                                <DetailField
                                  label="Zorlandığı Noktalar"
                                  value={c.challenges.map((ch) => (ch === "Diğer" && c.challengesOther ? `Diğer: ${c.challengesOther}` : ch)).join(" · ")}
                                />
                              )}
                              {c.goal && <DetailField label="Hedefi" value={c.goal} />}
                              {c.supportAreas?.length > 0 && (
                                <DetailField
                                  label="Beklediği Destek"
                                  value={c.supportAreas.map((s) => (s === "Diğer" && c.supportAreasOther ? `Diğer: ${c.supportAreasOther}` : s)).join(" · ")}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function DetailField({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#f1f5f9] px-3.5 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8] mb-1">{label}</p>
      <p className="text-sm text-[#334155] leading-relaxed">{value}</p>
    </div>
  );
}

export default AdminContactsPage;
