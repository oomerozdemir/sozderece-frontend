import { useState } from "react";



const RefundModal = ({ orderId, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = () => {
    console.log({ orderId, reason, description });

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
    
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
        <h3 className="mb-4">📝 İade Talep Formu</h3>

        <label className="block mb-3 font-medium">
          İade Nedeni:
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full mt-1 p-1.5 rounded border border-gray-300"
          >
            <option value="">Seçiniz...</option>
            <option value="Yanlış paket seçimi">Yanlış paket seçimi</option>
            <option value="Beklentileri karşılamadı">Beklentileri karşılamadı</option>
            <option value="Teknik sorun yaşandı">Teknik sorun yaşandı</option>
            <option value="Diğer">Diğer</option>
          </select>
        </label>

        <label className="block mb-3 font-medium">
          Açıklama (isteğe bağlı):
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dilerseniz detaylı açıklama yapabilirsiniz..."
            className="w-full mt-1 p-1.5 rounded border border-gray-300"
          />
        </label>

        <label className="flex items-center gap-2.5 my-3 font-medium">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
          />
          Aboneliğimi sonlandırmak ve iade talebi oluşturmak istiyorum.
        </label>

        <div className="flex justify-between">
          <button
            className="px-4 py-2 border-none rounded cursor-pointer bg-gray-300"
            onClick={onClose}
          >
            İptal
          </button>
          <button
            className="px-4 py-2 border-none rounded cursor-pointer bg-blue-600 text-white"
            onClick={handleSubmit}
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
