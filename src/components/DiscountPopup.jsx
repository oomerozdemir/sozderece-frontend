import { useEffect, useState } from "react";
import "../cssFiles/discountPopup.css";

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
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={handleClose}>×</button>
        <h3>🎉 İlk Siparişe Özel!</h3>
        <p>
          <strong>sozderece100</strong> kodunu kullanarak <strong>100₺'lik indirimden</strong> yararlan!
        </p>
      </div>
    </div>
  );
}
