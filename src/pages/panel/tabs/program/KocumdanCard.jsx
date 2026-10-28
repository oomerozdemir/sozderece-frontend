import { FaWhatsapp } from "react-icons/fa";

// Koçun bıraktığı en güncel not — hem Genel Bakış hem Programım (Bugünüm)
// aynı kompakt kartı kullanır (video geri bildirimi: "büyük olmak yerine
// küçük bir yerde durabilir" — HaftalikProgram.jsx'in zaten sahip olduğu
// kompakt, yatay düzen ikisine de taşındı, pozisyon [sayfanın üstü] aynı
// kaldı).
export default function KocumdanCard({ note }) {
  if (!note) return null;
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#ede8fa" }}>
        👋
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-fredoka font-bold text-[10px] uppercase text-brand mb-1" style={{ letterSpacing: 1 }}>Koçumdan</p>
        {note.type === "text" ? (
          <p className="font-nunito font-bold text-sm text-[#334155]">"{note.text}"</p>
        ) : (
          <audio controls src={note.audioUrl} className="h-8 mt-1 max-w-full" />
        )}
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-nunito text-[11px] text-[#94a3b8]">{note.coachName} · {note.isToday ? "Bugün" : ""}</p>
          <a href="https://wa.me/905312546701" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-nunito font-bold text-[11px] no-underline" style={{ color: "var(--color-brand)" }}>
            <FaWhatsapp size={11} /> Koçuma Yaz
          </a>
        </div>
      </div>
    </div>
  );
}
