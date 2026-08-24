import { useEffect, useState, useMemo, Fragment } from "react";
import axios from "../utils/axios";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import { FaInstagram, FaFacebook, FaGoogle, FaTiktok, FaWhatsapp, FaEnvelope, FaTwitter, FaYoutube, FaGlobe, FaLink } from "react-icons/fa";
import {
  FaChartPie, FaChalkboardTeacher, FaBoxOpen, FaUserCheck, FaClipboardList, FaShoppingCart,
  FaSyncAlt, FaUsers, FaFire, FaCreditCard, FaGraduationCap, FaUniversity, FaPhoneAlt,
  FaFileAlt, FaListUl, FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaDownload,
} from "react-icons/fa";
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
import AdminCampPage from "../pages/AdminCampPage";
import AdminPaymentSettings from "../pages/AdminPaymentSettings";
import AdminLgsPage from "../pages/AdminLgsPage";
import AdminYksPage from "../pages/AdminYksPage";
import AdminNavbarPage from "../pages/AdminNavbarPage";
import AdminSubscriptionsPage from "../pages/AdminSubscriptionsPage";
import AdminContactsPage from "../pages/AdminContactsPage";
import AdminInstructorApplicationsPage from "../pages/AdminInstructorApplicationsPage";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MONTH_LABELS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

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
  pending:          { label: "Ödeme Bekleniyor",   cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
  expired:          { label: "Süresi Doldu",       cls: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]" },
  active:           { label: "Aktif",              cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
};

const getOrderMeta = (order) => {
  if (order.status === "refunded")         return STATUS_META.refunded;
  if (order.status === "refund_requested") return STATUS_META.refund_requested;
  if (order.status === "failed")           return STATUS_META.failed;
  if (order.status === "pending" || order.status === "pending_payment") return STATUS_META.pending;
  if (new Date(order.endDate) < new Date()) return STATUS_META.expired;
  return STATUS_META.active;
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all bg-white";

const CHANNEL_ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  google: FaGoogle,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  x: FaTwitter,
  youtube: FaYoutube,
  referral: FaLink,
  direct: FaGlobe,
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")} dk`;
};

// ikas'taki "Bugün / 19:38" gösterimiyle aynı: bugünse "Bugün", dünse "Dün",
// değilse kısa tarih — altında saat ayrı satırda gösteriliyor.
const formatOrderDateParts = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  let label;
  if (isSameDay(d, now)) label = "Bugün";
  else if (isSameDay(d, yesterday)) label = "Dün";
  else label = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return { label, time };
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" });
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPage, setOrderPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [ordersSubView, setOrdersSubView] = useState("all"); // "all" | "abandoned"
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [abandonedCarts, setAbandonedCarts] = useState(null);
  const [abandonedLoading, setAbandonedLoading] = useState(false);
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      order.userName?.toLowerCase().includes(term) ||
      order.userEmail?.toLowerCase().includes(term) ||
      order.billingInfo?.email?.toLowerCase().includes(term) ||
      order.merchantOid?.toLowerCase().includes(term) ||
      order.package?.toLowerCase().includes(term);
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const pagedOrders = filteredOrders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  const loadAbandonedCarts = async () => {
    if (abandonedCarts) return; // zaten yüklendi
    setAbandonedLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/carts/abandoned", { headers: { Authorization: `Bearer ${token}` } });
      setAbandonedCarts(res.data.carts || []);
    } catch {
      setAbandonedCarts([]);
    } finally {
      setAbandonedLoading(false);
    }
  };

  const handleDeleteAbandonedCart = async (id) => {
    if (!window.confirm("Bu terk edilmiş sepeti silmek istediğine emin misin?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/carts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAbandonedCarts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Sepet silinemedi.");
    }
  };

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 12;
  const filteredUsers = users.filter((user) => {
    const term = userSearchTerm.trim().toLowerCase();
    const matchesSearch = !term || user.name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term);
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });
  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  const [editingBilling, setEditingBilling] = useState(null);
  const [updatedBillingInfo, setUpdatedBillingInfo] = useState({});
  const [view, setView] = useState("dashboard");
  const [attributionCache, setAttributionCache] = useState({}); // orderId -> data | "loading" | "error"

  const loadAttribution = async (orderId) => {
    if (attributionCache[orderId]) return; // zaten yüklendi/yükleniyor
    setAttributionCache((prev) => ({ ...prev, [orderId]: "loading" }));
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/admin/orders/${orderId}/attribution`, { headers: { Authorization: `Bearer ${token}` } });
      setAttributionCache((prev) => ({ ...prev, [orderId]: res.data }));
    } catch {
      setAttributionCache((prev) => ({ ...prev, [orderId]: "error" }));
    }
  };

  // Arama/filtre değişince sayfalamayı başa al — aksi halde filtrelenmiş
  // listede olmayan bir sayfada kalıp boş görünüm gösterebilir.
  useEffect(() => { setOrderPage(1); }, [searchTerm, orderStatusFilter, ordersPerPage]);
  useEffect(() => { setUserPage(1); }, [userSearchTerm, userRoleFilter]);

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
      showMsg("Kullanıcı başarıyla güncellendi.");
    } catch (error) {
      console.error("Kullanıcı güncellenemedi:", error);
      showMsg("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleUserDelete = async () => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/users/${selectedUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      showMsg("Kullanıcı silindi.");
    } catch (error) {
      console.error("Kullanıcı silinemedi:", error);
      showMsg("Kullanıcı silinemedi.");
    }
  };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApproveRefund = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/orders/${orderId}/approve-refund`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "refunded" } : o)));
      showMsg("İade onaylandı.");
    } catch (err) {
      showMsg("İade onaylanamadı.");
    }
  };

  const handleOrderUpdate = async (orderId, newEndDate) => {
    if (!window.confirm(`Siparişin bitiş tarihini ${newEndDate} olarak güncellemek istediğinize emin misiniz?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/orders/${orderId}`, { endDate: newEndDate }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, endDate: newEndDate } : o)));
      showMsg("Bitiş tarihi başarıyla güncellendi.");
    } catch (error) {
      console.error("Tarih güncellenemedi:", error);
      showMsg("Bitiş tarihi güncellenirken bir hata oluştu.");
    }
  };

  const handleBillingUpdate = async (orderId) => {
    if (!window.confirm("Fatura bilgilerini güncellemek istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/admin/orders/${orderId}/billing`, updatedBillingInfo, { headers: { Authorization: `Bearer ${token}` } });
      const newBillingInfo = res.data?.updatedOrder?.billingInfo;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, billingInfo: newBillingInfo || { ...o.billingInfo, ...updatedBillingInfo } } : o))
      );
      setEditingBilling(null);
      showMsg("Fatura bilgileri güncellendi.");
    } catch (err) {
      console.error("Fatura güncelleme hatası:", err);
      showMsg("Fatura bilgileri güncellenemedi.");
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
    // Sadece "paid" durumundaki siparişler gerçek ciroyu temsil ediyor —
    // iade edilenler status="refunded"a geçtiği için burada zaten hariç.
    const paidOrders = orders.filter((o) => o.status === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const revenueThisMonth = paidOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return { totalOrders, ordersThisMonth, mostPopularPackage, totalRevenue, revenueThisMonth };
  }, [orders]);

  const monthlyOrderData = useMemo(() => {
    // Önceden tüm yılların aynı ayını (ör. Ağustos 2025 + Ağustos 2026) tek
    // sütunda topluyordu. Artık son 12 ayı yıl+ay bazında, kayan bir
    // pencerede gösteriyor.
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    const counts = months.map(
      ({ year, month }) =>
        orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d.getFullYear() === year && d.getMonth() === month;
        }).length
    );
    return {
      labels: months.map(({ year, month }) => `${MONTH_LABELS[month]} '${String(year).slice(2)}`),
      datasets: [{ label: "Aylık Sipariş Sayısı", data: counts, backgroundColor: "#100481", borderRadius: 6 }],
    };
  }, [orders]);

  const SIDEBAR_SECTIONS = [
    {
      title: "Genel",
      items: [{ key: "dashboard", label: "Genel Bakış", icon: FaChartPie }],
    },
    {
      title: "Satış & Ödeme",
      items: [
        { key: "orders", label: "Siparişler", icon: FaShoppingCart },
        { key: "subscriptions", label: "Abonelikler", icon: FaSyncAlt },
        { key: "payment-settings", label: "Ödeme Sayfası", icon: FaCreditCard },
      ],
    },
    {
      title: "Ekip & Kullanıcılar",
      items: [
        { key: "coaches", label: "Koçlar", icon: FaChalkboardTeacher },
        { key: "teacher-approvals", label: "Öğretmen Onayları", icon: FaUserCheck },
        { key: "teacher-requests", label: "Talep Özeti", icon: FaClipboardList },
        { key: "users", label: "Kullanıcılar", icon: FaUsers },
      ],
    },
    {
      title: "Kampanyalar",
      items: [
        { key: "camp", label: "Deneme Kampı", icon: FaFire },
        { key: "lgs", label: "LGS Başvuruları", icon: FaGraduationCap },
        { key: "yks", label: "YKS Başvuruları", icon: FaUniversity },
      ],
    },
    {
      title: "İletişim & İçerik",
      items: [
        { key: "contacts", label: "Görüşme Talepleri", icon: FaPhoneAlt },
        { key: "applications", label: "Eğitmen Başvuruları", icon: FaFileAlt },
        { key: "packages", label: "Paketler", icon: FaBoxOpen },
        { key: "navbar", label: "Navbar", icon: FaListUl },
      ],
    },
  ];

  const sidebarItemCls = (key) =>
    view === key
      ? "bg-lime/15 text-lime border-l-2 border-lime"
      : "text-white/55 hover:text-white hover:bg-white/5 border-l-2 border-transparent";

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">

      {/* ── Toast ── */}
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-sm font-semibold animate-fade-in">
          {message}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 sticky top-0 h-screen overflow-y-auto" style={{ background: "#0D0A2E" }}>
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-fredoka font-bold text-white text-lg leading-tight">Sözderece</p>
          <p className="text-white/40 text-xs mt-0.5">Admin Kontrol Paneli</p>
        </div>
        <nav className="py-3">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">{section.title}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-all ${sidebarItemCls(item.key)}`}
                  >
                    <Icon className="flex-shrink-0 text-[15px]" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-brand-navy to-[#2563eb] text-white px-8 py-6 shadow-lg">
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
              to="/admin/popup"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold no-underline transition-all"
            >
              🎁 Popup Kuponu
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

        {/* ── Sub-page Views ── */}
        {view === "coaches"           && <AdminCoachPage />}
        {view === "packages"          && <AdminPackagePage />}
        {view === "teacher-approvals" && <AdminTeacherApprovals />}
        {view === "teacher-requests"  && <AdminTeacherRequests />}
        {view === "camp"              && <AdminCampPage />}
        {view === "payment-settings"  && <AdminPaymentSettings />}
        {view === "lgs"               && <AdminLgsPage />}
        {view === "yks"               && <AdminYksPage />}
        {view === "contacts"          && <AdminContactsPage />}
        {view === "applications"      && <AdminInstructorApplicationsPage />}
        {view === "navbar"            && <AdminNavbarPage />}
        {view === "subscriptions"     && <AdminSubscriptionsPage />}

        {/* ══════════════════════════ GENEL BAKIŞ ══════════════════════════ */}
        {view === "dashboard" && (
          <div className="grid grid-cols-2 gap-6 max-[768px]:grid-cols-1">
            {/* Sipariş Raporu */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9]">
              <h2 className="text-base font-black text-[#0f172a] mb-4">📈 Sipariş Raporu</h2>
              <div className="space-y-3">
                {[
                  { label: "Toplam Ciro",        value: `₺${orderStats.totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: "Bu Ayki Ciro",       value: `₺${orderStats.revenueThisMonth.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
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
            {/* Page header */}
            <div className="px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-[#0f172a]">Siparişler</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={handleSendReminders} variant="success" size="sm">
                  Hatırlatma Gönder
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
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
                  <FaDownload className="inline mr-1.5 -mt-0.5" /> Dışa Aktar
                </Button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="px-6 flex items-center gap-6 border-b border-[#e5e7eb]">
              <button
                onClick={() => setOrdersSubView("all")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${ordersSubView === "all" ? "text-page-navy border-page-navy" : "text-[#94a3b8] border-transparent hover:text-[#475569]"}`}
              >
                Tüm Siparişler
              </button>
              <button
                onClick={() => { setOrdersSubView("abandoned"); loadAbandonedCarts(); }}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${ordersSubView === "abandoned" ? "text-page-navy border-page-navy" : "text-[#94a3b8] border-transparent hover:text-[#475569]"}`}
              >
                Terk Edilmiş Sepetler{abandonedCarts ? ` (${abandonedCarts.length})` : ""}
              </button>
            </div>

            {ordersSubView === "all" ? (
              <>
                {/* Search + Filter */}
                <div className="px-6 py-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl px-3.5 py-2.5 flex-1 min-w-[220px] max-w-[380px]">
                    <FaSearch className="text-[#94a3b8] text-xs flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Tabloda arama yapın"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 outline-none bg-transparent text-sm w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-xl px-3.5 py-2.5">
                    <FaFilter className="text-[#94a3b8] text-xs flex-shrink-0" />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="outline-none text-sm bg-transparent"
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="paid">Ödendi / Aktif</option>
                      <option value="pending">Ödeme Bekliyor</option>
                      <option value="refund_requested">İade Talep Edildi</option>
                      <option value="refunded">İade Edildi</option>
                      <option value="failed">Başarısız</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                {filteredOrders.length === 0 ? (
                  <div className="p-10 text-center text-[#94a3b8] text-sm">Sipariş bulunamadı.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] border-y border-[#e5e7eb] text-left text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
                          <th className="px-6 py-3">Sipariş</th>
                          <th className="px-4 py-3">Tarih</th>
                          <th className="px-4 py-3">Müşteri</th>
                          <th className="px-4 py-3">Durum</th>
                          <th className="px-4 py-3 text-right">Toplam Tutar</th>
                          <th className="px-6 py-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedOrders.map((order) => {
                          const meta = getOrderMeta(order);
                          const isOpen = expandedOrderId === order.id;
                          const { label: dateLabel, time: dateTime } = formatOrderDateParts(order.createdAt);
                          return (
                            <Fragment key={order.id}>
                              <tr
                                onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                                className={`border-b border-[#f1f5f9] cursor-pointer transition-colors ${isOpen ? "bg-[#f8fafc]" : "hover:bg-[#f8fafc]"}`}
                              >
                                <td className="px-6 py-4 align-top">
                                  <p className="font-bold text-[#0f172a]">#{order.id}</p>
                                  <p className="text-xs text-[#64748b] truncate max-w-[220px]">{order.package}</p>
                                </td>
                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                  <p className="text-[#0f172a] font-semibold">{dateLabel}</p>
                                  <p className="text-xs text-[#94a3b8]">{dateTime}</p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <p className="font-semibold text-[#0f172a] truncate max-w-[180px]">{order.userName || "—"}</p>
                                  <p className="text-xs text-[#94a3b8] truncate max-w-[180px]">{order.userEmail}</p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.cls}`}>{meta.label}</span>
                                    {order.couponCode && (
                                      <span className="text-xs font-bold px-2 py-1 rounded-full border bg-[#fefce8] text-[#854d0e] border-[#fde68a]">
                                        🎟 {order.couponCode}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 align-top text-right font-black text-[#0f172a] whitespace-nowrap">₺{order.totalPrice}</td>
                                <td className="px-6 py-4 align-top text-[#94a3b8]">
                                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </td>
                              </tr>
                              {isOpen && (
                                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                                  <td colSpan={6} className="px-6 pb-6 pt-2">
                          <div className="grid grid-cols-2 gap-3 mb-4 max-[640px]:grid-cols-1">
                            <div className="bg-white rounded-xl p-3 border border-[#e5e7eb]">
                              <p className="text-xs text-[#64748b] font-semibold">Sipariş ID</p>
                              <p className="text-sm font-bold text-[#0f172a] font-mono mt-0.5">{order.id}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-[#e5e7eb]">
                              <p className="text-xs text-[#64748b] font-semibold">Oluşturulma</p>
                              <p className="text-sm font-bold text-[#0f172a] mt-0.5">{new Date(order.createdAt).toLocaleString("tr-TR")}</p>
                            </div>
                            {order.couponCode && (
                              <div className="col-span-2 bg-[#fefce8] rounded-xl p-3 border border-[#fde68a] max-[640px]:col-span-1">
                                <p className="text-xs text-[#854d0e] font-semibold">🎟 Kullanılan Kupon</p>
                                <p className="text-sm font-bold text-[#713f12] font-mono mt-0.5">
                                  {order.couponCode}
                                  {order.discountRate > 0 && (
                                    <span className="ml-2 text-xs font-normal text-[#92400e]">(%{order.discountRate} indirim)</span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Fatura */}
                          <details className="mb-4">
                            <summary className="text-sm font-bold text-[#2563eb] cursor-pointer hover:text-[#1d4ed8] list-none">
                              📄 Fatura Bilgileri
                            </summary>
                            {order.billingInfo ? (
                              <div className="mt-2 bg-white rounded-xl p-3 border border-[#e5e7eb] text-xs space-y-1 text-[#334155]">
                                <p><strong>Ad Soyad:</strong> {order.billingInfo?.name} {order.billingInfo?.surname}</p>
                                <p><strong>TC No:</strong> {order.billingInfo?.tcNo}</p>
                                <p><strong>Adres:</strong> {order.billingInfo.address}, {order.billingInfo.district}</p>
                                <p><strong>Şehir:</strong> {order.billingInfo.city} — {order.billingInfo.postalCode}</p>
                                <p><strong>Telefon:</strong> {order.billingInfo.phone}</p>
                                <p><strong>E-posta:</strong> {order.billingInfo.email}</p>
                                <p><strong>Sınıf:</strong> {order.billingInfo.sinif || "—"}</p>
                                <p><strong>Alan:</strong> {order.billingInfo.alan || "—"}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-[#94a3b8] mt-1">Fatura bilgisi bulunamadı.</p>
                            )}
                            {editingBilling === order.id ? (
                              <div className="mt-2 bg-white rounded-xl p-3 border border-[#e5e7eb] grid grid-cols-2 gap-2 max-[640px]:grid-cols-1">
                                {["name","surname","tcNo","address","city","postalCode","phone","email","sinif","alan"].map((f) => (
                                  <input key={f} className={inputCls} placeholder={f}
                                    value={updatedBillingInfo[f] || ""}
                                    onChange={(e) => setUpdatedBillingInfo({ ...updatedBillingInfo, [f]: e.target.value })}
                                  />
                                ))}
                                <div className="col-span-2 flex gap-2 max-[640px]:col-span-1">
                                  <Button onClick={() => handleBillingUpdate(order.id)} variant="secondary" size="sm" className="flex-1">Kaydet</Button>
                                  <Button onClick={() => setEditingBilling(null)} variant="neutral" size="sm" className="flex-1">İptal</Button>
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

                          {/* Trafik Kaynağı */}
                          <details className="mb-4" onToggle={(e) => { if (e.target.open) loadAttribution(order.id); }}>
                            <summary className="text-sm font-bold text-[#2563eb] cursor-pointer hover:text-[#1d4ed8] list-none">
                              🎯 Trafik Kaynağı & Oturum Geçmişi
                            </summary>
                            <div className="mt-2">
                              {(() => {
                                const data = attributionCache[order.id];
                                if (!data || data === "loading") {
                                  return <p className="text-xs text-[#94a3b8]">Yükleniyor...</p>;
                                }
                                if (data === "error") {
                                  return <p className="text-xs text-[#ef4444]">Trafik verisi yüklenemedi.</p>;
                                }
                                if (!data.hasData) {
                                  return <p className="text-xs text-[#94a3b8]">Bu sipariş için oturum verisi yok (eski sipariş ya da bu özellik eklenmeden önce oluşturulmuş).</p>;
                                }
                                const { snapshot, totalSessions, firstSession, convertingSession, middleSessionsCount } = data;
                                const SnapshotIcon = snapshot ? (CHANNEL_ICONS[snapshot.icon] || FaGlobe) : null;
                                const hasUtm = snapshot?.utm && (snapshot.utm.source || snapshot.utm.medium || snapshot.utm.campaign || snapshot.utm.term || snapshot.utm.content);
                                return (
                                  <div className="space-y-3">
                                    {snapshot && (
                                      <div className="bg-white rounded-xl p-3 border border-[#e5e7eb] space-y-1.5 text-xs text-[#334155]">
                                        <p className="flex items-center gap-2 font-bold text-[#0f172a] text-sm">
                                          <SnapshotIcon className="text-[#2563eb] flex-shrink-0" /> Sipariş {snapshot.headline}
                                        </p>
                                        {snapshot.referrerDomain && <p><strong>Yönlendiren:</strong> {snapshot.referrerDomain}</p>}
                                        <p><strong>Cihaz:</strong> {snapshot.deviceTypeLabel}{snapshot.os ? ` - ${snapshot.os}` : ""}{snapshot.browser ? ` - ${snapshot.browser}` : ""}</p>
                                        <p><strong>Oturum Süresi:</strong> {formatDuration(snapshot.durationSeconds)}</p>
                                        {snapshot.landingPage && <p className="break-all"><strong>Başlangıç Sayfası:</strong> {snapshot.landingPage}</p>}
                                        {hasUtm && (
                                          <div className="mt-2 pt-2 border-t border-[#f1f5f9] grid grid-cols-2 gap-1">
                                            {snapshot.utm.source && <p className="text-[11px]"><strong>utm_source:</strong> {snapshot.utm.source}</p>}
                                            {snapshot.utm.medium && <p className="text-[11px]"><strong>utm_medium:</strong> {snapshot.utm.medium}</p>}
                                            {snapshot.utm.campaign && <p className="text-[11px]"><strong>utm_campaign:</strong> {snapshot.utm.campaign}</p>}
                                            {snapshot.utm.term && <p className="text-[11px]"><strong>utm_term:</strong> {snapshot.utm.term}</p>}
                                            {snapshot.utm.content && <p className="text-[11px]"><strong>utm_content:</strong> {snapshot.utm.content}</p>}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#f1f5f9] text-xs text-[#334155] space-y-1.5">
                                      <p className="font-bold text-[#0f172a]">Toplam Oturum Sayısı: {totalSessions}</p>
                                      {firstSession?.isConverting ? (
                                        <p>• 1. oturumda sipariş {firstSession.headline} — {new Date(firstSession.startedAt).toLocaleDateString("tr-TR")}</p>
                                      ) : (
                                        <>
                                          {firstSession && (
                                            <p>• 1. oturum {firstSession.headline} — {new Date(firstSession.startedAt).toLocaleDateString("tr-TR")}</p>
                                          )}
                                          {middleSessionsCount > 0 && <p>• {middleSessionsCount} kez daha giriş yapıldı</p>}
                                          {convertingSession && (
                                            <p>• Sipariş {convertingSession.headline} — {new Date(convertingSession.startedAt).toLocaleDateString("tr-TR")}</p>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </details>

                          {/* Bitiş Tarihi */}
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <label className="text-xs font-bold text-[#475569]">📅 Bitiş Tarihi:</label>
                            <input
                              type="date"
                              className="px-3 py-1.5 border border-[#e5e7eb] rounded-xl text-sm outline-none focus:border-brand-navy transition-all"
                              value={order.endDate ? new Date(order.endDate).toISOString().split("T")[0] : ""}
                              onChange={(e) => handleOrderUpdate(order.id, e.target.value)}
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {["pending", "pending_payment"].includes(order.status) && (
                              <Button
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
                                variant="info"
                                size="sm"
                              >
                                Ödeme Durumunu Sorgula
                              </Button>
                            )}
                            {order.status === "refund_requested" && (
                              <Button onClick={() => handleApproveRefund(order.id)} variant="success" size="sm">
                                İadeyi Onayla
                              </Button>
                            )}
                            <Button onClick={() => handleDeleteOrder(order.id)} variant="danger" size="sm" className="ml-auto">
                              Siparişi Sil
                            </Button>
                          </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {filteredOrders.length > 0 && (
                  <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                      <span>Satır Adedi:</span>
                      <select
                        value={ordersPerPage}
                        onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                        className="border border-[#e5e7eb] rounded-lg px-2 py-1 text-xs outline-none"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span>
                        {filteredOrders.length === 0 ? 0 : (orderPage - 1) * ordersPerPage + 1} - {Math.min(orderPage * ordersPerPage, filteredOrders.length)} / {filteredOrders.length} Sipariş
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button disabled={orderPage === 1} onClick={() => setOrderPage((p) => p - 1)} variant="neutral" size="sm">‹ Önceki</Button>
                      <Button disabled={orderPage === orderTotalPages} onClick={() => setOrderPage((p) => p + 1)} variant="neutral" size="sm">Sonraki ›</Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6">
                {abandonedLoading ? (
                  <div className="p-10 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
                ) : !abandonedCarts || abandonedCarts.length === 0 ? (
                  <div className="p-10 text-center text-[#94a3b8] text-sm">Terk edilmiş sepet yok.</div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] border-y border-[#e5e7eb] text-left text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
                          <th className="px-6 py-3">Müşteri</th>
                          <th className="px-4 py-3">Ürünler</th>
                          <th className="px-4 py-3">Oluşturulma</th>
                          <th className="px-4 py-3">Hatırlatma</th>
                          <th className="px-4 py-3 text-right">Toplam</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {abandonedCarts.map((cart) => {
                          const { label: dateLabel, time: dateTime } = formatOrderDateParts(cart.createdAt);
                          return (
                            <tr key={cart.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                              <td className="px-6 py-4 align-top">
                                <p className="font-semibold text-[#0f172a]">{cart.customerName || "Misafir"}</p>
                                <p className="text-xs text-[#94a3b8] truncate max-w-[220px]">{cart.customerEmail || "—"}</p>
                              </td>
                              <td className="px-4 py-4 align-top text-xs text-[#475569]">
                                {cart.items.map((it, i) => (
                                  <p key={i}>{it.title} × {it.quantity}</p>
                                ))}
                              </td>
                              <td className="px-4 py-4 align-top whitespace-nowrap">
                                <p className="text-[#0f172a] font-semibold">{dateLabel}</p>
                                <p className="text-xs text-[#94a3b8]">{dateTime}</p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cart.reminderSent ? "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"}`}>
                                  {cart.reminderSent ? "Gönderildi" : "Gönderilmedi"}
                                </span>
                              </td>
                              <td className="px-4 py-4 align-top text-right font-black text-[#0f172a] whitespace-nowrap">₺{(cart.total / 100).toFixed(2)}</td>
                              <td className="px-6 py-4 align-top">
                                <Button onClick={() => handleDeleteAbandonedCart(cart.id)} variant="danger" size="sm">Sil</Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════ KULLANICILAR ══════════════════════════ */}
        {view === "users" && (
          <div className="space-y-6">
            {/* User Grid */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] overflow-hidden">
              <div className="p-5 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-black text-[#0f172a]">👥 Kayıtlı Kullanıcılar ({filteredUsers.length})</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl px-3 py-2">
                    <span className="text-[#94a3b8] text-sm">🔍</span>
                    <input
                      type="text"
                      placeholder="İsim veya e-posta..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="border-0 outline-none bg-transparent text-sm min-w-[180px]"
                    />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="bg-[#f8fafc] border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="all">Tüm Roller</option>
                    <option value="student">Öğrenci</option>
                    <option value="coach">Koç</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                {pagedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="group border border-[#e5e7eb] rounded-2xl p-4 cursor-pointer hover:border-brand-navy hover:shadow-[0_4px_16px_rgba(16,4,129,0.12)] transition-all bg-white"
                    onClick={() => { setSelectedUser(user); setEditingUser({ ...user, assignedCoachId: user.assignedCoach?.id || null }); }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-navy to-[#2563eb] flex items-center justify-center text-white font-black text-base flex-shrink-0">
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
              {filteredUsers.length > 0 && userTotalPages > 1 && (
                <div className="p-4 border-t border-[#f1f5f9] flex items-center justify-center gap-1.5 flex-wrap">
                  <Button disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)} variant="neutral" size="sm">‹ Önceki</Button>
                  <span className="text-xs text-[#64748b] px-2">Sayfa {userPage} / {userTotalPages}</span>
                  <Button disabled={userPage === userTotalPages} onClick={() => setUserPage((p) => p + 1)} variant="neutral" size="sm">Sonraki ›</Button>
                </div>
              )}
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
                    className="w-full py-3 bg-gradient-to-r from-brand-navy to-[#2563eb] text-white rounded-xl font-black text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,4,129,0.3)] transition-all"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const res = await axios.post("/api/admin/users", newUser, { headers: { Authorization: `Bearer ${token}` } });
                        setUsers([...users, res.data]);
                        setNewUser({ name: "", email: "", password: "", role: "student" });
                        showMsg("Yeni kullanıcı oluşturuldu.");
                      } catch (err) {
                        console.error(err);
                        showMsg("Kullanıcı oluşturulamadı.");
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
      </div>

      {/* ══════════════════════════ USER MODAL ══════════════════════════ */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" onClick={() => setSelectedUser(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[520px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] z-[1001]">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-5 border-b border-[#f1f5f9] sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-navy to-[#2563eb] flex items-center justify-center text-white font-black text-base flex-shrink-0">
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
              <Button onClick={handleUserUpdate} variant="secondary" className="flex-1">
                Güncelle
              </Button>
              <Button onClick={handleUserDelete} variant="danger" className="flex-1">
                Sil
              </Button>
              <Button onClick={() => setSelectedUser(null)} variant="neutral">
                Kapat
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
