// Minimalist, vektörel "dijital koç" avatarı — öğrenci yalnız hissetmesin
// diye panelde sabit duruyor. İfadesi son aktiviteye göre değişiyor: her
// şey yolundaysa gülümser ve başparmak kaldırır, 2+ gündür sessizse yüzü
// hafif ciddileşir (kızgın değil, sorgulayıcı).
export default function CoachAvatar({ daysSinceLastActivity, size = 52 }) {
  const mood =
    daysSinceLastActivity == null || daysSinceLastActivity >= 3
      ? "concerned"
      : daysSinceLastActivity >= 2
      ? "neutral"
      : "happy";

  const MOOD_META = {
    happy: { bg: "#D8FF4F", face: "#1C1B8A" },
    neutral: { bg: "#fde68a", face: "#78350f" },
    concerned: { bg: "#fecaca", face: "#7f1d1d" },
  };
  const meta = MOOD_META[mood];

  return (
    <div
      className="relative flex-shrink-0 rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: meta.bg }}
      title={
        mood === "happy"
          ? "Koçun seni gurur duyuyor!"
          : mood === "neutral"
          ? "Koçun seni merak ediyor — bir süredir görünmüyorsun"
          : "Koçun seni özledi — masaya dönme vakti"
      }
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
        {/* Gözler */}
        <circle cx="13" cy="17" r="2.6" fill={meta.face} />
        <circle cx="27" cy="17" r="2.6" fill={meta.face} />
        {/* Ağız — mood'a göre değişen path */}
        {mood === "happy" && <path d="M11 24c3 4 15 4 18 0" stroke={meta.face} strokeWidth="2.6" strokeLinecap="round" fill="none" />}
        {mood === "neutral" && <path d="M12 26h16" stroke={meta.face} strokeWidth="2.6" strokeLinecap="round" fill="none" />}
        {mood === "concerned" && <path d="M11 27c3-3 15-3 18 0" stroke={meta.face} strokeWidth="2.6" strokeLinecap="round" fill="none" />}
      </svg>
      {mood === "happy" && (
        <span className="absolute -bottom-1 -right-1 text-sm" role="img" aria-label="başparmak">👍</span>
      )}
    </div>
  );
}
