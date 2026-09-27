import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";
import { EXAM_TYPE_LABELS } from "./examConfig";
import { fmtClock } from "./examHelpers";

// Canlı deneme sayacı. Doğruluk kaynağı SUNUCU: exam.startedAt her zaman
// backend'den gelir, bu component yalnızca Date.now()-startedAt'i her
// saniye yeniden hesaplar (HaftalikProgram.jsx'teki Pomodoro sayacıyla
// birebir aynı desen) — sayfa yenilense bile doğru devam eder, çünkü
// startedAt kaybolmuyor. v1'de PAUSE yok.
export default function ActiveExamTimer({ exam, onFinished }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTime, setShowTime] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(exam.startedAt).getTime()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [exam.startedAt]);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`/api/v1/ogrenci/me/exam-results/${exam.id}/finish`, {}, { headers: { Authorization: `Bearer ${token}` } });
      onFinished(res.data.exam);
    } catch {
      setFinishing(false);
      setConfirming(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-8 text-center">
      <p className="font-nunito font-bold text-sm text-page-navy">{exam.examName}</p>
      <p className="font-nunito text-xs text-[#94a3b8] mb-6">{EXAM_TYPE_LABELS[exam.examType] || exam.examType}</p>

      {showTime ? (
        <p className="font-fredoka font-bold text-page-navy tabular-nums mb-2" style={{ fontSize: "clamp(40px,10vw,64px)" }}>
          {fmtClock(elapsedSeconds)}
        </p>
      ) : (
        <p className="font-fredoka font-bold text-[#cbd5e1] mb-2" style={{ fontSize: "clamp(40px,10vw,64px)" }}>••:••</p>
      )}
      {exam.targetDurationMinutes && <p className="font-nunito text-xs text-[#64748b] mb-6">Hedef süre: {exam.targetDurationMinutes} dk</p>}

      <button
        onClick={() => setShowTime((v) => !v)}
        className="flex items-center gap-1.5 mx-auto font-nunito text-xs text-[#94a3b8] hover:text-[#64748b] mb-8"
      >
        {showTime ? <FaEyeSlash size={11} /> : <FaEye size={11} />} Süreyi {showTime ? "Gizle" : "Göster"}
      </button>

      {!confirming ? (
        <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirming(true)}>
          Denemeyi Bitir
        </Button>
      ) : (
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <p className="font-nunito font-bold text-sm text-page-navy mb-1">Denemeyi bitirmek istediğine emin misin?</p>
          <p className="font-nunito text-xs text-[#64748b] mb-4">Geçen süre: {fmtClock(elapsedSeconds)}</p>
          <div className="flex gap-2">
            <Button variant="ghost" fullWidth onClick={() => setConfirming(false)} disabled={finishing}>Vazgeç</Button>
            <Button variant="primary" fullWidth onClick={handleFinish} loading={finishing}>Evet, Bitir</Button>
          </div>
        </div>
      )}
    </div>
  );
}
