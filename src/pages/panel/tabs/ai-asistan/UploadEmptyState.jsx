import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import Button from "../../../../components/ui/Button";

// Fotoğraf seçici — dosya validasyonu (boyut/tip) burada yalnızca UX için
// erken bir ön-kontrol; otorite her zaman backend'de (gerçek dosya imzası +
// MIME kontrolü), bu yüzden burada yalnızca bariz hatalar erken yakalanır.
const MAX_SIZE_MB = 5;

export default function UploadEmptyState({ onUpload, error }) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError("Yalnızca görsel dosyası yükleyebilirsin.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`Dosya ${MAX_SIZE_MB}MB'tan küçük olmalı.`);
      return;
    }
    setLocalError("");
    onUpload(file);
  };

  return (
    <div data-tour="ai-assistant-upload" className="bg-white rounded-2xl border-2 border-dashed border-[#e2e8f0] p-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-4 text-brand">
        <FaCamera size={24} />
      </div>
      <p className="font-fredoka font-bold text-page-navy text-lg mb-1.5">Çözemediğin soruyu yükle, birlikte çözelim.</p>
      <p className="font-nunito text-sm text-[#64748b] mb-6">Net ve okunaklı bir fotoğraf çek — tek bir soru olsun.</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button variant="primary" onClick={() => inputRef.current?.click()}>
        <FaCamera size={13} className="mr-1.5 inline" /> Fotoğraf Yükle
      </Button>

      {(localError || error) && <p className="font-nunito text-xs font-bold text-[#dc2626] mt-3">{localError || error}</p>}
    </div>
  );
}
