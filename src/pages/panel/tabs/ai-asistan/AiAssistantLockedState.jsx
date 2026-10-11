import { FaLock, FaRobot } from "react-icons/fa";
import Button from "../../../../components/ui/Button";

// Premium olmayan öğrencinin AI Soru Asistanı'na girdiğinde gördüğü ekran —
// yükleme alanının YERİNE geçer (geçmiş sorular/QuestionProfile bu
// component'in dışında, AiAsistan.jsx'te koşulsuz render edilmeye devam
// eder — yalnızca YENİ AI aksiyonu başlatma noktası kilitleniyor).
export default function AiAssistantLockedState() {
  return (
    <div data-tour="ai-assistant-upload" className="bg-white rounded-2xl border-2 border-dashed border-[#e2e8f0] p-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4 relative text-[#94a3b8]">
        <FaRobot size={24} />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-page-navy text-white flex items-center justify-center">
          <FaLock size={10} />
        </span>
      </div>
      <p className="font-fredoka font-bold text-page-navy text-lg mb-1.5">AI Soru Asistanı</p>
      <p className="font-nunito text-sm text-[#334155] mb-1.5 max-w-sm mx-auto">
        Çözemediğin soruları adım adım anlayarak ilerle.
      </p>
      <p className="font-nunito text-xs text-[#64748b] mb-6 max-w-sm mx-auto">
        AI Soru Asistanı, üst paket öğrencilerimizin kullanımına açıktır.
      </p>

      <Button variant="primary" to="/paket-detay">
        Paketleri İncele
      </Button>

      <p className="font-nunito text-[11px] text-[#94a3b8] mt-4">
        Paketin hakkında bilgi almak için koçunla da iletişime geçebilirsin.
      </p>
    </div>
  );
}
