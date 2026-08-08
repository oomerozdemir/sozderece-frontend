import { useState, useEffect, useCallback } from "react";
import axios from "../utils/axios";
import Button from "../components/ui/Button";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CATEGORY_LABELS = {
  PDR_GRADUATE: "PDR Mezunu",
  PDR_STUDENT: "PDR Öğrencisi",
  UNIVERSITY_STUDENT: "Üniversite Öğrencisi",
};

const STATUS_META = {
  PENDING: { label: "Bekliyor", bg: "bg-[#fef9c3]", text: "text-[#854d0e]" },
  REVIEWED: { label: "İncelendi", bg: "bg-[#eff6ff]", text: "text-[#1d4ed8]" },
  ACCEPTED: { label: "Kabul Edildi", bg: "bg-[#ecfdf5]", text: "text-[#065f46]" },
  REJECTED: { label: "Reddedildi", bg: "bg-[#fef2f2]", text: "text-[#991b1b]" },
};

const STATUS_OPTIONS = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];
const LIMIT = 20;

const AdminInstructorApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (statusFilter !== "all") params.status = statusFilter;
    axios
      .get("/api/v1/applications", { headers: authHeaders(), params })
      .then((res) => {
        setApplications(res.data.applications || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.patch(`/api/v1/applications/${id}/status`, { status }, { headers: authHeaders() });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch {
      alert("Durum güncellenemedi.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">Eğitmen Başvuruları</h2>
          <p className="text-xs text-[#64748b] mt-0.5">"/basvuru" formundan gelen eğitmen adaylığı başvuruları</p>
        </div>
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-[#3b82f6] font-semibold">Toplam</p>
          <p className="text-xl font-black text-[#1d4ed8]">{total}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-brand-navy bg-white"
          >
            <option value="all">Tüm Durumlar</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
        ) : !applications.length ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">Başvuru yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs font-bold text-[#64748b] uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 py-3 text-left">İletişim</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Üniversite / Bölüm</th>
                  <th className="px-4 py-3 text-left">CV</th>
                  <th className="px-4 py-3 text-left">Tarih</th>
                  <th className="px-4 py-3 text-left">Durum</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a, i) => (
                  <tr key={a.id} className={`border-t border-[#f1f5f9] ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} hover:bg-[#eff6ff] transition-colors align-top`}>
                    <td className="px-4 py-3 font-semibold text-[#0f172a] whitespace-nowrap">{a.firstName} {a.lastName}</td>
                    <td className="px-4 py-3 text-[#475569]">
                      <a href={`mailto:${a.email}`} className="hover:text-brand-navy block">{a.email}</a>
                      <a href={`tel:${a.phone}`} className="hover:text-brand-navy text-xs text-[#94a3b8]">{a.phone}</a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-[#f1f5f9] text-[#475569] text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {CATEGORY_LABELS[a.category] || a.category}
                      </span>
                      {a.ranking && <div className="text-xs text-[#94a3b8] mt-1">YKS: {a.ranking}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {a.university || "—"}
                      {a.department && <div className="text-xs text-[#94a3b8]">{a.department}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {a.cvUrl ? (
                        <a href={a.cvUrl} target="_blank" rel="noopener noreferrer" className="text-brand-navy font-bold text-xs hover:underline">
                          CV Görüntüle
                        </a>
                      ) : (
                        <span className="text-xs text-[#cbd5e1]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        disabled={updatingId === a.id}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border-0 outline-none ${STATUS_META[a.status]?.bg} ${STATUS_META[a.status]?.text} disabled:opacity-50`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-[#f1f5f9]">
            <Button variant="neutral" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Önceki</Button>
            <span className="text-xs font-semibold text-[#64748b]">Sayfa {page} / {totalPages}</span>
            <Button variant="neutral" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sonraki ›</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInstructorApplicationsPage;
