import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "../../../utils/axios";
import {
  FaClock, FaCheck, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight,
  FaRegCircle, FaHourglassHalf, FaFrown,
} from "react-icons/fa";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Emoji YOK: renkli emoji glifleri (ör. ✅) kendi rengiyle geliyor, bu yüzden
// buton "aktif değilken" bile "yeşil işaretli" gibi görünüyordu (canlı
// puppeteer doğrulamasında yakalandı). Tek renkli ikon kullanılınca aktif/
// pasif durumu sadece bizim style'ımız belirliyor.
const STATUS_META = {
  done: { label: "Bitti", Icon: FaCheck, color: "#059669", bg: "#ecfdf5" },
  partial: { label: "Yarıda Kaldı", Icon: FaHourglassHalf, color: "#c2740c", bg: "#fff7ea" },
  stuck: { label: "Zorlandım", Icon: FaFrown, color: "#dc2626", bg: "#fef2f2" },
};

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

const fmtToday = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
};

const fmtMinutes = (mins) => {
  const m = Math.max(0, Math.round(mins || 0));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} sa ${rem} dk` : `${h} sa`;
};

// Görevin yanındaki üç durum butonu — "Bitti" dışında "Yarıda Kaldı"/
// "Zorlandım" ile koç öğrencinin nerede takıldığını anlık görür. Aktif
// olana tekrar basmak "pending"e geri alır (yanlışlıkla işaretlemeyi
// düzeltmek için).
function StatusButtons({ status, onChange, compact }) {
  const size = compact ? 26 : 32;
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {Object.entries(STATUS_META).map(([key, meta]) => {
        const active = status === key;
        const Icon = meta.Icon;
        return (
          <button
            key={key}
            type="button"
            title={meta.label}
            aria-label={meta.label}
            aria-pressed={active}
            onClick={() => onChange(active ? "pending" : key)}
            className="flex items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{
              width: size,
              height: size,
              background: active ? meta.bg : "#f1f5f9",
              border: active ? `2px solid ${meta.color}` : "2px solid transparent",
              color: active ? meta.color : "#94a3b8",
            }}
          >
            <Icon size={compact ? 11 : 13} />
          </button>
        );
      })}
    </div>
  );
}

function TaskRow({ item, onChange, compact }) {
  const meta = STATUS_META[item.status];
  return (
    <div
      className="flex items-start sm:items-center gap-3 rounded-xl px-3.5 py-3 flex-wrap sm:flex-nowrap transition-colors"
      style={{ background: meta ? meta.bg : "#f8fafc" }}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5 sm:mt-0"
        style={{ width: 22, height: 22, color: meta ? meta.color : "#cbd5e1" }}
      >
        {item.status === "done" ? <FaCheck size={11} /> : <FaRegCircle size={11} />}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={`block font-nunito font-bold text-sm ${item.status === "done" ? "text-[#94a3b8] line-through" : "text-[#0f172a]"}`}
        >
          {item.subject}
        </span>
        {item.topic && <span className="block font-nunito text-xs text-[#64748b] mt-0.5">{item.topic}</span>}
        <span className="flex items-center gap-3 mt-1">
          {item.durationMin && (
            <span className="flex items-center gap-1 font-nunito text-[11px] text-[#94a3b8]">
              <FaClock size={9} /> {item.durationMin} dk
            </span>
          )}
          {meta && (
            <span className="font-nunito font-bold text-[11px]" style={{ color: meta.color }}>
              {meta.label}
            </span>
          )}
        </span>
      </span>
      <StatusButtons status={item.status} compact={compact} onChange={(next) => onChange(item.id, next)} />
    </div>
  );
}

function ZRaporuCard({ report }) {
  if (!report) return null;
  return (
    <div
      className="rounded-[20px] p-5 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f7a3d 0%, #059669 100%)" }}
    >
      <div className="absolute rounded-full pointer-events-none" style={{ width: 160, height: 160, background: "#00e676", filter: "blur(60px)", opacity: 0.35, top: -50, right: -40 }} />
      <div className="relative">
        <p className="font-fredoka font-bold text-base mb-0.5">🎉 Bugünün Z-Raporu Hazır!</p>
        <p className="font-nunito text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
          Bugünkü tüm görevlerin sonuçlandı — koçun bu özeti panelinde görebilir.
        </p>
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.14)" }}>
            <p className="font-fredoka font-bold text-lg">{report.doneTasks}</p>
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Bitti</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.14)" }}>
            <p className="font-fredoka font-bold text-lg">{report.partialTasks}</p>
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Yarıda Kaldı</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.14)" }}>
            <p className="font-fredoka font-bold text-lg">{report.stuckTasks}</p>
            <p className="font-nunito text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>Zorlandım</p>
          </div>
        </div>
        <p className="font-nunito text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>
          Toplam çalışma süresi: {fmtMinutes(report.totalMinutes)}
        </p>
      </div>
    </div>
  );
}

export default function HaftalikProgram() {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekOpen, setWeekOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => toMonday(new Date()));
  const [plan, setPlan] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/ogrenci/me/today", { headers });
      setToday(data || null);
    } catch {
      setToday(null);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const loadWeek = useCallback(
    async (ws) => {
      setWeekLoading(true);
      try {
        const { data } = await axios.get("/api/v1/ogrenci/me/study-plan", { headers, params: { weekStart: toISO(ws) } });
        setPlan(data?.plan || null);
      } catch {
        setPlan(null);
      } finally {
        setWeekLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    if (weekOpen) loadWeek(weekStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOpen, weekStart]);

  // İyimser güncelleme: buton anında tepki versin, sonra sunucudan (Z-Raporu
  // oluşmuş olabilir diye) otoriter veriyi tekrar çek.
  const setStatus = async (itemId, status, isToday) => {
    if (isToday) {
      setToday((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status } : it)) } : prev));
    } else {
      setPlan((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status } : it)) } : prev));
    }
    try {
      await axios.patch(`/api/v1/ogrenci/me/study-plan/items/${itemId}/status`, { status }, { headers });
    } catch {
      // sessizce yut, aşağıdaki refetch gerçek durumu geri getirir
    } finally {
      if (isToday) loadToday();
      else if (toISO(weekStart) === toISO(toMonday(new Date()))) loadToday();
    }
  };

  const items = today?.items || [];
  const total = items.length;
  const resolved = items.filter((i) => i.status !== "pending").length;
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const itemsByDay = useMemo(() => {
    const map = Array.from({ length: 7 }, () => []);
    (plan?.items || []).forEach((it) => {
      if (it.dayOfWeek >= 0 && it.dayOfWeek <= 6) map[it.dayOfWeek].push(it);
    });
    return map;
  }, [plan]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Bugün başlığı ── */}
      <div>
        <p className="font-fredoka font-bold text-page-navy text-lg capitalize">{fmtToday(today?.date) || "Bugün"}</p>
        <p className="font-nunito text-xs text-[#64748b] mt-0.5">Sadece bugüne odaklan — haftanın tamamı aşağıda seni bekliyor.</p>
      </div>

      {loading ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>
      ) : total === 0 ? (
        <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-10 text-center">
          <div className="text-3xl mb-3 opacity-40">🎉</div>
          <p className="font-nunito text-sm text-[#94a3b8]">Bugün için planlı görev yok. Koçun henüz eklemediyse yakında ekleyecek!</p>
        </div>
      ) : (
        <>
          {/* İlerleme çubuğu — neon yeşil */}
          <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-nunito font-bold text-xs text-[#334155]">Bugünkü İlerleme</span>
              <span className="font-fredoka font-bold text-sm" style={{ color: "#00b34a" }}>
                {resolved}/{total} · %{pct}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct > 0 ? 6 : 0, pct)}%`,
                  background: "linear-gradient(90deg, #00c853, #00e676)",
                  boxShadow: pct > 0 ? "0 0 10px rgba(0,230,118,0.6)" : "none",
                }}
              />
            </div>
          </div>

          <ZRaporuCard report={today?.report} />

          <div className="flex flex-col gap-2.5">
            {items.map((it) => (
              <TaskRow key={it.id} item={it} onChange={(id, status) => setStatus(id, status, true)} />
            ))}
          </div>
        </>
      )}

      {/* ── Bu Haftanın Tamamı (katlanır) ── */}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          onClick={() => setWeekOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="font-fredoka font-bold text-page-navy text-sm">Bu Haftanın Tamamı</span>
          {weekOpen ? <FaChevronUp size={12} className="text-[#94a3b8]" /> : <FaChevronDown size={12} className="text-[#94a3b8]" />}
        </button>

        {weekOpen && (
          <div className="px-5 pb-5 border-t border-[#f1f5f9] pt-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() - 7); return n; })}
                className="w-8 h-8 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
              >
                <FaChevronLeft size={11} className="text-[#475569]" />
              </button>
              <span className="font-fredoka font-bold text-page-navy text-xs px-1">{fmtRange(weekStart)}</span>
              <button
                onClick={() => setWeekStart((w) => { const n = new Date(w); n.setDate(n.getDate() + 7); return n; })}
                className="w-8 h-8 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center hover:border-page-navy/40 transition-colors"
              >
                <FaChevronRight size={11} className="text-[#475569]" />
              </button>
              {toISO(weekStart) !== toISO(toMonday(new Date())) && (
                <button onClick={() => setWeekStart(toMonday(new Date()))} className="font-nunito font-bold text-xs text-page-navy underline ml-1">
                  Bu hafta
                </button>
              )}
            </div>

            {weekLoading ? (
              <p className="font-nunito text-sm text-[#94a3b8] text-center py-6">Yükleniyor…</p>
            ) : !plan || (plan.items || []).length === 0 ? (
              <p className="font-nunito text-sm text-[#94a3b8] text-center py-6">Bu hafta için henüz bir program hazırlanmadı.</p>
            ) : (
              <div className="grid gap-3">
                {DAY_LABELS.map((label, dayIdx) => {
                  const dItems = itemsByDay[dayIdx];
                  if (dItems.length === 0) return null;
                  return (
                    <div key={dayIdx}>
                      <p className="font-fredoka font-bold text-[#334155] text-xs mb-2">{label}</p>
                      <div className="flex flex-col gap-2">
                        {dItems.map((it) => (
                          <TaskRow key={it.id} item={it} compact onChange={(id, status) => setStatus(id, status, false)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
