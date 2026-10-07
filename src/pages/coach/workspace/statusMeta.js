// Paylaşılan durum/renk sözlükleri — koç panelindeki hem eski modal
// (StudentPanelEditor.jsx) hem yeni workspace sekmeleri (OverviewTab,
// TrackingTab) ve CoachDashboard.jsx tarafından kullanılır. Tek kaynak,
// aynı renk mantığının birden fazla yerde ayrı ayrı tekrarlanmasını önler.

export const STATUS_META = {
  pending: { label: "Bekliyor", color: "#94a3b8", bg: "#f1f5f9" },
  done: { label: "Bitti", color: "#059669", bg: "#ecfdf5" },
  partial: { label: "Yarıda Kaldı", color: "#c2740c", bg: "#fff7ea" },
  stuck: { label: "Zorlandım", color: "#dc2626", bg: "#fef2f2" },
};

// Etiketler öğrenci tarafındaki Konu Ağacım ekranıyla ortak (bkz.
// src/pages/panel/tabs/konular/topicHelpers.js#STAGE_META) — aynı backend
// stage'i iki ekranda farklı isimle görünmesin. Renkler/davranış değişmedi.
export const MASTERY_META = {
  none: { label: "Başlanmadı", bg: "#f1f5f9", border: "#e2e8f0", color: "#94a3b8" },
  studied: { label: "Çalışıldı", bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8" },
  practiced: { label: "Pratik Yapıldı", bg: "#f5f3ff", border: "#7340C8", color: "#6d28d9" },
  mastered: { label: "Güçlü", bg: "#fef3c7", border: "#f59e0b", color: "#92400e" },
};
