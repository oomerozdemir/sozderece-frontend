import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaBoxOpen, FaHistory, FaSyncAlt, FaCalendarAlt } from "react-icons/fa";

const fmtDate = (d) => (d ? new Date(d).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "");

const isCoachingOrder = (o = {}) => {
  const t = (o.type || o.category || "").toString().toLowerCase();
  if (["coaching", "coach", "koçluk", "kocluk", "coaching_package"].some((k) => t.includes(k))) return true;
  const name = (o.package || o.packageTitle || o.title || "").toString().toLowerCase();
  return ["koçluk", "kocluk", "coach", "koç"].some((k) => name.includes(k));
};

const normalizeOrders = (list = []) =>
  list.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    endDate: o.endDate,
    amountTL: typeof o.totalPrice === "number" ? o.totalPrice : typeof o.amount === "number" ? Math.round(o.amount / 100) : null,
    package: o.package || o.packageTitle || o.title,
  }));

const STATUS_META = {
  paid: { label: "Ödendi", cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
  active: { label: "Aktif", cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
  pending: { label: "Ödeme Bekliyor", cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
  pending_payment: { label: "Ödeme Bekliyor", cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
  failed: { label: "Başarısız", cls: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" },
  cancelled: { label: "İptal", cls: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]" },
  refunded: { label: "İade Edildi", cls: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" },
  refund_requested: { label: "İade Talep Edildi", cls: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]" },
};

function EmptyState({ icon, text }) {
  return (
    <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center">
      <div className="text-2xl mb-2 opacity-40">{icon}</div>
      <p className="font-nunito text-sm text-[#94a3b8]">{text}</p>
    </div>
  );
}

export default function Siparislerim() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [pastLessons, setPastLessons] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pastLoading, setPastLoading] = useState(false);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await axios.get("/api/my-orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(normalizeOrders(data?.orders || []));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadPast = async () => {
    setPastLoading(true);
    try {
      const { data } = await axios.get("/api/v1/ogrenci/me/appointments/past", { headers: { Authorization: `Bearer ${token}` } });
      setPastLessons(data?.items || []);
    } catch {
      setPastLessons([]);
    } finally {
      setPastLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadPast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coachingOrders = orders.filter(isCoachingOrder);
  const isAnyLoading = ordersLoading || pastLoading;
  const tabCls = (t) =>
    `inline-flex items-center gap-2 font-fredoka font-bold text-sm px-5 py-2.5 rounded-full transition-all ${
      tab === t ? "text-white shadow-[0_6px_16px_rgba(28,27,138,0.25)]" : "bg-white text-[#475569] border border-[#e5e7eb] hover:border-page-navy/30"
    }`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => setTab("orders")} className={tabCls("orders")} style={tab === "orders" ? { background: "#1C1B8A" } : undefined}>
          <FaBoxOpen /> Koçluk Siparişlerim
        </button>
        <button onClick={() => setTab("past")} className={tabCls("past")} style={tab === "past" ? { background: "#1C1B8A" } : undefined}>
          <FaHistory /> Geçmiş Derslerim
        </button>
        <button
          onClick={() => (tab === "orders" ? loadOrders() : loadPast())}
          disabled={isAnyLoading}
          className="ml-auto inline-flex items-center gap-2 font-fredoka font-bold text-xs px-4 py-2.5 rounded-full transition-all disabled:opacity-60"
          style={{ background: "rgba(216,255,79,0.15)", color: "#7340C8" }}
        >
          <FaSyncAlt className={isAnyLoading ? "animate-spin" : ""} /> {isAnyLoading ? "Yükleniyor…" : "Yenile"}
        </button>
      </div>

      {tab === "orders" ? (
        ordersLoading ? (
          <EmptyState icon="⏳" text="Yükleniyor…" />
        ) : coachingOrders.length === 0 ? (
          <EmptyState icon="📦" text="Koçluk siparişiniz bulunmuyor." />
        ) : (
          <div className="grid gap-3">
            {coachingOrders.map((o) => {
              const meta = STATUS_META[o.status?.toLowerCase?.()] || { label: o.status || "—", cls: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]" };
              return (
                <div key={o.id} className="bg-white border border-[#f1f5f9] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-fredoka font-bold text-page-navy text-base">{o.package || "Koçluk Paketi"}</p>
                      <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">Sipariş #{o.id} · {fmtDate(o.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap text-xs font-nunito text-[#475569] pt-3 border-t border-[#f1f5f9]">
                    <span><strong className="text-[#0f172a]">Tutar:</strong> {typeof o.amountTL === "number" ? `${o.amountTL.toLocaleString("tr-TR")} ₺` : "—"}</span>
                    {o.endDate && <span><strong className="text-[#0f172a]">Bitiş:</strong> {fmtDate(o.endDate)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : pastLoading ? (
        <EmptyState icon="⏳" text="Yükleniyor…" />
      ) : pastLessons.length === 0 ? (
        <EmptyState icon="🗓" text="Geçmiş dersiniz bulunmuyor." />
      ) : (
        <div className="grid gap-3">
          {pastLessons.map((a) => (
            <div key={a.id} className="bg-white border border-[#f1f5f9] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(216,255,79,0.15)", color: "#7340C8" }}>
                <FaCalendarAlt />
              </div>
              <div className="min-w-0">
                <p className="font-nunito font-bold text-[#0f172a] text-sm truncate">{fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}</p>
                <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">{a.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
