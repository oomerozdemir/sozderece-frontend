import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import "../cssFiles/teacher-panel.css";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";
import useTeacherScheduling from "../hooks/useTeacherScheduling";
import AvailabilityEditor from "../components/teacherComps/AvailabilityEditor";
import SlotsPreview from "../components/teacherComps/SlotsPreview";
import TimeOffManager from "../components/teacherComps/TimeOffManager";
import TeacherLessons from "../components/teacherComps/TeacherLessons";

/* =======================
   Gelen Talepler Paneli
======================= */
function RequestsPanel() {
  const statusMap = {
    SUBMITTED: "Sepette",
    PACKAGE_SELECTED: "Paket seçildi, sepette",
    PAID: "Ödendi",
    CANCELLED: "İptal",
  };

  const statusHelp = {
    PACKAGE_SELECTED:
      "Sepette: Öğrenci ders talebini tamamlamış ve ürünü sepete eklemiştir ancak ödemeyi tamamlamamış. Talebi onaylamadan önce ödemeyi tamamlaması için öğrenciyle iletişime geçebilirsiniz.",
    PAID:
      "Ödendi: Öğrenci talebi oluşturmuş ve ödemeyi tamamlamıştır. Planlanan saat size uygunsa talebi onaylayıp ders platformunu öğrenciyle planlamak üzere iletişime geçebilirsiniz.",
    CANCELLED: "İptal: Bu talep iptal edilmiştir.",
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("pending"); // 'pending' | 'approved' | 'rejected' | 'all'
  const token = localStorage.getItem("token");

  const isPast = (dt) => new Date(dt) <= new Date();
  const hasDoneTeacher = (notes = "") => /doneTeacherAt=/.test(notes);

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

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  // Öğretmen, randevuyu onay/iptal eder
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

  // Öğretmen: “Ders tamamlandı”
  const completeAsTeacher = async (id) => {
    try {
      await axios.patch(
        `/api/v1/ogretmen/appointments/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Lokal olarak flagle
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
      // Geçmiş dersler sekmesini tazele
      window.dispatchEvent(new Event("refresh-past-lessons"));
    } catch (e) {
      alert(e?.response?.data?.message || "Tamamlandı olarak işaretlenemedi.");
    }
  };

  // Talepleri kovana ayır
  const bucketOf = (req) => {
    if ((req.appointmentsConfirmed || []).length > 0) return "approved";
    switch (req.status) {
      case "PAID":
        return "approved";
      case "CANCELLED":
        return "rejected";
      default:
        return "pending"; // SUBMITTED | PACKAGE_SELECTED
    }
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className={`tp-refresh ${loading ? "is-loading" : ""}`}
            onClick={load}
            disabled={loading}
            title="Yenile"
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
        <button
          type="button"
          className={`tp-tab ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Bekleyen <span className="tp-chip">{counts.pending}</span>
        </button>
        <button
          type="button"
          className={`tp-tab ${tab === "approved" ? "active" : ""}`}
          onClick={() => setTab("approved")}
        >
          Onaylanmış <span className="tp-chip success">{counts.approved}</span>
        </button>
        <button
          type="button"
          className={`tp-tab ${tab === "rejected" ? "active" : ""}`}
          onClick={() => setTab("rejected")}
        >
          Reddedilmiş <span className="tp-chip danger">{counts.rejected}</span>
        </button>
        <button
          type="button"
          className={`tp-tab ${tab === "all" ? "active" : ""}`}
          onClick={() => setTab("all")}
        >
          Tümü <span className="tp-chip muted">{counts.all}</span>
        </button>
      </div>

      {msg ? <div className="tp-alert">{msg}</div> : null}
      {loading ? <div className="tp-loading">Yükleniyor…</div> : null}

      {!loading && (!list || list.length === 0) ? (
        <div className="tp-empty">Bu bölümde gösterilecek talep yok.</div>
      ) : (
        <div className="tp-req-list">
          {list.map((r) => (
            <div key={r.id} className="tp-card">
              <div className="tp-card-head">
                <div className="tp-card-title">
                  {r.student?.name || "Öğrenci"}
                  <div className="tp-card-subtle">
                    {r.student?.email || "—"}
                    {r.student?.phone ? <> • {r.student.phone}</> : null}
                  </div>
                </div>
                <div className="tp-badge">{r.packageTitle || "Paket"}</div>
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
                  <span
                    className={
                      "tp-chip " +
                      (r.status === "PAID" ? "success" : r.status === "CANCELLED" ? "danger" : "")
                    }
                  >
                    {statusMap[r.status] || r.status}
                  </span>

                  <span className="tp-info" tabIndex={0} aria-label="Durum açıklaması">
                    !
                    <span className="tp-tooltip">
                      {statusHelp[r.status] || "Durum açıklaması bulunamadı."}
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
                            <button className="tp-btn" onClick={() => setStatus(a.id, "CONFIRMED")}>
                              Onayla
                            </button>
                            <button className="tp-btn ghost" onClick={() => setStatus(a.id, "CANCELLED")}>
                              İptal
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
            </div>
          ))}
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
    } catch (e) {
      setPastLessons([]);
    } finally {
      setPastLoading(false);
    }
  };

  // RANDEVU ONAY/İPTAL SONRASI TAKVİMİ YENİLE
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

  const togglePublish = async (next) => {
    setMsg("");
    try {
      await axios.put("/api/v1/ogretmen/me/profil", { isPublic: !!next });
      setProfile((p) => ({ ...p, isPublic: !!next }));
      setMsg(!!next ? "Profil yayına alındı." : "Profil yayından kaldırıldı.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Yayın durumu kaydedilemedi.");
    }
  };

  // Şifre değiştir
  const [pwd, setPwd] = useState({ current: "", next: "", next2: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

              <label className="tp-switch">
                <input
                  type="checkbox"
                  checked={!!profile.isPublic}
                  onChange={(e) => togglePublish(e.target.checked)}
                />
                <span>Profili yayında göster</span>
              </label>

              <div className="tp-hint">
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
                            districts.includes(profile.district) ? profile.district : ""
                          }
                          onChange={(e) => onChange("district", e.target.value)}
                          disabled={!profile.city || districts.length === 0}
                        >
                          <option value="">
                            {!profile.city
                              ? "Önce il seçin"
                              : districts.length
                              ? "İlçe seçin"
                              : "Bu il için ilçe listesi yakında"}
                          </option>
                          {districts.map((d) => (
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
                      >
                        <svg
                          className="icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 5V2L7 7l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-9z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="label">
                          {pastLoading ? "Yükleniyor…" : "Yenile"}
                        </span>
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
