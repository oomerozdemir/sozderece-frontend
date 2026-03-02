import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { RequestBadge } from "../utils/requestBadges";

const statusMap = {
  SUBMITTED: "Gönderildi",
  PACKAGE_SELECTED: "Sepette",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

const statusHelp = {
  SUBMITTED:
    "Gönderildi: Talebiniz oluşturuldu. Öğretmen uygun saatleri onayladığında bilgilendirileceksiniz.",
  PACKAGE_SELECTED:
    "Sepette: Paketiniz ve saatleriniz oluşturuldu, ödeme ile tamamlayabilirsiniz.",
  PAID:
    "Ödendi: Ödeme tamamlandı. Öğretmen onayı sonrası ders planlaması netleşir.",
  CANCELLED: "İptal: Bu talep iptal edilmiştir.",
};

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

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("requests"); // "requests" | "orders" | "past"
  const [loading, setLoading] = useState(true);

  const [reqLoading, setReqLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pastLoading, setPastLoading] = useState(false);

  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pastLessons, setPastLessons] = useState([]);

  // REVIEW MODAL STATE
  const [showReview, setShowReview] = useState(false);
  const [reviewAppt, setReviewAppt] = useState(null); // { id, startsAt, endsAt, ... }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // orders → paid requestId eşleştirmesi
  const [paidByReqId, setPaidByReqId] = useState(() => new Set());

  // Order içinden requestId'leri topla (çeşitli olası alanlar)
  const extractRequestIdsFromOrder = (o) => {
    const ids = new Set();
    const add = (v) => {
      if (v !== undefined && v !== null && v !== "") ids.add(String(v));
    };

    add(o?.requestId);
    add(o?.studentRequestId);
    add(o?.studentRequest?.id); // getMyOrders include ile geliyorsa

       if (Array.isArray(o?.studentRequests)) {
     o.studentRequests.forEach(r => add(r?.id));
  }
    add(o?.meta?.requestId);
    add(o?.metadata?.requestId);

    const scanArr = (arr) =>
      Array.isArray(arr)
        ? arr.forEach((it) => {
            add(it?.requestId);
            add(it?.meta?.requestId);
          })
        : null;

    scanArr(o?.items);
    scanArr(o?.cart);
    scanArr(o?.payload?.cart);

    return ids;
  };

  /* ---------------- Yardımcılar (ONAY/RED/PAID ayrımı) ---------------- */
  const STR = (v) => String(v ?? "");
  const APPT = (a) => STR(a?.status).toUpperCase();

  // Öğrenci tarafında 'paid' kararı: yalın ve güvenli
  const isPaidLike = (r = {}) => {
  const rs = String(r?.status || "").toUpperCase();
   const os = String(r?.order?.status || r?.orderStatus || "").toUpperCase();
   return rs === "PAID" || os === "PAID";
 };

  const hasConfirmedActive = (r) =>
    (r.appointmentsConfirmed || []).some((a) => APPT(a) !== "CANCELLED");

  const hasPendingActive = (r) =>
    (r.appointments || []).some((a) => APPT(a) !== "CANCELLED");

  const allSlotsCancelled = (r) => {
    const slots = [...(r.appointments || []), ...(r.appointmentsConfirmed || [])];
    return slots.length > 0 && slots.every((a) => APPT(a) === "CANCELLED");
  };

  // Reddedilmiş kural seti
 const isRejected = (r = {}) => {
   const s  = STR(r?.status).toUpperCase();
   const os = STR(r?.order?.status).toUpperCase();
   if (["CANCELLED", "REJECTED", "DECLINED"].includes(s)) return true;
   if (["CANCELLED","REFUNDED","FAILED","VOID","CHARGEBACK"].includes(os)) return true;
   if (r.cancelledAt || r.isCancelled) return true;
   if (allSlotsCancelled(r)) return true;
   const hasAnySlots =
     (r.appointments?.length || 0) + (r.appointmentsConfirmed?.length || 0) > 0;
   const anyActive = hasConfirmedActive(r) || hasPendingActive(r);
   if (hasAnySlots && !anyActive) return true;
   return false;
 };

  /* ---------------- Veri Yüklemeleri ---------------- */
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

  // Taleplerim
  const loadRequests = async () => {
    try {
      setReqLoading(true);
      const { data } = await axios.get("/api/v1/student-requests/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = data?.items || data || [];
      setRequests(raw);
    } catch (e) {
      console.error("Talepler alınamadı:", e?.message);
      setRequests([]);
    } finally {
      setReqLoading(false);
    }
  };

  // Siparişlerim (Koçluk)
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      try {
        const { data } = await axios.get("/api/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const normalized = normalizeOrdersNew(data?.orders || []);
        setOrders(normalized);

        const paidSet = new Set();
        (data?.orders || []).forEach((o) => {
          if (String(o?.status).toLowerCase() === "paid") {
            extractRequestIdsFromOrder(o).forEach((id) => paidSet.add(id));
          }
        });
        setPaidByReqId(paidSet);
      } catch (e1) {
        // Eski endpoint/yanıt uyumluluğu
        try {
          const { data } = await axios.get("api/my-orders", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
            ? data
            : [];
          const legacyNorm = normalizeOrdersLegacy(list);
          setOrders(legacyNorm);

          const paidSet2 = new Set();
          list.forEach((o) => {
            const st = STR(o?.status).toLowerCase();
            if (st === "paid") {
              extractRequestIdsFromOrder(o).forEach((id) => paidSet2.add(id));
            }
          });
          setPaidByReqId(paidSet2);
        } catch (e2) {
          console.error("Siparişler alınamadı:", e2?.message || e1?.message);
          setOrders([]);
          setPaidByReqId(new Set());
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

  // Review modalını aç
  const openReview = (appt) => {
    setReviewAppt(appt);
    setRating(5);
    setComment("");
    setShowReview(true);
  };

  // Review submit
  const submitReview = async () => {
    if (!reviewAppt) return;
    try {
      setSubmitting(true);
      await axios.patch(
        `/api/v1/ogrenci/appointments/${reviewAppt.id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.post(
        `/api/v1/ogrenci/appointments/${reviewAppt.id}/review`,
        { rating: Number(rating), comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((list) =>
        list.map((r) => ({
          ...r,
          appointmentsConfirmed: (r.appointmentsConfirmed || []).map((a) =>
            a.id === reviewAppt.id
              ? { ...a, notes: (a.notes || "") + `;doneStudentAt=${new Date().toISOString()}` }
              : a
          ),
        }))
      );
      loadPastAppointments();
      setShowReview(false);
    } catch (e) {
      alert(e?.response?.data?.message || "Değerlendirme gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadRequests();
    loadOrders();
    loadPastAppointments();
  }, []); // token sabit varsayımı

  // Kovalar (öncelik: rejected > approved > pending)
 const bucketOf = (r) => {
   if (isRejected(r)) return "rejected";
   if (hasConfirmedActive(r)) return "approved";
   if (hasPendingActive(r)) return "pending";
  const hadAnySlots =
     (r.appointments?.length || 0) + (r.appointmentsConfirmed?.length || 0) > 0;
   if (hadAnySlots) return "rejected";
   return "pending";
 };

  const groups = { pending: [], approved: [], rejected: [] };
  for (const r of requests) groups[bucketOf(r)].push(r);

  // Yalnız koçluk siparişleri
  const coachingOrders = (orders || []).filter(isCoachingOrder);

  const onRefresh = () => {
    if (tab === "requests") return loadRequests();
    if (tab === "orders") return loadOrders();
    if (tab === "past") return loadPastAppointments();
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (!student) return <p>Öğrenci verisi bulunamadı.</p>;

  const isAnyLoading = reqLoading || ordersLoading || pastLoading;

  const tabCls = (t) =>
    `border font-bold py-2 px-3 rounded-[10px] cursor-pointer transition-all max-[768px]:py-[7px] max-[768px]:px-[10px] ${
      tab === t
        ? "bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-[0_8px_20px_rgba(29,78,216,.25)]"
        : "border-[#e5e7eb] bg-white text-[#1f2937] hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(2,6,23,.08)]"
    }`;

  const btnCls = "py-[10px] px-4 text-white no-underline rounded-[52px] font-medium transition max-[768px]:flex-auto max-[768px]:text-center";

  return (
    <>
      <Navbar />

      <div className="flex justify-center px-5 py-[60px] min-h-screen">
        <div className="grid grid-cols-2 gap-8 max-w-[1100px] w-full max-[768px]:grid-cols-1">
          {/* Sol: Koç Kartı */}
          <div className="bg-white p-[30px_40px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.07)] text-center max-[768px]:p-5">
            <h3 className="text-[1.5rem] mb-5 text-[#1f2937]">Atanmış Koçunuz</h3>

            {!student.assignedCoach ? (
              <>
                <p>Hoş geldiniz! 👋</p>
                <p>
                  Henüz bir koç atamanız yapılmadı. Aşağıdaki butonları kullanarak paketlerimizi
                  inceleyebilir, ücretsiz ön görüşme planlayabilir veya WhatsApp üzerinden destek
                  alabilirsiniz.
                </p>
                <div className="mt-5 flex gap-3 flex-wrap max-[768px]:flex-col max-[768px]:items-stretch">
                  <a href="/paket-detay" className={`${btnCls} bg-[#dd8115] hover:bg-[#003db3]`}>📦 Paketleri İncele</a>
                  <a href="/ucretsiz-on-gorusme" className={`${btnCls} bg-[#dd8115] hover:bg-[#003db3]`}>🗓️ Ücretsiz Ön Görüşme</a>
                  <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className={`${btnCls} bg-[#03973a] hover:bg-[#03973a]`}>💬 WhatsApp Destek</a>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-[1.1rem] text-[#2563eb] mb-3">Hoş geldiniz! 👋</p>
                <img
                  src={student.assignedCoach.image}
                  alt={student.assignedCoach.name}
                  className="w-[140px] h-[140px] object-cover rounded-full border-[3px] border-[#2563eb] mx-auto mb-4 block"
                />
                <p className="bg-[#f9fafb] rounded-md p-[10px] mb-[10px] text-left text-[0.95rem] text-[#333]"><strong>👨‍🏫 Koç Adı:</strong> {student.assignedCoach.name}</p>
                <p className="bg-[#f9fafb] rounded-md p-[10px] mb-[10px] text-left text-[0.95rem] text-[#333]"><strong>📘 Üniversite:</strong> {student.assignedCoach.subject}</p>
                <p className="bg-[#f9fafb] rounded-md p-[10px] mb-[10px] text-left text-[0.95rem] text-[#333]"><strong>📝 Alanı ve Derecesi:</strong> {student.assignedCoach.description}</p>
                <p className="bg-[#f9fafb] rounded-md p-[10px] mb-[10px] text-left text-[0.95rem] text-[#333]"><strong>📧 Email:</strong> {student.assignedCoach.user?.email}</p>
                <p className="bg-[#f9fafb] rounded-md p-[10px] mb-[10px] text-left text-[0.95rem] text-[#333]"><strong>📞 Telefon:</strong> {student.assignedCoach.user?.phone || "Belirtilmemiş"}</p>
                <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className={`${btnCls} bg-[#03973a] hover:bg-[#03973a]`}>💬 WhatsApp Destek</a>
              </>
            )}
          </div>

          {/* Sağ: Sekmeler */}
          <div className="bg-[#f0f4ff] border-l-[6px] border-[#3b82f6] p-6 rounded-xl text-[#1e3a8a] max-[768px]:mt-6">
            <div className="flex items-center gap-2 mb-3 max-[768px]:gap-[6px]">
              <button className={tabCls("requests")} onClick={() => setTab("requests")}>
                Taleplerim
              </button>
              <button className={tabCls("orders")} onClick={() => setTab("orders")}>
                Koçluk Siparişlerim
              </button>
              <button className={tabCls("past")} onClick={() => setTab("past")}>
                Geçmiş Derslerim
              </button>

              <button
                className="ml-auto inline-flex items-center gap-2 py-2 px-3 rounded-[10px] border-0 bg-gradient-to-br from-[#0ea5e9] to-[#22c55e] text-white font-bold cursor-pointer shadow-[0_8px_24px_rgba(2,6,23,.12)] transition-all hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(2,6,23,.16)] disabled:opacity-70"
                onClick={onRefresh}
                disabled={isAnyLoading}
                title="Yenile"
              >
                <svg
                  className={isAnyLoading ? "animate-spin" : ""}
                  width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
                >
                  <path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" />
                </svg>
                <span>{isAnyLoading ? "Yükleniyor…" : "Yenile"}</span>
              </button>
            </div>

            {tab === "requests" ? (
              <RequestsGroups
                groups={groups}
                loading={reqLoading}
                isRejected={isRejected}
                isPaidLike={isPaidLike}
                openReview={openReview}
              />
            ) : tab === "orders" ? (
              <OrdersList loading={ordersLoading} orders={coachingOrders} />
            ) : (
              <PastLessons loading={pastLoading} items={pastLessons} />
            )}
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReview && (
        <div className="fixed inset-0 bg-[rgba(2,6,23,.55)] flex items-center justify-center z-[1000] p-4" role="dialog" aria-modal="true" aria-label="Ders değerlendirme">
          <div className="w-[min(560px,96vw)] bg-white rounded-2xl shadow-[0_30px_60px_rgba(2,6,23,.35)] overflow-hidden">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#e5e7eb] bg-[#f9fafb]">
              <div className="font-extrabold text-[#111827]">Ders Değerlendirmesi</div>
              <button className="bg-transparent border-0 text-[22px] leading-[1] cursor-pointer text-[#6b7280]" onClick={()=>!submitting && setShowReview(false)} aria-label="Kapat">×</button>
            </div>

            <div className="p-[14px_16px] grid gap-3">
              <div className="grid gap-2">
                <div className="font-bold text-[#111827]">Puanınız</div>
                <div className="flex gap-[6px]">
                  {[1,2,3,4,5].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`text-[22px] leading-[1] border-0 bg-transparent cursor-pointer ${v <= rating ? "text-[#f59e0b]" : "text-[#e5e7eb]"}`}
                      onClick={() => setRating(v)}
                      aria-label={`${v} yıldız`}
                    >★</button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="font-bold text-[#111827]">Yorumunuz (isteğe bağlı)</div>
                <textarea
                  rows={4}
                  placeholder="Ders deneyiminizi kısaca paylaşın…"
                  value={comment}
                  onChange={(e)=>setComment(e.target.value)}
                  className="border border-[#e5e7eb] rounded-[10px] p-[10px] font-[inherit] resize-y"
                />
              </div>
            </div>

            <div className="flex gap-[10px] justify-end p-[12px_16px] border-t border-[#e5e7eb]">
              <button
                className="flex-1 h-11 text-[15px] font-semibold rounded-xl bg-[#f3f4f6] text-[#111827] border border-[#e5e7eb] hover:bg-[#e5e7eb] transition-all"
                onClick={()=>!submitting && setShowReview(false)}
              >
                Vazgeç
              </button>
              <button
                className="flex-1 h-11 text-[15px] font-extrabold rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-[0_6px_16px_rgba(16,185,129,0.35)] text-white transition-all hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(5,150,105,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
                onClick={submitReview}
              >
                {submitting ? "Gönderiliyor…" : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ----------------- parçalar ----------------- */

function RequestsGroups({ groups, loading, isRejected, isPaidLike, openReview }) {
  return (
    <div>
      <div className="grid gap-3">
        <Group title={`Bekleyen (${groups.pending.length})`} color="warn" loading={loading}>
          {groups.pending.length === 0 ? (
            <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Bekleyen talebiniz yok.</div>
          ) : (
            groups.pending.map((r) => (
              <RequestCard key={r.id} r={r} openReview={openReview} rejected={isRejected(r)} paidLike={isPaidLike(r)} />
            ))
          )}
        </Group>

        <Group title={`Onaylanmış (${groups.approved.length})`} color="ok" loading={loading}>
          {groups.approved.length === 0 ? (
            <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Onaylanmış talebiniz yok.</div>
          ) : (
            groups.approved.map((r) => (
              <RequestCard key={r.id} r={r} openReview={openReview} rejected={isRejected(r)} paidLike={isPaidLike(r)} />
            ))
          )}
        </Group>

        <Group title={`Reddedilmiş (${groups.rejected.length})`} color="bad" loading={loading}>
          {groups.rejected.length === 0 ? (
            <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Reddedilmiş talebiniz yok.</div>
          ) : (
            groups.rejected.map((r) => (
              <RequestCard key={r.id} r={r} openReview={openReview} rejected={isRejected(r)} paidLike={isPaidLike(r)} />
            ))
          )}
        </Group>
      </div>
    </div>
  );
}

const statusColorMap = { paid: "text-[#065f46]", pending: "text-[#92400e]", failed: "text-[#991b1b]", cancelled: "text-[#991b1b]" };

function OrdersList({ loading, orders }) {
  return (
    <div>
      {loading ? (
        <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Yükleniyor…</div>
      ) : (orders.length === 0) ? (
        <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Koçluk siparişiniz bulunmuyor.</div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-[12px_14px] max-[768px]:p-3" key={o.id}>
              <div className="flex items-center gap-2 mt-2">
                <span>Sipariş No:</span> <b>{o.id}</b>
                <span className="mx-[6px] text-[#9ca3af]">•</span>
                <span>Tarih:</span> <b>{fmtDate(o.createdAt)}</b>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span>Paket:</span> <b>{o.package || "Koçluk Paketi"}</b>
                <span className="mx-[6px] text-[#9ca3af]">•</span>
                <span>Tutar:</span>{" "}
                <b>{typeof o.amountTL === "number" ? `${o.amountTL.toLocaleString("tr-TR")} ₺` : "—"}</b>
                {o.endDate ? (
                  <>
                    <span className="mx-[6px] text-[#9ca3af]">•</span>
                    <span>Bitiş:</span> <b>{fmtDate(o.endDate)}</b>
                  </>
                ) : null}
                <span className="mx-[6px] text-[#9ca3af]">•</span>
                <span>Durum:</span>{" "}
                <b className={statusColorMap[o.status?.toLowerCase?.() || ""] || ""}>{o.status || "—"}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PastLessons({ loading, items }) {
  return (
    <div>
      {loading ? (
        <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Yükleniyor…</div>
      ) : (items.length === 0) ? (
        <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Geçmiş dersiniz bulunmuyor.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-[12px_14px] max-[768px]:p-3" key={a.id}>
              <div className="flex items-center gap-2 mt-2">
                <span>🗓</span>{" "}
                <b>{fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}</b>
                <span className="mx-[6px] text-[#9ca3af]">•</span>
                <span>Tür:</span>{" "}
                <b>{a.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const groupTitleColorMap = { ok: "text-[#065f46]", warn: "text-[#1d4ed8]", bad: "text-[#b91c1c]" };

function Group({ title, color, loading, children }) {
  return (
    <section>
      <h4 className={`my-2 font-extrabold ${groupTitleColorMap[color] || "text-[#1d4ed8]"}`}>{title}</h4>
      {loading ? (
        <div className="border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#6b7280] p-[14px] rounded-xl">Yükleniyor…</div>
      ) : children}
    </section>
  );
}

function RequestCard({ r, openReview, rejected, paidLike }) {
  const isPast = (dt) => new Date(dt) <= new Date();
  const hasDoneStudent = (notes = "") => /doneStudentAt=/.test(notes);

  const uiKey = rejected ? "CANCELLED" : (paidLike ? "PAID" : (r.status || "SUBMITTED"));

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-[12px_14px] max-[768px]:p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-extrabold text-[#111827] flex items-center gap-2">
          {r.subject} <span className="text-[#6b7280] font-semibold">• {r.grade}</span>
        </div>

        <div className="flex items-center gap-[6px]">
          {/* Eski chip yerine ortak rozet */}
          <RequestBadge req={{ status: uiKey }} />
          {/* Tooltip trigger — group enables hover-show on child */}
          <span
            className="group relative inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#f59e0b] text-white font-black text-xs shadow-[0_2px_6px_rgba(2,6,23,.12)] cursor-help select-none"
            tabIndex={0}
            aria-label="Durum açıklaması"
          >
            !
            {/* sdb-tooltip class stays for ::after arrow in index.css */}
            <span className="sdb-tooltip hidden group-hover:block group-focus-within:block absolute bottom-[calc(100%+8px)] right-0 z-20 max-w-[min(360px,80vw)] p-[10px_12px] rounded-[10px] bg-[#111827] text-white text-xs leading-[1.35] shadow-[0_10px_26px_rgba(2,6,23,.18)] whitespace-normal font-normal">
              {statusHelp[uiKey] || ""}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span>Tür:</span>{" "}
        <b>{r.mode === "FACE_TO_FACE" ? "Yüz yüze" : r.mode === "ONLINE" ? "Online" : "—"}</b>
        {typeof r.paidTL === "number" && (
          <>
            <span className="mx-[6px] text-[#9ca3af]">•</span>
            <span>Ödenen:</span> <b>{r.paidTL.toLocaleString("tr-TR")} ₺</b>
          </>
        )}
        {typeof r.lessonsCount === "number" && (
          <>
            <span className="mx-[6px] text-[#9ca3af]">•</span>
            <span>Ders adedi:</span> <b>{r.lessonsCount}</b>
          </>
        )}
      </div>

      {(r.appointmentsConfirmed?.length || r.appointments?.length) ? (
        <>
          {r.appointmentsConfirmed?.length > 0 && (
            <div className="flex items-start flex-wrap gap-2 mt-2">
              <span className="text-[#065f46] font-bold">Onaylanan saatler:</span>
              <div className="flex gap-2 flex-wrap">
                {r.appointmentsConfirmed.map((a) => {
                  const past = isPast(a.endsAt);
                  const done = hasDoneStudent(a.notes);
                  return (
                    <span
                      className="font-bold text-xs py-1 px-2 rounded-full border border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]"
                      key={a.id}
                    >
                      {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
                      {done ? (
                        <span className="ml-[6px] font-bold text-[#10b981]">✓</span>
                      ) : (
                        past && (
                          <button
                            className="ml-2 py-1 px-3 text-[13px] font-semibold border-0 rounded-[20px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white cursor-pointer shadow-[0_4px_10px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-[2px] hover:shadow-[0_6px_14px_rgba(37,99,235,0.35)] hover:brightness-105"
                            onClick={() => openReview?.(a)}
                          >
                            Ders tamamlandı
                          </button>
                        )
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {r.appointments?.length > 0 && (
            <div className="flex items-start flex-wrap gap-2 mt-2">
              <span className="text-[#92400e] font-bold">Bekleyen saatler:</span>
              <div className="flex gap-2 flex-wrap">
                {r.appointments.map((a) => (
                  <span
                    className="font-bold text-xs py-1 px-2 rounded-full border border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
                    key={a.id}
                  >
                    {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[#9ca3af]">Saat seçimi henüz yapılmamış.</span>
        </div>
      )}
    </div>
  );
}
