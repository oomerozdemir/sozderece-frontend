import { useEffect, useMemo, useState } from "react";
import { FaBrain, FaClock } from "react-icons/fa";
import axios from "../../../utils/axios";
import { STATUS_META } from "./statusMeta";

// Genel Bakış — operasyon odaklı, büyük bir CRM ekranı değil (bkz. plan §2).
// İçerik önceliği: 1) bugünkü durum (durum pili + streak, workspace header'ında
// zaten kalıcı olarak gösteriliyor — burada tekrar edilmiyor) 2) dikkat
// edilmesi gerekenler 3) bugünkü görev/ilerleme 4) öğrenci temel bilgileri.
// Sipariş/paket bilgisi en altta, ikincil görsel ağırlıkta.
export default function OverviewTab({ student }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [todayItems, setTodayItems] = useState([]);
  const [actualStudyMinutesToday, setActualStudyMinutesToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/coach/students/${student.id}/today`, authHeaders)
      .then((res) => {
        setTodayItems(res.data?.items || []);
        setActualStudyMinutesToday(res.data?.actualStudyMinutesToday || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const latestOrder = student.orders?.[0];

  return (
    <div className="space-y-5">
      {/* 2) Dikkat edilmesi gerekenler */}
      {student.recurringWeaknessCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: "#f5f3ff" }}>
          <FaBrain className="flex-shrink-0" size={14} style={{ color: "#7340C8" }} />
          <p className="text-sm font-bold" style={{ color: "#7340C8" }}>
            {student.recurringWeaknessCount} tekrar eden hata — Takip sekmesinde detayları gör
          </p>
        </div>
      )}

      {/* 3) Bugünkü görev/ilerleme */}
      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5">
        {loading ? (
          <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
        ) : (
          <>
            {actualStudyMinutesToday > 0 && (
              <div className="flex items-center gap-2 bg-[#ede8fa] rounded-xl px-3.5 py-2.5 mb-4">
                <FaClock className="text-page-navy flex-shrink-0" size={13} />
                <p className="text-xs font-bold text-page-navy">Bugün {actualStudyMinutesToday} dk gerçek çalışma (Pomodoro)</p>
              </div>
            )}
            <p className="text-xs font-bold text-[#475569] mb-2">Bugünün Görevleri</p>
            {todayItems.length === 0 ? (
              <p className="text-xs text-[#94a3b8]">Bugün için planlı görev yok.</p>
            ) : (
              <div className="space-y-1.5">
                {todayItems.map((it) => {
                  const meta = STATUS_META[it.status] || STATUS_META.pending;
                  return (
                    <div key={it.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5" style={{ background: meta.bg }}>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0f172a] truncate">{it.subject}</p>
                        {it.topic && <p className="text-[11px] text-[#64748b] truncate">{it.topic}</p>}
                      </div>
                      <span className="text-[11px] font-bold flex-shrink-0" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 4) Öğrenci temel bilgileri */}
      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5 space-y-1.5">
        <p className="text-xs font-bold text-[#475569] mb-2">Öğrenci Bilgileri</p>
        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">Email:</strong> {student.email}</p>
        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">Telefon:</strong> {student.phone || "Yok"}</p>
        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">Sınıf:</strong> {student.grade || "Belirtilmemiş"}</p>
        {["9", "10", "11", "12", "Mezun"].includes(student.grade) && (
          <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">Alan:</strong> {student.track || "Belirtilmemiş"}</p>
        )}
        <p className="font-nunito text-sm text-[#475569]"><strong className="text-page-navy">Atanma Tarihi:</strong> {new Date(student.createdAt).toLocaleDateString("tr-TR")}</p>
      </div>

      {/* Sipariş/paket — ikincil görsel ağırlık */}
      <div className="rounded-xl px-4 py-3 border border-[#f1f5f9]">
        {latestOrder ? (
          <p className="font-nunito text-xs text-[#94a3b8]">
            📦 {latestOrder.package} · {latestOrder.startDate ? new Date(latestOrder.startDate).toLocaleDateString("tr-TR") : "—"} – {latestOrder.endDate ? new Date(latestOrder.endDate).toLocaleDateString("tr-TR") : "—"} · {latestOrder.status}
          </p>
        ) : (
          <p className="font-nunito text-xs italic text-[#94a3b8]">Sipariş bilgisi bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
