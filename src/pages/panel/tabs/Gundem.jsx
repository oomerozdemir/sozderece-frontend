import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaBullhorn } from "react-icons/fa";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "");

export default function Gundem() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/announcements", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAnnouncements(res.data?.announcements || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <div className="text-3xl mb-3 opacity-40">📣</div>
        <p className="font-nunito text-sm text-[#94a3b8]">Şu an yayında bir duyuru yok.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 max-w-[640px]">
      {announcements.map((a) => (
        <div key={a.id} className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff0ea", color: "#FF6B35" }}>
            <FaBullhorn size={14} />
          </div>
          <div className="min-w-0">
            <p className="font-fredoka font-bold text-page-navy text-sm">{a.title}</p>
            <p className="font-nunito text-xs text-[#94a3b8] mt-0.5 mb-2">{fmtDate(a.publishedAt)}</p>
            <p className="font-nunito text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{a.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
