import { useEffect, useState } from "react";
import axios from "../utils/axios";

const STATUS_META = {
  active: { label: "Aktif", cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
  past_due: { label: "Ödeme Bekleniyor", cls: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]" },
  cancelled: { label: "İptal Edildi", cls: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]" },
};

const getMeta = (sub) => {
  if (sub.status === "cancelled") return STATUS_META.cancelled;
  if (sub.status === "past_due") return STATUS_META.past_due;
  return STATUS_META.active;
};

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const token = () => localStorage.getItem("token");

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/subscriptions", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error("Abonelikler alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancel = async (sub) => {
    if (!window.confirm(`"${sub.user?.name || sub.user?.email}" kullanıcısının aboneliğini hemen iptal etmek istediğinize emin misiniz? (Dönem sonu beklenmez, anında durur.)`)) return;
    setCancellingId(sub.id);
    try {
      await axios.put(`/api/admin/subscriptions/${sub.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showMsg("✅ Abonelik iptal edildi.");
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
      showMsg("❌ Abonelik iptal edilemedi.");
    } finally {
      setCancellingId(null);
    }
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const mrr = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0) / 100;

  return (
    <div className="space-y-6">
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-sm font-semibold">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-black text-[#0f172a]">🔁 Abonelikler</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {activeCount} aktif abonelik · aylık tekrarlayan ciro (MRR): <strong>₺{mrr.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#64748b]">Yükleniyor...</p>
        ) : subscriptions.length === 0 ? (
          <p className="p-6 text-sm text-[#64748b]">Henüz abonelik yok.</p>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {subscriptions.map((sub) => {
              const meta = getMeta(sub);
              return (
                <div key={sub.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-[#0f172a] text-sm">{sub.planLabel}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.cls}`}>{meta.label}</span>
                      {sub.cancelAtPeriodEnd && sub.status !== "cancelled" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]">
                          Dönem sonunda duracak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748b]">
                      {sub.user?.name || "—"} · {sub.user?.email || "—"} · ₺{(sub.amount / 100).toFixed(2)}/ay
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Sonraki çekim: {sub.status === "cancelled" ? "—" : new Date(sub.nextBillingDate).toLocaleDateString("tr-TR")}
                      {sub.failedAttempts > 0 && ` · ${sub.failedAttempts} başarısız deneme`}
                    </p>
                    {sub.consentAt && (
                      <p className="text-[10px] text-[#cbd5e1] mt-0.5">
                        Rıza kaydı: {new Date(sub.consentAt).toLocaleString("tr-TR")} · IP: {sub.consentIp || "—"}
                        {" "}<span title={sub.consentText || ""}>(itiraz savunması için)</span>
                      </p>
                    )}
                  </div>
                  {sub.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancel(sub)}
                      disabled={cancellingId === sub.id}
                      className="px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-xl text-xs font-bold hover:bg-[#fee2e2] transition-all disabled:opacity-50 flex-shrink-0"
                    >
                      {cancellingId === sub.id ? "İptal ediliyor..." : "🛑 Hemen İptal Et"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
