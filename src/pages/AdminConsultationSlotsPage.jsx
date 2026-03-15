import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Link } from "react-router-dom";

const ALL_SLOTS = [
  // Sabah
  "09:00 - 09:20", "09:20 - 09:40", "09:40 - 10:00",
  "10:00 - 10:20", "10:20 - 10:40", "10:40 - 11:00",
  "11:00 - 11:20", "11:20 - 11:40", "11:40 - 12:00",
  // Öğle
  "12:00 - 12:20", "12:20 - 12:40", "12:40 - 13:00",
  "13:00 - 13:20", "13:20 - 13:40", "13:40 - 14:00",
  "14:00 - 14:20", "14:20 - 14:40", "14:40 - 15:00",
  // Öğleden Sonra
  "15:00 - 15:20", "15:20 - 15:40", "15:40 - 16:00",
  "16:00 - 16:20", "16:20 - 16:40", "16:40 - 17:00",
  "17:00 - 17:20", "17:20 - 17:40", "17:40 - 18:00",
  // Akşam
  "18:00 - 18:20", "18:20 - 18:40", "18:40 - 19:00",
  "19:00 - 19:20", "19:20 - 19:40", "19:40 - 20:00",
  "20:00 - 20:20", "20:20 - 20:40", "20:40 - 21:00",
];

const GROUPS = [
  { label: "Sabah", slots: ALL_SLOTS.slice(0, 9) },
  { label: "Öğle", slots: ALL_SLOTS.slice(9, 18) },
  { label: "Öğleden Sonra", slots: ALL_SLOTS.slice(18, 27) },
  { label: "Akşam", slots: ALL_SLOTS.slice(27) },
];

export default function AdminConsultationSlotsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [blockedSlots, setBlockedSlots] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // slot string veya "bulk"
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchSlots = async (date) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.get(`/api/admin/consultation-slots?date=${date}`);
      setBlockedSlots(new Set(res.data.blockedSlots || []));
    } catch {
      setMessage({ text: "Slotlar yüklenemedi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate]);

  const handleToggle = async (slot) => {
    const isBlocked = !blockedSlots.has(slot);
    setSaving(slot);
    setMessage({ text: "", type: "" });
    try {
      await axios.post("/api/admin/consultation-slots/toggle", {
        date: selectedDate,
        timeSlot: slot,
        isBlocked,
      });
      setBlockedSlots((prev) => {
        const next = new Set(prev);
        if (isBlocked) next.add(slot);
        else next.delete(slot);
        return next;
      });
    } catch {
      setMessage({ text: "İşlem başarısız.", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const handleBulk = async (isBlocked) => {
    setSaving("bulk");
    setMessage({ text: "", type: "" });
    try {
      await axios.post("/api/admin/consultation-slots/bulk", {
        date: selectedDate,
        slots: ALL_SLOTS,
        isBlocked,
      });
      setBlockedSlots(isBlocked ? new Set(ALL_SLOTS) : new Set());
      setMessage({
        text: isBlocked ? "Tüm slotlar dolu yapıldı." : "Tüm slotlar boş yapıldı.",
        type: "success",
      });
    } catch {
      setMessage({ text: "Toplu işlem başarısız.", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const blockedCount = blockedSlots.size;
  const totalCount = ALL_SLOTS.length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[800px] mx-auto">
        {/* Başlık */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="text-sm text-blue-600 hover:underline">
            ← Admin Paneli
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-800">Randevu Slotları</h1>
        </div>

        {/* Tarih seçici + özet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tarih Seçin
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulk(false)}
                disabled={saving === "bulk"}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-60 transition"
              >
                Tümünü Boş Yap
              </button>
              <button
                onClick={() => handleBulk(true)}
                disabled={saving === "bulk"}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-60 transition"
              >
                Tümünü Dolu Yap
              </button>
            </div>
          </div>

          {/* Özet */}
          <div className="mt-4 flex gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
              ✅ Boş: {totalCount - blockedCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-medium">
              🔴 Dolu: {blockedCount}
            </span>
          </div>
        </div>

        {/* Mesaj */}
        {message.text && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium mb-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Slot grupları */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            {GROUPS.map((group) => (
              <div key={group.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-700 mb-4">{group.label}</h2>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {group.slots.map((slot) => {
                    const isBlocked = blockedSlots.has(slot);
                    const isSaving = saving === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => handleToggle(slot)}
                        disabled={isSaving || saving === "bulk"}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition text-center disabled:opacity-60 ${
                          isBlocked
                            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                      >
                        {isSaving ? "..." : slot}
                        <span className="block text-[10px] mt-0.5 opacity-70">
                          {isBlocked ? "Dolu" : "Boş"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
