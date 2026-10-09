import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaFilePdf, FaVideo, FaLink, FaFileAlt, FaLock, FaFire, FaBook, FaClipboardList } from "react-icons/fa";

const TYPE_META = {
  video: { icon: FaVideo, label: "Video", color: "#dc2626", bg: "#fef2f2" },
  pdf: { icon: FaFilePdf, label: "PDF", color: "#b91c1c", bg: "#fef2f2" },
  link: { icon: FaLink, label: "Link", color: "#1d4ed8", bg: "#eff6ff" },
  document: { icon: FaFileAlt, label: "Belge", color: "var(--color-brand)", bg: "var(--color-brand-light)" },
};

// Koçun atadığı kaynakların türleri — backend coach.controller.js'teki
// RESOURCE_TYPES ile aynı enum, burada yalnızca görünen etiket/ikon var
// (salt-okunur görünüm, ayrı bir "source of truth" gerektirmiyor).
const ASSIGNED_TYPE_META = {
  BOOK: { icon: FaBook, label: "Kitap / Soru Bankası" },
  MOCK_EXAM: { icon: FaClipboardList, label: "Genel Deneme" },
  BRANCH_MOCK: { icon: FaClipboardList, label: "Branş Denemesi" },
  FASCICLE: { icon: FaFileAlt, label: "Fasikül" },
  OTHER: { icon: FaFileAlt, label: "Diğer" },
};

function AssignedResourceCard({ resource }) {
  const meta = ASSIGNED_TYPE_META[resource.type] || ASSIGNED_TYPE_META.OTHER;
  const Icon = meta.icon;
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-light text-brand">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block font-nunito font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b] mb-1">
            {resource.examType}{resource.subject ? ` · ${resource.subject}` : ""}
          </span>
          <p className="font-fredoka font-bold text-page-navy text-sm">{resource.title}</p>
          {resource.publisher && <p className="font-nunito text-xs text-[#64748b] mt-0.5">{resource.publisher}</p>}
          <p className="font-nunito text-[11px] text-[#94a3b8] mt-1.5">{meta.label}</p>
          {resource.note && (
            <div className="mt-2.5 pt-2.5 border-t border-[#f1f5f9]">
              <p className="font-nunito text-[11px] font-bold text-[#475569] mb-0.5">Koçunun notu:</p>
              <p className="font-nunito text-xs text-[#64748b] leading-relaxed">{resource.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Kaynaklarim() {
  const [assignedResources, setAssignedResources] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/assigned-resources", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAssignedResources(res.data?.resources || []))
      .catch(() => setAssignedResources([]))
      .finally(() => setAssignedLoading(false));

    axios
      .get("/api/v1/ogrenci/me/resources", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setResources(res.data?.resources || []);
        setStreak(res.data?.streak || { current: 0, longest: 0 });
      })
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Birincil: koçun atadığı kaynaklar ── */}
      <div>
        <p className="font-fredoka font-bold text-page-navy text-base mb-0.5">Koçumun Kaynakları</p>
        <p className="font-nunito text-xs text-[#64748b] mb-3">Koçunun senin için belirlediği çalışma kaynakları.</p>

        {assignedLoading ? (
          <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>
        ) : assignedResources.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
            <div className="text-3xl mb-3 opacity-40">📚</div>
            <p className="font-nunito text-sm text-[#94a3b8]">Koçun henüz sana bir kaynak eklemedi.</p>
            <p className="font-nunito text-xs text-[#cbd5e1] mt-1">Kaynakların eklendiğinde burada görebileceksin.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {assignedResources.map((r) => <AssignedResourceCard key={r.id} resource={r} />)}
          </div>
        )}
      </div>

      {/* ── İkincil: genel yayın kataloğu (admin yönetimli, var olan davranış) ── */}
      <div>
        <p className="font-fredoka font-bold text-[#94a3b8] text-sm mb-3">Diğer / Genel Kaynaklar</p>

        {loading ? (
          <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
            <p className="font-nunito text-sm text-[#94a3b8]">Henüz genel bir kaynak eklenmemiş.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
