import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaEllipsisH } from "react-icons/fa";
import axios from "../../../utils/axios";
import { RESOURCE_EXAM_TYPES, TYPE_META } from "./resourceMeta";
import ResourceFormDrawer from "./ResourceFormDrawer";

const FILTER_OPTIONS = [{ value: "all", label: "Tümü" }, ...RESOURCE_EXAM_TYPES.map((et) => ({ value: et, label: et }))];

function ResourceCard({ resource, onEdit, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const meta = TYPE_META[resource.type] || TYPE_META.OTHER;
  const Icon = meta.icon;

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-light text-brand">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-nunito font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b]">
              {resource.examType}{resource.subject ? ` · ${resource.subject}` : ""}
            </span>
          </div>
          <p className="font-fredoka font-bold text-page-navy text-sm">{resource.title}</p>
          {resource.publisher && <p className="font-nunito text-xs text-[#64748b] mt-0.5">{resource.publisher}</p>}
          <p className="font-nunito text-[11px] text-[#94a3b8] mt-1.5">{meta.label}</p>
          {resource.note && (
            <div className="mt-2.5 pt-2.5 border-t border-[#f1f5f9]">
              <p className="font-nunito text-[11px] font-bold text-[#475569] mb-0.5">Koç notu:</p>
              <p className="font-nunito text-xs text-[#64748b] leading-relaxed">{resource.note}</p>
            </div>
          )}
        </div>
      </div>

      {confirmingRemove ? (
        <div className="mt-3.5 pt-3.5 border-t border-[#f1f5f9] space-y-2">
          <p className="font-nunito text-xs text-[#64748b]">Bu kaynak öğrencinin aktif kaynaklarından kaldırılacak.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmingRemove(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-[#64748b] bg-[#f1f5f9]">İptal</button>
            <button onClick={() => onArchive(resource.id)} className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-[#dc2626]">Kaldır</button>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 pt-3.5 border-t border-[#f1f5f9] flex items-center justify-between relative">
          <button onClick={() => onEdit(resource)} className="font-nunito font-bold text-xs text-brand">Düzenle</button>
          <button onClick={() => setMenuOpen((v) => !v)} className="text-[#94a3b8] p-1.5 rounded-lg hover:bg-[#f8fafc]"><FaEllipsisH size={13} /></button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 bottom-full mb-1 z-20 bg-white rounded-xl border border-[#e2e8f0] shadow-lg py-1 w-36">
                <button
                  onClick={() => { setMenuOpen(false); setConfirmingRemove(true); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#dc2626] hover:bg-[#fef2f2]"
                >
                  Kaynağı kaldır
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Koç workspace — "Kaynaklar" sekmesi: öğrenciye atanmış kitap/deneme/
// fasikül vb. kaynakların listesi + yönetimi. StudyPlanItem/Deneme Merkezi
// ile hiçbir zorunlu bağlantısı yok (bkz. plan K9) — bağımsız bir domain.
export default function ResourcesTab({ student }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [drawerState, setDrawerState] = useState(null); // null | "add" | resource object (edit)

  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const loadResources = () => {
    axios
      .get(`/api/coach/students/${student.id}/resources`, authHeaders)
      .then((res) => setResources(res.data?.resources || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const visibleResources = filter === "all" ? resources : resources.filter((r) => r.examType === filter);

  const handleSaved = (resource, isEdit) => {
    setResources((prev) => (isEdit ? prev.map((r) => (r.id === resource.id ? resource : r)) : [resource, ...prev]));
  };

  const handleArchive = async (resourceId) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    try {
      await axios.patch(`/api/coach/students/${student.id}/resources/${resourceId}/archive`, {}, authHeaders);
    } catch {
      loadResources(); // başarısızsa gerçek durumu geri çek
    }
  };

  if (loading) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-fredoka font-bold text-page-navy text-base">Kaynaklar</p>
          <p className="font-nunito text-xs text-[#64748b] mt-0.5">Öğrencinin çalıştığı kitap, deneme ve diğer kaynakları buradan yönet.</p>
        </div>
        <button
          onClick={() => setDrawerState("add")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-navy flex-shrink-0"
        >
          <FaPlus size={11} /> Kaynak Ekle
        </button>
      </div>

      {resources.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className="shrink-0 font-nunito font-bold text-xs px-3 py-2 rounded-full border transition-colors"
                style={active ? { background: "var(--color-brand)", color: "#fff", borderColor: "var(--color-brand)" } : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8] mb-4">Bu öğrenciye henüz kaynak eklenmemiş.</p>
          <button onClick={() => setDrawerState("add")} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-navy">
            <FaPlus size={11} /> İlk Kaynağı Ekle
          </button>
        </div>
      ) : visibleResources.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <p className="font-nunito text-sm text-[#94a3b8]">Bu filtrede kaynak bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleResources.map((r) => (
            <ResourceCard key={r.id} resource={r} onEdit={setDrawerState} onArchive={handleArchive} />
          ))}
        </div>
      )}

      {drawerState && (
        <ResourceFormDrawer
          student={student}
          initialData={drawerState === "add" ? null : drawerState}
          onClose={() => setDrawerState(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
