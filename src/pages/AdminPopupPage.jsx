import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Link } from "react-router-dom";

export default function AdminPopupPage() {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [description, setDescription] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/settings/popup")
      .then((res) => {
        setEnabled(res.data.enabled || false);
        setTitle(res.data.title || "🎉 İlk Siparişe Özel Fırsat!");
        setCouponCode(res.data.couponCode || "");
        setDiscountText(res.data.discountText || "");
        setDescription(res.data.description || "");
        setDelaySeconds(res.data.delaySeconds ?? 2);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await axios.put("/api/admin/settings/popup", {
        enabled,
        title,
        couponCode,
        discountText,
        description,
        delaySeconds: Number(delaySeconds),
      });
      setMessage({ text: "✅ Popup ayarları başarıyla kaydedildi.", type: "success" });
    } catch {
      setMessage({ text: "❌ Ayarlar kaydedilemedi.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="text-[#64748b] text-sm">Yükleniyor...</div>
      </div>
    );
  }

  const inputCls =
    "w-full border border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#100481] focus:ring-2 focus:ring-[#100481]/10 transition-all bg-white";

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-10 px-4">
      <div className="max-w-[640px] mx-auto">
        {/* Başlık */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="text-sm text-[#2563eb] hover:underline font-medium">
            ← Admin Paneli
          </Link>
          <span className="text-[#cbd5e1]">/</span>
          <h1 className="text-2xl font-black text-[#0f172a]">🎁 Popup Kupon Yönetimi</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#f1f5f9] p-8">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Aktif/Pasif toggle */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
              <div>
                <p className="font-bold text-[#0f172a]">Popup'ı Göster</p>
                <p className="text-sm text-[#64748b] mt-0.5">
                  Açık olduğunda ziyaretçilere kupon popup'ı gösterilir
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnabled((v) => !v)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  enabled ? "bg-[#10b981]" : "bg-[#cbd5e1]"
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
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                Popup Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="örn. 🎉 İlk Siparişe Özel Fırsat!"
                className={inputCls}
              />
            </div>

            {/* Kupon kodu */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                Kupon Kodu
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="örn. SOZDERECE200"
                className={inputCls + " font-mono tracking-widest"}
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                Kullanıcı bu kodu kopyalayıp ödeme sayfasında kullanır
              </p>
            </div>

            {/* İndirim metni */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                İndirim Miktarı / Metni
              </label>
              <input
                type="text"
                value={discountText}
                onChange={(e) => setDiscountText(e.target.value)}
                placeholder="örn. 200₺  veya  %20"
                className={inputCls}
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                Açıklama Metni
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="örn. kodunu kullanarak indirimden hemen yararlan!"
                className={inputCls}
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                Popup'ta kupon kodunun altında gösterilecek kısa metin
              </p>
            </div>

            {/* Gecikme */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                Görünme Gecikmesi (saniye)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(e.target.value)}
                className={inputCls}
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                Sayfa açıldıktan kaç saniye sonra popup çıksın
              </p>
            </div>

            {/* Önizleme */}
            {couponCode && (
              <div className="border border-[#e5e7eb] rounded-2xl overflow-hidden">
                <p className="text-xs font-bold text-[#64748b] px-4 pt-3 pb-2 bg-[#f8fafc] border-b border-[#f1f5f9] uppercase tracking-wide">
                  Önizleme
                </p>
                <div className="p-4 flex items-center justify-center bg-black/5">
                  <PopupPreview
                    title={title}
                    couponCode={couponCode}
                    discountText={discountText}
                    description={description}
                  />
                </div>
              </div>
            )}

            {/* Mesaj */}
            {message.text && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  message.type === "success"
                    ? "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]"
                    : "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#100481] text-white font-bold py-3 rounded-xl hover:bg-[#1d4ed8] transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PopupPreview({ title, couponCode, discountText, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden">
      {/* Üst renkli şerit */}
      <div className="bg-gradient-to-r from-[#100481] to-[#7c3aed] px-5 py-4 text-white text-center">
        <p className="text-base font-black">{title || "🎉 İlk Siparişe Özel Fırsat!"}</p>
      </div>
      <div className="px-5 py-5 text-center space-y-3">
        {discountText && (
          <div className="inline-block bg-[#fef9c3] border border-[#fde047] rounded-xl px-4 py-2">
            <span className="text-2xl font-black text-[#713f12]">{discountText}</span>
            <span className="text-xs text-[#92400e] ml-1">indirim</span>
          </div>
        )}
        <div className="bg-[#f1f5f9] rounded-xl px-4 py-3 border border-[#e2e8f0] flex items-center justify-between gap-2">
          <span className="font-mono font-black text-[#100481] text-sm tracking-widest">{couponCode}</span>
          <span className="text-xs text-[#64748b] bg-white border border-[#e5e7eb] px-2 py-1 rounded-lg">Kopyala</span>
        </div>
        {description && (
          <p className="text-xs text-[#64748b]">{description}</p>
        )}
      </div>
    </div>
  );
}
