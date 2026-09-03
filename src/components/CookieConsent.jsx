import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCookieBite, FaTimes } from "react-icons/fa";

const STORAGE_KEY = "cookieConsent";

// Basit, senkron bir okuma: consent olayını sayfanın en başında (analytics
// script'leri index.html'de yüklenmeden önce) sormak istersek diye dışa
// açık tutuluyor — şu an sadece bu bileşen içinde kullanılıyor.
export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const DEFAULT_PREFS = { necessary: true, analytics: true, marketing: true };

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  const save = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...value, decidedAt: new Date().toISOString() }));
    } catch {}
    setVisible(false);
    setShowSettings(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9990] flex justify-center px-3 pb-3 max-[640px]:px-2 max-[640px]:pb-2"
      role="dialog"
      aria-label="Çerez tercihleri"
      aria-live="polite"
    >
      <div
        className="w-full max-w-[880px] bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_12px_40px_rgba(13,10,46,0.18)] overflow-hidden"
      >
        {!showSettings ? (
          <div className="flex items-center gap-4 p-5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3 max-[640px]:p-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EEFBC7" }}>
              <FaCookieBite size={18} color="#3F6B0A" />
            </div>
            <p className="font-nunito text-sm text-[#374151] leading-relaxed flex-1 m-0">
              Sitemizi daha iyi hale getirmek ve deneyimini kişiselleştirmek için çerezler kullanıyoruz.{" "}
              <Link to="/gizlilik-politikasi-kvkk" className="font-semibold text-page-navy underline">
                Gizlilik ve KVKK politikamızı
              </Link>{" "}
              inceleyebilirsin.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0 max-[640px]:w-full max-[640px]:flex-wrap">
              <button
                onClick={() => setShowSettings(true)}
                className="font-fredoka font-semibold text-sm px-4 py-2.5 rounded-full border border-[#d1d5db] text-[#374151] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer"
              >
                Ayarlar
              </button>
              <button
                onClick={() => save({ necessary: true, analytics: false, marketing: false })}
                className="font-fredoka font-semibold text-sm px-4 py-2.5 rounded-full border border-[#d1d5db] text-[#374151] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer"
              >
                Reddet
              </button>
              <button
                onClick={() => save(DEFAULT_PREFS)}
                className="font-fredoka font-bold text-sm px-5 py-2.5 rounded-full text-white transition-transform hover:scale-105 cursor-pointer"
                style={{ background: "#FF6B35" }}
              >
                Kabul Et
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 max-[640px]:p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-fredoka font-bold text-base text-[#150E33] m-0">Çerez Ayarları</h2>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Ayarları kapat"
                className="w-7 h-7 rounded-full flex items-center justify-center border-none bg-[#f3f4f6] text-[#6b7280] cursor-pointer"
              >
                <FaTimes size={11} />
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <PrefRow
                title="Zorunlu Çerezler"
                description="Sitenin çalışması için gereklidir (oturum, sepet, güvenlik). Kapatılamaz."
                checked
                disabled
              />
              <PrefRow
                title="Analitik Çerezler"
                description="Ziyaretçi davranışını anonim olarak ölçüp deneyimi iyileştirmemizi sağlar."
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <PrefRow
                title="Pazarlama Çerezleri"
                description="Reklamların sana ne kadar uygun ve etkili gösterildiğini ölçmemizi sağlar."
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="flex items-center justify-end gap-2 max-[640px]:flex-wrap">
              <button
                onClick={() => save({ necessary: true, analytics: false, marketing: false })}
                className="font-fredoka font-semibold text-sm px-4 py-2.5 rounded-full border border-[#d1d5db] text-[#374151] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer"
              >
                Tümünü Reddet
              </button>
              <button
                onClick={() => save(prefs)}
                className="font-fredoka font-bold text-sm px-5 py-2.5 rounded-full text-white transition-transform hover:scale-105 cursor-pointer"
                style={{ background: "#FF6B35" }}
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PrefRow({ title, description, checked, disabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#f9fafb] border border-[#eef0f5]">
      <div>
        <div className="font-fredoka font-bold text-sm text-[#150E33]">{title}</div>
        <div className="font-nunito text-[13px] text-[#6b7280] mt-0.5 leading-snug">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className="flex-shrink-0 rounded-full border-none transition-colors"
        style={{
          width: 40, height: 24, padding: 3,
          background: checked ? "#D8FF4F" : "#e5e7eb",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <span
          style={{
            display: "block", width: 18, height: 18, borderRadius: "50%",
            background: checked ? "#150E33" : "#ffffff",
            transform: checked ? "translateX(16px)" : "translateX(0)",
            transition: "transform 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </button>
    </div>
  );
}
