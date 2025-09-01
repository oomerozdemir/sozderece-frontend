import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

const SUBJECTS = [
  "Matematik","Fen Bilimleri","Türkçe","Tarih","Coğrafya",
  "Fizik","Kimya","Biyoloji","İngilizce","Almanca","Geometri","Edebiyat","Bilgisayar"
];

export default function TeacherLessons({ profile, onModeChange }) {
  // mode toggle’ları (profil.mode’dan beslenir)
  const [onlineOn, setOnlineOn] = useState(true);
  const [f2fOn, setF2fOn] = useState(false);

  useEffect(() => {
    const m = String(profile?.mode || "BOTH").toUpperCase();
    setOnlineOn(m === "ONLINE" || m === "BOTH");
    setF2fOn(m === "FACE_TO_FACE" || m === "BOTH");
  }, [profile?.mode]);

  const applyMode = async (nextOnline, nextF2F) => {
    const nextMode =
      nextOnline && nextF2F ? "BOTH" :
      nextOnline ? "ONLINE" :
      nextF2F ? "FACE_TO_FACE" : "ONLINE"; // her ikisi kapalıysa online’a düşelim
    await onModeChange?.(nextMode);
  };

  // Listeleme
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchList = async (opts={}) => {
    const params = {
      q, page, pageSize,
      ...opts,
    };
    const { data } = await axios.get("/api/v1/ogretmen/me/lessons", { params });
    setItems(data.items || []);
    setTotal(data.total || 0);
    setPage(data.page || 1);
    setPageSize(data.pageSize || 10);
  };

  useEffect(() => { fetchList(); }, [page, pageSize]); // q değişince butondan ara yapacağız

  // Yeni / düzenle formu
  const [editing, setEditing] = useState(null); // null=new, {..}=edit
  const [form, setForm] = useState({ subject: "", topic: "", durationMin: 60, priceOnline: "", priceF2F: "" });
  const isEdit = Boolean(editing?.id);

  const openNew = () => {
    setEditing({}); // new
    setForm({ subject: "", topic: "", durationMin: 60, priceOnline: "", priceF2F: "" });
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      subject: row.subject || "",
      topic: row.topic || "",
      durationMin: row.durationMin || 60,
      priceOnline: row.priceOnline ?? "",
      priceF2F: row.priceF2F ?? "",
    });
  };

  const save = async () => {
    const payload = {
      subject: form.subject,
      topic: form.topic || null,
      durationMin: Number(form.durationMin) || 60,
      priceOnline: form.priceOnline === "" ? null : Number(form.priceOnline),
      priceF2F:    form.priceF2F    === "" ? null : Number(form.priceF2F),
    };
    if (!payload.subject) return;

    if (isEdit) {
      await axios.put(`/api/v1/ogretmen/me/lessons/${editing.id}`, payload);
    } else {
      await axios.post("/api/v1/ogretmen/me/lessons", payload);
    }
    setEditing(null);
    await fetchList();
  };

  const remove = async (row) => {
    if (!window.confirm("Bu dersi silmek istediğinize emin misiniz?")) return;
    await axios.delete(`/api/v1/ogretmen/me/lessons/${row.id}`);
    await fetchList();
  };

  const headerMode = useMemo(() => {
    if (onlineOn && f2fOn) return "BOTH";
    if (onlineOn) return "ONLINE";
    if (f2fOn) return "FACE_TO_FACE";
    return "ONLINE";
  }, [onlineOn, f2fOn]);

  return (
    <div className="tl-card">
      {/* Toggle alanı */}
      <div className="tl-toggles">
        <div className={`tl-toggle ${onlineOn ? "on" : "off"}`}>
          <div className="tl-toggle-head">Online Ders Veriyorum Olarak Seçtiniz</div>
          <label className="switch">
            <input
              type="checkbox"
              checked={onlineOn}
              onChange={async (e) => {
                const v = e.target.checked;
                setOnlineOn(v);
                await applyMode(v, f2fOn);
              }}
            />
            <span />
          </label>
        </div>

        <div className={`tl-toggle ${f2fOn ? "on" : "off"}`}>
          <div className="tl-toggle-head">Yüz Yüze Ders Vermiyorum Olarak Seçtiniz</div>
          <label className="switch">
            <input
              type="checkbox"
              checked={f2fOn}
              onChange={async (e) => {
                const v = e.target.checked;
                setF2fOn(v);
                await applyMode(onlineOn, v);
              }}
            />
            <span />
          </label>
        </div>
      </div>

      {/* Ara + Yeni */}
      <div className="tl-toolbar">
        <div className="tl-left">
          <label>Sayfada</label>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5,10,20,30].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>Kayıt Göster</span>
        </div>

        <div className="tl-right">
          <div className="tl-search">
            <FiSearch />
            <input
              placeholder="Arama yap..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchList({ page: 1 })}
            />
          </div>
          <button className="tl-btn-primary" onClick={openNew}>
            <FiPlus /> Yeni Ders Ekle
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="tl-table">
        <div className="tl-thead">
          <div className="tl-tr">
            <div className="tl-th">Ders</div>
            <div className="tl-th">Süre</div>
            <div className="tl-th">Online Ücret</div>
            <div className="tl-th">İşlemler</div>
          </div>
        </div>
        <div className="tl-tbody">
          {items.map((row) => (
            <div className="tl-tr" key={row.id}>
              <div className="tl-td">
                {row.subject}{row.topic ? ` > ${row.topic}` : ""}
              </div>
              <div className="tl-td">{row.durationMin} dk.</div>
              <div className="tl-td">{row.priceOnline != null ? `${row.priceOnline.toFixed ? row.priceOnline.toFixed(2) : row.priceOnline}.00 ₺` : "-"}</div>
              <div className="tl-td tl-actions">
                <button className="tl-icon yellow" onClick={() => openEdit(row)} title="Düzenle"><FiEdit2 /></button>
                <button className="tl-icon red" onClick={() => remove(row)} title="Sil"><FiTrash2 /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="tl-empty">Kayıt yok.</div>
          )}
        </div>
      </div>

      {/* Pager */}
      <div className="tl-pager">
        <button disabled={page<=1} onClick={() => setPage(1)}>İlk</button>
        <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Önceki</button>
        <span>{page}</span>
        <button disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Sonraki</button>
        <button disabled={page>=totalPages} onClick={() => setPage(totalPages)}>Son</button>
      </div>

      {/* Modal (basit) */}
      {editing && (
        <div className="tl-modal" onClick={() => setEditing(null)}>
          <div className="tl-modal-card" onClick={(e) => e.stopPropagation()}>
            <h4>{isEdit ? "Dersi Düzenle" : "Yeni Ders Ekle"}</h4>

            <div className="tl-form">
              <label>Ders</label>
              <select value={form.subject} onChange={(e)=>setForm(s=>({...s, subject:e.target.value}))}>
                <option value="">Seçiniz</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <label>Alt Başlık (opsiyonel)</label>
              <input value={form.topic} onChange={(e)=>setForm(s=>({...s, topic:e.target.value}))} placeholder="Örn: Genel Matematik" />

              <div className="tl-grid2">
                <div>
                  <label>Süre (dk)</label>
                  <input type="number" min={15} step={5} value={form.durationMin} onChange={(e)=>setForm(s=>({...s, durationMin:e.target.value}))} />
                </div>
                <div>
                  <label>Online Ücret (₺)</label>
                  <input type="number" min={0} value={form.priceOnline} onChange={(e)=>setForm(s=>({...s, priceOnline:e.target.value}))} />
                </div>
              </div>

              <div className="tl-grid2">
                <div>
                  <label>Yüz Yüze Ücret (₺)</label>
                  <input type="number" min={0} value={form.priceF2F} onChange={(e)=>setForm(s=>({...s, priceF2F:e.target.value}))} />
                </div>
              </div>
            </div>

            <div className="tl-modal-actions">
              <button onClick={()=>setEditing(null)} className="tl-btn-light">Vazgeç</button>
              <button onClick={save} className="tl-btn-primary">{isEdit ? "Güncelle" : "Ekle"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
