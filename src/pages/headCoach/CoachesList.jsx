import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import HeadCoachLayout from "./HeadCoachLayout";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("tr-TR") : "—");

// Koçlarım — K-madde 9: sadece supervise edilen koçlar listelenir (kendi
// doğrudan öğrencileri burada bir "koç kartı" olarak görünmez, bkz.
// getMyCoaches'in kod yorumu — Genel Bakış'taki toplam sayıya dahildirler).
export default function CoachesList() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/head-coach/coaches", { headers: authHeaders() })
      .then((res) => setCoaches(res.data?.coaches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <HeadCoachLayout active="coaches" title="Koçlarım" subtitle={`${coaches.length} koç sana bağlı`}>
      {loading ? (
        <p className="font-nunito text-sm text-[#94a3b8]">Yükleniyor…</p>
      ) : coaches.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8]">Henüz sana atanmış bir koç bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/head-coach/coaches/${c.id}`)}
              className="text-left bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 hover:border-brand/40 transition-colors"
            >
              <p className="font-fredoka font-bold text-page-navy text-base">{c.name}</p>
              {c.subject && <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">{c.subject}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f1f5f9]">
                <span className="font-fredoka font-bold text-sm text-brand">{c.studentCount} öğrenci</span>
                <span className="font-nunito text-[11px] text-[#94a3b8]">Son not: {fmtDate(c.lastActivityAt)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </HeadCoachLayout>
  );
}
