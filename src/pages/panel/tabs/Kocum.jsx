import { FaUserTie, FaEnvelope, FaPhoneAlt, FaWhatsapp, FaGraduationCap } from "react-icons/fa";

// Mevcut LegacyStudentDashboard'daki atanmış-koç kartıyla aynı içerik/mantık,
// panel sekmesi olarak.
export default function Kocum({ student }) {
  if (!student) {
    return <div className="bg-white rounded-[24px] border border-[#f1f5f9] p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  if (!student.assignedCoach) {
    return (
      <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-7 max-w-[460px]">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
          style={{ background: "rgba(115,64,200,0.12)", color: "#7340C8" }}
        >
          <FaUserTie />
        </div>
        <h3 className="font-fredoka font-bold text-page-navy text-lg mb-2">Henüz Koçun Yok</h3>
        <p className="font-nunito text-[#64748b] text-sm leading-relaxed mb-5">
          Aşağıdaki seçeneklerle paketlerimizi inceleyebilir ya da ücretsiz bir ön görüşme planlayabilirsin.
        </p>
        <div className="flex flex-col gap-2.5">
          <a href="/paket-detay" className="text-center font-fredoka font-bold text-sm px-5 py-3 rounded-full transition-transform hover:scale-[1.02]" style={{ background: "#1C1B8A", color: "white" }}>
            📦 Paketleri İncele
          </a>
          <a href="/ucretsiz-on-gorusme" className="text-center font-fredoka font-bold text-sm px-5 py-3 rounded-full transition-transform hover:scale-[1.02]" style={{ background: "#D8FF4F", color: "#1C1B8A" }}>
            🗓️ Ücretsiz Görüşme Al
          </a>
          <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 font-fredoka font-bold text-sm px-5 py-3 rounded-full border-2 transition-colors hover:bg-[#f0fdf4]" style={{ borderColor: "#22c55e", color: "#15803d" }}>
            <FaWhatsapp /> WhatsApp Destek
          </a>
        </div>
      </div>
    );
  }

  const coach = student.assignedCoach;
  return (
    <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-7 max-w-[420px]">
      <p className="font-fredoka font-bold text-accent-orange text-[11px] uppercase mb-3" style={{ letterSpacing: 3 }}>
        Atanmış Koçun
      </p>
      <img src={coach.image} alt={coach.name} className="w-24 h-24 object-cover rounded-full border-4 mx-auto mb-4 block" style={{ borderColor: "#D8FF4F" }} />
      <h3 className="font-fredoka font-bold text-page-navy text-lg text-center mb-4">{coach.name}</h3>
      <div className="space-y-2 mb-5">
        {coach.subject && (
          <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5">
            <FaGraduationCap className="text-page-navy flex-shrink-0" />
            <span className="font-nunito text-xs text-[#334155]">{coach.subject}</span>
          </div>
        )}
        {coach.user?.email && (
          <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5">
            <FaEnvelope className="text-page-navy flex-shrink-0" />
            <span className="font-nunito text-xs text-[#334155] truncate">{coach.user.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5">
          <FaPhoneAlt className="text-page-navy flex-shrink-0" />
          <span className="font-nunito text-xs text-[#334155]">{coach.user?.phone || "Belirtilmemiş"}</span>
        </div>
      </div>
      {coach.description && <p className="font-nunito text-xs text-[#64748b] leading-relaxed mb-5">{coach.description}</p>}
      <a href="https://wa.me/905312546701" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 font-fredoka font-bold text-sm px-5 py-3 rounded-full transition-transform hover:scale-[1.02]" style={{ background: "#22c55e", color: "white" }}>
        <FaWhatsapp /> WhatsApp Destek
      </a>
    </div>
  );
}
