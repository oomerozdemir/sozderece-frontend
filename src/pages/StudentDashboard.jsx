import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/studentPage.css";

const statusMap = {
  PACKAGE_SELECTED: "Sepette",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

const statusHelp = {
  PACKAGE_SELECTED:
    "Sepette: Talebiniz sepetinizde. Ödemeyi tamamladığınızda talebiniz öğretmeninize iletilecek ve onay sürecine geçilecektir.",
  PAID:
    "Ödendi: Ödemeniz alındı. Seçtiğiniz saatler öğretmenin onayına gönderildi. Onaylandığında saatler 'Onaylanan saatler' bölümünde görünecektir.",
  CANCELLED:
    "İptal: Bu talep iptal edildi. İsterseniz yeni bir talep oluşturabilir veya farklı saatler deneyebilirsiniz.",
};
const bucketOf = (req) => {
  if ((req.appointmentsConfirmed || []).length > 0) return "approved";
  switch (req.status) {
    case "PAID":
      return "approved";
    case "CANCELLED":
      return "rejected";
    default:
      return "pending";
  }
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("requests"); // "requests" | "orders"
  const [loading, setLoading] = useState(true);

  const [reqLoading, setReqLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Profil bilgisi
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/student/me", {
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
      // ⬇️ Doğru endpoint
      const { data } = await axios.get("/api/v1/student-requests/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data?.items || data || []);
    } catch (e) {
      console.error("Talepler alınamadı:", e?.message);
      setRequests([]);
    } finally {
      setReqLoading(false);
    }
  };

  // Siparişlerim
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await axios.get("/api/v1/ogrenci/me/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = (data?.items || data || []).map((o) => ({
        id: o.id,
        status: o.status,
        amountTL:
          typeof o.amountTL === "number"
            ? o.amountTL
            : typeof o.amount === "number"
            ? Math.round(o.amount / 100)
            : null,
        createdAt: o.createdAt,
      }));
      setOrders(items);
    } catch (e) {
      console.error("Siparişler alınamadı:", e?.message);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // İlk yüklemede talepler ve siparişleri getir
  useEffect(() => {
    loadRequests();
    loadOrders();
  }, []); // token değişmiyor varsayımıyla

  if (loading) return <p>Yükleniyor...</p>;
  if (!student) return <p>Öğrenci verisi bulunamadı.</p>;

  // Talepleri kovala
  const groups = {
    pending: [],
    approved: [],
    rejected: [],
  };
  for (const r of requests) {
    groups[bucketOf(r)].push(r);
  }

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
                  <a href="/paket-detay" className="studentPage-button">
                    📦 Paketleri İncele
                  </a>
                  <a href="/ucretsiz-on-gorusme" className="studentPage-button">
                    🗓️ Ücretsiz Ön Görüşme
                  </a>
                  <a
                    href="https://wa.me/905312546701"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="studentPage-button whatsapp"
                  >
                    💬 WhatsApp Destek
                  </a>
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
                <p className="student-info-item">
                  <strong>👨‍🏫 Koç Adı:</strong> {student.assignedCoach.name}
                </p>
                <p className="student-info-item">
                  <strong>📘 Üniversite:</strong> {student.assignedCoach.subject}
                </p>
                <p className="student-info-item">
                  <strong>📝 Alanı ve Derecesi:</strong> {student.assignedCoach.description}
                </p>
                <p className="student-info-item">
                  <strong>📧 Email:</strong> {student.assignedCoach.user?.email}
                </p>
                <p className="student-info-item">
                  <strong>📞 Telefon:</strong> {student.assignedCoach.user?.phone || "Belirtilmemiş"}
                </p>
                <a
                  href="https://wa.me/905312546701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="studentPage-button whatsapp"
                >
                  💬 WhatsApp Destek
                </a>
              </>
            )}
          </div>

          {/* Sağ: Taleplerim / Siparişlerim */}
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
                Siparişlerim
              </button>

              <button
                className={`sdb-refresh ${reqLoading || ordersLoading ? "is-loading" : ""}`}
                onClick={() => {
                  if (tab === "requests") loadRequests();
                  else loadOrders();
                }}
                disabled={reqLoading || ordersLoading}
                title="Yenile"
              >
                <svg className="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" />
                </svg>
                <span className="label">{reqLoading || ordersLoading ? "Yükleniyor…" : "Yenile"}</span>
              </button>
            </div>

            {tab === "requests" ? (
              <div className="sdb-requests">
                <div className="sdb-groups">
                  <Group
                    title={`Bekleyen (${groups.pending.length})`}
                    color="warn"
                    loading={reqLoading}
                  >
                    {groups.pending.length === 0 ? (
                      <div className="sdb-empty">Bekleyen talebiniz yok.</div>
                    ) : (
                      groups.pending.map((r) => <RequestCard key={r.id} r={r} />)
                    )}
                  </Group>

                  <Group
                    title={`Onaylanmış (${groups.approved.length})`}
                    color="ok"
                    loading={reqLoading}
                  >
                    {groups.approved.length === 0 ? (
                      <div className="sdb-empty">Onaylanmış talebiniz yok.</div>
                    ) : (
                      groups.approved.map((r) => <RequestCard key={r.id} r={r} />)
                    )}
                  </Group>

                  <Group
                    title={`Reddedilmiş (${groups.rejected.length})`}
                    color="bad"
                    loading={reqLoading}
                  >
                    {groups.rejected.length === 0 ? (
                      <div className="sdb-empty">Reddedilmiş talebiniz yok.</div>
                    ) : (
                      groups.rejected.map((r) => <RequestCard key={r.id} r={r} />)
                    )}
                  </Group>
                </div>
              </div>
            ) : (
              <div className="sdb-orders">
                {ordersLoading ? (
                  <div className="sdb-empty">Yükleniyor…</div>
                ) : orders.length === 0 ? (
                  <div className="sdb-empty">Henüz siparişiniz yok.</div>
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
                          <span>Tutar:</span>{" "}
                          <b>
                            {typeof o.amountTL === "number"
                              ? `${o.amountTL.toLocaleString("tr-TR")} ₺`
                              : "—"}
                          </b>
                          <span className="sep">•</span>
                          <span>Durum:</span>{" "}
                          <b className={`sdb-status ${o.status?.toLowerCase?.() || ""}`}>
                            {o.status || "—"}
                          </b>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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

function RequestCard({ r }) {
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
              (r.status === "PAID" ? "ok" : r.status === "CANCELLED" ? "bad" : "warn")
            }
          >
            <i className="dot" aria-hidden="true" />
            {statusMap[r.status] || r.status}
          </span>
          <span className="sdb-info" tabIndex={0} aria-label="Durum açıklaması">
            !
            <span className="sdb-tooltip">{statusHelp[r.status] || ""}</span>
          </span>
        </div>
      </div>

      <div className="sdb-card-row">
        <span>Tür:</span>{" "}
        <b>{r.mode === "FACE_TO_FACE" ? "Yüz yüze" : r.mode === "ONLINE" ? "Online" : "—"}</b>
        {typeof r.paidTL === "number" && (
          <>
            <span className="sep">•</span>
            <span>Fiyat:</span> <b>{r.paidTL.toLocaleString("tr-TR")} ₺</b>
          </>
        )}
        {typeof r.lessonsCount === "number" && (
          <>
            <span className="sep">•</span>
            <span>Ders adedi:</span> <b>{r.lessonsCount}</b>
          </>
        )}
      </div>

      {/* Saatler */}
      {(r.appointmentsConfirmed?.length || r.appointments?.length) ? (
        <>
          {r.appointmentsConfirmed?.length > 0 && (
            <div className="sdb-card-row wrap">
              <span className="label-ok">Onaylanan saatler:</span>
              <div className="sdb-chips">
                {r.appointmentsConfirmed.map((a) => (
                  <span className="chip ok" key={a.id}>
                    {fmtDate(a.startsAt)} — {fmtDate(a.endsAt)}
                  </span>
                ))}
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
