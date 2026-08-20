import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import {
  FaUserTie, FaEnvelope, FaPhoneAlt, FaWhatsapp, FaSyncAlt,
  FaBoxOpen, FaHistory, FaGraduationCap, FaCalendarAlt,
} from "react-icons/fa";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "";

/** Koçluk siparişi filtresi */
const isCoachingOrder = (o = {}) => {
  const t = (o.type || o.category || "").toString().toLowerCase();
  if (["coaching", "coach", "koçluk", "kocluk", "coaching_package"].some((k) => t.includes(k)))
    return true;

  const name = (o.package || o.packageTitle || o.title || "").toString().toLowerCase();
  if (["koçluk", "kocluk", "coach", "koç"].some((k) => name.includes(k))) return true;

  return false;
};

const normalizeOrdersNew = (list = []) =>
  list.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    endDate: o.endDate,
    amountTL:
      typeof o.totalPrice === "number"
        ? o.totalPrice
        : typeof o.amount === "number"
        ? Math.round(o.amount / 100)
        : null,
    package: o.package || o.packageTitle || o.title,
    type: o.type || o.category || null,
    raw: o,
  }));

const normalizeOrdersLegacy = (list = []) =>
  list.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    endDate: o.endDate,
    amountTL:
      typeof o.amountTL === "number"
        ? o.amountTL
        : typeof o.amount === "number"
        ? Math.round(o.amount / 100)
        : null,
    package: o.packageTitle || o.packageSlug || o.title || null,
    type: o.type || o.category || null,
    raw: o,
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

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("orders"); // "orders" | "past"
  const [loading, setLoading] = useState(true);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pastLoading, setPastLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [pastLessons, setPastLessons] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Profil
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/ogrenci/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
      } catch (e) {
        console.error("Öğrenci verisi alınamadı:", e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Siparişlerim (Koçluk)
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      try {
        const { data } = await axios.get("/api/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(normalizeOrdersNew(data?.orders || []));
      } catch (e1) {
        // Eski endpoint/yanıt uyumluluğu
        try {
          const { data } = await axios.get("api/my-orders", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
          setOrders(normalizeOrdersLegacy(list));
        } catch (e2) {
          console.error("Siparişler alınamadı:", e2?.message || e1?.message);
          setOrders([]);
        }
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  // Geçmiş derslerim
  const loadPastAppointments = async () => {
    try {
      setPastLoading(true);
      const { data } = await axios.get("/api/v1/ogrenci/me/appointments/past", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPastLessons(data?.items || []);
    } catch (e) {
      console.error("Geçmiş dersler alınamadı:", e?.message);
      setPastLessons([]);
    } finally {
      setPastLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadPastAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coachingOrders = (orders || []).filter(isCoachingOrder);
  const isAnyLoading = ordersLoading || pastLoading;

  const onRefresh = () => (tab === "orders" ? loadOrders() : loadPastAppointments());

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-nunito text-[#94a3b8] text-sm">Yükleniyor...</p>
      </div>
    );
  }
  if (!student) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-nunito text-[#94a3b8] text-sm">Öğrenci verisi bulunamadı.</p>
      </div>
    );
  }

  const tabCls = (t) =>
    `inline-flex items-center gap-2 font-fredoka font-bold text-sm px-5 py-2.5 rounded-full transition-all ${
      tab === t
        ? "text-white shadow-[0_6px_16px_rgba(28,27,138,0.25)]"
        : "bg-white text-[#475569] border border-[#e5e7eb] hover:border-page-navy/30"
    }`;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-5 py-12 max-[768px]:py-8">
        <div className="mb-8">
          <h1 className="font-fredoka font-bold text-page-navy text-2xl max-[640px]:text-xl">
            Merhaba, {student.name || "Öğrenci"} 👋
          </h1>
          <p className="font-nunito text-[#64748b] text-sm mt-1">
            Koçunu, siparişlerini ve geçmiş derslerini buradan takip edebilirsin.
          </p>
        </div>

        <div className="grid grid-cols-[340px_1fr] gap-6 max-[900px]:grid-cols-1">
          {/* Sol: Koç Kartı */}
          <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 h-fit">
            {!student.assignedCoach ? (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
                  style={{ background: "rgba(115,64,200,0.12)", color: "#7340C8" }}
                >
                  <FaUserTie />
                </div>
                <h3 className="font-fredoka font-bold text-page-navy text-lg mb-2">Henüz Koçun Yok</h3>
                <p className="font-nunito text-[#64748b] text-sm leading-relaxed mb-5">
                  Aşağıdaki seçeneklerle paketlerimizi inceleyebilir ya da ücretsiz bir ön görüşme planlayabilirsin.
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="/paket-detay"
                    className="text-center font-fredoka font-bold text-sm px-5 py-3 rounded-full transition-transform hover:scale-[1.02]"
                    style={{ background: "#1C1B8A", color: "white" }}
                  >
                    📦 Paketleri İncele
                  </a>
                  <a
                    href="/ucretsiz-on-gorusme"
                    className="text-center font-fredoka font-bold text-sm px-5 py-3 rounded-full transition-transform hover:scale-[1.02]"
                    style={{ background: "#D8FF4F", color: "#1C1B8A" }}
                  >
                    🗓️ Ücretsiz Ön Görüşme
                  </a>
                  <a
                    href="https://wa.me/905312546701"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 font-fredoka font-bold text-sm px-5 py-3 rounded-full border-2 transition-colors hover:bg-[#f0fdf4]"
                    style={{ borderColor: "#22c55e", color: "#15803d" }}
                  >
                    <FaWhatsapp /> WhatsApp Destek
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="font-fredoka font-bold text-accent-orange text-[11px] uppercase mb-3" style={{ letterSpacing: 3 }}>
                  Atanmış Koçun
                </p>
                <img
                  src={student.assignedCoach.image}
                  alt={student.assignedCoach.name}
                  className="w-24 h-24 object-cover rounded-full border-4 mx-auto mb-4 block"
                  style={{ borderColor: "#D8FF4F" }}
                />
                <h3 className="font-fredoka font-bold text-page-navy text-lg text-center mb-4">
                  {student.assignedCoach.name}
                </h3>
                <div className="space-y-2 mb-5">
                  {student.assignedCoach.subject && (
                    <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5">
                      <FaGraduationCap className="text-page-navy flex-shrink-0" />
                      <span className="font-nunito text-xs text-[#334155]">{student.assignedCoach.subject}</span>
                    </div>
                  )}
                  {student.assignedCoach.user?.email && (
                    <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5">
                      <FaEnvelope className="text-page-navy flex-shrink-0" />
                      <span className="font-nunito text-xs text-[#334155] truncate">{student.assignedCoach.user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5">
                    <FaPhoneAlt className="text-page-navy flex-shrink-0" />
                    <span className="font-nunito text-xs text-[#334155]">{student.assignedCoach.user?.phone || "Belirtilmemiş"}</span>
                  </div>
                </div>
                {student.assignedCoach.description && (
                  <p className="font-nunito text-xs text-[#64748b] leading-relaxed mb-5">{student.assignedCoach.description}</p>
                )}
                <a
                  href="https://wa.me/905312546701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-fredoka font-bold text-sm px-5 py-3 rounded-full transition-transform hover:scale-[1.02]"
                  style={{ background: "#22c55e", color: "white" }}
                >
                  <FaWhatsapp /> WhatsApp Destek
                </a>
              </>
            )}
          </div>

          {/* Sağ: Sekmeler */}
          <div>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <button onClick={() => setTab("orders")} className={tabCls("orders")} style={tab === "orders" ? { background: "#1C1B8A" } : undefined}>
                <FaBoxOpen /> Koçluk Siparişlerim
              </button>
              <button onClick={() => setTab("past")} className={tabCls("past")} style={tab === "past" ? { background: "#1C1B8A" } : undefined}>
                <FaHistory /> Geçmiş Derslerim
              </button>

              <button
                onClick={onRefresh}
                disabled={isAnyLoading}
                className="ml-auto inline-flex items-center gap-2 font-fredoka font-bold text-xs px-4 py-2.5 rounded-full transition-all disabled:opacity-60"
                style={{ background: "rgba(216,255,79,0.15)", color: "#7340C8" }}
                title="Yenile"
              >
                <FaSyncAlt className={isAnyLoading ? "animate-spin" : ""} />
                {isAnyLoading ? "Yükleniyor…" : "Yenile"}
              </button>
            </div>

            {tab === "orders" ? (
              <OrdersList loading={ordersLoading} orders={coachingOrders} />
            ) : (
              <PastLessons loading={pastLoading} items={pastLessons} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- parçalar ----------------- */

function EmptyState({ icon, text }) {
  return (
    <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center">
      <div className="text-2xl mb-2 opacity-40">{icon}</div>
      <p className="font-nunito text-sm text-[#94a3b8]">{text}</p>
    </div>
  );
}

function OrdersList({ loading, orders }) {
  if (loading) return <EmptyState icon="⏳" text="Yükleniyor…" />;
  if (orders.length === 0) return <EmptyState icon="📦" text="Koçluk siparişiniz bulunmuyor." />;

  return (
    <div className="grid gap-3">
      {orders.map((o) => {
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
  );
}

function PastLessons({ loading, items }) {
  if (loading) return <EmptyState icon="⏳" text="Yükleniyor…" />;
  if (items.length === 0) return <EmptyState icon="🗓" text="Geçmiş dersiniz bulunmuyor." />;

  return (
    <div className="grid gap-3">
      {items.map((a) => (
        <div key={a.id} className="bg-white border border-[#f1f5f9] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(216,255,79,0.15)", color: "#7340C8" }}
          >
            <FaCalendarAlt />
          </div>
          <div className="min-w-0">
            <p className="font-nunito font-bold text-[#0f172a] text-sm truncate">
              {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
            </p>
            <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">{a.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
