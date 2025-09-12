import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/studentPage.css";

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

  // 🔗 paid siparişlere bağlı requestId set'i
  const [paidByReqId, setPaidByReqId] = useState(() => new Set());

  // Order -> requestId(ler) çıkar
  const extractRequestIdsFromOrder = (o) => {
    const ids = new Set();
    const add = (v) => {
      if (v !== undefined && v !== null && v !== "") ids.add(String(v));
    };

    add(o?.requestId);
    add(o?.studentRequestId);
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
        headers: { Authorization: `Bearer ${token}` }, // 🔧 düzeltildi
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

        // paid siparişlerden requestId set
        const paidSet = new Set();
        (data?.orders || []).forEach((o) => {
          const st = String(o?.status || "").toLowerCase();
          if (st === "paid") {
            extractRequestIdsFromOrder(o).forEach((id) => paidSet.add(id));
          }
        });
        setPaidByReqId(paidSet);
      } catch (e1) {
        try {
          const { data } = await axios.get("api/my-orders", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
          const legacyNorm = normalizeOrdersLegacy(list);
          setOrders(legacyNorm);

          const paidSet2 = new Set();
          list.forEach((o) => {
            const st = String(o?.status || "").toLowerCase();
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

  // Review submit (tamamla + yorum)
  const submitReview = async () => {
    if (!reviewAppt) return;
    try {
      setSubmitting(true);
      // 1) Tamamlandı işaretle
      await axios.patch(
        `/api/v1/ogrenci/appointments/${reviewAppt.id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 2) Değerlendirme gönder
      await axios.post(
        `/api/v1/ogrenci/appointments/${reviewAppt.id}/review`,
        { rating: Number(rating), comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 3) UI güncelle
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
      // 4) Geçmişi tazele
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

  // Ödeme “benzeri” kontrol (orders join + fallback sinyaller)
  const isPaidLike = (req = {}) => {
    if (paidByReqId.has(String(req.id))) return true; // orders eşleşti
    const s = String(req?.order?.status || req?.orderStatus || req?.status || "").toLowerCase();
    if (s === "paid") return true;
    if (typeof req.paidTL === "number" && req.paidTL > 0) return true;
    if (req?.invoice?.vatAmount > 0 || req?.meta?.tax?.vatAmount > 0) return true;
    return false;
  };

  // Talepleri kovala
  const bucketOf = (req) => {
    if ((req.appointmentsConfirmed || []).length > 0) return "approved";
    if (isPaidLike(req)) return "approved";
    if (req.status === "CANCELLED") return "rejected";
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

  return (
    <>
      <Navbar />

      <div className="student-page-wrapper">
        <div className="student-dashboard-grid">
          {/* Sol: Koç Kartı */}
          <div className="studentPage-coach-card">
            <h3>Atanmış Koçunuz</h3>

            {!student.assignedCoach ? (
              <>
                <p>Hoş geldiniz! 👋</p>
                <p>
                  Henüz bir koç atamanız yapılmadı. Aşağıdaki butonları kullanarak paketlerimizi
                  inceleyebilir, ücretsiz ön görüşme planlayabilir veya WhatsApp üzerinden destek
                  alabilirsiniz.
                </p>
                <div className="studentPage-button-group">
                  <a href="/paket-detay" className="studentPage-button">📦 Paketleri İncele</a>
                  <a href="/ucretsiz-on-gorusme" className="studentPage-button">🗓️ Ücretsiz Ön Görüşme</a>
                  <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="studentPage-button whatsapp">💬 WhatsApp Destek</a>
                </div>
              </>
            ) : (
              <>
                <p className="student-welcome">Hoş geldiniz! 👋</p>
                <img
                  src={student.assignedCoach.image}
                  alt={student.assignedCoach.name}
                  className="student-dashboard-coach-image"
                />
                <p className="student-info-item"><strong>👨‍🏫 Koç Adı:</strong> {student.assignedCoach.name}</p>
                <p className="student-info-item"><strong>📘 Üniversite:</strong> {student.assignedCoach.subject}</p>
                <p className="student-info-item"><strong>📝 Alanı ve Derecesi:</strong> {student.assignedCoach.description}</p>
                <p className="student-info-item"><strong>📧 Email:</strong> {student.assignedCoach.user?.email}</p>
                <p className="student-info-item"><strong>📞 Telefon:</strong> {student.assignedCoach.user?.phone || "Belirtilmemiş"}</p>
                <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="studentPage-button whatsapp">💬 WhatsApp Destek</a>
              </>
            )}
          </div>

          {/* Sağ: Sekmeler */}
          <div className="studentPage-side-info">
            <div className="sdb-tabs">
              <button
                className={`sdb-tab ${tab === "requests" ? "active" : ""}`}
                onClick={() => setTab("requests")}
              >
                Taleplerim
              </button>
              <button
                className={`sdb-tab ${tab === "orders" ? "active" : ""}`}
                onClick={() => setTab("orders")}
              >
                Koçluk Siparişlerim
              </button>
              <button
                className={`sdb-tab ${tab === "past" ? "active" : ""}`}
                onClick={() => setTab("past")}
              >
                Geçmiş Derslerim
              </button>

              <button
                className={`sdb-refresh ${(reqLoading || ordersLoading || pastLoading) ? "is-loading" : ""}`}
                onClick={onRefresh}
                disabled={reqLoading || ordersLoading || pastLoading}
                title="Yenile"
              >
                <svg className="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" />
                </svg>
                <span className="label">
                  {(reqLoading || ordersLoading || pastLoading) ? "Yükleniyor…" : "Yenile"}
                </span>
              </button>
            </div>

            {tab === "requests" ? (
              <RequestsGroups
                groups={groups}
                loading={reqLoading}
                openReview={openReview}
                isPaidLike={isPaidLike}
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
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Ders değerlendirme">
          <div className="modal-card">
            <div className="modal-head">
              <div className="modal-title">Ders Değerlendirmesi</div>
              <button className="modal-close" onClick={()=>!submitting && setShowReview(false)} aria-label="Kapat">×</button>
            </div>

            <div className="modal-body">
              <div className="modal-row">
                <div className="modal-label">Puanınız</div>
                <div className="rating">
                  {[1,2,3,4,5].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={"star" + (v <= rating ? " active" : "")}
                      onClick={() => setRating(v)}
                      aria-label={`${v} yıldız`}
                    >★</button>
                  ))}
                </div>
              </div>

              <div className="modal-row">
                <div className="modal-label">Yorumunuz (isteğe bağlı)</div>
                <textarea
                  rows={4}
                  placeholder="Ders deneyiminizi kısaca paylaşın…"
                  value={comment}
                  onChange={(e)=>setComment(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={()=>!submitting && setShowReview(false)}>Vazgeç</button>
              <button className="btn" disabled={submitting} onClick={submitReview}>
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

function RequestsGroups({ groups, loading, openReview, isPaidLike }) {
  return (
    <div className="sdb-requests">
      <div className="sdb-groups">
        <Group title={`Bekleyen (${groups.pending.length})`} color="warn" loading={loading}>
          {groups.pending.length === 0 ? (
            <div className="sdb-empty">Bekleyen talebiniz yok.</div>
          ) : (
            groups.pending.map((r) => (
              <RequestCard key={r.id} r={r} openReview={openReview} paidLike={isPaidLike(r)} />
            ))
          )}
        </Group>

        <Group title={`Onaylanmış (${groups.approved.length})`} color="ok" loading={loading}>
          {groups.approved.length === 0 ? (
            <div className="sdb-empty">Onaylanmış talebiniz yok.</div>
          ) : (
            groups.approved.map((r) => (
              <RequestCard key={r.id} r={r} openReview={openReview} paidLike={isPaidLike(r)} />
            ))
          )}
        </Group>

        <Group title={`Reddedilmiş (${groups.rejected.length})`} color="bad" loading={loading}>
          {groups.rejected.length === 0 ? (
            <div className="sdb-empty">Reddedilmiş talebiniz yok.</div>
          ) : (
            groups.rejected.map((r) => (
              <RequestCard key={r.id} r={r} openReview={openReview} paidLike={isPaidLike(r)} />
            ))
          )}
        </Group>
      </div>
    </div>
  );
}

function OrdersList({ loading, orders }) {
  return (
    <div className="sdb-orders">
      {loading ? (
        <div className="sdb-empty">Yükleniyor…</div>
      ) : (orders.length === 0) ? (
        <div className="sdb-empty">Koçluk siparişiniz bulunmuyor.</div>
      ) : (
        <div className="sdb-list">
          {orders.map((o) => (
            <div className="sdb-card" key={o.id}>
              <div className="sdb-card-row">
                <span>Sipariş No:</span> <b>{o.id}</b>
                <span className="sep">•</span>
                <span>Tarih:</span> <b>{fmtDate(o.createdAt)}</b>
              </div>
              <div className="sdb-card-row">
                <span>Paket:</span> <b>{o.package || "Koçluk Paketi"}</b>
                <span className="sep">•</span>
                <span>Tutar:</span>{" "}
                <b>{typeof o.amountTL === "number" ? `${o.amountTL.toLocaleString("tr-TR")} ₺` : "—"}</b>
                {o.endDate ? (
                  <>
                    <span className="sep">•</span>
                    <span>Bitiş:</span> <b>{fmtDate(o.endDate)}</b>
                  </>
                ) : null}
                <span className="sep">•</span>
                <span>Durum:</span>{" "}
                <b className={`sdb-status ${o.status?.toLowerCase?.() || ""}`}>{o.status || "—"}</b>
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
    <div className="sdb-orders">
      {loading ? (
        <div className="sdb-empty">Yükleniyor…</div>
      ) : (items.length === 0) ? (
        <div className="sdb-empty">Geçmiş dersiniz bulunmuyor.</div>
      ) : (
        <div className="sdb-list">
          {items.map((a) => (
            <div className="sdb-card" key={a.id}>
              <div className="sdb-card-row">
                <span>🗓</span>{" "}
                <b>{fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}</b>
                <span className="sep">•</span>
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

function Group({ title, color, loading, children }) {
  return (
    <section className={`sdb-group ${color || ""}`}>
      <h4 className="sdb-group-title">{title}</h4>
      {loading ? <div className="sdb-empty">Yükleniyor…</div> : children}
    </section>
  );
}

function RequestCard({ r, openReview, paidLike }) {
  const isPast = (dt) => new Date(dt) <= new Date();
  const hasDoneStudent = (notes = "") => /doneStudentAt=/.test(notes);

  return (
    <div className="sdb-card">
      <div className="sdb-card-head">
        <div className="sdb-card-title">
          {r.subject} <span className="muted">• {r.grade}</span>
        </div>

        <div className="sdb-status-wrap">
          <span
            className={
              "sdb-status-chip " +
              (paidLike ? "ok" : r.status === "CANCELLED" ? "bad" : "warn")
            }
          >
            <i className="dot" aria-hidden="true" />
            {statusMap[paidLike ? "PAID" : r.status] || (paidLike ? "PAID" : r.status)}
          </span>
          <span className="sdb-info" tabIndex={0} aria-label="Durum açıklaması">
            !
            <span className="sdb-tooltip">{statusHelp[paidLike ? "PAID" : r.status] || ""}</span>
          </span>
        </div>
      </div>

      <div className="sdb-card-row">
        <span>Tür:</span>{" "}
        <b>{r.mode === "FACE_TO_FACE" ? "Yüz yüze" : r.mode === "ONLINE" ? "Online" : "—"}</b>
        {typeof r.paidTL === "number" && (
          <>
            <span className="sep">•</span>
            <span>Ödenen:</span> <b>{r.paidTL.toLocaleString("tr-TR")} ₺</b>
          </>
        )}
        {typeof r.lessonsCount === "number" && (
          <>
            <span className="sep">•</span>
            <span>Ders adedi:</span> <b>{r.lessonsCount}</b>
          </>
        )}
      </div>

      {(r.appointmentsConfirmed?.length || r.appointments?.length) ? (
        <>
          {r.appointmentsConfirmed?.length > 0 && (
            <div className="sdb-card-row wrap">
              <span className="label-ok">Onaylanan saatler:</span>
              <div className="sdb-chips">
                {r.appointmentsConfirmed.map((a) => {
                  const past = isPast(a.endsAt);
                  const done = hasDoneStudent(a.notes);
                  return (
                    <span className="chip ok" key={a.id}>
                      {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
                      {done ? (
                        <span className="chip-check">✓</span>
                      ) : (
                        past && (
                          <button className="chip-btn" onClick={() => openReview?.(a)}>
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
            <div className="sdb-card-row wrap">
              <span className="label-warn">Bekleyen saatler:</span>
              <div className="sdb-chips">
                {r.appointments.map((a) => (
                  <span className="chip warn" key={a.id}>
                    {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="sdb-card-row">
          <span className="muted">Saat seçimi henüz yapılmamış.</span>
        </div>
      )}
    </div>
  );
}
