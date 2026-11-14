import { createContext, useContext } from "react";

// StudentWorkspace ve 6 tab'ı hem /coach/students/:id (coach) hem
// /head-coach/students/:id (head_coach) altında BİREBİR AYNI component'lerle
// render edilir — hangi bağlamda çalıştıklarını (hangi API prefix'i
// kullanacaklarını, hangi WRITE aksiyonların görünür olacağını) buradan
// okurlar. Sağlayıcı yoksa varsayılan coach davranışı korunur (geriye dönük
// uyumlu).
const PanelAccessContext = createContext({
  apiPrefix: "coach",
  backTo: "/coach/dashboard",
  // V1'de head_coach'a KAPALI write aksiyonları (plan K6/K9): deneme sonucu
  // girme, SOS çözme, kaynak ekleme/düzenleme/arşivleme, AI program-görseli
  // yükleme. coach bağlamında hepsi true.
  canAddExamResult: true,
  canManageResources: true,
  canImportProgramImage: true,
});

export const PanelAccessProvider = PanelAccessContext.Provider;

export default function usePanelAccess() {
  return useContext(PanelAccessContext);
}
