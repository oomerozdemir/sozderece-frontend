import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaFilePdf, FaVideo, FaLink, FaFileAlt, FaLock, FaFire } from "react-icons/fa";

const TYPE_META = {
  video: { icon: FaVideo, label: "Video", color: "#dc2626", bg: "#fef2f2" },
  pdf: { icon: FaFilePdf, label: "PDF", color: "#b91c1c", bg: "#fef2f2" },
  link: { icon: FaLink, label: "Link", color: "#1d4ed8", bg: "#eff6ff" },
  document: { icon: FaFileAlt, label: "Belge", color: "#7340C8", bg: "#ede8fa" },
};

export default function Kaynaklarim() {
  const [resources, setResources] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/resources", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setResources(res.data?.resources || []);
        setStreak(res.data?.streak || { current: 0, longest: 0 });
      })
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
        const locked = (r.requiredStreak || 0) > streak.current;

        if (locked) {
          return (
            <div
              key={r.id}
              title={`Kilidi açmak için ${r.requiredStreak} günlük seri gerekiyor`}
              className="bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1] p-5 flex items-start gap-3.5 grayscale opacity-70"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#e2e8f0] text-[#94a3b8]">
                <FaLock size={15} />
              </div>
              <div className="min-w-0">
                <p className="font-fredoka font-bold text-[#475569] text-sm">{r.title}</p>
                <p className="font-nunito font-bold text-[11px] text-[#94a3b8] mt-1.5 flex items-center gap-1">
                  <FaFire size={10} /> Kilidi açmak için {r.requiredStreak} günlük seri gerekiyor ({streak.current}/{r.requiredStreak})
                </p>
              </div>
            </div>
          );
        }

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
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {r.subject && (
                  <span className="inline-block font-nunito font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b]">
                    {r.subject}
                  </span>
                )}
                {r.requiredStreak > 0 && (
                  <span className="inline-flex items-center gap-1 font-nunito font-bold text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    <FaFire size={9} /> Kilidi açtın!
                  </span>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
