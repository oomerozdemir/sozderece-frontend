import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  SUBMITTED: "Talebiniz oluşturuldu.",
  PACKAGE_SELECTED: "Sepette: Paket seçildi, ödeme ile tamamlayabilirsiniz.",
  PAID: "Ödendi: Ödeme tamamlandı.",
  CANCELLED: "İptal edildi.",
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "";

const isCoachingOrder = (o = {}) => {
  const t = (o.type || o.category || "").toString().toLowerCase();
  if (["coaching", "coach", "koçluk", "kocluk", "coaching_package"].some((k) => t.includes(k))) return true;
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
    amountTL: typeof o.totalPrice === "number" ? o.totalPrice : typeof o.amount === "number" ? Math.round(o.amount / 100) : null,
    package: o.package || o.packageTitle || o.title,
    type: o.type || o.category || null,
    raw: o,
  }));

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("requests");
  const [loading, setLoading] = useState(true);

  const [reqLoading, setReqLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pastLoading, setPastLoading] = useState(false);

  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pastLessons, setPastLessons] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const str = (v) => String(v || "");
  const isActiveAppt = (a) => str(a?.status).toUpperCase() !== "CANCELLED";
  const hasConfirmedActive = (r) => (r.appointmentsConfirmed || []).some(isActiveAppt);
  const hasPendingActive = (r) => (r.appointments || []).some(isActiveAppt);

  // tek kaynak: request.status === 'PAID'
  const isPaidLike = (r = {}) => str(r?.status).toUpperCase() === "PAID";

  const isRejected = (r = {}) => {
    const s = str(r?.status).toUpperCase();
    const os = str(r?.order?.status || r?.orderStatus).toUpperCase();
    if (["CANCELLED", "REJECTED", "DECLINED"].includes(s)) return true;
    if (["CANCELLED", "REFUNDED", "FAILED", "VOID", "CHARGEBACK"].includes(os)) return true;
    if (r.cancelledAt || r.isCancelled) return true;
    const hasAnySlots = (r.appointments?.length || 0) + (r.appointmentsConfirmed?.length || 0) > 0;
    const anyActive = hasConfirmedActive(r) || hasPendingActive(r);
    if (hasAnySlots && !anyActive) return true;
    return false;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/ogrenci/me", { headers: { Authorization: `Bearer ${token}` } });
        setStudent(res.data);
      } catch {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const loadRequests = async () => {
    try {
      setReqLoading(true);
      const { data } = await axios.get("/api/v1/student-requests/me", { headers: { Authorization: `Bearer ${token}` } });
      setRequests(data?.items || data || []);
    } catch {
      setRequests([]);
    } finally {
      setReqLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await axios.get("/api/my-orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(normalizeOrdersNew(data?.orders || []));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadPastAppointments = async () => {
    try {
      setPastLoading(true);
      const { data } = await axios.get("/api/v1/ogrenci/me/appointments/past", { headers: { Authorization: `Bearer ${token}` } });
      setPastLessons(data?.items || []);
    } catch {
      setPastLessons([]);
    } finally {
      setPastLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    loadOrders();
    loadPastAppointments();
  }, []);

  const bucketOf = (r) => {
    if (isRejected(r)) return "rejected";
    if (hasConfirmedActive(r) || isPaidLike(r)) return "approved";
    return "pending";
  };

  const groups = { pending: [], approved: [], rejected: [] };
  for (const r of requests) groups[bucketOf(r)].push(r);

  const coachingOrders = (orders || []).filter(isCoachingOrder);

  const onRefresh = () => {
    if (tab === "requests") return loadRequests();
    if (tab === "orders") return loadOrders();
    if (tab === "past") return loadPastAppointments();
  };

  if (loading) return <p>Yükleniyor…</p>;
  if (!student) return <p>Öğrenci verisi bulunamadı.</p>;

  return (
    <>
      <Navbar />

      <div className="student-page-wrapper">
        <div className="student-dashboard-grid">
          {/* sol kart */}
          <div className="studentPage-coach-card">
            <h3>Atanmış Koçunuz</h3>
            {!student.assignedCoach ? (
              <>
                <p>Hoş geldiniz! 👋</p>
                <p>Paketleri inceleyebilir veya WhatsApp üzerinden destek alabilirsiniz.</p>
                <div className="studentPage-button-group">
                  <a href="/paket-detay" className="studentPage-button">📦 Paketleri İncele</a>
                  <a href="/ucretsiz-on-gorusme" className="studentPage-button">🗓️ Ücretsiz Ön Görüşme</a>
                  <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="studentPage-button whatsapp">💬 WhatsApp Destek</a>
                </div>
              </>
            ) : (
              <>
                <p className="student-welcome">Hoş geldiniz! 👋</p>
                <img src={student.assignedCoach.image} alt={student.assignedCoach.name} className="student-dashboard-coach-image" />
                <p className="student-info-item"><strong>👨‍🏫 Koç Adı:</strong> {student.assignedCoach.name}</p>
                <p className="student-info-item"><strong>📘 Üniversite:</strong> {student.assignedCoach.subject}</p>
                <p className="student-info-item"><strong>📝 Alanı:</strong> {student.assignedCoach.description}</p>
                <p className="student-info-item"><strong>📧 Email:</strong> {student.assignedCoach.user?.email}</p>
                <p className="student-info-item"><strong>📞 Telefon:</strong> {student.assignedCoach.user?.phone || "Belirtilmemiş"}</p>
                <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="studentPage-button whatsapp">💬 WhatsApp Destek</a>
              </>
            )}
          </div>

          {/* sağ: sekmeler */}
          <div className="studentPage-side-info">
            <div className="sdb-tabs">
              <button className={`sdb-tab ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>Taleplerim</button>
              <button className={`sdb-tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>Koçluk Siparişlerim</button>
              <button className={`sdb-tab ${tab === "past" ? "active" : ""}`} onClick={() => setTab("past")}>Geçmiş Derslerim</button>
              <button className={`sdb-refresh ${(reqLoading || ordersLoading || pastLoading) ? "is-loading" : ""}`} onClick={onRefresh} disabled={reqLoading || ordersLoading || pastLoading} title="Yenile">
                <svg className="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" /></svg>
                <span className="label">{(reqLoading || ordersLoading || pastLoading) ? "Yükleniyor…" : "Yenile"}</span>
              </button>
            </div>

            {tab === "requests" ? (
              <RequestsGroups
                groups={groups}
                loading={reqLoading}
                isRejected={isRejected}
                isPaidLike={(r) => isPaidLike(r)}
              />
            ) : tab === "orders" ? (
              <OrdersList loading={ordersLoading} orders={coachingOrders} />
            ) : (
              <PastLessons loading={pastLoading} items={pastLessons} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* -------- Parçalar -------- */

function RequestsGroups({ groups, loading, isRejected, isPaidLike }) {
  return (
    <div className="sdb-requests">
      <div className="sdb-groups">
        <Group title={`Bekleyen (${groups.pending.length})`} color="warn" loading={loading}>
          {groups.pending.length === 0 ? (
            <div className="sdb-empty">Bekleyen talebiniz yok.</div>
          ) : (
            groups.pending.map((r) => <RequestCard key={r.id} r={r} rejected={isRejected(r)} paidLike={isPaidLike(r)} />)
          )}
        </Group>

        <Group title={`Onaylanmış (${groups.approved.length})`} color="ok" loading={loading}>
          {groups.approved.length === 0 ? (
            <div className="sdb-empty">Onaylanmış talebiniz yok.</div>
          ) : (
            groups.approved.map((r) => <RequestCard key={r.id} r={r} rejected={isRejected(r)} paidLike={isPaidLike(r)} />)
          )}
        </Group>

        <Group title={`Reddedilmiş (${groups.rejected.length})`} color="bad" loading={loading}>
          {groups.rejected.length === 0 ? (
            <div className="sdb-empty">Reddedilmiş talebiniz yok.</div>
          ) : (
            groups.rejected.map((r) => <RequestCard key={r.id} r={r} rejected={true} paidLike={false} />)
          )}
        </Group>
      </div>
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

function RequestCard({ r, rejected, paidLike }) {
  const navigate = useNavigate();

  const isPast = (dt) => new Date(dt) <= new Date();
  const hasDoneStudent = (notes = "") => /doneStudentAt=/.test(notes);

  const uiKey = rejected ? "CANCELLED" : paidLike ? "PAID" : (r.status || "SUBMITTED");

  const goToPayment = (req) => {
    try { localStorage.setItem("activeRequestId", req.id); } catch {}
    navigate(`/payment?requestId=${req.id}`, { state: { requestId: req.id } });
  };

  return (
    <div className="sdb-card">
      <div className="sdb-card-head">
        <div className="sdb-card-title">
          {r.subject} <span className="muted">• {r.grade}</span>
        </div>
        <div className="sdb-status-wrap">
          <span className={"sdb-status-chip " + (rejected ? "bad" : paidLike ? "ok" : "warn")}>
            <i className="dot" aria-hidden="true" />
            {statusMap[uiKey] || uiKey}
          </span>
          <span className="sdb-info" tabIndex={0} aria-label="Durum açıklaması">
            !
            <span className="sdb-tooltip">{statusHelp[uiKey] || ""}</span>
          </span>
        </div>
      </div>

      <div className="sdb-card-row wrap">
        <span>Tür:</span>{" "}
        <b>{r.mode === "FACE_TO_FACE" ? "Yüz yüze" : r.mode === "ONLINE" ? "Online" : "—"}</b>
        <span className="sep">•</span>
        <span>Oluşturulma:</span> <b>{fmtDate(r.createdAt)}</b>
        {r.packageTitle ? (<><span className="sep">•</span><span>Paket:</span> <b>{r.packageTitle}</b></>) : null}
      </div>

      {(r.appointments || []).length > 0 && (
        <>
          <div className="sdb-card-row" style={{ marginTop: 6 }}><span className="label-warn">Onay bekleyen saatler</span></div>
          <div className="sdb-chips">
            {r.appointments.map((a) => {
              const st = new Date(a.startsAt);
              const et = new Date(a.endsAt);
              return (
                <span className="chip warn" key={a.id}>
                  {st.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}{" "}
                  {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} –{" "}
                  {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              );
            })}
          </div>
        </>
      )}

      {(r.appointmentsConfirmed || []).length > 0 && (
        <>
          <div className="sdb-card-row" style={{ marginTop: 6 }}><span className="label-ok">Onaylanmış saatler</span></div>
          <div className="sdb-chips">
            {r.appointmentsConfirmed.map((a) => {
              const st = new Date(a.startsAt);
              const et = new Date(a.endsAt);
              const past = isPast(a.endsAt);
              const done = hasDoneStudent(a.notes);
              return (
                <span className="chip ok" key={a.id} title={done ? "Tamamlandı" : past ? "Geçmiş ders" : ""}>
                  {st.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}{" "}
                  {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} –{" "}
                  {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  {done ? <span className="chip-check">✓</span> : null}
                </span>
              );
            })}
          </div>
        </>
      )}

      {/* Sepette → Ödeme Yap */}
      {String(r.status).toUpperCase() === "PACKAGE_SELECTED" && !paidLike && (
        <div className="sdb-card-row" style={{ marginTop: 10 }}>
          <button className="studentPage-button" onClick={() => goToPayment(r)}>
            💳 Ödeme Yap
          </button>
        </div>
      )}
    </div>
  );
}

function OrdersList({ loading, orders }) {
  return (
    <div className="sdb-orders">
      {loading ? (
        <div className="sdb-empty">Yükleniyor…</div>
      ) : orders.length === 0 ? (
        <div className="sdb-empty">Siparişiniz bulunmuyor.</div>
      ) : (
        <div className="sdb-list">
          {orders.map((o) => (
            <div className="sdb-card" key={o.id}>
              <div className="sdb-card-head">
                <div className="sdb-card-title">
                  {o.package || "Paket"} <span className="muted">• {fmtDate(o.createdAt)}</span>
                </div>
                <div className={`sdb-status ${String(o.status || "").toLowerCase() || ""}`}>
                  <b>{o.status || "—"}</b>
                </div>
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
      ) : items.length === 0 ? (
        <div className="sdb-empty">Geçmiş dersiniz bulunmuyor.</div>
      ) : (
        <div className="sdb-list">
          {items.map((a) => (
            <div className="sdb-card" key={a.id}>
              <div className="sdb-card-row">
                <span>🗓</span>{" "}
                <b>
                  {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
                </b>
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
