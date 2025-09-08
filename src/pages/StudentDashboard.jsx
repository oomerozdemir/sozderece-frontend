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

/** Koçluk siparişi filtresi:
 *  - type/category alanında “coaching/koçluk/kocluk/coach” içeriyorsa
 *  - veya paket/başlık içinde bu ifadeler geçiyorsa
 */
const isCoachingOrder = (o = {}) => {
  const t = (o.type || o.category || "").toString().toLowerCase();
  if (["coaching", "coach", "koçluk", "kocluk", "coaching_package"].some((k) => t.includes(k)))
    return true;

  const name = (o.package || o.packageTitle || o.title || "").toString().toLowerCase();
  if (["koçluk", "kocluk", "coach", "koç"].some((k) => name.includes(k))) return true;

  return false;
};

// /api/my-orders → yeni yapı (OrdersPage.jsx ile uyumlu)
// Fallback: /api/v1/ogrenci/me/orders → eski yapı
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
  const [tab, setTab] = useState("requests"); // "requests" | "orders"
  const [loading, setLoading] = useState(true);

  const [reqLoading, setReqLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Profil
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
      const { data } = await axios.get("/api/v1/ogrenci/me/requests", {
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

  // Siparişlerim (Koçluk)
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);

      // 1) Yeni uç: /api/my-orders (OrdersPage.jsx ile aynı)
      try {
        const { data } = await axios.get("/api/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(normalizeOrdersNew(data?.orders || []));
      } catch (e1) {
        // 2) Eski uç: /api/v1/ogrenci/me/orders
        try {
          const { data } = await axios.get("/api/v1/ogrenci/me/orders", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
          setOrders(normalizeOrdersLegacy(list));
        } catch (e2) {
          console.error("Siparişler alınamadı:", e2?.message || e1?.message);
          setOrders([]);
        }
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  // İlk yüklemede talepler ve siparişleri getir
  useEffect(() => {
    loadRequests();
    loadOrders();
  }, []); // token sabit varsayıldı

  if (loading) return <p>Yükleniyor...</p>;
  if (!student) return <p>Öğrenci verisi bulunamadı.</p>;

  // Talepleri kovala
  const groups = { pending: [], approved: [], rejected: [] };
  for (const r of requests) groups[bucketOf(r)].push(r);

  // Yalnız koçluk siparişleri
  const coachingOrders = (orders || []).filter(isCoachingOrder);

  return (
    <>
      <Navbar />

      <div className="student-page-wrapper">
        <div className="student-dashboard-grid">
          {/* Sol: Koç Kartı (mevcut) */}
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

          {/* Sağ: Taleplerim / Koçluk Siparişlerim */}
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
                  <Group title={`Bekleyen (${groups.pending.length})`} color="warn" loading={reqLoading}>
                    {groups.pending.length === 0 ? (
                      <div className="sdb-empty">Bekleyen talebiniz yok.</div>
                    ) : (
                      groups.pending.map((r) => <RequestCard key={r.id} r={r} />)
                    )}
                  </Group>

                  <Group title={`Onaylanmış (${groups.approved.length})`} color="ok" loading={reqLoading}>
                    {groups.approved.length === 0 ? (
                      <div className="sdb-empty">Onaylanmış talebiniz yok.</div>
                    ) : (
                      groups.approved.map((r) => <RequestCard key={r.id} r={r} />)
                    )}
                  </Group>

                  <Group title={`Reddedilmiş (${groups.rejected.length})`} color="bad" loading={reqLoading}>
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
                ) : coachingOrders.length === 0 ? (
                  <div className="sdb-empty">Koçluk siparişiniz bulunmuyor.</div>
                ) : (
                  <div className="sdb-list">
                    {coachingOrders.map((o) => (
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
