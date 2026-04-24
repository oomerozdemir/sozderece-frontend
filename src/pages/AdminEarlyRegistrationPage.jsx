import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Link } from "react-router-dom";

export default function AdminEarlyRegistrationPage() {
  const [enabled, setEnabled] = useState(false);
  const [badge, setBadge] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/settings/early-registration")
      .then((res) => {
        const d = res.data;
        setEnabled(d.enabled || false);
        setBadge(d.badge || "");
        setTitle(d.title || "");
        setSubtitle(d.subtitle || "");
        setDiscountText(d.discountText || "");
        setCtaText(d.ctaText || "");
        setNote(d.note || "");
        if (d.endDate) {
          const dt = new Date(d.endDate);
          const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setEndDate(local);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await axios.put("/api/admin/settings/early-registration", {
        enabled,
        badge,
        title,
        subtitle,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        discountText,
        ctaText,
        note,
      });
      setMessage({ text: "✅ Ayarlar başarıyla kaydedildi.", type: "success" });
    } catch {
      setMessage({ text: "❌ Ayarlar kaydedilemedi.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[640px] mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="text-sm text-blue-600 hover:underline">
            ← Admin Paneli
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-800">Erken Kayıt Kampanyası</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Aktif/Pasif */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-700">Kampanyayı Göster</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Açık olduğunda ana sayfada banner görünür
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

            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rozet Metni
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="örn. 🎉 Erken Kayıt Kampanyası"
                className={inputCls}
              />
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
                placeholder="örn. Erken Kayıt Fırsatını Kaçırma!"
                className={inputCls}
              />
            </div>

            {/* Alt başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alt Metin
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="örn. Sınav öncesi başla, daha az öde."
                className={inputCls}
              />
            </div>

            {/* İndirim metni */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                İndirim Metni
              </label>
              <input
                type="text"
                value={discountText}
                onChange={(e) => setDiscountText(e.target.value)}
                placeholder="örn. %20 İndirim"
                className={inputCls}
              />
            </div>

            {/* Bitiş tarihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kampanya Bitiş Tarihi{" "}
                <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">
                Bu tarih dolunca banner otomatik gizlenir.
              </p>
            </div>

            {/* CTA Butonu metni */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Buton Metni
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="örn. Hemen Kaydol →"
                className={inputCls}
              />
            </div>

            {/* Not */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Not / Açıklama{" "}
                <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="örn. ⚡ Sınırlı kontenjan"
                className={inputCls}
              />
            </div>

            {/* Önizleme bilgisi */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>Nasıl görünür?</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside text-yellow-700">
                <li>Ana sayfada Hizmet Kartları ile Paketler bölümü arasında sarı (lime) banner olarak</li>
                <li>Bitiş tarihi geçince otomatik gizlenir</li>
                <li>WA butonu tıklandığında WhatsApp'a yönlendirir</li>
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
