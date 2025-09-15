import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/ordersPage.css";
import { format } from "date-fns";
import trLocale from "date-fns/locale/tr";
import RefundModal from "../components/RefundModal";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    if (status === "refunded") return { label: "İade Edildi", className: "badge-refunded" };
    if (status === "refund_requested") return { label: "İade Talep Edildi", className: "badge-requested" };
    if (status === "failed") return { label: "Ödeme Başarısız", className: "badge-failed" };
    if (!isTutorPkg && endDate && new Date(endDate) < new Date()) {
      return { label: "Süresi Dolmuş", className: "badge-expired" };
    }
    return { label: "Aktif", className: "badge-active" };
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
      <div className="orders-page">
        <div className="orders-center">
          <div className="account-layout">
            <main className="account-main">
              <section className="info-card modern-form">
                <h2>📦 Siparişlerim</h2>

                {loading ? (
                  <p>🔄 Siparişler yükleniyor...</p>
                ) : orders.length === 0 ? (
                  <p>Henüz bir siparişiniz yok.</p>
                ) : (
                  <ul className="order-list">
                    {orders.map((order) => {
                      const tutorPkg = isTutorLessonPackage(order.package);
                      const { label, className } = getStatusLabel(order.status, order.endDate, tutorPkg);

                      return (
                        <li className="order-card" key={order.id}>
                          <h3><strong>{order.package}</strong></h3>
                          <p>📄 <strong>Sipariş ID:</strong> {order.id}</p>
                          <p>🗓️ <strong>Satın Alma:</strong> {formatDate(order.createdAt)}</p>

                          {/* Tek/3/6 ders paketlerinde bitiş tarihi GÖSTERME */}
                          {!tutorPkg && (
                            <p>📅 <strong>Bitiş Tarihi:</strong> {formatDate(order.endDate)}</p>
                          )}

                          <span className={`badge ${className}`}>{label}</span>

                          {/* Tek/3/6 ders paketleri: Öğrenci paneline yönlendirme */}
                          {tutorPkg && (
                            <div className="ordersPage-student-hint">
                              <p style={{ marginTop: 8 }}>
                                🔔 Talebinizin durumunu takip etmek için öğrenci paneline gidin.
                              </p>
                              <a
                                href="/student/dashboard" // rotanıza göre gerekirse /ogrenci-panel
                                className="refund-btn"
                                style={{ marginTop: 6, display: "inline-block" }}
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
                            <p><strong>Toplam Ödenen Miktar:</strong> ₺{order.totalPrice}</p>
                          )}
                          {order.couponCode && (
                            <p>🏷️ <strong>Kupon:</strong> {order.couponCode}</p>
                          )}

                          {order.status === "paid" && (
                            <button onClick={() => handleRefundRequest(order.id)} className="refund-btn">
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
                            className="ordersPage-whatsapp-support-btn"
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
