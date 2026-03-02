import { useEffect, useState } from "react";
import axios from "../utils/axios";

const RefundRequests = () => {
  const [refundOrders, setRefundOrders] = useState([]);

  const fetchRefundRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/orders/refund-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefundOrders(res.data.refundOrders);
    } catch (err) {
      console.error("İade talepleri alınamadı:");
    }
  };

  const handleApprove = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/orders/${orderId}/approve-refund`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("İade onaylandı.");
      fetchRefundRequests();
    } catch (err) {
      alert("İade onayı başarısız.");
      console.error(err);
    }
  };

  const handleReject = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/orders/${orderId}/reject-refund`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("İade reddedildi.");
      fetchRefundRequests();
    } catch (err) {
      alert("İade reddi başarısız.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  return (
    <div className="admin-section">
      <h2>🧾 İade Talepleri</h2>
      {refundOrders.length === 0 ? (
        <p>Bekleyen iade talebi yok.</p>
      ) : (
        <ul className="order-list">
          {refundOrders.map((order) => (
            <li key={order.id}>
              <strong>{order.package}</strong> - Sipariş No: #{order.id} <br />
              <span style={{ fontSize: "0.85rem", color: "#555" }}>
                {new Date(order.createdAt).toLocaleString("tr-TR")}
              </span>
              <p>
                <strong>Ad Soyad:</strong> {order.billingInfo.name} {order.billingInfo.surname}
              </p>
              <p>
                <strong>Kullanıcı:</strong> {order.user.name} ({order.user.email})
              </p>
              <button onClick={() => handleApprove(order.id)}>İade Onayla</button>
              <button onClick={() => handleReject(order.id)} style={{ marginLeft: "10px", backgroundColor: "#f44336", color: "white" }}>
                İade Reddet
              </button>
              {order.status === "refund_requested" && (
              <div className="refund-details">
                <h4>📋 İade Talebi Bilgileri</h4>
                <p><strong>Neden:</strong> {order.refundReason}</p>
                <p><strong>Açıklama:</strong> {order.refundExplanation}</p>
              </div>
            )}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RefundRequests;
