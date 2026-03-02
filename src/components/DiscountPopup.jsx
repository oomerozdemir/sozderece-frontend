import { useEffect, useState } from "react";

export default function DiscountPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem("popupShown");

    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("popupShown", "true"); // gösterildi olarak işaretle
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-[90%] max-w-[400px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)] relative animate-fade-in">
        <button
          className="absolute top-2.5 right-4 bg-transparent border-none text-2xl cursor-pointer text-gray-500"
          onClick={handleClose}
        >
          ×
        </button>
        <h3 className="mb-3 text-2xl text-gray-900">🎉 İlk Siparişe Özel Fırsat!</h3>
        <p className="text-lg text-gray-700">
          <strong>Sozderece200</strong> kodunu kullanarak <strong>200₺'lik indirimden</strong> hemen yararlan!
        </p>
      </div>
    </div>
  );
}
