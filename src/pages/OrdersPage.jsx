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

  const getStatusLabel = (status, endDate) => {
    if (status === "refunded") return { label: "İade Edildi", className: "badge-refunded" };
    if (status === "refund_requested") return { label: "İade Talep Edildi", className: "badge-requested" };
    if (new Date(endDate) < new Date()) return { label: "Süresi Dolmuş", className: "badge-expired" };
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
                  const { label, className } = getStatusLabel(order.status, order.endDate);

                  return (
                    <div className="order-card" key={order.id}>
                      <h3><strong>{order.package}</strong></h3>
                      <p>📄 <strong>Sipariş ID:</strong> {order.id}</p>
                      <p>🗓️ <strong>Satın Alma:</strong> {formatDate(order.createdAt)}</p>
                      <p>📅 <strong>Bitiş Tarihi:</strong> {formatDate(order.endDate)}</p>
                      <span className={`badge ${className}`}>{label}</span>

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
                        <p>💰 <strong>Toplam:</strong> ₺{order.totalPrice}</p>
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
                        href={`https://wa.me/905xxxxxxxxx?text=Merhaba, ${order.package} paketiyle ilgili bir sorum var. Sipariş ID: ${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ordersPage-whatsapp-support-btn"
                      >
                        💬 Destek İçin (WhatsApp)
                      </a>
                    </div>
                  );
                })}
              </ul>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default OrdersPage;
