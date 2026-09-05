import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaWhatsapp, FaRedo, FaHome } from "react-icons/fa";

const WA_LINK = "https://wa.me/905312546701?text=Merhaba%2C%20%C3%B6deme%20yaparken%20hata%20ald%C4%B1m%2C%20yard%C4%B1mc%C4%B1%20olur%20musunuz%3F";

const PaymentFailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#f8f9fa] p-5">
      <div className="bg-white p-8 max-[480px]:p-6 rounded-2xl shadow-[0_8px_30px_rgba(21,14,51,0.1)] text-center max-w-[520px] w-full">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#fef2f2" }}>
          <FaExclamationTriangle size={22} color="#dc2626" />
        </div>
        <h2 className="font-fredoka font-bold text-[#150E33] text-2xl mb-2">Ödeme Tamamlanamadı</h2>
        <p className="font-nunito text-[#64748b] text-[15px] leading-relaxed mb-1">
          Kartından herhangi bir tutar çekilmedi. Bu genelde geçici bir aksaklık ya da
          bankandan kaynaklanan bir onay sorunu oluyor — bilgilerini kontrol edip
          tekrar deneyebilirsin.
        </p>
        <p className="font-nunito text-[#94a3b8] text-sm mt-3">
          Tekrar denemek istemiyorsan ya da sorun devam ederse, doğrudan bize yaz —
          senin yerine kontrol edip yardımcı olalım.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 font-fredoka font-bold text-white text-[15px] py-3 px-5 rounded-full border-none cursor-pointer transition-transform hover:scale-[1.02]"
            style={{ background: "#FF6B35" }}
          >
            <FaRedo size={13} /> Tekrar Dene
          </button>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-fredoka font-bold text-white text-[15px] py-3 px-5 rounded-full no-underline transition-transform hover:scale-[1.02]"
            style={{ background: "#25D366" }}
          >
            <FaWhatsapp size={16} /> WhatsApp'tan Yardım Al
          </a>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 font-fredoka font-semibold text-[#374151] text-sm py-2.5 px-5 rounded-full border border-[#e5e7eb] bg-white cursor-pointer hover:bg-[#f9fafb] transition-colors"
          >
            <FaHome size={12} /> Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;
