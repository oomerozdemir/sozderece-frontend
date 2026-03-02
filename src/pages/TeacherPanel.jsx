import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import useTeacherScheduling from "../hooks/useTeacherScheduling";
import AvailabilityEditor from "../components/teacherComps/AvailabilityEditor";
import SlotsPreview from "../components/teacherComps/SlotsPreview";
import TimeOffManager from "../components/teacherComps/TimeOffManager";
import TeacherLessons from "../components/teacherComps/TeacherLessons";
import { RequestBadge } from "../utils/requestBadges";


/* =======================
   Gelen Talepler Paneli
======================= */
function RequestsPanel() {
  const statusMap = {
    SUBMITTED: "Gönderildi",
    PACKAGE_SELECTED: "Sepette",
    PAID: "Ödendi",
    CANCELLED: "İptal",
  };

  // ---- Yardımcılar ----
  const STR = (v) => String(v ?? "");
  const APPT = (a) => STR(a?.status).toUpperCase();
  const isActive = (a) => APPT(a) !== "CANCELLED";
  const isPackageStudent = (r = {}) => r.isFreeRight === true;

  const hasPendingActive = (r) =>
    (r.appointments || []).some((a) => APPT(a) !== "CANCELLED");

  const hasConfirmedActive = (r) =>
    (r.appointmentsConfirmed || []).some((a) => APPT(a) !== "CANCELLED");

  const allSlotsCancelled = (r) => {
    const slots = [...(r.appointments || []), ...(r.appointmentsConfirmed || [])];
    return slots.length > 0 && slots.every((a) => APPT(a) === "CANCELLED");
  };

  const isRejected = (r = {}) => {
    const s = STR(r?.status).toUpperCase();
    const os = STR(r?.order?.status || r?.orderStatus).toUpperCase();

    if (["CANCELLED", "REJECTED", "DECLINED"].includes(s)) return true;
    if (["CANCELLED", "REFUNDED", "FAILED", "VOID", "CHARGEBACK"].includes(os)) return true;
    if (r.cancelledAt || r.isCancelled) return true;
    if (allSlotsCancelled(r)) return true;

    const hasAnySlots =
      (r.appointments?.length || 0) + (r.appointmentsConfirmed?.length || 0) > 0;
    const anyActive =
      (r.appointmentsConfirmed || []).some(isActive) ||
      (r.appointments || []).some(isActive);
    if (hasAnySlots && !anyActive) return true;

    return false;
  };

  const isPaidLike = (r = {}) => {
    const s = STR(r?.status).toUpperCase();
    const os = STR(r?.order?.status || r?.orderStatus).toUpperCase();
    return s === "PAID" || os === "PAID";
  };

  const statusHelp = {
    SUBMITTED:
      "Gönderildi: Öğrenci talebi iletildi. Paket ve saatler netleştiğinde onaylayabilirsiniz.",
    PACKAGE_SELECTED:
      "Sepette: Öğrenci paketi ve saatleri seçti, ancak ödemeyi tamamlamadı.",
    PAID:
      "Ödendi: Ödeme tamamlandı. Saatler uygunsa onaylayıp planlamaya geçebilirsiniz.",
    CANCELLED: "İptal: Bu talep iptal edilmiştir.",
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("pending"); // 'pending' | 'approved' | 'rejected' | 'package' | 'all'
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isPast = (dt) => new Date(dt) <= new Date();
  const hasDoneTeacher = (notes = "") => /doneTeacherAt=/.test(notes);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const { data } = await axios.get("/api/v1/ogretmen/me/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = data.items || [];
      setItems(raw);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Talepler getirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          const hadThisPending = (r.appointments || []).some((a) => a.id === id);
          const wasConfirmedSlot = (r.appointmentsConfirmed || []).some((a) => a.id === id);

          const stillPending = (r.appointments || []).filter((a) => a.id !== id);
          let stillConfirmed = (r.appointmentsConfirmed || []).filter((a) => a.id !== id);

          if (status === "CONFIRMED" && hadThisPending) {
            stillConfirmed = [...stillConfirmed, updated];
          }

          let newStatus = r.status;
          if (status === "CANCELLED" && (hadThisPending || wasConfirmedSlot)) {
            const noPending = stillPending.length === 0;
            const noConfirmed = (stillConfirmed?.length || 0) === 0;
            if (noPending && noConfirmed) newStatus = "CANCELLED";
          }

          return {
            ...r,
            status: newStatus,
            appointments: stillPending,
            appointmentsConfirmed: stillConfirmed,
          };
        })
      );

      // Takvim önizlemeyi yenile
      window.dispatchEvent(new Event("refresh-slots"));

      if (status === "CANCELLED") {
        load();
      }
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
            a.id === id
              ? { ...a, notes: (a.notes || "") + `;doneTeacherAt=${new Date().toISOString()}` }
              : a
          ),
        }))
      );
      window.dispatchEvent(new Event("refresh-past-lessons"));
    } catch (e) {
      alert(e?.response?.data?.message || "Tamamlandı olarak işaretlenemedi.");
    }
  };

  const rejectRequest = async (reqId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return alert("Oturum bulunamadı.");
    if (!window.confirm("Bu talebe ait tüm saatler iptal edilecek ve talep reddedilecek. Devam edilsin mi?")) return;

    try {
      await axios.post(
        `/api/v1/ogretmen/requests/${reqId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Talep reddedilemedi.");
    }
  };

  const bucketOf = (r) => {
    if (isRejected(r)) return "rejected";
    if (hasConfirmedActive(r)) return "approved";
    if (hasPendingActive(r)) return "pending";
    const hadAnySlots =
      (r.appointments?.length || 0) + (r.appointmentsConfirmed?.length || 0) > 0;
    if (hadAnySlots) return "rejected";
    return "pending";
  };

  const groups = useMemo(() => {
    const g = { pending: [], approved: [], rejected: [], package: [], all: [] };
    for (const r of items) {
      if (isPackageStudent(r)) g.package.push(r);
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
    package: groups.package.length,
    all: groups.all.length,
  };

  const list = tab === "package" ? groups.package : (groups[tab] || []);

  return (
    <div className="tp-section">
      <div className="tp-head">
        <h2 className="tp-title">Gelen Talepler</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className={`tp-refresh ${loading ? "is-loading" : ""}`}
            onClick={load}
            disabled={loading}
            title="Yenile"
            type="button"
          >
            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" />
            </svg>
            <span className="label">{loading ? "Yükleniyor…" : "Yenile"}</span>
          </button>
        </div>
      </div>

      {/* Sekmeler */}
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
        <button type="button" className={`tp-tab ${tab === "package" ? "active" : ""}`} onClick={() => setTab("package")}>
          Paket Öğrencileri <span className="tp-chip">{counts.package}</span>
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
            const uiKey = rejected ? "CANCELLED" : (isPaidLike(r) ? "PAID" : (r.status || "SUBMITTED"));

            return (
              <div key={r.id} className="tp-card">
                <div className="tp-card-head">
                  <div className="tp-card-title">
                    {r.student?.name || "Öğrenci"}
                    <div className="tp-card-subtle">
                      {r.student?.email || "—"}
                      {r.student?.phone ? <> • {r.student.phone}</> : null}
                    </div>
                  </div>
                  {isPackageStudent(r) && (
                    <div className="tp-badge">{r.packageTitle || "Paket"}</div>
                  )}
                </div>

                <div className="tp-card-row">
                  <span>Ders:</span> <b>{r.subject}</b>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>Seviye:</span> <b>{r.grade}</b>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>Tür:</span>{" "}
                  <b>{r.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</b>

                  {typeof r.paidTL === "number" && (
                    <>
                      <span style={{ margin: "0 8px" }}>•</span>
                      <span>Ödenen:</span> <b>{r.paidTL.toLocaleString("tr-TR")} ₺</b>
                    </>
                  )}

                  {typeof r.lessonsCount === "number" && (
                    <>
                      <span style={{ margin: "0 8px" }}>•</span>
                      <span>Adet:</span> <b>{r.lessonsCount}</b>
                    </>
                  )}

                  {/* Durum + açıklama */}
                  <div className="tp-status" style={{ marginLeft: 10 }}>
                    <RequestBadge req={{ status: uiKey }} />
                    <span className="tp-info" tabIndex={0} aria-label="Durum açıklaması">
                      !
                      <span className="tp-tooltip">
                        {statusHelp[uiKey] || "Durum açıklaması bulunamadı."}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Onay bekleyen randevular */}
                {(r.appointments || []).length > 0 && (
                  <>
                    <div className="tp-section-sub" style={{ marginTop: 8 }}>
                      Onay bekleyen saatler
                    </div>
                    <div className="tp-slots-grid">
                      {r.appointments.map((a) => {
                        const st = new Date(a.startsAt);
                        const et = new Date(a.endsAt);
                        const statusU = APPT(a);
                        const disabledAll = rejected || tab === "rejected";

                        return (
                          <div key={a.id} className="tp-slot-card">
                            <div className="tp-slot-time">
                              {st.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}{" "}
                              {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}{" "}
                              – {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="tp-slot-mode">
                              {a.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}
                            </div>
                            <div className="tp-slot-actions">
                              <button
                                className="tp-btn tp-btn--approve"
                                onClick={() => setStatus(a.id, "CONFIRMED")}
                                disabled={disabledAll || statusU === "CONFIRMED"}
                                aria-disabled={disabledAll || statusU === "CONFIRMED"}
                                title={disabledAll ? "Bu sekmede işlem devre dışı" : "Onayla"}
                                type="button"
                              >
                                ✓ Onayla
                              </button>
                              <button
                                className="tp-btn tp-btn--cancel"
                                onClick={() => setStatus(a.id, "CANCELLED")}
                                disabled={disabledAll || statusU === "CANCELLED"}
                                aria-disabled={disabledAll || statusU === "CANCELLED"}
                                title={disabledAll ? "Bu sekmede işlem devre dışı" : "İptal Et"}
                                type="button"
                              >
                                ✕ Saati İptal Et
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Onaylanmış randevular */}
                {(r.appointmentsConfirmed || []).length > 0 && (
                  <>
                    <div className="tp-section-sub" style={{ marginTop: 8 }}>
                      Onaylanmış saatler
                    </div>
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
                              {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}{" "}
                              – {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="tp-slot-mode">Onaylı</div>
                            {a.studentName && (
                              <div className="tp-slot-note">
                                Öğrenci: <b>{a.studentName}</b>
                              </div>
                            )}

                            <div className="tp-slot-actions">
                              {done ? (
                                <span className="tp-chip success">✓ Tamamlandı</span>
                              ) : (
                                <button
                                  className="tp-btn"
                                  disabled={!past}
                                  title={!past ? "Ders saati geçtikten sonra aktif olur" : ""}
                                  onClick={() => past && completeAsTeacher(a.id)}
                                  type="button"
                                >
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

                {/* Talep düzeyinde aksiyon */}
                {tab === "pending" && !isRejected(r) && (
                  <div className="tp-card-actions" style={{ marginTop: 10 }}>
                    <button
                      className="tp-btn tp-btn--danger"
                      onClick={() => rejectRequest(r.id)}
                      title="Bu talebe ait tüm saatler iptal edilir"
                      type="button"
                    >
                      🚫 Tüm Talepleri Reddet
                    </button>
                  </div>
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
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  // Scheduling
  const {
    avail,
    setAvail,
    slots,
    range,
    setRange,
    timeOffs,
    creatingOff,
    setCreatingOff,
    minToStr,
    strToMin,
    onAvailChange,
    saveAvailability,
    fetchSlots,
    addTimeOff,
    delTimeOff,
    confirmed,
  } = useTeacherScheduling(setMsg);

  // Geçmiş dersler
  const [pastLessons, setPastLessons] = useState([]);
  const [pastLoading, setPastLoading] = useState(false);

  const loadPastAppointments = async () => {
    try {
      setPastLoading(true);
      const { data } = await axios.get("/api/v1/ogretmen/me/appointments/past");
      setPastLessons(data?.items || []);
    } catch {
      setPastLessons([]);
    } finally {
      setPastLoading(false);
    }
  };

  // Randevu onay/iptal sonrası takvimi yenile
  useEffect(() => {
    const onChanged = () => {
      fetchSlots();
    };
    window.addEventListener("refresh-slots", onChanged);
    return () => window.removeEventListener("refresh-slots", onChanged);
  }, [fetchSlots]);

  // RequestsPanel içinden tamamlandı sonrası geçmişi yenile
  useEffect(() => {
    const onPast = () => {
      loadPastAppointments();
    };
    window.addEventListener("refresh-past-lessons", onPast);
    return () => window.removeEventListener("refresh-past-lessons", onPast);
  }, []);

  // Şifre değiştir
  const [pwd, setPwd] = useState({ current: "", next: "", next2: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Yayın işlemleri
  const [publishing, setPublishing] = useState(false);

  // Biyografi ve WhyMe kayıt durumları
  const [bioSaving, setBioSaving] = useState(false);
  const [whySaving, setWhySaving] = useState(false);

  // Sekmeler
  const [tab, setTab] = useState("lessons");

  // Profil
  useEffect(() => {
    axios
      .get("/api/v1/ogretmen/me/profil")
      .then(({ data }) => setProfile(data.profile))
      .catch(() => {});
  }, []);

  // İlk yüklemede geçmiş dersleri de al
  useEffect(() => {
    loadPastAppointments();
  }, []);

  const onChange = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  // İl -> İlçe listesi
  const districts = useMemo(() => {
    if (!profile?.city) return [];
    return TR_DISTRICTS[profile.city] || [];
  }, [profile?.city]);

  useEffect(() => {
    if (!profile?.city) return;
    setProfile((p) => {
      const current = p?.district || "";
      if (current && districts.includes(current)) return p;
      return { ...p, district: districts[0] || "" };
    });
  }, [profile?.city, districts]);

  // Lokasyon kaydet
  const saveLocation = async () => {
    if (!profile) return;
    setSaving(true);
    setMsg("");
    try {
      await axios.put("/api/v1/ogretmen/me/profil", {
        city: profile.city,
        district: profile.district,
      });
      setMsg("Lokasyon güncellendi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Lokasyon kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  // Fotoğraf
  const onPickPhoto = () => fileRef.current?.click();
  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Dosya boyutu en fazla 5MB olmalı.");
      return;
    }
    const fd = new FormData();
    fd.append("photo", file);
    try {
      setMsg("Fotoğraf yükleniyor…");
      const { data } = await axios.post("/api/v1/ogretmen/me/photo", fd);
      if (data?.profile?.photoUrl) {
        setProfile((p) => ({ ...p, photoUrl: data.profile.photoUrl }));
        setMsg("Fotoğraf güncellendi.");
      } else {
        setMsg("Yükleme tamamlandı, ancak URL alınamadı.");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "Fotoğraf yüklenemedi.");
    }
  };

  // Şifre değiştir
  const changePassword = async (e) => {
    e?.preventDefault?.();
    setMsg("");
    if (!pwd.next || !pwd.next2) return setMsg("Yeni şifre ve doğrulama zorunludur.");
    if (pwd.next !== pwd.next2) return setMsg("Şifreler uyuşmuyor.");
    if (pwd.next.length < 8) return setMsg("Yeni şifre en az 8 karakter olmalı.");

    setPwdLoading(true);
    try {
      const body = {
        currentPassword: pwd.current || undefined,
        newPassword: pwd.next,
        confirmPassword: pwd.next2,
      };
      const { data } = await axios.put("/api/v1/ogretmen/me/password", body);
      setMsg(data?.message || "Şifre güncellendi.");
      setPwd({ current: "", next: "", next2: "" });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Şifre güncellenemedi.");
    } finally {
      setPwdLoading(false);
    }
  };

  // Biyografi
  const saveBio = async (e) => {
    e?.preventDefault?.();
    if (!profile) return;
    setBioSaving(true);
    setMsg("");
    try {
      await axios.put("/api/v1/ogretmen/me/profil", { bio: (profile.bio || "").trim() });
      setMsg("Biyografi güncellendi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Biyografi kaydedilemedi.");
    } finally {
      setBioSaving(false);
    }
  };

  // WhyMe
  const saveWhyMe = async (e) => {
    e?.preventDefault?.();
    if (!profile) return;
    setWhySaving(true);
    setMsg("");
    try {
      await axios.put("/api/v1/ogretmen/me/profil", { whyMe: (profile.whyMe || "").trim() });
      setMsg("“Neden benden ders almalısınız?” güncellendi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Metin kaydedilemedi.");
    } finally {
      setWhySaving(false);
    }
  };

  // Yayın talebi gönder
  const requestPublish = async () => {
    try {
      setPublishing(true);
      setMsg("");
      const { data } = await axios.post("/api/v1/ogretmen/me/publish-request");
      setProfile((p) => ({ ...p, ...data.profile }));
      setMsg(data.message || "Talebiniz iletildi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Talep gönderilemedi.");
    } finally {
      setPublishing(false);
    }
  };

  // PROFİLİ YAYINDAN KALDIR
  const unpublish = async () => {
    try {
      setPublishing(true);
      setMsg("");
      const { data } = await axios.post("/api/v1/ogretmen/me/unpublish");
      setProfile((p) => ({ ...p, ...data.profile }));
      setMsg(data?.message || "Profil yayından kaldırıldı.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Profil yayından kaldırılamadı.");
    } finally {
      setPublishing(false);
    }
  };

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="tpanel">
          <div className="tp-wrap">
            <div className="tp-loading">Yükleniyor…</div>
          </div>
        </div>
      </>
    );
  }

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initial = (profile.firstName?.[0] || "").toUpperCase();

  const updateMode = async (nextMode) => {
    try {
      await axios.put("/api/v1/ogretmen/me/profil", { mode: nextMode });
      setProfile((p) => ({ ...p, mode: nextMode }));
      setMsg("Ders modu güncellendi.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Ders modu güncellenemedi.");
    }
  };

  const bioLen = (profile.bio || "").length;
  const BIO_MAX = 1200;
  const whyLen = (profile.whyMe || "").length;
  const WHY_MAX = 1200;

  const publishStatus = profile.publishStatus || "DRAFT";

  return (
    <>
      <Navbar />
      <div className="tpanel">
        <div className="tp-wrap">
          <header className="tp-header">
            <h1>Öğretmen Paneli</h1>
            <p>Profil bilgilerini düzenle, randevularını ve derslerini yönet.</p>
          </header>

          {!!msg && <div className="tp-message">{msg}</div>}

          <div className="tp-layout">
            {/* Sol özet */}
            <aside className="tp-card tp-side">
              <div className="tp-avatar">
                <div className="tp-avatar-wrapper">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt={fullName || "Profil"} className="tp-avatar-img" />
                  ) : (
                    <div className="tp-avatar-circle">{initial}</div>
                  )}
                  <button
                    type="button"
                    className="tp-avatar-edit"
                    onClick={onPickPhoto}
                    title="Profil fotoğrafını değiştir"
                    aria-label="Profil fotoğrafını değiştir"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="currentColor"
                      />
                      <path
                        d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="tp-hidden-file"
                    onChange={onPhotoChange}
                  />
                </div>
              </div>

              <div className="tp-name">{fullName || "İsimsiz"}</div>
              <div className="tp-slug">
                kullanıcı slug: <code>{profile.slug}</code>
              </div>

              {/* Yayın durumu ve talep */}
              <div className="tp-publish-state" style={{ marginTop: 8 }}>
                <b>Yayın Durumu:</b>{" "}
                {publishStatus === "APPROVED" && <span className="tp-chip success">Yayında</span>}
                {publishStatus === "PENDING" && <span className="tp-chip warn">Onay bekliyor</span>}
                {publishStatus === "REJECTED" && <span className="tp-chip danger">Reddedildi</span>}
                {publishStatus === "DRAFT" && <span className="tp-chip">Taslak</span>}
              </div>

              {/* Yayından kaldır (APPROVED & isPublic) */}
              {publishStatus === "APPROVED" && profile.isPublic && (
                <button
                  type="button"
                  className="tp-btn ghost"
                  onClick={unpublish}
                  disabled={publishing}
                  title="Profili geçici olarak yayından kaldırır"
                  style={{ marginTop: 8 }}
                >
                  {publishing ? "İşleniyor…" : "🚫 Yayından kaldır"}
                </button>
              )}

              {/* Taslak veya reddedildiyse tekrar talep gönderilebilir */}
              {(publishStatus === "DRAFT" || publishStatus === "REJECTED") && (
                <button
                  type="button"
                  className="tp-btn"
                  onClick={requestPublish}
                  disabled={publishing}
                  title="Yayına alma talebi admin onayına gönderilir"
                  style={{ marginTop: 8 }}
                >
                  {publishing ? "Gönderiliyor…" : "🔔 Yayın talebi gönder"}
                </button>
              )}

              {/* Onay beklerken bilgilendirme */}
              {publishStatus === "PENDING" && (
                <div className="tp-hint" style={{ marginTop: 8 }}>
                  Talebiniz admin tarafından inceleniyor.
                </div>
              )}

              {/* Admin notu */}
              {profile.reviewNote && (
                <div className="tp-hint" style={{ marginTop: 6 }}>
                  <b>Admin Notu:</b> {profile.reviewNote}
                </div>
              )}

              <div className="tp-hint" style={{ marginTop: 8 }}>
                Öğrenciler sadece <b>yayında</b> olan profilleri görebilir.
              </div>
            </aside>

            {/* Sağ kart: sekmeler + içerikler */}
            <section className="tp-card">
              <div className="tp-tabs">
                <button
                  type="button"
                  className={`tp-tab ${tab === "availability" ? "active" : ""}`}
                  onClick={() => setTab("availability")}
                >
                  Uygunluk
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "slots" ? "active" : ""}`}
                  onClick={() => setTab("slots")}
                >
                  Takvim Önizleme
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "timeoff" ? "active" : ""}`}
                  onClick={() => setTab("timeoff")}
                >
                  Tatil / Blokaj
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "lessons" ? "active" : ""}`}
                  onClick={() => setTab("lessons")}
                >
                  Derslerim
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "location" ? "active" : ""}`}
                  onClick={() => setTab("location")}
                >
                  Lokasyon
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "requests" ? "active" : ""}`}
                  onClick={() => setTab("requests")}
                >
                  Talepler
                </button>
                <button
                  type="button"
                  className={`tp-tab ${tab === "past" ? "active" : ""}`}
                  onClick={() => setTab("past")}
                >
                  Geçmiş Derslerim
                </button>
              </div>

              {/* Sekme içerikleri */}
              {tab === "availability" && (
                <AvailabilityEditor
                  avail={avail}
                  setAvail={setAvail}
                  onAvailChange={onAvailChange}
                  minToStr={minToStr}
                  strToMin={strToMin}
                  onSave={saveAvailability}
                />
              )}

              {tab === "slots" && (
                <SlotsPreview
                  range={range}
                  setRange={setRange}
                  slots={slots}
                  fetchSlots={fetchSlots}
                  confirmed={confirmed}
                />
              )}

              {tab === "timeoff" && (
                <TimeOffManager
                  creatingOff={creatingOff}
                  setCreatingOff={setCreatingOff}
                  timeOffs={timeOffs}
                  addTimeOff={addTimeOff}
                  delTimeOff={delTimeOff}
                />
              )}

              {tab === "lessons" && <TeacherLessons profile={profile} onModeChange={updateMode} />}

              {tab === "location" && (
                <form
                  className="tp-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveLocation();
                  }}
                >
                  <div className="tp-section">
                    <div className="tp-section-title">Lokasyon</div>
                    <div className="tp-grid-2">
                      <div>
                        <label className="tp-label">İl</label>
                        <select
                          value={profile.city || ""}
                          onChange={(e) => onChange("city", e.target.value)}
                        >
                          <option value="">İl seçin</option>
                          {TR_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="tp-label">İlçe</label>
                        <select
                          value={
                            (profile.district && (TR_DISTRICTS[profile.city] || []).includes(profile.district))
                              ? profile.district
                              : ""
                          }
                          onChange={(e) => onChange("district", e.target.value)}
                          disabled={!profile.city || (TR_DISTRICTS[profile.city] || []).length === 0}
                        >
                          <option value="">
                            {!profile.city
                              ? "Önce il seçin"
                              : (TR_DISTRICTS[profile.city] || []).length
                              ? "İlçe seçin"
                              : "Bu il için ilçe listesi yakında"}
                          </option>
                          {(TR_DISTRICTS[profile.city] || []).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="tp-actions">
                    <button type="submit" disabled={saving}>
                      {saving ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                  </div>
                </form>
              )}

              {tab === "requests" && <RequestsPanel />}

              {tab === "past" && (
                <div className="tp-section">
                  <div className="tp-head">
                    <h2 className="tp-title">Geçmiş Derslerim</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        className={`tp-refresh ${pastLoading ? "is-loading" : ""}`}
                        onClick={loadPastAppointments}
                        disabled={pastLoading}
                        title="Yenile"
                        type="button"
                      >
                        <svg className="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z" fill="currentColor" />
                        </svg>
                        <span className="label">{pastLoading ? "Yükleniyor…" : "Yenile"}</span>
                      </button>
                    </div>
                  </div>

                  {pastLoading ? (
                    <div className="tp-loading">Yükleniyor…</div>
                  ) : (pastLessons?.length || 0) === 0 ? (
                    <div className="tp-empty">Geçmiş ders bulunmuyor.</div>
                  ) : (
                    <div className="tp-req-list">
                      {pastLessons.map((a) => {
                        const st = new Date(a.startsAt);
                        const et = new Date(a.endsAt);
                        return (
                          <div key={a.id} className="tp-card">
                            <div className="tp-card-row">
                              <span>🗓</span>{" "}
                              <b>
                                {st.toLocaleDateString("tr-TR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}{" "}
                                {st.toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                –{" "}
                                {et.toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </b>
                              <span style={{ margin: "0 8px" }}>•</span>
                              <span>Tür:</span>{" "}
                              <b>{a.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</b>
                              {a.studentName ? (
                                <>
                                  <span style={{ margin: "0 8px" }}>•</span>
                                  <span>Öğrenci:</span> <b>{a.studentName}</b>
                                </>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Şifre Değiştir */}
            <section className="tp-card" style={{ marginTop: 16 }}>
              <form className="tp-form" onSubmit={changePassword}>
                <div className="tp-section">
                  <div className="tp-section-title">Şifre Değiştir</div>
                  <div className="tp-grid-2">
                    <div>
                      <label className="tp-label">Mevcut Şifre</label>
                      <input
                        type="password"
                        placeholder="Mevcut şifreniz"
                        value={pwd.current}
                        onChange={(e) =>
                          setPwd((s) => ({ ...s, current: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="tp-label">Yeni Şifre</label>
                      <input
                        type="password"
                        placeholder="En az 8 karakter"
                        value={pwd.next}
                        onChange={(e) =>
                          setPwd((s) => ({ ...s, next: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="tp-grid-2 tp-mt8" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="tp-label">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        placeholder="Yeni şifrenizi tekrar yazın"
                        value={pwd.next2}
                        onChange={(e) =>
                          setPwd((s) => ({ ...s, next2: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="tp-actions">
                  <button type="submit" disabled={pwdLoading}>
                    {pwdLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </button>
                </div>
              </form>
            </section>

            {/* Biyografi */}
            <section className="tp-card" style={{ marginTop: 16 }}>
              <form className="tp-form" onSubmit={saveBio}>
                <div className="tp-section">
                  <div className="tp-section-title">Biyografi / Tanıtım</div>
                  <textarea
                    placeholder="Kendinden ve tecrübenden kısaca bahset. (örn. 8 yıllık matematik öğretmeniyim, LGS-TYT-AYT hazırlık...)"
                    rows={8}
                    maxLength={BIO_MAX}
                    value={profile.bio ?? ""}
                    onChange={(e) => onChange("bio", e.target.value)}
                  />
                  <div className="tp-hint" style={{ textAlign: "right" }}>
                    {bioLen}/{BIO_MAX}
                  </div>
                </div>
                <div className="tp-actions">
                  <button type="submit" disabled={bioSaving}>
                    {bioSaving ? "Kaydediliyor…" : "Biyografiyi Kaydet"}
                  </button>
                </div>
              </form>
            </section>

            {/* Neden benden ders almalısınız? */}
            <section className="tp-card" style={{ marginTop: 16, gridColumn: "2 / 3" }}>
              <form className="tp-form" onSubmit={saveWhyMe}>
                <div className="tp-section">
                  <div className="tp-section-title">Neden benden ders almalısınız?</div>
                  <textarea
                    placeholder="Öğrencilerin sizi seçmesi için güçlü yanlarınızı, yöntemlerinizi ve sonuçlarınızı yazın."
                    rows={8}
                    maxLength={WHY_MAX}
                    value={profile.whyMe ?? ""}
                    onChange={(e) => onChange("whyMe", e.target.value)}
                  />
                  <div className="tp-hint" style={{ textAlign: "right" }}>
                    {whyLen}/{WHY_MAX}
                  </div>
                </div>
                <div className="tp-actions">
                  <button type="submit" disabled={whySaving}>
                    {whySaving ? "Kaydediliyor…" : "Metni Kaydet"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
