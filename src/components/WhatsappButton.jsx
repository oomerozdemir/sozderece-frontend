import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "905312546701"; // Numaranı buraya yaz

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {isOpen && (
        <div className="bg-white rounded-xl p-4 mb-2.5 w-60 shadow-lg text-left animate-fade-in-up">
          <p className="m-0 mb-2 text-gray-800 text-sm">Merhaba! Size nasıl yardımcı olabiliriz?</p>
          <a
            href={`https://wa.me/${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25d366] text-white py-2 px-4 inline-block rounded-md text-sm no-underline font-medium hover:bg-[#1ebc59] transition-colors"
          >
            WhatsApp'tan Yaz
          </a>
        </div>
      )}

      <button
        className="bg-[#25d366] text-white rounded-full w-14 h-14 text-3xl border-none flex items-center justify-center shadow-lg cursor-pointer outline-none animate-wa-pulse"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="WhatsApp ile iletişime geç"
      >
        <FaWhatsapp />
      </button>
    </div>
  );
};

export default WhatsAppButton;
