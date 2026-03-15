import { useEffect, useState, useMemo } from "react";
import axios from "../utils/axios";
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
import AdminTeacherApprovals from "../pages/AdminTeacherApprovels";
import AdminTeacherRequests from "../pages/AdminTeacherRequests";
import AdminPackagePage from "../pages/AdminPackagePage";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ROLE_META = {
  admin:   { label: "Admin",    bg: "bg-[#fef2f2]", text: "text-[#991b1b]",  dot: "bg-[#ef4444]" },
  coach:   { label: "Koç",      bg: "bg-[#ecfdf5]", text: "text-[#065f46]",  dot: "bg-[#10b981]" },
  student: { label: "Öğrenci",  bg: "bg-[#eff6ff]", text: "text-[#1d4ed8]",  dot: "bg-[#3b82f6]" },
};

const RoleBadge = ({ role }) => {
  const m = ROLE_META[role] || { label: role, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center gap-4 border border-[#f1f5f9]">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-[#0f172a] mt-0.5">{value}</p>
    </div>
  </div>
);

const STATUS_META = {
  refunded:         { label: "İade Edildi",       cls: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" },
  refund_requested: { label: "İade Talep Edildi", cls: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]" },
  failed:           { label: "Başarısız",          cls: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" },
  expired:          { label: "Süresi Doldu",       cls: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]" },
  active:           { label: "Aktif",              cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
};

const getOrderMeta = (order) => {
  if (order.status === "refunded")         return STATUS_META.refunded;
  if (order.status === "refund_requested") return STATUS_META.refund_requested;
  if (order.status === "failed")           return STATUS_META.failed;
  if (new Date(order.endDate) < new Date()) return STATUS_META.expired;
  return STATUS_META.active;
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

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
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [userRes, orderRes] = await Promise.all([
          axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } }),
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
    document.body.classList.toggle("modal-open", !!selectedUser);
    return () => document.body.classList.remove("modal-open");
  }, [selectedUser]);

  const countByRole = (role) => users.filter((u) => u.role === role).length;

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Bu siparişi silmek istediğinizden emin misiniz?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/users/${editingUser.id}`, editingUser, { headers: { Authorization: `Bearer ${token}` } });
      let assignedCoachData = null;
      if (editingUser.role === "student") {
        const res = await axios.post("/api/admin/assign-coach",
          { userId: editingUser.id, coachId: editingUser.assignedCoachId || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        assignedCoachData = res.data.coach || null;
      }
      const updatedUser = { ...editingUser, assignedCoach: assignedCoachData };
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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
    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/users/${selectedUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.put(`/api/admin/orders/${orderId}/approve-refund`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("İade onaylandı.");
      window.location.reload();
    } catch (err) {
      alert("İade onaylanamadı.");
    }
  };

  const handleOrderUpdate = async (orderId, newEndDate) => {
    if (!window.confirm(`Siparişin bitiş tarihini ${newEndDate} olarak güncellemek istediğinize emin misiniz?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/orders/${orderId}`, { endDate: newEndDate }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Bitiş tarihi başarıyla güncellendi.");
      window.location.reload();
    } catch (error) {
      console.error("Tarih güncellenemedi:", error);
      alert("Bitiş tarihi güncellenirken bir hata oluştu.");
    }
  };

  const handleBillingUpdate = async (orderId) => {
    if (!window.confirm("Fatura bilgilerini güncellemek istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/orders/${orderId}/billing`, updatedBillingInfo, { headers: { Authorization: `Bearer ${token}` } });
      alert("Fatura bilgileri güncellendi.");
      setEditingBilling(null);
      window.location.reload();
    } catch (err) {
      console.error("Fatura güncelleme hatası:", err);
      alert("Fatura bilgileri güncellenemedi.");
    }
  };

  const handleSendReminders = async () => {
    if (!window.confirm("Süresi yaklaşan siparişler için e-posta hatırlatması gönderilsin mi?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/admin/orders/send-expiry-reminders", {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message || "Hatırlatma e-postaları gönderildi.");
    } catch (err) {
      console.error("Hatırlatma gönderilemedi:", err);
      alert("E-posta gönderimi başarısız oldu.");
    }
  };

  const orderStats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const totalOrders = orders.length;
    const ordersThisMonth = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const packageCounts = {};
    orders.forEach((o) => { const p = o.package || "Bilinmiyor"; packageCounts[p] = (packageCounts[p] || 0) + 1; });
    const mostPopularPackage = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Veri yok";
    return { totalOrders, ordersThisMonth, mostPopularPackage };
  }, [orders]);

  const monthlyOrderData = useMemo(() => {
    const counts = new Array(12).fill(0);
    orders.forEach((o) => { counts[new Date(o.createdAt).getMonth()]++; });
    return {
      labels: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
      datasets: [{ label: "Aylık Sipariş Sayısı", data: counts, backgroundColor: "#100481", borderRadius: 6 }],
    };
  }, [orders]);

  const TABS = [
    { key: "dashboard",          label: "📊 Genel Bakış" },
    { key: "coaches",            label: "👨‍🏫 Koçlar" },
    { key: "packages",           label: "🛒 Paketler" },
    { key: "teacher-approvals",  label: "🧑‍🏫 Öğretmen Onayları" },
    { key: "teacher-requests",   label: "📋 Talep Özeti" },
    { key: "orders",             label: "📦 Siparişler" },
    { key: "users",              label: "👥 Kullanıcılar" },
  ];

  const tabCls = (key) =>
    view === key
      ? "px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#100481] text-white shadow-[0_4px_12px_rgba(16,4,129,0.25)] transition-all"
      : "px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-all";

  return (
    <div className="min-h-screen bg-[#f1f5f9]">

      {/* ── Toast ── */}
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-sm font-semibold animate-fade-in">
          {message}
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#100481] to-[#2563eb] text-white px-8 py-6 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight">🛠 Admin Kontrol Paneli</h1>
            <p className="text-blue-200 text-sm mt-0.5">Sözderece Koçluk Yönetim Sistemi</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/admin/coupons"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold no-underline transition-all"
            >
              🏷 Kupon Oluştur
            </Link>
            <Link
              to="/admin/refund-requests"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold no-underline transition-all"
            >
              💸 İade Talepleri
            </Link>
            <Link
              to="/admin/countdown"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold no-underline transition-all"
            >
              ⏳ Geri Sayım
            </Link>
            <Link
              to="/admin/randevu-slotlari"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold no-underline transition-all"
            >
              📅 Randevu Slotları
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
          <StatCard icon="👥" label="Toplam Kullanıcı" value={users.length}          color="bg-[#eff6ff]" />
          <StatCard icon="👨‍🏫" label="Koçlar"           value={countByRole("coach")}   color="bg-[#ecfdf5]" />
          <StatCard icon="🎓" label="Öğrenciler"        value={countByRole("student")} color="bg-[#fdf4ff]" />
          <StatCard icon="📦" label="Toplam Sipariş"    value={orders.length}          color="bg-[#fff7ed]" />
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] p-2 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setView(t.key)} className={tabCls(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Sub-page Views ── */}
        {view === "coaches"           && <AdminCoachPage />}
        {view === "packages"          && <AdminPackagePage />}
        {view === "teacher-approvals" && <AdminTeacherApprovals />}
        {view === "teacher-requests"  && <AdminTeacherRequests />}

        {/* ══════════════════════════ GENEL BAKIŞ ══════════════════════════ */}
        {view === "dashboard" && (
          <div className="grid grid-cols-2 gap-6 max-[768px]:grid-cols-1">
            {/* Sipariş Raporu */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
              <h2 className="text-base font-black text-[#0f172a] mb-4">📈 Sipariş Raporu</h2>
              <div className="space-y-3">
                {[
                  { label: "Toplam Sipariş",     value: orderStats.totalOrders },
                  { label: "Bu Ayki Sipariş",    value: orderStats.ordersThisMonth },
                  { label: "En Popüler Paket",   value: orderStats.mostPopularPackage },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                    <span className="text-sm font-semibold text-[#475569]">{item.label}</span>
                    <span className="text-sm font-black text-[#0f172a]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
              <h2 className="text-base font-black text-[#0f172a] mb-4">📊 Aylık Sipariş Grafiği</h2>
              <Bar data={monthlyOrderData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        )}

        {/* ══════════════════════════ SİPARİŞLER ══════════════════════════ */}
        {view === "orders" && (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-black text-[#0f172a]">📦 Siparişler ({filteredOrders.length})</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl px-3 py-2">
                  <span className="text-[#94a3b8] text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Kullanıcı adına göre filtrele..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 outline-none bg-transparent text-sm min-w-[180px]"
                  />
                </div>
                <button
                  onClick={handleSendReminders}
                  className="px-4 py-2 bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] rounded-xl text-sm font-bold hover:bg-[#d1fae5] transition-all"
                >
                  ✉️ Hatırlatma Gönder
                </button>
                <button
                  className="px-4 py-2 bg-[#100481] text-white rounded-xl text-sm font-bold hover:bg-[#1d4ed8] transition-all"
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    fetch("/api/admin/orders/export", { headers: { Authorization: `Bearer ${token}` } })
                      .then((r) => r.blob())
                      .then((blob) => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = "siparisler.csv";
                        document.body.appendChild(a); a.click(); a.remove();
                      })
                      .catch(() => alert("CSV indirilemedi."));
                  }}
                >
                  📁 CSV İndir
                </button>
              </div>
            </div>

            {/* Order List */}
            {filteredOrders.length === 0 ? (
              <div className="p-10 text-center text-[#94a3b8] text-sm">Sipariş bulunamadı.</div>
            ) : (
              <ul className="divide-y divide-[#f1f5f9]">
                {filteredOrders.map((order) => {
                  const meta = getOrderMeta(order);
                  return (
                    <li key={order.id}>
                      <details className="group">
                        <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#f8fafc] transition-all list-none select-none">
                          <span className="text-lg">📦</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#0f172a] text-sm truncate">{order.package}</p>
                            <p className="text-xs text-[#64748b] truncate">{order.userName} · {order.userEmail}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.cls} flex-shrink-0`}>
                            {meta.label}
                          </span>
                          <span className="text-sm font-black text-[#0f172a] flex-shrink-0">₺{order.totalPrice}</span>
                          <span className="text-[#94a3b8] group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                        </summary>

                        <div className="px-5 pb-5 pt-2 bg-[#f8fafc] border-t border-[#f1f5f9]">
                          <div className="grid grid-cols-2 gap-3 mb-4 max-[640px]:grid-cols-1">
                            <div className="bg-white rounded-xl p-3 border border-[#e5e7eb]">
                              <p className="text-xs text-[#64748b] font-semibold">Sipariş ID</p>
                              <p className="text-sm font-bold text-[#0f172a] font-mono mt-0.5">{order.id}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-[#e5e7eb]">
                              <p className="text-xs text-[#64748b] font-semibold">Oluşturulma</p>
                              <p className="text-sm font-bold text-[#0f172a] mt-0.5">{new Date(order.createdAt).toLocaleString("tr-TR")}</p>
                            </div>
                          </div>

                          {/* Fatura */}
                          <details className="mb-4">
                            <summary className="text-sm font-bold text-[#2563eb] cursor-pointer hover:text-[#1d4ed8] list-none">
                              📄 Fatura Bilgileri
                            </summary>
                            {order.billingInfo ? (
                              <div className="mt-2 bg-white rounded-xl p-3 border border-[#e5e7eb] text-xs space-y-1 text-[#334155]">
                                <p><strong>Ad Soyad:</strong> {order.billingInfo?.name} {order.billingInfo?.surname}</p>
                                <p><strong>TC No:</strong> {order.billingInfo?.tcno}</p>
                                <p><strong>Adres:</strong> {order.billingInfo.address}, {order.billingInfo.district}</p>
                                <p><strong>Şehir:</strong> {order.billingInfo.city} — {order.billingInfo.postalCode}</p>
                                <p><strong>Telefon:</strong> {order.billingInfo.phone}</p>
                                <p><strong>E-posta:</strong> {order.billingInfo.email}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-[#94a3b8] mt-1">Fatura bilgisi bulunamadı.</p>
                            )}
                            {editingBilling === order.id ? (
                              <div className="mt-2 bg-white rounded-xl p-3 border border-[#e5e7eb] grid grid-cols-2 gap-2 max-[640px]:grid-cols-1">
                                {["name","surname","address","city","postalCode","phone","email"].map((f) => (
                                  <input key={f} className={inputCls} placeholder={f}
                                    value={updatedBillingInfo[f] || ""}
                                    onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, [f]: e.target.value })}
                                  />
                                ))}
                                <div className="col-span-2 flex gap-2 max-[640px]:col-span-1">
                                  <button onClick={() => handleBillingUpdate(order.id)} className="flex-1 py-2 bg-[#100481] text-white rounded-xl text-sm font-bold hover:bg-[#1d4ed8] transition-all">Kaydet</button>
                                  <button onClick={() => setEditingBilling(null)} className="flex-1 py-2 bg-[#f1f5f9] text-[#475569] rounded-xl text-sm font-bold hover:bg-[#e2e8f0] transition-all">İptal</button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="mt-2 text-xs font-bold text-[#475569] hover:text-[#0f172a] underline"
                                onClick={() => { setEditingBilling(order.id); setUpdatedBillingInfo(order.billingInfo || {}); }}
                              >
                                ✏️ Fatura Düzenle
                              </button>
                            )}
                          </details>

                          {/* Bitiş Tarihi */}
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <label className="text-xs font-bold text-[#475569]">📅 Bitiş Tarihi:</label>
                            <input
                              type="date"
                              className="px-3 py-1.5 border border-[#e5e7eb] rounded-xl text-sm outline-none focus:border-[#100481] transition-all"
                              value={order.endDate ? new Date(order.endDate).toISOString().split("T")[0] : ""}
                              onChange={(e) => handleOrderUpdate(order.id, e.target.value)}
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {["pending", "pending_payment"].includes(order.status) && (
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem("token");
                                  try {
                                    const res = await axios.post("/api/admin/orders/check-payment",
                                      { merchant_oid: order.merchantOid },
                                      { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    alert(`Durum: ${res.data.status}`);
                                    window.location.reload();
                                  } catch (err) {
                                    alert("Durum sorgusu başarısız."); console.error(err);
                                  }
                                }}
                                className="px-3 py-1.5 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded-xl text-xs font-bold hover:bg-[#dbeafe] transition-all"
                              >
                                🔄 Ödeme Durumunu Sorgula
                              </button>
                            )}
                            {order.status === "refund_requested" && (
                              <button onClick={() => handleApproveRefund(order.id)} className="px-3 py-1.5 bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] rounded-xl text-xs font-bold hover:bg-[#d1fae5] transition-all">
                                ✅ İadeyi Onayla
                              </button>
                            )}
                            <button onClick={() => handleDeleteOrder(order.id)} className="px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-xl text-xs font-bold hover:bg-[#fee2e2] transition-all ml-auto">
                              🗑 Siparişi Sil
                            </button>
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* ══════════════════════════ KULLANICILAR ══════════════════════════ */}
        {view === "users" && (
          <div className="space-y-6">
            {/* User Grid */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] overflow-hidden">
              <div className="p-5 border-b border-[#f1f5f9]">
                <h2 className="text-base font-black text-[#0f172a]">👥 Kayıtlı Kullanıcılar ({users.length})</h2>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="group border border-[#e5e7eb] rounded-2xl p-4 cursor-pointer hover:border-[#100481] hover:shadow-[0_4px_16px_rgba(16,4,129,0.12)] transition-all bg-white"
                    onClick={() => { setSelectedUser(user); setEditingUser({ ...user, assignedCoachId: user.assignedCoach?.id || null }); }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#100481] to-[#2563eb] flex items-center justify-center text-white font-black text-base flex-shrink-0">
                        {(user.name || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0f172a] text-sm truncate">{user.name}</p>
                        <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <RoleBadge role={user.role} />
                      <span className="text-xs text-[#94a3b8]">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    {user.role === "student" && user.assignedCoach && (
                      <div className="mt-2 text-xs text-[#065f46] bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg px-2 py-1 truncate">
                        ✅ {user.assignedCoach.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* New User Form */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] overflow-hidden">
              <div className="p-5 border-b border-[#f1f5f9]">
                <h2 className="text-base font-black text-[#0f172a]">➕ Yeni Kullanıcı Oluştur</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <input className={inputCls} placeholder="Ad Soyad" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                <input className={inputCls} placeholder="E-posta" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input className={inputCls} placeholder="Şifre" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <select className={inputCls} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="student">Öğrenci</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="col-span-2 max-[640px]:col-span-1">
                  <button
                    className="w-full py-3 bg-gradient-to-r from-[#100481] to-[#2563eb] text-white rounded-xl font-black text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,4,129,0.3)] transition-all"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const res = await axios.post("/api/admin/users", newUser, { headers: { Authorization: `Bearer ${token}` } });
                        setUsers([...users, res.data]);
                        setNewUser({ name: "", email: "", password: "", role: "student" });
                        setMessage("✅ Yeni kullanıcı oluşturuldu.");
                        setTimeout(() => setMessage(null), 3000);
                      } catch (err) {
                        console.error(err);
                        setMessage("❌ Kullanıcı oluşturulamadı.");
                        setTimeout(() => setMessage(null), 3000);
                      }
                    }}
                  >
                    Kullanıcı Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════ USER MODAL ══════════════════════════ */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" onClick={() => setSelectedUser(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[520px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] z-[1001]">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-5 border-b border-[#f1f5f9] sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#100481] to-[#2563eb] flex items-center justify-center text-white font-black text-base flex-shrink-0">
                {(editingUser?.name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-[#0f172a] text-base truncate">{editingUser?.name}</h2>
                <p className="text-xs text-[#64748b] truncate">{editingUser?.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] text-lg transition-all font-bold">×</button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {[
                { label: "Adı", field: "name", type: "text" },
                { label: "Email", field: "email", type: "email" },
                { label: "Telefon", field: "phone", type: "text" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">{label}</label>
                  <input type={type} className={inputCls} value={editingUser?.[field] || ""} onChange={(e) => updateUserField(field, e.target.value)} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">Rol</label>
                <select className={inputCls} value={editingUser?.role} onChange={(e) => updateUserField("role", e.target.value)}>
                  <option value="student">Öğrenci</option>
                  <option value="coach">Koç</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser?.role === "student" && (
                <div className="space-y-3 p-4 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                  <p className="text-xs font-black text-[#475569] uppercase tracking-wide">Öğrenci Bilgileri</p>

                  {/* Koç */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">Atanmış Koç</label>
                    {editingUser.assignedCoachId && editingUser.assignedCoach ? (
                      <div className="flex items-center justify-between bg-white border border-[#a7f3d0] rounded-xl px-3 py-2">
                        <span className="text-sm font-bold text-[#065f46]">{editingUser.assignedCoach.name} — {editingUser.assignedCoach.subject}</span>
                        <button onClick={() => updateUserField("assignedCoachId", null)} className="text-xs text-[#ef4444] font-bold hover:text-[#dc2626] ml-2">Kaldır</button>
                      </div>
                    ) : (
                      <p className="text-xs text-[#94a3b8] italic">Henüz koç atanmamış.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">Sınıf</label>
                    <input className={inputCls} value={editingUser.grade || ""} onChange={(e) => updateUserField("grade", e.target.value)} placeholder="Örn: 11" />
                  </div>

                  {["9","10","11","12","Mezun"].includes(editingUser.grade) && (
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">Alan</label>
                      <select className={inputCls} value={editingUser.track || ""} onChange={(e) => updateUserField("track", e.target.value)}>
                        <option value="">Alan Seçin</option>
                        <option value="Sayısal">Sayısal</option>
                        <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                        <option value="Sözel">Sözel</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 p-5 border-t border-[#f1f5f9] sticky bottom-0 bg-white rounded-b-2xl">
              <button className="flex-1 py-2.5 bg-gradient-to-r from-[#100481] to-[#2563eb] text-white rounded-xl text-sm font-black hover:shadow-[0_6px_16px_rgba(16,4,129,0.3)] hover:-translate-y-0.5 transition-all" onClick={handleUserUpdate}>
                💾 Güncelle
              </button>
              <button className="flex-1 py-2.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-xl text-sm font-bold hover:bg-[#fee2e2] transition-all" onClick={handleUserDelete}>
                🗑 Sil
              </button>
              <button className="py-2.5 px-4 bg-[#f1f5f9] text-[#475569] rounded-xl text-sm font-bold hover:bg-[#e2e8f0] transition-all" onClick={() => setSelectedUser(null)}>
                Kapat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
