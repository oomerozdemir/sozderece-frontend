import { useState } from "react";
import axios from "../../../../utils/axios";
import Button from "../../../../components/ui/Button";
import SubjectNetRows from "./SubjectNetRows";
import { getDefaultSubjects } from "./examConfig";

// LIVE akışında "Denemeyi Bitir"den sonraki adım: ders bazlı sonuç girişi.
// PATCH .../results — sunucu netleri yeniden hesaplar, client'ın net
// değerine güvenilmez (SubjectNetRows'taki net yalnızca önizleme).
export default function ExamResultForm({ exam, student, onSubmitted }) {
  const [subjectNets, setSubjectNets] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const initialSubjects = exam.branch
    ? [{ subject: exam.branch, questionCount: exam.totalQuestions }]
    : getDefaultSubjects(exam.examType, student?.track);

  const handleSubmit = async () => {
    const rows = subjectNets.filter((r) => r.subject.trim());
    if (rows.length === 0) {
      setError("En az bir ders sonucu girmelisin.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/v1/ogrenci/me/exam-results/${exam.id}/results`,
        { subjectNets: rows.map((r) => ({ subject: r.subject, questionCount: r.questionCount || null, correct: Number(r.correct) || 0, wrong: Number(r.wrong) || 0, blank: Number(r.blank) || 0 })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSubmitted(res.data.exam);
    } catch (err) {
      setError(err?.response?.data?.message || "Sonuçlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-6 space-y-4">
      <div>
        <p className="font-fredoka font-bold text-page-navy text-base">Sonuçlarını Gir</p>
        <p className="font-nunito text-xs text-[#64748b]">{exam.examName} — ders bazlı doğru/yanlış/boş sayılarını gir.</p>
      </div>
      <SubjectNetRows examType={exam.examType} track={student?.track} initialSubjects={initialSubjects} onChange={setSubjectNets} />
      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}
      <Button variant="primary" fullWidth onClick={handleSubmit} loading={saving}>Sonuçları Kaydet</Button>
    </div>
  );
}
