import { useEffect, useState, useMemo } from "react";
import axios from "../utils/axios";
import "../cssFiles/App.css";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import AdminCoachPage from "../pages/AdminCoachPage";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" });
  const [searchTerm, setSearchTerm] = useState("");
  const filteredOrders = orders.filter((order) =>
    order.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [editingBilling, setEditingBilling] = useState(null);
  const [updatedBillingInfo, setUpdatedBillingInfo] = useState({});
  const [view, setView] = useState("user");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [userRes, orderRes] = await Promise.all([
          axios.get("/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
         
          
          axios.get("/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          
        ]);

        setUsers(userRes.data);
        setOrders(orderRes.data);
      } catch (error) {
        console.error("Admin verileri alınamadı:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [selectedUser]);

  const countByRole = (role) => users.filter((u) => u.role === role).length;


  const handleDeleteOrder = async (id) => {
    const confirm = window.confirm("Bu siparişi silmek istediğinizden emin misiniz?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Sipariş silinirken hata oluştu:", err);
      alert("Sipariş silinemedi.");
    }
  };

  const updateUserField = (field, value) => {
    setEditingUser((prev) => ({ ...prev, [field]: value }));
  };

const handleUserUpdate = async () => {
  try {
    console.log("🟡 Güncellenecek kullanıcı ID:", editingUser?.id);

    const token = localStorage.getItem("token");

    // Kullanıcı bilgilerini güncelle
    await axios.put(`/api/admin/users/${editingUser.id}`, editingUser, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Koç atama (veya kaldırma)
    let assignedCoachData = null;
    if (editingUser.role === "student") {
      const res = await axios.post(
        "/api/admin/assign-coach",
        {
          userId: editingUser.id,
          coachId: editingUser.assignedCoachId || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      assignedCoachData = res.data.coach || null;
    }

    // Güncel kullanıcıyı oluştur (koçla birlikte)
    const updatedUser = {
      ...editingUser,
      assignedCoach: assignedCoachData,
    };

    // Local state'i güncelle
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    setSelectedUser(null);
    setMessage("✅ Kullanıcı başarıyla güncellendi.");
    setTimeout(() => setMessage(null), 3000);
  } catch (error) {
    console.error("Kullanıcı güncellenemedi:", error);
    setMessage("❌ Güncelleme sırasında hata oluştu.");
    setTimeout(() => setMessage(null), 3000);
  }
};



  const handleUserDelete = async () => {
    const confirmDelete = window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      setMessage("✅ Kullanıcı silindi.");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Kullanıcı silinemedi:", error);
      setMessage("❌ Kullanıcı silinemedi.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleApproveRefund = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/orders/${orderId}/approve-refund`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("İade onaylandı.");
      window.location.reload();
    } catch (err) {
      alert("İade onaylanamadı.");
    }
  };

  const orderStats = useMemo(() => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalOrders = orders.length;

  const ordersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getMonth() === thisMonth &&
      orderDate.getFullYear() === thisYear
    );
  }).length;

  const packageCounts = {};
  orders.forEach((order) => {
    const pkg = order.package || "Bilinmiyor";
    packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
  });

  const mostPopularPackage = Object.entries(packageCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || "Veri yok";

  return { totalOrders, ordersThisMonth, mostPopularPackage };
}, [orders]);

const monthlyOrderData = useMemo(() => {
  const counts = new Array(12).fill(0);

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const month = date.getMonth(); // 0 - 11
    counts[month]++;
  });




  return {
    labels: [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ],
    datasets: [
      {
        label: "Aylık Sipariş Sayısı",
        data: counts,
        backgroundColor: "#4a90e2",
      },
    ],
  };
}, [orders]);

const handleOrderUpdate = async (orderId, newEndDate) => {
  const confirmation = window.confirm(
    `Siparişin bitiş tarihini ${newEndDate} olarak güncellemek istediğinize emin misiniz?`
  );
  if (!confirmation) return;

  try {
    const token = localStorage.getItem("token");
    await axios.put(`/api/admin/orders/${orderId}`, { endDate: newEndDate }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Bitiş tarihi başarıyla güncellendi.");
    window.location.reload();
  } catch (error) {
    console.error("Tarih güncellenemedi:", error);
    alert("Bitiş tarihi güncellenirken bir hata oluştu.");
  }
};

const handleBillingUpdate = async (orderId) => {
  const confirm = window.confirm("Fatura bilgilerini güncellemek istediğinize emin misiniz?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem("token");
    await axios.put(`/api/admin/orders/${orderId}/billing`, updatedBillingInfo, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Fatura bilgileri güncellendi.");
    setEditingBilling(null);
    window.location.reload();
  } catch (err) {
    console.error("Fatura güncelleme hatası:", err);
    alert("Fatura bilgileri güncellenemedi.");
  }
};


  return (
    <div className="admin-dashboard">
      <h1>🛠 Admin Kontrol Paneli</h1>

      {message && (
        <div style={{
          position: "fixed",
          top: "600px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#333",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 2000,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          fontSize: "0.95rem"
        }}>
          {message}
        </div>
      )}

      <div className="admin-cards">
        <div className="admin-card">👥 Toplam Kullanıcı: <strong>{users.length}</strong></div>
        <div className="admin-card">👨‍🏫 Koçlar: <strong>{countByRole("coach")}</strong></div>
        <div className="admin-card">🎓 Öğrenciler: <strong>{countByRole("student")}</strong></div>
        <div className="admin-card">📦 Siparişler: <strong>{orders.length}</strong></div>
      </div>

      <div className="admin-tabs">
        <button onClick={() => setView("coaches")} className={view === "coaches" ? "active-tab" : ""}>👨‍🏫 Koçlar</button>
      </div>
  

{view === "coaches" && <AdminCoachPage />}



      <section className="admin-section">
        <h2>📦 Siparişler</h2>
        <input
  type="text"
  placeholder="Kullanıcı adına göre filtrele..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    padding: "8px",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc"
  }}
/>

        {orders.length === 0 ? (
          <p>Henüz sipariş yok.</p>
        ) : (
          <ul className="admin-order-list">
            
            {filteredOrders.map((order) => (
              
              <details key={order.id} className="admin-order-item">
                <summary>
                  📦 <strong>{order.package}</strong> — {order.userName} ({order.userEmail})
                </summary>
                
                <div className="order-details">
                  <p><strong>Sipariş ID:</strong> {order.id}</p>
                  {order.status === "pending_payment" && (
  <button
    onClick={async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.post(
          "/api/admin/orders/check-payment",
          { merchant_oid: order.merchantOid },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(`Durum: ${res.data.status}`);
        window.location.reload();
      } catch (err) {
        alert("Durum sorgusu başarısız.");
        console.error("PayTR durum sorgu hatası:", err);
      }
    }}
    className="paytr-status-btn"
  >
    🔄 Ödeme Durumunu Sorgula
  </button>
)}

                <p><strong>Oluşturulma:</strong> {new Date(order.createdAt).toLocaleString("tr-TR")}</p>
                <p><strong>Paket Adı:</strong> {order.package}</p>
                  {console.log("Order içeriği:", order)}
                  <details style={{ marginTop: "10px" }}>
  <summary style={{ cursor: "pointer", color: "#007bff" }}>
    Fatura Bilgilerini Göster
  </summary>
  {order.billingInfo ? (
    <div style={{ paddingLeft: "10px", marginTop: "5px" }}>
     <p><strong>Ad Soyad:</strong> {order.billingInfo?.name} {order.billingInfo?.surname}</p>
        <p><strong>Adres:</strong> {order.billingInfo.address}, {order.billingInfo.district}</p>
        <p><strong>Şehir:</strong> {order.billingInfo.city} - {order.billingInfo.postalCode}</p>
        <p><strong>Telefon:</strong> {order.billingInfo.phone}</p>
        <p><strong>E-posta:</strong> {order.billingInfo.email}</p>
    </div>
  ) : (
    <p style={{ paddingLeft: "10px" }}>Fatura bilgisi bulunamadı.</p>
  )}
  {editingBilling === order.id ? (
  <div className="billing-edit-form">
    <input value={updatedBillingInfo.name || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, name: e.target.value })} placeholder="Ad" />
    <input value={updatedBillingInfo.surname || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, surname: e.target.value })} placeholder="Soyad" />
    <input value={updatedBillingInfo.address || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, address: e.target.value })} placeholder="Adres" />
    <input value={updatedBillingInfo.city || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, city: e.target.value })} placeholder="Şehir" />
    <input value={updatedBillingInfo.postalCode || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, postalCode: e.target.value })} placeholder="Posta Kodu" />
    <input value={updatedBillingInfo.phone || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, phone: e.target.value })} placeholder="Telefon" />
    <input value={updatedBillingInfo.email || ""} onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, email: e.target.value })} placeholder="E-posta" />
    <button onClick={() => handleBillingUpdate(order.id)}>Kaydet</button>
    <button onClick={() => setEditingBilling(null)}>İptal</button>
  </div>
) : (
  <button onClick={() => {
    setEditingBilling(order.id);
    setUpdatedBillingInfo(order.billingInfo || {});
  }}>
    Fatura Bilgisini Düzenle
  </button>
)}
</details>


        <h5 style={{color: "red"}}>Bitis Tarihi Guncelleme</h5>
          <input
            type="date"
            value={order.endDate ? new Date(order.endDate).toISOString().split("T")[0] : ""}
            onChange={(e) => handleOrderUpdate(order.id, e.target.value)}
          />
                    <p>
                    <strong>Durum:</strong>{" "}
                    <span style={{
                      color:
                        order.status === "refunded" ? "red" :
                        order.status === "refund_requested" ? "orange" :
                        "green"
                    }}>
                      {order.status === "refunded"
                        ? "İade Edildi"
                        : order.status === "refund_requested"
                        ? "İade Talep Edildi"
                        : "Aktif"}
                    </span>
                  </p>
                  <button onClick={() => handleDeleteOrder(order.id)} className="delete-btn">❌ Bu Siparişi Sil</button>
                </div>
                {order.status === "refund_requested" && (
                  <button onClick={() => handleApproveRefund(order.id)}>
                    İadeyi Onayla
                  </button>
                )}
              </details>
            ))}
          </ul>
        )}
        
              <button
  className="csv-export-button"
  onClick={() => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/orders/export", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "siparisler.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => {
        alert("CSV indirilemedi.");
        console.error(err);
      });
  }}
>
  📁 CSV Dışa Aktar
</button>
      </section>
      
      <section className="admin-section">
      <Link to="/admin/coupons">Kupon Oluştur</Link>
</section>

        <section className="admin-section">
        <Link to="/admin/refund-requests" className="refund-link"><h2>İade Talepleri</h2></Link>
        </section>

      <section className="admin-section">
        <h2>👥 Kayıtlı Kullanıcılar</h2>
     <div className="user-grid">
  {users.map((user) => (
    <div
      key={user.id}
      className="user-card"
      onClick={() => {
        setSelectedUser(user);
        setEditingUser({
  ...user,
  assignedCoachId: user.assignedCoach?.id || null,
});
      }}
    >
      <h4>{user.name}</h4>
      <p>{user.email}</p>

      <div className="role-badge">
        {user.role === "admin" ? "🔐 Admin" :
         user.role === "coach" ? "👨‍🏫 Koç" : "🎓 Öğrenci"}
      </div>

      <div className="user-date">
        📅 {new Date(user.createdAt).toLocaleDateString("tr-TR")}
      </div>

      {user.role === "student" && user.assignedCoach && (
  <div className="assigned-coach">
    ✅ Koç: {user.assignedCoach.name} ({user.assignedCoach.subject})
  </div>
)}
    </div>
  ))}
</div>


        <h2>➕ Yeni Kullanıcı Oluştur</h2>
        <input placeholder="Ad Soyad" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <input placeholder="Şifre" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="student">Öğrenci</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.post("/api/admin/users", newUser, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUsers([...users, res.data]);
            setNewUser({ name: "", email: "", password: "", role: "student" });
            setMessage("✅ Yeni kullanıcı oluşturuldu.");
            setTimeout(() => setMessage(null), 3000);
          } catch (err) {
            console.error(err);
            setMessage("❌ Kullanıcı oluşturulamadı.");
            setTimeout(() => setMessage(null), 3000);
          }
        }}>Kaydet</button>
      </section>

 {selectedUser && (
  <>
    <div className="modal-overlay" onClick={() => setSelectedUser(null)}></div>
    <div className="user-modal">
      <h2>👤 {editingUser.name} — Detaylar</h2>

      <div className="modal-section">
        <label>Adı</label>
        <input value={editingUser.name} onChange={(e) => updateUserField("name", e.target.value)} />
      </div>

      <div className="modal-section">
        <label>Email</label>
        <input value={editingUser.email} onChange={(e) => updateUserField("email", e.target.value)} />
      </div>

      <div className="modal-section">
        <label>Telefon</label>
        <input value={editingUser.phone || ""} onChange={(e) => updateUserField("phone", e.target.value)} />
      </div>

      <div className="modal-section">
        <label>Rol</label>
        <select value={editingUser.role} onChange={(e) => updateUserField("role", e.target.value)}>
          <option value="student">Öğrenci</option>
          <option value="coach">Koç</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {editingUser.role === "student" && (
        <div className="modal-section">
          <label>Koç Bilgisi</label>
          {editingUser.assignedCoachId && editingUser.assignedCoach ? (
            <div className="coach-box">
              <span><strong>{editingUser.assignedCoach.name}</strong> — {editingUser.assignedCoach.subject}</span>
              <button onClick={() => updateUserField("assignedCoachId", null)} className="remove-btn">❌ Kaldır</button>
            </div>
          ) : (
            <p style={{ fontStyle: "italic", color: "gray" }}>Şu anda atanmış koç yok.</p>
          )}
          {editingUser.role === "student" && (
  <>
    <div className="modal-section">
      <label>Sınıf</label>
      <input
        value={editingUser.grade || ""}
        onChange={(e) => updateUserField("grade", e.target.value)}
        placeholder="Örn: 11"
      />
    </div>

    {["9", "10", "11", "12", "Mezun"].includes(editingUser.grade) && (
      <div className="modal-section">
        <label>Alan</label>
        <select
          value={editingUser.track || ""}
          onChange={(e) => updateUserField("track", e.target.value)}
        >
          <option value="">Alan Seçin</option>
          <option value="Sayısal">Sayısal</option>
          <option value="Eşit Ağırlık">Eşit Ağırlık</option>
          <option value="Sözel">Sözel</option>
        </select>
      </div>
    )}
  </>
)}

         
        </div>
      )}

      <div className="modal-actions">
        <button className="primary" onClick={handleUserUpdate}>💾 Güncelle</button>
        <button className="danger" onClick={handleUserDelete}>❌ Sil</button>
        <button onClick={() => setSelectedUser(null)}>🔙 Geri</button>
      </div>
    </div>
  </>
)}


      <section className="admin-section">
      <h2>📈 Sipariş Raporu</h2>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        <li><strong>📦 Toplam Sipariş:</strong> {orderStats.totalOrders}</li>
        <li><strong>🗓 Bu Ayki Sipariş:</strong> {orderStats.ordersThisMonth}</li>
        <li><strong>🏆 En Popüler Paket:</strong> {orderStats.mostPopularPackage}</li>
      </ul>
    </section>
    <section className="admin-section">
      <h2>📊 Aylık Sipariş Grafiği</h2>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Bar data={monthlyOrderData} />
      </div>
    </section>

    </div>
  );
};

export default AdminDashboard;
