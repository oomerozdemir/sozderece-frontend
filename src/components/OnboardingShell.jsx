import Seo from "./Seo";

// Onboarding ekranları için sade kabuk: sitenin navbar/footer'ı bilinçli olarak
// yok — öğrencinin dikkati dağılmasın (ana sayfa, paket satın al vb. linkler yok).
export default function OnboardingShell({ children, wide = false }) {
  return (
    <div className="min-h-screen font-nunito" style={{ background: "#F8F7FF" }}>
      <Seo title="Hoş Geldin" noindex />
      <header className="px-5 py-4 flex items-center justify-center" style={{ background: "#0D0A2E" }}>
        <span className="font-fredoka text-2xl select-none" style={{ color: "#D8FF4F", letterSpacing: 0.5 }}>SÖZDERECE</span>
      </header>
      <main className={`mx-auto px-4 py-8 md:py-12 ${wide ? "max-w-[680px]" : "max-w-[620px]"}`}>{children}</main>
    </div>
  );
}

export function OnboardingLoading() {
  return (
    <OnboardingShell>
      <p className="text-center text-[#94a3b8] text-sm py-20">Yükleniyor…</p>
    </OnboardingShell>
  );
}
