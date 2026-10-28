import { useEffect, useRef, useState } from "react";
import { FaClock, FaCheck, FaRegCircle, FaFrown, FaPlay, FaStop } from "react-icons/fa";
import { playTaskDoneSound } from "../../../../utils/sound";
import { fmtMinutes } from "./programHelpers";

// HaftalikProgram.jsx (Programım) ve GenelBakis.jsx (Genel Bakış) arasında
// paylaşılan "Bugünkü Rotam" birimi — Başla → çalış → Bitir, tamamlanınca
// hafif bir "nasıl geçti?" istemi, yapılamadıysa suçlamadan sebep sorma.
// Her iki ekran da aynı useTodayTasks() hook'unun döndürdüğü state/handler'ları
// kullanır, davranış ikisinde de birebir aynı kalır.

export const FEELING_META = {
  kolay: { emoji: "😌", label: "Kolay" },
  normal: { emoji: "🙂", label: "Normal" },
  zor: { emoji: "😓", label: "Zor" },
};

export const NOT_COMPLETED_REASONS = [
  "Vaktim yetmedi",
  "Konu zor geldi",
  "Okul/kurstan dolayı yetişmedi",
  "Motivasyonum düşüktü",
  "Diğer",
];

export const fmtClock = (totalSeconds) => {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

// Görev tamamlandığı ANI fiziksel bir tatmine dönüştürüyor: sert bir
// neo-brutalist çerçeve+gölge anlık parlayıp sarsılıyor (CSS shake), metnin
// üstü kalın bir fosforlu çizgiyle "çiziliyor" ve kısa bir "klik" sesi çalıyor.
function useCelebration(status) {
  const prevRef = useRef(status);
  const [celebrate, setCelebrate] = useState(false);
  const [strikeOn, setStrikeOn] = useState(status === "done");

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== "done" && status === "done") {
      playTaskDoneSound();
      setCelebrate(true);
      setStrikeOn(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setStrikeOn(true)));
      const t = setTimeout(() => setCelebrate(false), 550);
      prevRef.current = status;
      return () => clearTimeout(t);
    }
    if (status !== "done") setStrikeOn(false);
    prevRef.current = status;
  }, [status]);

  return { celebrate, strikeOn };
}

// Görev tamamlanınca / "Bugün Yapamadım" denince açılan hafif inline geri
// bildirim istemi — devasa bir form değil, tek satırlık emoji seçimi +
// opsiyonel not. "Atla" ile tamamen geçilebilir.
function FeelingPrompt({ onSubmit, onSkip }) {
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  return (
    <div className="mt-3 pt-3 border-t border-black/5">
      <p className="font-nunito font-bold text-xs text-[#334155] mb-2">Nasıl geçti?</p>
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(FEELING_META).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSubmit(key, note)}
            className="flex items-center gap-1.5 font-nunito font-bold text-xs px-3 py-2 rounded-full bg-white border border-[#e2e8f0] hover:border-page-navy/40 transition-colors"
          >
            <span className="text-base leading-none">{meta.emoji}</span> {meta.label}
          </button>
        ))}
        <button type="button" onClick={onSkip} className="font-nunito text-[11px] text-[#94a3b8] underline ml-1">
          Atla
        </button>
      </div>
      {!noteOpen ? (
        <button type="button" onClick={() => setNoteOpen(true)} className="font-nunito font-bold text-[11px] text-page-navy underline mt-2.5">
          Koçuma not bırak
        </button>
      ) : (
        <textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: Fonksiyonlarda bileşke kısmında zorlandım."
          maxLength={500}
          rows={2}
          className="w-full mt-2.5 px-3 py-2 rounded-xl border border-[#e2e8f0] outline-none text-xs font-nunito bg-white focus:border-page-navy resize-none"
        />
      )}
    </div>
  );
}

// "Bugün Yapamadım" akışı — öğrenciyi suçlu hissettirmeden nedeni öğrenir,
// bu bile koçluk verisine dönüşür.
function ReasonPrompt({ onSubmit, onCancel }) {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");

  if (reason) {
    return (
      <div className="mt-3 pt-3 border-t border-black/5">
        {reason === "Diğer" && (
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kısaca anlat..."
            maxLength={500}
            rows={2}
            className="w-full mb-2.5 px-3 py-2 rounded-xl border border-[#e2e8f0] outline-none text-xs font-nunito bg-white focus:border-page-navy resize-none"
          />
        )}
        <button
          type="button"
          onClick={() => onSubmit(reason, note)}
          className="font-nunito font-bold text-xs px-4 py-2 rounded-full text-white"
          style={{ background: "var(--color-brand)" }}
        >
          Gönder
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-black/5">
      <p className="font-nunito font-bold text-xs text-[#334155] mb-2">Neden?</p>
      <div className="flex flex-col gap-1.5 items-start">
        {NOT_COMPLETED_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className="font-nunito font-bold text-xs px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] hover:border-page-navy/40 transition-colors"
          >
            {r}
          </button>
        ))}
      </div>
      <button type="button" onClick={onCancel} className="font-nunito text-[11px] text-[#94a3b8] underline mt-2">
        Vazgeç
      </button>
    </div>
  );
}

export default function TodayTaskCard({
  item, isActive, elapsedSeconds, disabledStart,
  onStart, onCancelActive, onFinishActive, onDirectComplete,
  feelingOpen, onSubmitFeeling, onSkipFeeling,
  reasonOpen, onOpenReason, onSubmitReason, onCancelReason,
}) {
  const { celebrate, strikeOn } = useCelebration(item.status);
  const feelingMeta = item.feeling ? FEELING_META[item.feeling] : null;

  return (
    <div
      className={`rounded-2xl border transition-colors ${celebrate ? "sd-task-pop" : ""}`}
      style={{
        background: item.status === "done" ? "#f0fdf4" : item.status === "stuck" ? "#fef2f2" : "#fff",
        borderColor: celebrate ? "#0f172a" : item.status === "done" ? "#bbf7d0" : item.status === "stuck" ? "#fecaca" : "#f1f5f9",
        borderWidth: celebrate ? 3 : 1,
        boxShadow: celebrate ? "4px 4px 0px #00e676" : "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
            style={{ width: 22, height: 22, color: item.status === "done" ? "#059669" : item.status === "stuck" ? "#dc2626" : "#cbd5e1" }}
          >
            {item.status === "done" ? <FaCheck size={11} /> : item.status === "stuck" ? <FaFrown size={11} /> : <FaRegCircle size={11} />}
          </span>
          <div className="min-w-0 flex-1">
            <span className="relative inline-block">
              <span className="block font-fredoka font-bold text-page-navy text-sm uppercase" style={{ letterSpacing: 0.5 }}>
                {item.subject}
              </span>
              {item.status === "done" && (
                <span
                  className="absolute left-0 top-1/2 h-[3px] rounded-full pointer-events-none"
                  style={{ background: "#00c853", width: strikeOn ? "100%" : "0%", transition: "width 0.3s ease" }}
                />
              )}
            </span>
            {item.topic && <p className="font-nunito text-xs text-[#64748b] mt-0.5">{item.topic}</p>}

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {item.status === "done" ? (
                <span className="flex items-center gap-1 font-nunito font-bold text-[11px] text-[#059669]">
                  <FaClock size={9} /> {fmtMinutes(item.actualMinutes || item.durationMin)}
                </span>
              ) : item.durationMin ? (
                <span className="flex items-center gap-1 font-nunito text-[11px] text-[#94a3b8]">
                  <FaClock size={9} /> ~{item.durationMin} dk
                </span>
              ) : null}
              {feelingMeta && (
                <span className="font-nunito font-bold text-[11px]" style={{ color: "#059669" }}>
                  {feelingMeta.emoji} {feelingMeta.label}
                </span>
              )}
              {item.status === "stuck" && item.notCompletedReason && (
                <span className="font-nunito font-bold text-[11px] text-[#dc2626]">{item.notCompletedReason}</span>
              )}
            </div>
            {item.note && (
              <p className="font-nunito text-[11px] text-[#94a3b8] italic mt-1.5">"{item.note}"</p>
            )}
          </div>

          {/* Sağdaki aksiyon alanı — sadece pending & prompt kapalıyken */}
          {item.status === "pending" && !feelingOpen && !reasonOpen && (
            <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
              {isActive ? (
                <>
                  <span className="font-fredoka font-bold text-sm text-page-navy tabular-nums">{fmtClock(elapsedSeconds)}</span>
                  <button
                    type="button"
                    onClick={() => onFinishActive(item)}
                    className="flex items-center gap-1.5 font-nunito font-bold text-xs px-3.5 py-2 rounded-full text-white"
                    style={{ background: "var(--color-brand)" }}
                  >
                    <FaStop size={9} /> Bitir
                  </button>
                  <button type="button" onClick={onCancelActive} className="font-nunito text-[10px] text-[#94a3b8] underline">
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={disabledStart}
                    onClick={() => onStart(item)}
                    className="flex items-center gap-1.5 font-nunito font-bold text-xs px-3.5 py-2 rounded-full text-white disabled:opacity-30"
                    style={{ background: "var(--color-brand)" }}
                  >
                    <FaPlay size={9} /> Başla
                  </button>
                  <button type="button" onClick={() => onDirectComplete(item)} className="font-nunito font-bold text-[11px] text-[#059669] underline">
                    Tamamla
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {feelingOpen && <FeelingPrompt onSubmit={(f, n) => onSubmitFeeling(item, f, n)} onSkip={() => onSkipFeeling(item)} />}
        {reasonOpen && <ReasonPrompt onSubmit={(r, n) => onSubmitReason(item, r, n)} onCancel={onCancelReason} />}

        {item.status === "pending" && !isActive && !feelingOpen && !reasonOpen && (
          <button type="button" onClick={() => onOpenReason(item)} className="font-nunito text-[11px] text-[#cbd5e1] hover:text-[#94a3b8] underline mt-2.5">
            Bugün yapamadım
          </button>
        )}
      </div>
    </div>
  );
}
