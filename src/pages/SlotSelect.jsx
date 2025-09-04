import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../utils/auth";
import "../cssFiles/teacher.css";

export default function SlotSelect() {
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const requestId = qs.get("requestId");
  const slug = qs.get("slug");
  const qty = Number(qs.get("qty") || 1);

  const token = localStorage.getItem("token");
  const [teacher, setTeacher] = useState(null);
  const [reqData, setReqData] = useState(null);

  const todayISO = new Date().toISOString().slice(0,10);
  const weekAheadISO = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10);

  const [range, setRange] = useState({ from: todayISO, to: weekAheadISO });
  const [slots, setSlots] = useState([]);
  const [picked, setPicked] = useState([]); // {start, end, mode}

  // Auth guard
  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/saat-sec?requestId=${requestId}&slug=${slug}&qty=${qty}`, { replace: true });
    }
  }, [token, requestId, slug, qty, navigate]);

  // Öğretmen + Talep bilgisi
  useEffect(() => {
    (async () => {
      try {
        const [tRes, rRes] = await Promise.all([
          axios.get(`/api/v1/ogretmenler/${slug}`),
          axios.get(`/api/v1/student-requests/${requestId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setTeacher(tRes.data.teacher);
        setReqData(rRes.data.request);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [slug, requestId, token]);

  // Slotları getir
  const fetchSlots = async () => {
    if (!reqData) return;
    try {
      const { data } = await axios.get(`/api/v1/ogretmenler/${slug}/slots`, {
        params: {
          from: range.from,
          to: range.to,
          mode: reqData.mode,        // ONLINE | FACE_TO_FACE
          durationMin: 60,           // Appointment.durationMin varsayımı
        },
      });
      setSlots(data.slots || []);
    } catch (e) {
      console.error(e);
      alert("Uygun saatler getirilemedi.");
    }
  };

  const grouped = useMemo(() => {
    const g = {};
    for (const s of slots) {
      const d = new Date(s.start);
      const key = d.toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
      (g[key] ||= []).push(s);
    }
    return g;
  }, [slots]);

  const togglePick = (s) => {
    const k = s.start + "|" + s.end;
    setPicked((arr) => {
      const exists = arr.find((x) => (x.start + "|" + x.end) === k);
      if (exists) return arr.filter((x) => (x.start + "|" + x.end) !== k);
      if (arr.length >= qty) return arr; // limit
      return [...arr, s];
    });
  };

  const saveAndGoCart = async () => {
    if (picked.length !== qty) {
      alert(`Lütfen ${qty} adet ders saati seçiniz.`);
      return;
    }
    try {
      await axios.post(
        `/api/v1/student-requests/${requestId}/slots`,
        { slots: picked },  // [{start,end,mode}]
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/sepet", { replace: true });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Seçilen saatler kaydedilemedi.");
    }
  };

  return (
    <div className="pkc-container">
      <h1 className="pkc-title">Ders Saatlerini Seç</h1>

      <div className="tp-grid-2">
        <div>
          <label className="tp-sublabel">Başlangıç</label>
          <input type="date" value={range.from} onChange={(e)=>setRange(r=>({...r, from: e.target.value}))}/>
        </div>
        <div>
          <label className="tp-sublabel">Bitiş</label>
          <input type="date" value={range.to} onChange={(e)=>setRange(r=>({...r, to: e.target.value}))}/>
        </div>
      </div>

      <div className="tp-actions">
        <button type="button" onClick={fetchSlots}>Uygun Saatleri Göster</button>
      </div>

      {!Object.keys(grouped).length ? (
        <div className="tp-empty">Bu aralıkta uygun slot bulunamadı.</div>
      ) : (
        Object.entries(grouped).map(([label, list]) => (
          <div key={label} className="tp-slot-group">
            <div className="tp-slot-group-head">
              <span className="tp-badge">{label}</span>
            </div>
            <div className="tp-slots-grid">
              {list.map((s) => {
                const key = s.start + "|" + s.end;
                const st = new Date(s.start);
                const et = new Date(s.end);
                const chosen = picked.find((x) => (x.start + "|" + x.end) === key);
                return (
                  <button
                    key={key}
                    className={`tp-slot-card ${chosen ? "is-selected" : ""}`}
                    onClick={()=>togglePick(s)}
                    type="button"
                  >
                    <div className="tp-slot-time">
                      {st.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {et.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="tp-slot-mode">{s.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="pkc-actions">
        <div className="tp-sublabel">Seçili: {picked.length} / {qty}</div>
        <button className="pkc-btn" disabled={picked.length !== qty} onClick={saveAndGoCart}>
          Sepete devam et
        </button>
      </div>
    </div>
  );
}
