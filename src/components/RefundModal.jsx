import { useState } from "react";

const inp = "w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-page-dark outline-none focus:border-page-navy focus:ring-2 focus:ring-page-navy/10 transition-all font-nunito";

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
    <div className="fixed inset-0 bg-page-dark/50 flex items-center justify-center z-[999] p-4" onClick={onClose}>
      <div
        className="bg-white p-6 rounded-[24px] w-[420px] max-w-full shadow-[0_20px_50px_rgba(13,10,46,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-fredoka font-bold text-page-navy text-lg mb-4">İade Talep Formu</h3>

        <label className="block mb-3 font-nunito font-bold text-xs text-[#374151]">
          İade Nedeni
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className={inp}
          >
            <option value="">Seçiniz...</option>
            <option value="Yanlış paket seçimi">Yanlış paket seçimi</option>
            <option value="Beklentileri karşılamadı">Beklentileri karşılamadı</option>
            <option value="Teknik sorun yaşandı">Teknik sorun yaşandı</option>
            <option value="Diğer">Diğer</option>
          </select>
        </label>

        <label className="block mb-3 font-nunito font-bold text-xs text-[#374151]">
          Açıklama (isteğe bağlı)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dilerseniz detaylı açıklama yapabilirsiniz..."
            className={`${inp} resize-none h-20`}
          />
        </label>

        <label className="flex items-start gap-2.5 my-4 font-nunito text-sm text-[#374151] cursor-pointer">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            className="mt-0.5 accent-page-navy"
          />
          Aboneliğimi sonlandırmak ve iade talebi oluşturmak istiyorum.
        </label>

        <div className="flex justify-between gap-3 mt-2">
          <button
            className="flex-1 py-2.5 rounded-full border border-[#e5e7eb] font-fredoka font-bold text-sm text-[#64748b] bg-white hover:bg-[#f8fafc] transition-colors"
            onClick={onClose}
          >
            İptal
          </button>
          <button
            className="flex-1 py-2.5 rounded-full font-fredoka font-bold text-sm text-white transition-transform hover:scale-[1.02]"
            style={{ background: "#1C1B8A" }}
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
