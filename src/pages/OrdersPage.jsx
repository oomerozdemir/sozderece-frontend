import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { format } from "date-fns";
import trLocale from "date-fns/locale/tr";
import RefundModal from "../components/RefundModal";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import {
  FaBoxOpen, FaSyncAlt, FaCreditCard, FaCalendarAlt, FaChevronDown,
  FaWhatsapp, FaUserTie, FaClipboardList, FaPhoneAlt, FaTag,
} from "react-icons/fa";

const STATUS_META = {
  paid: { label: "Ödendi", cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
  active: { label: "Aktif", cls: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]" },
  pending: { label: "Ödeme Bekliyor", cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
  pending_payment: { label: "Ödeme Bekliyor", cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
  failed: { label: "Başarısız", cls: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" },
  cancelled: { label: "İptal", cls: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]" },
  refunded: { label: "İade Edildi", cls: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" },
  refund_requested: { label: "İade Talep Edildi", cls: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]" },
  expired: { label: "Süresi Dolmuş", cls: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]" },
  past_due: { label: "Ödeme Bekleniyor", cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
  period_end: { label: "Dönem Sonunda Duracak", cls: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" },
};

const NEXT_STEPS = [
  {
    icon: <FaPhoneAlt />,
    title: "Danışmanımız Sizi Arar",
    desc: "Siparişiniz onaylandıktan sonra 24 saat içinde eğitim danışmanımız sizi arayarak süreci başlatır.",
    circleColor: "#1C1B8A",
  },
  {
    icon: <FaUserTie />,
    title: "Koçunuz Atanır",
    desc: "Akademik durumunuz ve hedefleriniz analiz edilerek size en uygun koç atanır.",
    circleColor: "#7340C8",
  },
  {
    icon: <FaClipboardList />,
    title: "Tanışma & İlk Programınız",
    desc: "Koçunuzla aynı gün tanışır, ilk haftalık çalışma programınızı birlikte oluşturursunuz.",
    circleColor: "#FF6B35",
  },
  {
    icon: <FaWhatsapp />,
    title: "Günlük Takip Başlar",
    desc: "WhatsApp üzerinden günlük plan ve akşam özetiyle sistemli çalışmaya başlarsınız.",
    circleColor: "#16a34a",
  },
];

const ORDER_FAQ = [
  {
    title: "Siparişimden sonra süreç nasıl işliyor?",
    content: "Siparişiniz onaylandıktan sonra 24 saat içinde eğitim danışmanımız sizi arar. Akademik durumunuz analiz edilir, size en uygun koç atanır ve aynı gün koçunuzla tanışıp ilk haftalık programınızı oluşturursunuz.",
  },
  {
    title: "İade politikanız nedir?",
    content: "Kayıt tarihinden itibaren ilk 14 gün içinde koşulsuz iade hakkınız bulunuyor. Program sizi tatmin etmezse hiçbir gerekçe göstermeksizin talep oluşturabilirsiniz.",
  },
  {
    title: "İade talebimi nasıl oluştururum?",
    content: "Aşağıdaki sipariş kartınızda yer alan \"İade Talebi Oluştur\" butonuna tıklayıp formu doldurmanız yeterli. Talebiniz incelendikten sonra size dönüş yapılır ve durumunu bu sayfadan takip edebilirsiniz.",
  },
  {
    title: "Aboneliğimi nasıl iptal ederim?",
    content: "Aktif bir aboneliğiniz varsa, \"Aboneliklerim\" kartındaki \"Aboneliği İptal Et\" butonunu kullanabilirsiniz. İptal ettiğinizde mevcut ödediğiniz dönem sonuna kadar erişiminiz devam eder, bir sonraki ay tekrar çekim yapılmaz.",
  },
  {
    title: "Koçumu değiştirebilir miyim?",
    content: "Evet. Koçunuzla enerjiniz uyuşmazsa ilk 5 gün içinde koşulsuz, sonrasında talep etmeniz halinde her zaman koç değiştirme hakkınız vardır. Yeni koçla tanışma görüşmesi ücretsizdir.",
  },
  {
    title: "Fatura bilgilerime nereden ulaşabilirim?",
    content: "Her siparişin altındaki \"Fatura Bilgileri\" bölümüne tıklayarak ad soyad, adres ve ödeme bilgilerinizi görüntüleyebilirsiniz.",
  },
];

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-14 border-2 border-dashed border-[#e2e8f0] rounded-2xl">
    <div className="text-3xl text-[#cbd5e1]">{icon}</div>
    <p className="font-nunito text-[#94a3b8] text-sm">{text}</p>
  </div>
);

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

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
    if (sub.status === "cancelled") return STATUS_META.cancelled;
    if (sub.status === "past_due") return STATUS_META.past_due;
    if (sub.cancelAtPeriodEnd) return STATUS_META.period_end;
    return STATUS_META.active;
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
  const getStatusMeta = (status, endDate, isTutorPkg) => {
    if (STATUS_META[status]) {
      if (status === "paid" || status === "active") {
        if (!isTutorPkg && endDate && new Date(endDate) < new Date()) return STATUS_META.expired;
      }
      return STATUS_META[status];
    }
    if (!isTutorPkg && endDate && new Date(endDate) < new Date()) return STATUS_META.expired;
    return STATUS_META.active;
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

  const hasAnything = !loading && !subsLoading && (orders.length > 0 || subscriptions.length > 0);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <TopBar />
      <Navbar />

      <div className="max-w-[900px] mx-auto px-5 py-12 max-[768px]:py-8">
        <div className="mb-8">
          <h1 className="font-fredoka font-bold text-page-navy text-2xl">Siparişlerim</h1>
          <p className="font-nunito text-[#64748b] text-sm mt-1">
            Siparişlerinizi, aboneliklerinizi ve fatura bilgilerinizi buradan takip edebilirsiniz.
          </p>
        </div>

        {/* Siparişten sonra ne olur? */}
        {hasAnything && (
          <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 max-[768px]:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6">
            <div className="mb-5">
              <div className="font-fredoka font-bold text-accent-orange text-[11px] uppercase mb-2" style={{ letterSpacing: 3 }}>
                SIRADA NE VAR?
              </div>
              <h2 className="font-fredoka font-bold text-page-navy text-lg">Siparişinizden Sonra Süreç Nasıl İşliyor?</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">
              {NEXT_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col gap-2.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                    style={{ background: step.circleColor, boxShadow: `0 4px 14px ${step.circleColor}40` }}
                  >
                    {step.icon}
                  </div>
                  <h3 className="font-fredoka font-bold text-page-dark text-sm leading-snug">{step.title}</h3>
                  <p className="font-nunito text-[#64748b] text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Abonelikler */}
        {!subsLoading && subscriptions.length > 0 && (
          <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 max-[768px]:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6">
            <h2 className="font-fredoka font-bold text-page-navy text-lg mb-4 flex items-center gap-2">
              <FaSyncAlt className="text-page-navy" size={16} /> Aboneliklerim
            </h2>
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub) => {
                const meta = subscriptionStatusMeta(sub);
                const canCancel = sub.status !== "cancelled" && !sub.cancelAtPeriodEnd;
                return (
                  <div key={sub.id} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-fredoka font-bold text-page-dark text-base m-0">{sub.planLabel}</h3>
                      <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-[11px] font-bold border ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="font-nunito text-[#64748b] text-sm m-0 flex items-center gap-1.5">
                      <FaCreditCard size={12} /> Aylık Tutar: <strong className="text-page-dark">₺{(sub.amount / 100).toFixed(2)}</strong>
                      {sub.cardLast4 && <span>· •••• {sub.cardLast4}</span>}
                    </p>
                    {sub.status !== "cancelled" && (
                      <p className="font-nunito text-[#64748b] text-sm m-0 flex items-center gap-1.5">
                        <FaCalendarAlt size={12} />
                        {sub.cancelAtPeriodEnd ? "Erişim Sonu" : "Sonraki Çekim"}: {formatDate(sub.cancelAtPeriodEnd ? sub.currentPeriodEnd : sub.nextBillingDate)}
                      </p>
                    )}
                    {sub.cancelAtPeriodEnd && sub.status !== "cancelled" && (
                      <p className="font-nunito text-[#92400e] text-xs bg-[#fffbeb] border border-[#fde68a] rounded-lg px-3 py-2 mt-1">
                        Bu abonelik dönem sonunda otomatik olarak duracak, tekrar çekim yapılmayacak.
                      </p>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelSubscription(sub.id)}
                        disabled={cancellingId === sub.id}
                        className="mt-2 self-start font-fredoka font-bold text-xs px-4 py-2 rounded-full border border-[#fecaca] text-[#991b1b] bg-[#fef2f2] hover:bg-[#fee2e2] transition-colors disabled:opacity-60"
                      >
                        {cancellingId === sub.id ? "İptal ediliyor..." : "Aboneliği İptal Et"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Siparişler */}
        <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 max-[768px]:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="font-fredoka font-bold text-page-navy text-lg mb-4 flex items-center gap-2">
            <FaBoxOpen className="text-page-navy" size={16} /> Siparişlerim
          </h2>

          {loading ? (
            <EmptyState icon={<FaSyncAlt className="animate-spin" />} text="Siparişler yükleniyor..." />
          ) : orders.length === 0 ? (
            <EmptyState icon={<FaBoxOpen />} text="Henüz bir siparişiniz yok." />
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => {
                const tutorPkg = isTutorLessonPackage(order.package);
                const meta = getStatusMeta(order.status, order.endDate, tutorPkg);

                return (
                  <div key={order.id} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-fredoka font-bold text-page-dark text-base m-0">{order.package}</h3>
                      <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="font-nunito text-[#64748b] text-sm m-0">Sipariş #{order.id} · {formatDate(order.createdAt)}</p>

                    {!tutorPkg && (
                      <p className="font-nunito text-[#64748b] text-sm m-0 flex items-center gap-1.5">
                        <FaCalendarAlt size={12} /> Bitiş Tarihi: {formatDate(order.endDate)}
                      </p>
                    )}

                    {order.totalPrice != null && (
                      <p className="font-nunito text-[#64748b] text-sm m-0">
                        Toplam: <strong className="text-page-dark">₺{order.totalPrice}</strong>
                      </p>
                    )}
                    {order.couponCode && (
                      <p className="font-nunito text-[#64748b] text-sm m-0 flex items-center gap-1.5">
                        <FaTag size={11} /> Kupon: {order.couponCode}
                      </p>
                    )}

                    {tutorPkg && (
                      <div className="mt-2 p-3.5 rounded-xl" style={{ background: "rgba(28,27,138,0.06)", border: "1px solid rgba(28,27,138,0.15)" }}>
                        <p className="font-nunito text-page-navy text-sm m-0 mb-2">
                          Talebinizin durumunu takip etmek için öğrenci paneline gidin.
                        </p>
                        <a
                          href="/student/dashboard"
                          className="inline-flex items-center gap-1.5 font-fredoka font-bold text-xs px-4 py-2 rounded-full no-underline text-white transition-colors"
                          style={{ background: "#1C1B8A" }}
                        >
                          <FaUserTie size={11} /> Öğrenci Paneline Git
                        </a>
                      </div>
                    )}

                    <details className="group mt-1">
                      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-1.5 font-nunito font-bold text-page-navy text-xs">
                        <FaChevronDown size={10} className="transition-transform group-open:rotate-180" />
                        Fatura Bilgileri
                      </summary>
                      <div className="mt-2 pl-4 border-l-2 border-[#e2e8f0] flex flex-col gap-1">
                        <p className="font-nunito text-[#64748b] text-xs m-0"><strong className="text-page-dark">Ad Soyad:</strong> {order.billingInfo?.name} {order.billingInfo?.surname}</p>
                        <p className="font-nunito text-[#64748b] text-xs m-0"><strong className="text-page-dark">Adres:</strong> {order.billingInfo?.address}, {order.billingInfo?.district}, {order.billingInfo?.city} {order.billingInfo?.postalCode}</p>
                        <p className="font-nunito text-[#64748b] text-xs m-0"><strong className="text-page-dark">Telefon:</strong> {order.billingInfo?.phone}</p>
                        <p className="font-nunito text-[#64748b] text-xs m-0"><strong className="text-page-dark">E-posta:</strong> {order.billingInfo?.email}</p>
                      </div>
                    </details>

                    {order.status === "refund_requested" && (
                      <p className="font-nunito text-[#9a3412] text-xs bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-3 py-2 mt-1">
                        İade talebiniz için cevap bekleniyor.
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {order.status === "paid" && (
                        <button
                          onClick={() => handleRefundRequest(order.id)}
                          className="font-fredoka font-bold text-xs px-4 py-2 rounded-full border border-[#fde68a] text-[#92400e] bg-[#fffbeb] hover:bg-[#fef3c7] transition-colors"
                        >
                          İade Talebi Oluştur
                        </button>
                      )}
                      <a
                        href={`https://wa.me/9055312546701?text=Merhaba, ${order.package} paketiyle ilgili bir sorum var. Sipariş ID: ${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-fredoka font-bold text-xs px-4 py-2 rounded-full no-underline transition-colors"
                        style={{ background: "rgba(37,211,102,0.1)", color: "#128c4c", border: "1px solid rgba(37,211,102,0.3)" }}
                      >
                        <FaWhatsapp size={13} /> Destek İçin WhatsApp
                      </a>
                    </div>

                    {selectedOrderId === order.id && showModal && (
                      <RefundModal
                        orderId={order.id}
                        onClose={() => setShowModal(false)}
                        onSubmit={submitRefundRequest}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SSS */}
        <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 max-[768px]:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mt-6">
          <div className="mb-5">
            <div className="font-fredoka font-bold text-accent-orange text-[11px] uppercase mb-2" style={{ letterSpacing: 3 }}>SSS</div>
            <h2 className="font-fredoka font-bold text-page-navy text-lg">Sipariş, Süreç ve İade Hakkında</h2>
          </div>
          {ORDER_FAQ.map((item, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div
                key={idx}
                className={`relative rounded-2xl border overflow-hidden mb-3 transition-all duration-300 ${isOpen ? "border-page-navy shadow-[0_0_0_3px_rgba(28,27,138,0.06)]" : "border-[#e2e8f0] hover:border-page-navy/30"}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isOpen ? "bg-lime" : "bg-transparent"}`} />
                <button
                  className="w-full flex justify-between items-center gap-4 py-4 pl-6 pr-4 bg-white border-0 font-nunito font-bold text-[#0f172a] cursor-pointer text-left text-sm transition-colors"
                  onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                >
                  {item.title}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-black transition-all duration-300 ${isOpen ? "bg-lime text-page-navy rotate-45" : "bg-[#f1f5f9] text-[#64748b] rotate-0"}`}>+</div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 bg-[#f8fafc] ${isOpen ? "max-h-[240px] py-4 pl-6 pr-4 text-[#64748b] text-sm leading-relaxed border-t border-[#f1f5f9]" : "max-h-0"}`}>
                  <p>{item.content}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default OrdersPage;
