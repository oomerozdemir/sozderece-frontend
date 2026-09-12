import { useEffect, useMemo, useState } from "react";
import axios from "../../../utils/axios";
import { FaCalendarWeek, FaChartLine, FaBookOpen, FaBullhorn } from "react-icons/fa";

const toMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function GenelBakis() {
  const [plan, setPlan] = useState(null);
  const [examCount, setExamCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("/api/v1/ogrenci/me/study-plan", { headers, params: { weekStart: toMonday(new Date()).toISOString().slice(0, 10) } })
      .then((res) => setPlan(res.data?.plan || null)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/exam-results", { headers })
      .then((res) => setExamCount(res.data?.results?.length || 0)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/resources", { headers })
      .then((res) => setResourceCount(res.data?.resources?.length || 0)).catch(() => {});
    axios.get("/api/v1/ogrenci/me/announcements", { headers })
      .then((res) => setLatestAnnouncement(res.data?.announcements?.[0] || null)).catch(() => {});
  }, [token]);

  const totalItems = plan?.items?.length || 0;
  const doneItems = (plan?.items || []).filter((i) => i.completed).length;

  const CARDS = [
    {
      key: "program",
      icon: FaCalendarWeek,
      color: "#1C1B8A",
      bg: "#ede8fa",
      title: "Haftalık Programım",
      desc: totalItems > 0 ? `${doneItems}/${totalItems} görev tamamlandı` : "Bu hafta için henüz program yok",
    },
    {
      key: "deneme",
      icon: FaChartLine,
      color: "#059669",
      bg: "#ecfdf5",
      title: "Deneme Analizim",
      desc: examCount > 0 ? `${examCount} deneme kayıtlı` : "Henüz deneme sonucun yok",
    },
    {
      key: "kaynaklar",
      icon: FaBookOpen,
      color: "#c2410c",
      bg: "#fff0ea",
      title: "Kaynaklarım",
      desc: resourceCount > 0 ? `${resourceCount} kaynak seni bekliyor` : "Henüz kaynak eklenmedi",
    },
    {
      key: "gundem",
      icon: FaBullhorn,
      color: "#7340C8",
      bg: "#f5f3ff",
      title: "Gündem",
      desc: latestAnnouncement ? latestAnnouncement.title : "Güncel duyuru yok",
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg, color: c.color }}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="font-fredoka font-bold text-page-navy text-sm">{c.title}</p>
                <p className="font-nunito text-xs text-[#64748b] mt-1 truncate">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" }}>
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
