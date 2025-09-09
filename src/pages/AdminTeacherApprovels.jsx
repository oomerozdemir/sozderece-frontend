import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function AdminTeacherApprovals(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/teacher-publish-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(data.items || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, type) => {
    const note = prompt(type === "approve" ? "Onay notu (isteğe bağlı):" : "Reddetme notu (isteğe bağlı):") || "";
    const url = `/api/admin/teacher-publish-requests/${id}/${type}`;
    await axios.put(url, { note }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  if (loading) return <div>Yükleniyor…</div>;
  if (items.length === 0) return <div>Onay bekleyen talep yok.</div>;

  return (
    <div className="admin-approvals">
      {items.map(p => (
        <div key={p.id} className="admin-card">
          <div style={{display:"grid", gridTemplateColumns:"100px 1fr", gap:16}}>
            <img src={p.photoUrl} alt="" style={{width:100, height:100, borderRadius:12, objectFit:"cover", background:"#f3f4f6"}} />
            <div>
              <h3 style={{margin:"0 0 6px 0"}}>{p.firstName} {p.lastName}</h3>
              <div>📍 {p.city}{p.district ? ` / ${p.district}` : ""}</div>
              <div>💼 Ders tipi: {p.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}</div>
              <div>📚 Verdiği dersler: {(p.subjects || []).join(", ") || "—"}</div>
              <div>🎓 Seviyeler: {(p.grades || []).join(", ") || "—"}</div>
              <div style={{marginTop:8}}>
                <b>Hakkımda:</b>
                <div style={{whiteSpace:"pre-wrap"}}>{p.bio || "—"}</div>
              </div>
              <div style={{marginTop:8}}>
                <b>Neden benden ders almalısınız?</b>
                <div style={{whiteSpace:"pre-wrap"}}>{p.whyMe || "—"}</div>
              </div>
              <div style={{display:"flex", gap:8, marginTop:12}}>
                <button onClick={() => act(p.id, "approve")} className="primary">✅ Onayla</button>
                <button onClick={() => act(p.id, "reject")} className="danger">❌ Reddet</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
