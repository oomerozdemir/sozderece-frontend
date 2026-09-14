import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { FaVolumeUp } from "react-icons/fa";

const relativeDay = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "bugün";
  if (days === 1) return "dün";
  return `${days} gün önce`;
};

// Panelin en üstünde, HER sekmede sabit görünen "koçtan günün notu" kartı —
// öğrenci yalnız çalışmadığını hissetsin diye günlük psikolojik çapa. Kalın
// çerçeve + sert gölge (neo-brutalist vurgu) bilinçli olarak sitenin
// genelindeki yumuşak kart dilinden ayrılıyor — bu kart "dikkatimi çek" diyor.
export default function CoachNoteBanner() {
  const [note, setNote] = useState(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get("/api/v1/ogrenci/me/notes/latest", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNote(res.data?.note || null))
      .catch(() => {});
  }, [token]);

  if (!note) return null;

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3.5 flex-wrap sm:flex-nowrap mb-5"
      style={{ background: "#fff", border: "3px solid #0f172a", boxShadow: "5px 5px 0px #D8FF4F" }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "#1C1B8A" }}>
        💌
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-fredoka font-bold text-[11px] uppercase text-page-navy" style={{ letterSpacing: 1.5 }}>
          {note.coachName} {note.isToday ? "bugün sana yazdı" : `son notu — ${relativeDay(note.createdAt)}`}
        </p>
        {note.type === "text" ? (
          <p className="font-nunito font-bold text-sm text-[#0f172a] mt-1">{note.text}</p>
        ) : (
          <div className="flex items-center gap-2 mt-1.5">
            <FaVolumeUp className="text-page-navy flex-shrink-0" size={14} />
            <audio controls src={note.audioUrl} className="h-9" style={{ maxWidth: 320 }} />
          </div>
        )}
      </div>
    </div>
  );
}
