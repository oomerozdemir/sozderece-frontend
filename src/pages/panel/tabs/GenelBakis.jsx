import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import {
  FaFire, FaStar, FaRegStar, FaBullseye, FaChartBar, FaClock,
  FaCheckCircle, FaArrowUp, FaArrowDown, FaBookOpen, FaBullhorn,
} from "react-icons/fa";

const fmtMinutes = (mins) => {
  const m = Math.max(0, Math.round(mins || 0));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} sa ${rem} dk` : `${h} sa`;
};

const relativeTime = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dakika önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

function StarRating({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) =>
        i < count ? (
          <FaStar key={i} size={13} className="text-[#D8FF4F]" style={{ filter: "drop-shadow(0 0 3px rgba(216,255,79,0.5))" }} />
        ) : (
          <FaRegStar key={i} size={13} className="text-white/25" />
        )
      )}
    </div>
  );
}

function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-nunito font-bold text-xs text-[#334155]">{label}</span>
        <span className="font-nunito font-bold text-xs text-[#0f172a]">%{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(4, value)}%`, background: "linear-gradient(90deg, #1C1B8A, #FF6B35)" }}
        />
      </div>
    </div>
  );
}

export default function GenelBakis({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [resourceCount, setResourceCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [perfTab, setPerfTab] = useState("hafta"); // "hafta" | "genel"
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("/api/v1/ogrenci/me/summary", { headers }).then((res) => setSummary(res.data)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/resources", { headers }).then((res) => setResourceCount(res.data?.resources?.length || 0)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/announcements", { headers }).then((res) => setAnnouncementCount(res.data?.announcements?.length || 0)).catch(() => {});
  }, [token]);

  if (!summary) {
    return <div className="bg-white border border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  const quality = summary.quality || { profile: 0, program: 0, deneme: 0, overall: 0, stars: 1 };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Canlı Aktivite ── */}
      <div
        className="rounded-[24px] p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" }}
      >
        <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, background: "#4a1da0", filter: "blur(70px)", opacity: 0.5, top: -80, right: -60 }} />
        <div className="flex items-center justify-between gap-3 mb-4 relative flex-wrap">
          <div className="flex items-center gap-2">
            <FaFire className="text-[#D8FF4F]" size={14} />
            <span className="font-fredoka font-bold text-[12px] uppercase" style={{ color: "#D8FF4F", letterSpacing: 2 }}>
              Canlı Aktivite
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(216,255,79,0.4)", background: "rgba(216,255,79,0.08)" }}
          >
            <span className="font-nunito font-bold text-[10px] uppercase text-white/60" style={{ letterSpacing: 1 }}>
              Toplam Çalışma
            </span>
            <span className="font-fredoka font-bold text-sm text-[#D8FF4F]">{fmtMinutes(summary.totalMinutesCompleted)}</span>
          </div>
        </div>

        {summary.recentActivity?.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1 relative" style={{ scrollbarWidth: "thin" }}>
            {summary.recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border whitespace-nowrap"
                style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
              >
                <span className="text-sm">{a.type === "exam" ? "📊" : "✅"}</span>
                <span className="font-nunito font-bold text-xs">{a.label}</span>
                <span className="font-nunito text-[11px] text-white/50">· {relativeTime(a.at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-nunito text-sm text-white/70 relative">
            Henüz aktivite yok — ilk görevini tamamladığında burada görünecek.
          </p>
        )}
      </div>

      {/* ── Koçun Seni Ne Kadar Tanıyor ── */}
      <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#ede8fa", color: "#7340C8" }}>
              ✨
            </div>
            <div>
              <p className="font-fredoka font-bold text-page-navy text-base">Koçun Seni %{quality.overall} Tanıyor</p>
              <p className="font-nunito text-xs text-[#64748b] mt-1 max-w-[420px]">
                Programını tamamladıkça ve deneme sonuçların girildikçe koçun sana daha isabetli bir yol haritası çıkarabiliyor.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="px-2 py-1 rounded-full" style={{ background: "#1C1B8A" }}>
              <StarRating count={quality.stars} />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ProgressBar label="Profil" value={quality.profile} />
          <ProgressBar label="Haftalık Program" value={quality.program} />
          <ProgressBar label="Deneme Geçmişi" value={quality.deneme} />
        </div>
      </div>

      {/* ── Bugünün Odağı + Performansım ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <FaBullseye className="text-accent-orange" size={14} />
            <span className="font-fredoka font-bold text-[11px] uppercase text-accent-orange" style={{ letterSpacing: 2 }}>
              Bugünün Odağı
            </span>
          </div>
          {summary.todayFocus?.length > 0 ? (
            <>
              <p className="font-fredoka font-bold text-page-navy text-lg leading-snug">
                {summary.todayFocus[0].subject}
                {summary.todayFocus[0].topic && <span className="text-[#64748b] font-nunito text-sm font-bold"> — {summary.todayFocus[0].topic}</span>}
              </p>
              {summary.todayFocus[0].durationMin && (
                <p className="font-nunito text-xs text-[#94a3b8] mt-1 flex items-center gap-1.5">
                  <FaClock size={10} /> {summary.todayFocus[0].durationMin} dakika
                </p>
              )}
              {summary.todayFocus.length > 1 && (
                <p className="font-nunito text-xs text-[#64748b] mt-3">+{summary.todayFocus.length - 1} görev daha bugün seni bekliyor</p>
              )}
            </>
          ) : (
            <p className="font-nunito text-sm text-[#64748b]">Bugün için planlı görev yok — dilersen ileriye bakabilirsin. 🎉</p>
          )}
          <button
            onClick={() => onNavigate && onNavigate("program")}
            className="mt-auto pt-4 font-nunito font-bold text-sm text-page-navy text-left hover:underline"
          >
            Bugünü Aç →
          </button>
        </div>

        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FaChartBar className="text-page-navy" size={14} />
              <span className="font-fredoka font-bold text-page-navy text-sm">Performansım</span>
            </div>
            <div className="flex gap-1 rounded-full p-1" style={{ background: "#F4F2FA" }}>
              {[{ key: "hafta", label: "Bu Hafta" }, { key: "genel", label: "Genel" }].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setPerfTab(t.key)}
                  className="font-nunito font-bold text-xs px-3.5 py-1.5 rounded-full transition-colors"
                  style={perfTab === t.key ? { background: "#1C1B8A", color: "#D8FF4F" } : { color: "#8B87A6" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {perfTab === "hafta" ? (
            <div className="grid grid-cols-3 gap-3">
              <StatTile icon={<FaCheckCircle />} color="#059669" bg="#ecfdf5" label="Tamamlanan" value={`${summary.weeklyTaskDone}/${summary.weeklyTaskTotal}`} />
              <StatTile icon={<FaClock />} color="#1C1B8A" bg="#ede8fa" label="Çalışma Süresi" value={fmtMinutes(summary.weeklyMinutesCompleted)} />
              <StatTile
                icon={<FaChartBar />}
                color="#c2410c"
                bg="#fff0ea"
                label="Son Deneme"
                value={summary.latestExam?.totalNet != null ? `${summary.latestExam.totalNet} net` : "—"}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <StatTile icon={<FaClock />} color="#1C1B8A" bg="#ede8fa" label="Toplam Süre" value={fmtMinutes(summary.totalMinutesCompleted)} />
              <StatTile icon={<FaChartBar />} color="#c2410c" bg="#fff0ea" label="Deneme Sayısı" value={summary.examCount} />
              <StatTile
                icon={summary.netTrendDelta != null && summary.netTrendDelta < 0 ? <FaArrowDown /> : <FaArrowUp />}
                color={summary.netTrendDelta != null && summary.netTrendDelta < 0 ? "#dc2626" : "#059669"}
                bg={summary.netTrendDelta != null && summary.netTrendDelta < 0 ? "#fef2f2" : "#ecfdf5"}
                label="Net Trendi"
                value={summary.netTrendDelta != null ? `${summary.netTrendDelta > 0 ? "+" : ""}${summary.netTrendDelta}` : "—"}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Hızlı erişim ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => onNavigate && onNavigate("kaynaklar")}
          className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-center gap-3.5 text-left hover:border-page-navy/30 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff0ea", color: "#c2410c" }}>
            <FaBookOpen size={16} />
          </div>
          <div>
            <p className="font-fredoka font-bold text-page-navy text-sm">Kaynaklarım</p>
            <p className="font-nunito text-xs text-[#64748b] mt-0.5">{resourceCount > 0 ? `${resourceCount} kaynak seni bekliyor` : "Henüz kaynak eklenmedi"}</p>
          </div>
        </button>
        <button
          onClick={() => onNavigate && onNavigate("gundem")}
          className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-center gap-3.5 text-left hover:border-page-navy/30 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f5f3ff", color: "#7340C8" }}>
            <FaBullhorn size={16} />
          </div>
          <div>
            <p className="font-fredoka font-bold text-page-navy text-sm">Gündem</p>
            <p className="font-nunito text-xs text-[#64748b] mt-0.5">{announcementCount > 0 ? `${announcementCount} güncel duyuru` : "Güncel duyuru yok"}</p>
          </div>
        </button>
      </div>

      <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" }}>
        <p className="font-fredoka font-bold text-lg mb-1.5">Takıldığın bir yer mi var?</p>
        <p className="font-nunito text-sm mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
          Koçun gün boyu WhatsApp'tan ulaşılabilir — sormaktan çekinme.
        </p>
        <a
          href="https://wa.me/905312546701"
          target="_blank"
          rel="noreferrer"
          className="inline-block font-fredoka font-bold text-sm px-5 py-2.5 rounded-full no-underline"
          style={{ background: "#D8FF4F", color: "#1C1B8A" }}
        >
          Koçuma Yaz →
        </a>
      </div>
    </div>
  );
}

function StatTile({ icon, color, bg, label, value }) {
  return (
    <div className="p-4 rounded-xl text-center" style={{ background: bg }}>
      <div className="flex items-center justify-center mb-1.5" style={{ color }}>
        {icon}
      </div>
      <p className="font-nunito font-bold text-[11px]" style={{ color }}>{label}</p>
      <p className="font-fredoka font-bold text-lg mt-0.5" style={{ color: "#0f172a" }}>{value}</p>
    </div>
  );
}
