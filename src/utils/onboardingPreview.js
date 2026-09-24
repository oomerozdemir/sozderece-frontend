import { getRoleFromToken } from "./auth";

// Admin panelden gerçek bir sipariş/ödeme oluşturmadan "Hoş Geldin" ve
// "Sürecimi Gör" ekranlarını görebilmek için: ?preview=1 ile açılıp rol
// admin ise, useOnboarding hiç çağrılmıyor — bunun yerine burada üretilen
// sahte (DB'ye hiç yazılmayan) veri kullanılıyor.
export const isAdminPreview = (searchParams) =>
  searchParams.get("preview") === "1" && getRoleFromToken(localStorage.getItem("token")) === "admin";

export const PREVIEW_ONBOARDING = {
  stage: "payment_completed",
  currentStep: 1,
  answers: { fullName: "Örnek Öğrenci", phone: "05XX XXX XX XX", respondent: "ogrenci", exam: "YKS" },
  packageName: "YKS Tam Kapsamlı Paket",
  formCompleted: true,
  processStep: 0,
  processCompleted: false,
};

export const PREVIEW_DATA = { onboarding: PREVIEW_ONBOARDING, prefill: {}, form: null };

// Hoş geldin ekranı formCompleted:false bekliyor — sabit bir referans (render
// başına yeni obje üretmemek için), gereksiz effect tetiklenmesini önler.
export const PREVIEW_ONBOARDING_WELCOME = { ...PREVIEW_ONBOARDING, formCompleted: false };
