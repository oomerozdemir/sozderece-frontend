import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FaExclamationTriangle, FaTimes, FaWhatsapp } from "react-icons/fa";
import { getCookieConsent } from "../../components/CookieConsent";

const COACH_WHATSAPP = "905312546701";

// Panelin her sekmesinde sabit görünen acil durum butonu. Öğrenci kriz
// anında (kötü deneme, motivasyon çöküşü vb.) tek dokunuşla hem panelde
// (koç/admin anında görür) hem WhatsApp'ta koçuna ulaşabiliyor.
export default function SosButton({ studentName }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // Çerez banner'ı (mobilde tam genişlik, alt-sabit) karar verilene kadar bu
  // butonu kaplıyordu — kararsız kaldığı sürece butonu biraz yukarı kaldır.
  const [cookieBannerUp, setCookieBannerUp] = useState(() => !getCookieConsent());

  useEffect(() => {
    if (!cookieBannerUp) return;
    const t = setInterval(() => {
      if (getCookieConsent()) setCookieBannerUp(false);
    }, 1000);
    return () => clearInterval(t);
  }, [cookieBannerUp]);

  const reset = () => {
    setOpen(false);
    setMessage("");
    setSent(false);
  };

  const handleConfirm = async () => {
    setSending(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "/api/v1/ogrenci/me/sos",
        { message: message.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Panele yazamasa bile WhatsApp'a gitmesini engelleme — öğrenci yine de ulaşsın.
    } finally {
      setSending(false);
      setSent(true);
    }

    const waText = message.trim()
      ? `🆘 ACİL: ${studentName || "Bir öğrencin"} sana ulaşmaya çalışıyor.\n\n"${message.trim()}"`
      : `🆘 ACİL: ${studentName || "Bir öğrencin"} sana ulaşmaya çalışıyor. Panelden SOS gönderdi.`;
    window.open(`https://wa.me/${COACH_WHATSAPP}?text=${encodeURIComponent(waText)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Acil durum bildirimi gönder"
        className={`fixed z-[900] right-6 flex items-center gap-2 font-fredoka font-bold text-sm px-5 py-3.5 rounded-full text-white transition-all hover:scale-105 ${
          cookieBannerUp ? "bottom-[260px] sm:bottom-6" : "bottom-6"
        }`}
        style={{
          background: "linear-gradient(135deg, #dc2626, #b91c1c)",
          boxShadow: "0 8px 24px rgba(220,38,38,0.45)",
        }}
      >
        <FaExclamationTriangle size={14} />
        SOS
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={reset}>
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-6" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-3">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-fredoka font-bold text-page-navy text-base mb-1.5">Koçuna ulaştık!</p>
                <p className="font-nunito text-xs text-[#64748b] mb-5">
                  Panelde ve WhatsApp'ta bildirim gönderildi. Koçun en kısa sürede sana dönecek.
                </p>
                <button onClick={reset} className="w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-black">
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-fredoka font-bold text-[#0f172a] text-base flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-500" size={15} /> Acil Durum Bildirimi
                  </h3>
                  <button onClick={reset} className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] flex-shrink-0">
                    <FaTimes size={13} />
                  </button>
                </div>
                <p className="font-nunito text-xs text-[#64748b] mb-4">
                  Bu, koçuna panelde anında görünen bir bildirim gönderir ve WhatsApp'ı önceden doldurulmuş bir mesajla açar — göndermek sana kalır.
                </p>
                <textarea
                  className="w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-page-navy transition-colors resize-none"
                  rows={3}
                  placeholder="Ne oldu? (opsiyonel) Örn: Denemem çok kötü geçti, motivasyonum çok düştü..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <button
                  onClick={handleConfirm}
                  disabled={sending}
                  className="w-full mt-4 py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                >
                  <FaWhatsapp size={15} /> {sending ? "Gönderiliyor…" : "Koçuma Ulaş"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
