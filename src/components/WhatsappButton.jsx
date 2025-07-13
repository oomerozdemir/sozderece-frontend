import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import "../cssFiles/WhatsappButton.css";

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "905312546701"; // Numaranı buraya yaz

  return (
    <div className="wa-wrapper">
      {isOpen && (
        <div className="wa-chatbox">
          <p>Merhaba! Size nasıl yardımcı olabiliriz?</p>
          <a
            href={`https://wa.me/${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-chat-link"
          >
            WhatsApp'tan Yaz
          </a>
        </div>
      )}

      <button
        className="wa-float-button pulse"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="WhatsApp ile iletişime geç"
      >
        <FaWhatsapp />
      </button>
    </div>
  );
};

export default WhatsAppButton;
