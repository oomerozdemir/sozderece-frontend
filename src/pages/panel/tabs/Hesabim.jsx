import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import axios from "../../../utils/axios";

// Öğrenci "Hesabım" sekmesi — şu an için sadece isim değişikliği (bkz. Koç
// Paneli'ndeki "Hesabım" ile aynı istek). student.name güncellenince
// StudentPanel.jsx'in onStudentUpdate'i sidebar'daki "Merhaba, X" gibi
// yerleri de anında güncellesin diye local state yerine parent'a yazılıyor.
export default function Hesabim({ student, onStudentUpdate }) {
  const [name, setName] = useState(student?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  if (!student) {
    return <div className="bg-white rounded-[24px] border border-[#f1f5f9] p-8 text-center text-[#94a3b8] font-nunito text-sm">Yükleniyor…</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("İsim boş olamaz.");
      return;
    }
    setError("");
    setSavedMessage("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        "/api/v1/ogrenci/me",
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedName = res.data?.name ?? name.trim();
      setName(updatedName);
      onStudentUpdate?.({ name: updatedName });

      try {
        const stored = JSON.parse(localStorage.getItem("user") || "null");
        if (stored) localStorage.setItem("user", JSON.stringify({ ...stored, name: updatedName }));
        localStorage.setItem("userName", updatedName);
      } catch {
        /* localStorage kullanılamıyorsa sorun değil */
      }
      setSavedMessage("Değişiklikler kaydedildi.");
    } catch {
      setError("Değişiklikler kaydedilemedi, lütfen tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-7 max-w-[460px]">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
        style={{ background: "var(--color-brand-light)", color: "var(--color-brand)" }}
      >
        <FaUserCircle />
      </div>
      <h3 className="font-fredoka font-bold text-page-navy text-lg mb-5">Hesabım</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-nunito font-bold text-xs text-[#475569] mb-1.5">İsim</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-nunito focus:outline-none focus:border-page-navy"
          />
        </div>

        <div>
          <label className="block font-nunito font-bold text-xs text-[#475569] mb-1.5">E-posta</label>
          <input
            type="email"
            value={student.email || ""}
            disabled
            className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-nunito text-[#94a3b8] bg-[#f8fafc] cursor-not-allowed"
          />
        </div>

        {error && <p className="font-nunito text-sm text-[#dc2626]">{error}</p>}
        {savedMessage && <p className="font-nunito text-sm text-[#059669]">{savedMessage}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start px-6 py-3 rounded-full font-fredoka font-bold text-sm text-white bg-brand-navy disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
