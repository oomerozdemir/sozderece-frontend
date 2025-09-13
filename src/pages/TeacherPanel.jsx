import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/teacher-panel.css";

function RequestsPanel() {
  const statusMap = {
    SUBMITTED: "Gönderildi",
    PACKAGE_SELECTED: "Sepette",
    PAID: "Ödendi",
    CANCELLED: "İptal",
  };
  const statusHelp = {
    PACKAGE_SELECTED: "Öğrenci paket seçti fakat ödeme yapılmadı.",
    PAID: "Ödeme tamamlandı.",
    CANCELLED: "Talep iptal edildi.",
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("pending");
  const token = localStorage.getItem("token");

  const str = (v) => String(v || "");
  const isActive = (a) => str(a?.status).toUpperCase() !== "CANCELLED";
  const isPast = (dt) => new Date(dt) <= new Date();
  const hasDoneTeacher = (notes = "") => /doneTeacherAt=/.test(notes);

  // tek kaynak: request.status === 'PAID' (eski kayıtlar için order.status 'paid' ikincil sinyal olabilir)
  const isPaidLike = (r = {}) => {
    const sReq = str(r?.status).toUpperCase();
    if (sReq === "PAID") return true;
    const sOrder = str(r?.order?.status).toUpperCase();
    return sOrder === "PAID";
  };

  const isRejected = (r = {}) => {
    const s = str(r?.status).toUpperCase();
    const os = str(r?.order?.status || r?.orderStatus).toUpperCase();
    if (["CANCELLED", "REJECTED", "DECLINED"].includes(s)) return true;
    if (["CANCELLED", "REFUNDED", "FAILED", "VOID", "CHARGEBACK"].includes(os)) return true;
    if (r.cancelledAt || r.isCancelled) return true;
    const hasAnySlots = (r.appointments?.length || 0) + (r.appointmentsConfirmed?.length || 0) > 0;
    const anyActive =
      (r.appointmentsConfirmed || []).some(isActive) ||
      (r.appointments || []).some(isActive);
    if (hasAnySlots && !anyActive) return true;
    return false;
  };

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const { data } = await axios.get("/api/v1/ogretmen/me/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.items || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Talepler getirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const setStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(
        `/api/v1/ogretmen/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = data?.appointment || { id, status };
      setItems((list) =>
        list.map((r) => {
          const hadPending = (r.appointments || []).some((a) => a.id === id);
          const wasConfirmed = (r.appointmentsConfirmed || []).some((a) => a.id === id);
          const pending = (r.appointments || []).filter((a) => a.id !== id);
          let confirmed = (r.appointmentsConfirmed || []).filter((a) => a.id !== id);
          if (status === "CONFIRMED" && hadPending) confirmed = [...confirmed, updated];

          let newStatus = r.status;
          if (status === "CANCELLED" && (hadPending || wasConfirmed)) {
            if (pending.length === 0 && (confirmed?.length || 0) === 0) newStatus = "CANCELLED";
          }

          return { ...r, status: newStatus, appointments: pending, appointmentsConfirmed: confirmed };
        })
      );
      if (status === "CANCELLED") load();
    } catch (e) {
      alert(e?.response?.data?.message || "Durum güncellenemedi.");
    }
  };

  const completeAsTeacher = async (id) => {
    try {
      await axios.patch(
        `/api/v1/ogretmen/appointments/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((list) =>
        list.map((r) => ({
          ...r,
          appointmentsConfirmed: (r.appointmentsConfirmed || []).map((a) =>
            a.id === id ? { ...a, notes: (a.notes || "") + `;doneTeacherAt=${new Date().toISOString()}` } : a
          ),
        }))
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Tamamlandı olarak işaretlenemedi.");
    }
  };

  const bucketOf = (r) => {
    if (isRejected(r)) return "rejected";
    const hasConfirmedActive =
      (r.appointmentsConfirmed || []).some((a) => str(a?.status).toUpperCase() !== "CANCELLED");
    if (hasConfirmedActive || isPaidLike(r)) return "approved";
    return "pending";
  };

  const groups = useMemo(() => {
    const g = { pending: [], approved: [], rejected: [], all: [] };
    for (const r of items) {
      const b = bucketOf(r);
      g[b].push(r);
      g.all.push(r);
    }
    return g;
  }, [items]);

  const counts = {
    pending: groups.pending.length,
    approved: groups.approved.length,
    rejected: groups.rejected.length,
    all: groups.all.length,
  };
  const list = groups[tab] || [];

  return (
    <div className="tp-section">
      <div className="tp-head">
        <h2 className="tp-title">Gelen Talepler</h2>
        <button className={`tp-refresh ${loading ? "is-loading" : ""}`} onClick={load} disabled={loading} title="Yenile">
          <svg className="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" /></svg>
          <span className="label">{loading ? "Yükleniyor…" : "Yenile"}</span>
        </button>
      </div>

      <div className="tp-tabs" style={{ marginBottom: 8 }}>
        <button type="button" className={`tp-tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
          Bekleyen <span className="tp-chip">{counts.pending}</span>
        </button>
        <button type="button" className={`tp-tab ${tab === "approved" ? "active" : ""}`} onClick={() => setTab("approved")}>
          Onaylanmış <span className="tp-chip success">{counts.approved}</span>
        </button>
        <button type="button" className={`tp-tab ${tab === "rejected" ? "active" : ""}`} onClick={() => setTab("rejected")}>
          Reddedilmiş <span className="tp-chip danger">{counts.rejected}</span>
        </button>
        <button type="button" className={`tp-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          Tümü <span className="tp-chip muted">{counts.all}</span>
        </button>
      </div>

      {msg ? <div className="tp-alert">{msg}</div> : null}
      {loading ? <div className="tp-loading">Yükleniyor…</div> : null}

      {!loading && (!list || list.length === 0) ? (
        <div className="tp-empty">Bu bölümde gösterilecek talep yok.</div>
      ) : (
        <div className="tp-req-list">
          {list.map((r) => {
            const rejected = isRejected(r);
            const uiKey = rejected ? "CANCELLED" : isPaidLike(r) ? "PAID" : (r.status || "SUBMITTED");

            return (
              <div key={r.id} className="tp-card">
                <div className="tp-card-head">
                  <div className="tp-card-title">
                    {r.student?.name || "Öğrenci"}
                    <div className="tp-card-subtle">
                      {r.student?.email || "—"}{r.student?.phone ? <> • {r.student.phone}</> : null}
                    </div>
                  </div>
                  <div className="tp-badge">{r.packageTitle || "Paket"}</div>
                </div>

                <div className="tp-card-row">
                  <span>Ders:</span> <b>{r.subject}</b>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>Seviye:</span> <b>{r.grade}</b>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>Tür:</span> <b>{r.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</b>

                  <div className="tp-status" style={{ marginLeft: 10 }}>
                    <span className={"tp-chip " + (rejected ? "danger" : isPaidLike(r) ? "success" : "")}>
                      {statusMap[uiKey] || uiKey}
                    </span>
                    <span className="tp-info" tabIndex={0} aria-label="Durum açıklaması">
                      !
                      <span className="tp-tooltip">{statusHelp[uiKey] || "Durum açıklaması bulunamadı."}</span>
                    </span>
                  </div>
                </div>

                {(r.appointments || []).length > 0 && (
                  <>
                    <div className="tp-section-sub" style={{ marginTop: 8 }}>Onay bekleyen saatler</div>
                    <div className="tp-slots-grid">
                      {r.appointments.map((a) => {
                        const st = new Date(a.startsAt);
                        const et = new Date(a.endsAt);
                        return (
                          <div key={a.id} className="tp-slot-card">
                            <div className="tp-slot-time">
                              {st.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}{" "}
                              {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} –{" "}
                              {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="tp-slot-mode">{a.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</div>
                            <div className="tp-slot-actions">
                              <button className="tp-btn" onClick={() => setStatus(a.id, "CONFIRMED")}>Onayla</button>
                              <button className="tp-btn ghost" onClick={() => setStatus(a.id, "CANCELLED")}>İptal</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {(r.appointmentsConfirmed || []).length > 0 && (
                  <>
                    <div className="tp-section-sub" style={{ marginTop: 8 }}>Onaylanmış saatler</div>
                    <div className="tp-slots-grid">
                      {r.appointmentsConfirmed.map((a) => {
                        const st = new Date(a.startsAt);
                        const et = new Date(a.endsAt);
                        const past = isPast(a.endsAt);
                        const done = hasDoneTeacher(a.notes);
                        return (
                          <div key={a.id} className="tp-slot-card slot-confirmed">
                            <div className="tp-slot-time">
                              {st.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}{" "}
                              {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} –{" "}
                              {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="tp-slot-mode">Onaylı</div>
                            <div className="tp-slot-actions">
                              {done ? (
                                <span className="tp-chip success">✓ Tamamlandı</span>
                              ) : (
                                <button className="tp-btn" disabled={!past} title={!past ? "Ders saati geçtikten sonra aktif olur" : ""} onClick={() => past && completeAsTeacher(a.id)}>
                                  Ders tamamlandı
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TeacherPanel() {
  return (
    <>
      <Navbar />
      <div className="tpanel">
        <div className="tp-wrap">
          <RequestsPanel />
        </div>
      </div>
    </>
  );
}
