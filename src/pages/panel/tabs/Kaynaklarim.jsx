import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaFilePdf, FaVideo, FaLink, FaFileAlt } from "react-icons/fa";

const TYPE_META = {
  video: { icon: FaVideo, label: "Video", color: "#dc2626", bg: "#fef2f2" },
  pdf: { icon: FaFilePdf, label: "PDF", color: "#b91c1c", bg: "#fef2f2" },
  link: { icon: FaLink, label: "Link", color: "#1d4ed8", bg: "#eff6ff" },
  document: { icon: FaFileAlt, label: "Belge", color: "#7340C8", bg: "#ede8fa" },
};

export default function Kaynaklarim() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/resources", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setResources(res.data?.resources || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
        <div className="text-3xl mb-3 opacity-40">📚</div>
        <p className="font-nunito text-sm text-[#94a3b8]">Henüz sana özel bir kaynak eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resources.map((r) => {
        const meta = TYPE_META[r.type] || TYPE_META.document;
        const Icon = meta.icon;
        return (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-start gap-3.5 no-underline hover:border-page-navy/30 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-fredoka font-bold text-page-navy text-sm">{r.title}</p>
              {r.description && <p className="font-nunito text-xs text-[#64748b] mt-1 leading-relaxed">{r.description}</p>}
              {r.subject && (
                <span className="inline-block mt-2 font-nunito font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b]">
                  {r.subject}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
