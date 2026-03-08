import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Link } from "react-router-dom";

export default function AdminCountdownPage() {
  const [enabled, setEnabled] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/settings/countdown")
      .then((res) => {
        setEnabled(res.data.enabled || false);
        // targetDate gelirse datetime-local formatına çevir
        if (res.data.targetDate) {
          const d = new Date(res.data.targetDate);
          // "YYYY-MM-DDTHH:MM" formatı
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setTargetDate(local);
        }
        setTitle(res.data.title || "");
        setSubtitle(res.data.subtitle || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await axios.put("/api/admin/settings/countdown", {
        enabled,
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        title,
        subtitle,
      });
      setMessage({ text: "✅ Ayarlar başarıyla kaydedildi.", type: "success" });
    } catch (err) {
      setMessage({ text: "❌ Ayarlar kaydedilemedi.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Üst başlık */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Admin Paneli
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-800">Zam Geri Sayımı</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Aktif/Pasif toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-700">Geri Sayımı Göster</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Açık olduğunda üst bar ve paket sayfasında görünür
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnabled((v) => !v)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  enabled ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Başlık
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="örn. Fiyatlar Yakında Artıyor!"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Alt başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alt Metin <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="örn. Bu fiyatlarla son şansın! Hemen paketini al."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Hedef tarih */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Zam Tarihi ve Saati
              </label>
              <input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Bu tarih/saate kadar geri sayım gösterilir. Süre dolunca otomatik gizlenir.
              </p>
            </div>

            {/* Ön izleme bilgisi */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>Nasıl görünür?</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside text-yellow-700">
                <li>Ana sayfa üst bar'ında kırmızı ince şerit olarak</li>
                <li>Paket sayfasında büyük kırmızı gradient banner olarak</li>
              </ul>
            </div>

            {/* Mesaj */}
            {message.text && (
              <div
                className={`rounded-lg px-4 py-3 text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Kaydet butonu */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0f2a4a] text-white font-bold py-3 rounded-xl hover:bg-[#1a3d6b] transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
