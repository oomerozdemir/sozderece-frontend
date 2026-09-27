import { FaArrowLeft } from "react-icons/fa";
import { EXAM_TYPE_LABELS, comparisonLabel } from "./examConfig";
import { fmtDate, fmtDurationMinutes, formatNet, formatMetric } from "./examHelpers";

const FIELD_LABELS = {
  bilgi_eksikligi: "Bilgi eksikliği", sure_yetmedi: "Süre yetişmedi", dikkat_hatasi: "Dikkat hatası",
  islem_hatasi: "İşlem hatası", soruyu_yanlis_okudum: "Soruyu yanlış okudum",
  iki_secenek_arasinda_kaldim: "İki seçenek arasında kaldım", zor_soruda_fazla_zaman: "Zor soruda fazla zaman harcadım",
  stres_odak: "Stres / odak problemi", diger: "Diğer",
  sure_yonetimi: "Süre yönetimi", dikkat: "Dikkat", islem_hatalari: "İşlem hataları",
  turlama: "Turlama tekniği", zor_soruda_takilmama: "Zor soruda takılmama", odak: "Odak",
};

// Tek deneme detay ekranı — geçmiş listesinden gelinen exam objesi doğrudan
// kullanılır (liste zaten tüm alanları döndüğü için ayrıca bir GET
// /:id çağrısına gerek yok).
export default function ExamDetail({ exam, onBack }) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 font-nunito font-bold text-xs text-[#64748b] hover:text-page-navy">
        <FaArrowLeft size={11} /> Geçmişe Dön
      </button>

      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-5">
        <div>
          <p className="font-fredoka font-bold text-page-navy text-lg">{exam.examName}</p>
          <p className="font-nunito text-xs text-[#94a3b8] mt-0.5">
            {comparisonLabel(exam) || EXAM_TYPE_LABELS[exam.examType]} · {fmtDate(exam.examDate)} · {exam.entryMode === "LIVE" ? "Canlı deneme" : "Manuel giriş"}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
            <p className="font-fredoka font-bold text-page-navy text-lg">{formatNet(exam.totalNet)}</p>
            <p className="font-nunito text-[10px] text-[#94a3b8]">Toplam Net</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
            <p className="font-fredoka font-bold text-page-navy text-lg">{fmtDurationMinutes(exam.durationSeconds)}</p>
            <p className="font-nunito text-[10px] text-[#94a3b8]">Süre</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
            <p className="font-fredoka font-bold text-page-navy text-lg">{formatMetric(exam.targetNet)}</p>
            <p className="font-nunito text-[10px] text-[#94a3b8]">Hedef Net</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
            <p className="font-fredoka font-bold text-page-navy text-lg">{exam.targetDurationMinutes != null ? `${exam.targetDurationMinutes} dk` : "—"}</p>
            <p className="font-nunito text-[10px] text-[#94a3b8]">Hedef Süre</p>
          </div>
        </div>

        {Array.isArray(exam.subjectNets) && exam.subjectNets.length > 0 && (
          <div>
            <p className="font-nunito font-bold text-xs text-[#475569] mb-2">Ders Sonuçları</p>
            <div className="flex flex-wrap gap-2">
              {exam.subjectNets.map((s, i) => (
                <span key={i} className="font-nunito text-xs font-semibold text-[#334155] bg-[#f8fafc] px-2.5 py-1 rounded-full">
                  {s.subject}: <strong className="text-page-navy">{formatMetric(s.net)}</strong>
                  {s.correct != null && ` (${s.correct}D ${s.wrong}Y ${s.blank ?? "—"}B)`}
                </span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(exam.focusAreas) && exam.focusAreas.length > 0 && (
          <div>
            <p className="font-nunito font-bold text-xs text-[#475569] mb-2">Odak Noktaları</p>
            <div className="flex flex-wrap gap-1.5">
              {exam.focusAreas.map((f) => (
                <span key={f} className="font-nunito text-xs font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand">{FIELD_LABELS[f] || f}</span>
              ))}
            </div>
          </div>
        )}

        {(exam.difficultyReasons?.length > 0 || exam.didWell || exam.nextImprovement || exam.studentNote) && (
          <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
            <p className="font-nunito font-bold text-xs text-[#475569]">Kendi Analizim</p>
            {exam.difficultyReasons?.length > 0 && (
              <div>
                <p className="text-[11px] text-[#94a3b8] mb-1">Beni en çok zorlayan:</p>
                <div className="flex flex-wrap gap-1.5">
                  {exam.difficultyReasons.map((d) => (
                    <span key={d} className="font-nunito text-xs font-bold px-2.5 py-1 rounded-full bg-[#fef2f2] text-[#dc2626]">{FIELD_LABELS[d] || d}</span>
                  ))}
                </div>
              </div>
            )}
            {exam.didWell && <p className="font-nunito text-sm text-[#334155]"><strong className="text-page-navy">İyi yaptığım:</strong> {exam.didWell}</p>}
            {exam.nextImprovement && <p className="font-nunito text-sm text-[#334155]"><strong className="text-page-navy">Bir sonraki denemede:</strong> {exam.nextImprovement}</p>}
            {exam.studentNote && <p className="font-nunito text-sm text-[#334155]"><strong className="text-page-navy">Not:</strong> {exam.studentNote}</p>}
          </div>
        )}

        {exam.notes && (
          <div className="pt-4 border-t border-[#f1f5f9]">
            <p className="font-nunito font-bold text-xs text-[#475569] mb-1">Koç Notu</p>
            <p className="font-nunito text-sm text-[#334155]">{exam.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
