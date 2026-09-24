import Seo from "./Seo";

// Onboarding ekranları için sade kabuk: sitenin navbar/footer'ı bilinçli olarak
// yok — öğrencinin dikkati dağılmasın (ana sayfa, paket satın al vb. linkler yok).
export default function OnboardingShell({ children, wide = false, maxWidth }) {
  return (
    <div className="min-h-screen font-nunito" style={{ background: "var(--color-background)" }}>
      <Seo title="Hoş Geldin" noindex />
      <header className="px-5 py-4 flex items-center justify-center gap-2" style={{ background: "var(--color-dark)" }}>
        <img src="/images/logo-bee.png" alt="" aria-hidden="true" className="w-6 h-6 flex-shrink-0" />
        <span className="font-fredoka text-2xl select-none" style={{ color: "var(--color-brand-on-dark)", letterSpacing: 0.5 }}>SÖZDERECE</span>
      </header>
      <main className={`mx-auto px-4 py-8 md:py-12 ${maxWidth ? "" : wide ? "max-w-[680px]" : "max-w-[620px]"}`} style={maxWidth ? { maxWidth } : undefined}>{children}</main>
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
