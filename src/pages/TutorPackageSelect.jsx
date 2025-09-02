// src/pages/PackageSelect.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { PACKAGES } from "../hooks/packages.js"; // mevcut
import { isTokenValid } from "../utils/auth";

export default function PackageSelect() {
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const requestId = qs.get("requestId");
  const slug = qs.get("slug");

  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const list = useMemo(()=> Object.entries(PACKAGES).map(([k,v])=>({slug:k, ...v})), []);

  useEffect(()=> {
    if (!token || !isTokenValid(token)) {
      sessionStorage.setItem("skipSilentLoginOnce", "1");
      navigate(`/login?next=/paket-sec?requestId=${requestId}&slug=${slug}`, { replace: true });
    }
  }, [token, requestId, slug, navigate]);

  const attachAndGoToCart = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      // 1) Talebe paketi bağla
      await axios.put(`/api/student-requests/${requestId}/package`, {
        packageSlug: selected.slug,
        packageTitle: selected.title,
        unitPrice: Number(selected.unitPrice),
      }, { headers: { Authorization: `Bearer ${token}` } });

      // 2) Sepete ekle (ödemeye hazır)
      await axios.post("/api/cart/items", {
        slug: selected.slug,
        title: selected.title,
        name: selected.title,
        unitPrice: Number(selected.unitPrice),
        quantity: 1,
        meta: {
          requestId,
          teacherSlug: slug
        }
      }, { headers: { Authorization: `Bearer ${token}` } });

      navigate("/sepet", { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || "Paket eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{maxWidth:960, margin:"24px auto", padding:"0 16px"}}>
      <h1>Özel Ders Paketleri</h1>
      <div className="grid">
        {list.map(p=>(
          <label key={p.slug} className="pkg">
            <input
              type="radio"
              name="pkg"
              value={p.slug}
              checked={selected?.slug === p.slug}
              onChange={()=>setSelected(p)}
            />
            <div className="pkg-body">
              <div className="pkg-title">{p.title}</div>
              <div className="pkg-price">{(p.unitPrice/100).toLocaleString("tr-TR")} ₺</div>
              <div className="pkg-desc">{p.description}</div>
            </div>
          </label>
        ))}
      </div>

      <button disabled={!selected || saving} onClick={attachAndGoToCart}>
        {saving ? "Ekleniyor..." : "Devam et"}
      </button>
    </div>
  );
}
