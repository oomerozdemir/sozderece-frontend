import { useState } from "react";
import axios from "../../utils/axios";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Öğrenci transferi — K7: backend zaten hem mevcut hem hedef koçun bu Ana
// Koç'un ekibine bağlı olduğunu doğruluyor (transferStudentWithinTeam).
// Bu modal yalnızca "coaches" prop'uyla (zaten kendi ekibi) sınırlı bir
// dropdown gösteriyor — ekstra bir güvenlik katmanı değil, sadece UX.
export default function AssignmentModal({ student, coaches, onClose, onTransferred }) {
  const [targetCoachId, setTargetCoachId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!targetCoachId) return setError("Bir koç seçmelisin.");
    setSaving(true);
    setError("");
    try {
      await axios.patch(
        `/api/head-coach/students/${student.id}/coach`,
        { coachId: targetCoachId },
        { headers: authHeaders() }
      );
      onTransferred?.(student.id, parseInt(targetCoachId));
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Transfer yapılamadı.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-page-dark/50 flex items-center justify-center z-[999] p-4" onClick={onClose}>
      <div className="bg-white p-6 rounded-[24px] w-[420px] max-w-full shadow-[0_20px_50px_rgba(13,10,46,0.25)]" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-fredoka font-bold text-page-navy text-lg mb-1">Koçu Değiştir</h3>
        <p className="font-nunito text-sm text-[#64748b] mb-4">{student.name}</p>

        <label className="text-xs font-bold text-[#475569] block mb-1.5">Yeni Koç</label>
        <select
          className="w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-brand transition-colors font-nunito mb-3"
          value={targetCoachId}
          onChange={(e) => setTargetCoachId(e.target.value)}
        >
          <option value="">Seçiniz</option>
          {coaches.filter((c) => c.id !== student.assignedCoachId).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {error && <p className="text-xs font-bold text-[#dc2626] mb-2">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm font-bold text-[#64748b] bg-[#f1f5f9]">İptal</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "var(--color-brand)" }}
          >
            {saving ? "Kaydediliyor…" : "Atamayı Güncelle"}
          </button>
        </div>
      </div>
    </div>
  );
}
