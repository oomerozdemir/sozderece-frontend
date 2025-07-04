import { useState } from "react";
import "../cssFiles/RefundModal.css";



const RefundModal = ({ orderId, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = () => {
    if (!reason || !confirm) {
      alert("Lütfen bir neden seçin ve onay kutusunu işaretleyin.");
      return;
    }

    onSubmit({
      orderId,
      reason,
      description,
    });
  };

  return (
    <div className="refund-modal-overlay">
      <div className="refund-modal">
        <h3>📝 İade Talep Formu</h3>
        
        <label>
          İade Nedeni:
          <select value={reason} onChange={(e) => setReason(e.target.value)} required>
            <option value="">Seçiniz...</option>
            <option value="Yanlış paket seçimi">Yanlış paket seçimi</option>
            <option value="Beklentileri karşılamadı">Beklentileri karşılamadı</option>
            <option value="Teknik sorun yaşandı">Teknik sorun yaşandı</option>
            <option value="Diğer">Diğer</option>
          </select>
        </label>

        <label>
          Açıklama (isteğe bağlı):
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dilerseniz detaylı açıklama yapabilirsiniz..."
          />
        </label>

        <label className="confirm-label">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
          />
          Aboneliğimi sonlandırmak ve iade talebi oluşturmak istiyorum.
        </label>

        <div className="refund-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>İptal</button>
          <button className="submit-btn" onClick={handleSubmit}>Gönder</button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
