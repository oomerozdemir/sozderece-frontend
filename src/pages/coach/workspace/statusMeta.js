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

export const MASTERY_META = {
  none: { label: "—", bg: "#f1f5f9", border: "#e2e8f0", color: "#94a3b8" },
  studied: { label: "Çalıştı", bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8" },
  practiced: { label: "Test Çözdü", bg: "#f5f3ff", border: "#7340C8", color: "#6d28d9" },
  mastered: { label: "Full ⭐", bg: "#fef3c7", border: "#f59e0b", color: "#92400e" },
};
