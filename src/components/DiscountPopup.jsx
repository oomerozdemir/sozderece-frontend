import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function DiscountPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem("popupShown");
    if (alreadyShown) return;

    axios
      .get("/api/settings/popup")
      .then((res) => {
        const data = res.data;
        if (!data.enabled || !data.couponCode) return;
        setSettings(data);
        const delay = (data.delaySeconds ?? 2) * 1000;
        const timer = setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem("popupShown", "true");
        }, delay);
        return () => clearTimeout(timer);
      })
      .catch(() => {});
  }, []);

  const handleClose = () => setShowPopup(false);

  const handleCopy = () => {
    if (!settings?.couponCode) return;
    navigator.clipboard.writeText(settings.couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!showPopup || !settings) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[360px] rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.35)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all text-sm font-bold"
        >
          ✕
        </button>

        {/* Üst gradient başlık */}
        <div className="bg-gradient-to-br from-[#100481] via-[#2563eb] to-[#7c3aed] px-6 pt-8 pb-6 text-white text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h3 className="text-lg font-black leading-tight">
            {settings.title || "İlk Siparişe Özel Fırsat!"}
          </h3>
          {settings.discountText && (
            <div className="mt-3 inline-block bg-white/15 border border-white/30 rounded-2xl px-4 py-2">
              <span className="text-3xl font-black">{settings.discountText}</span>
              <span className="text-sm opacity-80 ml-1">indirim</span>
            </div>
          )}
        </div>

        {/* Alt beyaz kısım */}
        <div className="bg-white px-6 py-5 space-y-4">
          {/* Kupon kodu */}
          <div>
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2 text-center">
              Kupon Kodun
            </p>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between gap-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] border-2 border-dashed border-[#100481]/30 hover:border-[#100481]/60 rounded-2xl px-4 py-3 transition-all group"
            >
              <span className="font-mono font-black text-[#100481] text-base tracking-widest">
                {settings.couponCode}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex-shrink-0 ${
                  copied
                    ? "bg-[#10b981] text-white"
                    : "bg-[#100481] text-white group-hover:bg-[#1d4ed8]"
                }`}
              >
                {copied ? "✓ Kopyalandı" : "Kopyala"}
              </span>
            </button>
          </div>

          {/* Açıklama */}
          {settings.description && (
            <p className="text-sm text-[#64748b] text-center leading-relaxed">
              {settings.description}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-[#100481] to-[#2563eb] text-white font-bold rounded-2xl hover:opacity-90 transition-all text-sm shadow-[0_4px_16px_rgba(16,4,129,0.3)]"
          >
            Hemen Kullan 
          </button>
        </div>
      </div>
    </div>
  );
}
