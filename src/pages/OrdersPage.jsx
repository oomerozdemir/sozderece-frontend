import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { format } from "date-fns";
import trLocale from "date-fns/locale/tr";
import RefundModal from "../components/RefundModal";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";

const badgeBase = "inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold w-max bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]";
const refundBtnBase = "inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border-0 bg-[#ffe69c] text-[#5a3e00] font-semibold cursor-pointer no-underline transition hover:brightness-[0.98] active:translate-y-px";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Abonelikler
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Siparişleri çek
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders);
      } catch {
        console.error("Siparişler alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);


  // Abonelikleri çek
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/subscriptions/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptions(data?.subscriptions || []);
      } catch (e) {
        console.warn("subscriptions fetch failed", e);
        setSubscriptions([]);
      } finally {
        setSubsLoading(false);
      }
    })();
  }, []);

  const subscriptionStatusMeta = (sub) => {
    if (sub.status === "cancelled") return { label: "İptal Edildi", variant: "bg-[rgba(55,65,81,0.08)] text-[#374151] border-[rgba(55,65,81,0.2)]" };
    if (sub.status === "past_due") return { label: "Ödeme Bekleniyor", variant: "bg-[rgba(217,119,6,0.10)] text-[#d97706] border-[rgba(217,119,6,0.25)]" };
    if (sub.cancelAtPeriodEnd) return { label: "Dönem Sonunda Duracak", variant: "bg-[rgba(217,119,6,0.10)] text-[#d97706] border-[rgba(217,119,6,0.25)]" };
    return { label: "Aktif", variant: "bg-[rgba(22,163,74,0.08)] text-[#16a34a] border-[rgba(22,163,74,0.2)]" };
  };

  const handleCancelSubscription = async (id) => {
    if (!window.confirm("Aboneliğini iptal etmek istediğine emin misin? Mevcut ödediğin dönem sonuna kadar erişimin devam eder, bir sonraki ay tekrar çekim yapılmaz.")) return;
    setCancellingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/subscriptions/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, cancelAtPeriodEnd: true } : s)));
    } catch (e) {
      alert(e?.response?.data?.message || "Abonelik iptal edilemedi.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "PPP", { locale: trLocale });
    } catch {
      return dateStr;
    }
  };

  // Tek/3/6 ders paketini yakala (başlık üzerinden)
  const isTutorLessonPackage = (pkg) => {
    const name = String(pkg || "").toLowerCase().trim();
    return /^(tek ders|3\s*ders paketi|6\s*ders paketi)$/.test(name);
  };

  // Yalnızca abonelik benzeri siparişlerde bitişe göre "Süresi Dolmuş" göster
  const getStatusLabel = (status, endDate, isTutorPkg) => {
    if (status === "refunded") return { label: "İade Edildi", variant: "bg-[rgba(14,165,233,0.08)] text-[#0ea5e9] border-[rgba(14,165,233,0.2)]" };
    if (status === "refund_requested") return { label: "İade Talep Edildi", variant: "bg-[rgba(217,119,6,0.10)] text-[#d97706] border-[rgba(217,119,6,0.25)]" };
    if (status === "failed") return { label: "Ödeme Başarısız", variant: "bg-[rgba(220,38,38,0.08)] text-[#dc2626] border-[rgba(220,38,38,0.2)]" };
    if (!isTutorPkg && endDate && new Date(endDate) < new Date()) {
      return { label: "Süresi Dolmuş", variant: "bg-[rgba(55,65,81,0.08)] text-[#374151] border-[rgba(55,65,81,0.2)]" };
    }
    return { label: "Aktif", variant: "bg-[rgba(22,163,74,0.08)] text-[#16a34a] border-[rgba(22,163,74,0.2)]" };
  };

  const handleRefundRequest = (orderId) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const submitRefundRequest = async ({ orderId, reason, description }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/orders/${orderId}/refund-request`,
        { reason, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("İade talebiniz gönderildi!");
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error("İade talebi oluşturulamadı:", err);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  return (
    <>
      <TopBar />
      <Navbar />
      <div className="p-4">
        <div className="w-full max-w-[780px] mx-auto">
          <div>
            <main className="max-w-[860px] w-full mx-auto">
              {!subsLoading && subscriptions.length > 0 && (
                <section className="bg-white p-[22px] rounded-[14px] shadow-[0_6px_24px_rgba(2,6,23,0.06)] border border-[#e5e7eb] mb-[18px]">
                  <h2>🔁 Aboneliklerim</h2>
                  <ul className="list-none p-0 m-0 flex flex-col gap-[14px]">
                    {subscriptions.map((sub) => {
                      const { label, variant } = subscriptionStatusMeta(sub);
                      const canCancel = sub.status !== "cancelled" && !sub.cancelAtPeriodEnd;
                      return (
                        <li key={sub.id} className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-[14px] flex flex-col gap-2.5 max-[480px]:p-3">
                          <h3 className="m-0 mb-1.5 text-base leading-tight text-[#111827]"><strong>{sub.planLabel}</strong></h3>
                          <p className="m-0 text-[#6b7280] text-sm">💳 <strong>Aylık Tutar:</strong> ₺{(sub.amount / 100).toFixed(2)}</p>
                          {sub.cardLast4 && (
                            <p className="m-0 text-[#6b7280] text-sm mt-1">💳 <strong>Kart:</strong> •••• {sub.cardLast4}</p>
                          )}
                          {sub.status !== "cancelled" && (
                            <p className="m-0 text-[#6b7280] text-sm mt-1">
                              🗓️ <strong>{sub.cancelAtPeriodEnd ? "Erişim Sonu" : "Sonraki Çekim"}:</strong> {formatDate(sub.cancelAtPeriodEnd ? sub.currentPeriodEnd : sub.nextBillingDate)}
                            </p>
                          )}
                          <span className={`${badgeBase} ${variant}`}>{label}</span>
                          {canCancel && (
                            <button
                              onClick={() => handleCancelSubscription(sub.id)}
                              disabled={cancellingId === sub.id}
                              className={refundBtnBase}
                            >
                              {cancellingId === sub.id ? "İptal ediliyor..." : "🛑 Aboneliği İptal Et"}
                            </button>
                          )}
                          {sub.cancelAtPeriodEnd && sub.status !== "cancelled" && (
                            <p className="refund-waiting">ℹ️ Bu abonelik dönem sonunda otomatik olarak duracak, tekrar çekim yapılmayacak.</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section className="bg-white p-[22px] rounded-[14px] shadow-[0_6px_24px_rgba(2,6,23,0.06)] border border-[#e5e7eb] mb-[18px]">
                <h2>📦 Siparişlerim</h2>

                {loading ? (
                  <p>🔄 Siparişler yükleniyor...</p>
                ) : orders.length === 0 ? (
                  <p>Henüz bir siparişiniz yok.</p>
                ) : (
                  <ul className="list-none p-0 m-0 flex flex-col gap-[14px]">
                    {orders.map((order) => {
                      const tutorPkg = isTutorLessonPackage(order.package);
                      const { label, variant } = getStatusLabel(order.status, order.endDate, tutorPkg);

                      return (
                        <li className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-[14px] flex flex-col gap-2.5 max-[480px]:p-3" key={order.id}>
                          <h3 className="m-0 mb-1.5 text-base leading-tight text-[#111827]"><strong>{order.package}</strong></h3>
                          <p className="m-0 text-[#6b7280] text-sm">📄 <strong>Sipariş ID:</strong> {order.id}</p>
                          <p className="m-0 text-[#6b7280] text-sm mt-1">🗓️ <strong>Satın Alma:</strong> {formatDate(order.createdAt)}</p>

                          {/* Tek/3/6 ders paketlerinde bitiş tarihi GÖSTERME */}
                          {!tutorPkg && (
                            <p className="m-0 text-[#6b7280] text-sm mt-1">📅 <strong>Bitiş Tarihi:</strong> {formatDate(order.endDate)}</p>
                          )}

                          <span className={`${badgeBase} ${variant}`}>{label}</span>

                          {/* Tek/3/6 ders paketleri: Öğrenci paneline yönlendirme */}
                          {tutorPkg && (
                            <div
                              className="mt-3 p-3 px-[14px] bg-[#eef5ff] border border-[rgba(13,110,253,0.25)] rounded-lg"
                              style={{ borderLeft: "4px solid #0d6efd" }}
                            >
                              <p className="m-0 mb-2 text-sm text-[#0b3c8a] mt-2">
                                🔔 Talebinizin durumunu takip etmek için öğrenci paneline gidin.
                              </p>
                              <a
                                href="/student/dashboard"
                                className="inline-block mt-1.5 bg-[#0d6efd] text-white no-underline px-3 py-2 rounded-md font-semibold border-0 transition hover:bg-[#0b5ed7] focus:outline-[2px] focus:outline-[rgba(13,110,253,0.35)] focus:outline-offset-2"
                              >
                                👩‍🎓 Öğrenci Paneline Git
                              </a>
                            </div>
                          )}

                          <details className="billing-accordion">
                            <summary>🧾 Fatura Bilgileri</summary>
                            <div className="billing-info">
                              <p><strong>Ad Soyad:</strong> {order.billingInfo?.name} {order.billingInfo?.surname}</p>
                              <p><strong>Adres:</strong> {order.billingInfo?.address}, {order.billingInfo?.district}, {order.billingInfo?.city} {order.billingInfo?.postalCode}</p>
                              <p><strong>Telefon:</strong> {order.billingInfo?.phone}</p>
                              <p><strong>E-posta:</strong> {order.billingInfo?.email}</p>
                            </div>
                          </details>

                          {order.totalPrice && (
                            <p className="m-0 text-[#6b7280] text-sm mt-1"><strong>Toplam Ödenen Miktar:</strong> ₺{order.totalPrice}</p>
                          )}
                          {order.couponCode && (
                            <p className="m-0 text-[#6b7280] text-sm mt-1">🏷️ <strong>Kupon:</strong> {order.couponCode}</p>
                          )}

                          {order.status === "paid" && (
                            <button onClick={() => handleRefundRequest(order.id)} className={refundBtnBase}>
                              📝 İade Talebi Oluştur
                            </button>
                          )}

                          {order.status === "refund_requested" && (
                            <p className="refund-waiting">⏳ İade talebiniz için cevap bekleniyor.</p>
                          )}

                          {selectedOrderId === order.id && showModal && (
                            <RefundModal
                              orderId={order.id}
                              onClose={() => setShowModal(false)}
                              onSubmit={submitRefundRequest}
                            />
                          )}

                          <a
                            href={`https://wa.me/9055312546701?text=Merhaba, ${order.package} paketiyle ilgili bir sorum var. Sipariş ID: ${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-[#0a7c3a] no-underline font-semibold hover:underline"
                          >
                            💬 Destek İçin (WhatsApp)
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
