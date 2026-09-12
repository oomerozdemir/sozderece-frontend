import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaCheck, FaChevronLeft, FaChevronRight, FaClock } from "react-icons/fa";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const toMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtRange = (monday) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts = { day: "numeric", month: "long" };
  return `${monday.toLocaleDateString("tr-TR", opts)} — ${sunday.toLocaleDateString("tr-TR", opts)}`;
};

const toISO = (d) => d.toISOString().slice(0, 10);

export default function HaftalikProgram() {
  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const load = async (ws) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/ogrenci/me/study-plan", {
        headers: { Authorization: `Bearer ${token}` },
        params: { weekStart: toISO(ws) },
      });
      setPlan(data?.plan || null);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(weekStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const toggleItem = async (item) => {
    // İyimser güncelleme — sunucu yanıtı beklemeden checkbox anında değişsin.
    setPlan((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === item.id ? { ...it, completed: !it.completed } : it)),
    }));
    try {
      await axios.patch(
        `/api/v1/ogrenci/me/study-plan/items/${item.id}/complete`,
        { completed: !item.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Başarısızsa geri al
      setPlan((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it.id === item.id ? { ...it, completed: item.completed } : it)),
      }));
    }
  };

  const itemsByDay = useMemo(() => {
    const map = Array.from({ length: 7 }, () => []);
    (plan?.items || []).forEach((it) => {
      if (it.dayOfWeek >= 0 && it.dayOfWeek <= 6) map[it.dayOfWeek].push(it);
    });
    return map;
  }, [plan]);

  const totalItems = plan?.items?.length || 0;
  const doneItems = (plan?.items || []).filter((i) => i.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() - 7); return n; })}
            className="w-9 h-9 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
          >
            <FaChevronLeft size={12} className="text-[#475569]" />
          </button>
          <span className="font-fredoka font-bold text-page-navy text-sm px-2">{fmtRange(weekStart)}</span>
          <button
            onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() + 7); return n; })}
            className="w-9 h-9 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
          >
            <FaChevronRight size={12} className="text-[#475569]" />
          </button>
          {toISO(weekStart) !== toISO(toMonday(new Date())) && (
            <button
              onClick={() => setWeekStart(toMonday(new Date()))}
              className="font-nunito font-bold text-xs text-page-navy underline ml-1"
            >
              Bu hafta
            </button>
          )}
        </div>
        {totalItems > 0 && (
          <span className="font-nunito font-bold text-xs px-3 py-1.5 rounded-full" style={{ background: "#ede8fa", color: "#1C1B8A" }}>
            {doneItems}/{totalItems} tamamlandı
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>
      ) : !plan || totalItems === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <div className="text-3xl mb-3 opacity-40">🗓️</div>
          <p className="font-nunito text-sm text-[#94a3b8]">Bu hafta için henüz bir program hazırlanmadı. Koçun yakında ekleyecek!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {DAY_LABELS.map((label, dayIdx) => {
            const items = itemsByDay[dayIdx];
            if (items.length === 0) return null;
            return (
              <div key={dayIdx} className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
                <p className="font-fredoka font-bold text-page-navy text-sm mb-3">{label}</p>
                <div className="flex flex-col gap-2">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => toggleItem(it)}
                      className="flex items-start gap-3 text-left bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-xl px-3.5 py-3 transition-colors"
                    >
                      <span
                        className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5 border-2 transition-colors"
                        style={{
                          width: 20, height: 20,
                          borderColor: it.completed ? "#1C1B8A" : "#cbd5e1",
                          background: it.completed ? "#1C1B8A" : "transparent",
                        }}
                      >
                        {it.completed && <FaCheck size={9} className="text-white" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block font-nunito font-bold text-sm ${it.completed ? "text-[#94a3b8] line-through" : "text-[#0f172a]"}`}>
                          {it.subject}
                        </span>
                        {it.topic && <span className="block font-nunito text-xs text-[#64748b] mt-0.5">{it.topic}</span>}
                      </span>
                      {it.durationMin && (
                        <span className="flex items-center gap-1 font-nunito text-xs text-[#94a3b8] flex-shrink-0">
                          <FaClock size={10} /> {it.durationMin} dk
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
