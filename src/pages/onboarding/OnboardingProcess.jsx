import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingShell, { OnboardingLoading } from "../../components/OnboardingShell";
import useOnboarding, { saveProcessStep, completeProcessIntro } from "../../hooks/useOnboarding";
import { isAdminPreview, PREVIEW_ONBOARDING } from "../../utils/onboardingPreview";

const TOTAL = 6;
const NAVY = "#1C1B8A";
const INK = "#0D0A2E";
const LIME = "#D8FF4F";

// Anlatım gerçek operasyona göre: form → WhatsApp → Canva'da hazırlanan program →
// WhatsApp'tan takip. Panel, dönüş süresi vb. vaat edilmez.

function Styles() {
  return (
    <style>{`
      @keyframes obDot { 0%,80%,100% { opacity:.25; transform:translateY(0) } 40% { opacity:1; transform:translateY(-3px) } }
      @keyframes obSpin { to { transform: rotate(360deg) } }
      @keyframes obPop { 0% { transform:scale(.6); opacity:0 } 70% { transform:scale(1.12) } 100% { transform:scale(1); opacity:1 } }
      @keyframes obDraw { to { stroke-dashoffset: 0 } }
      .ob-nav { background: linear-gradient(to top, #F8F7FF 70%, rgba(248,247,255,0)) }
      @media (min-width: 768px) { .ob-nav { background: none } }
      @media (prefers-reduced-motion: reduce) { .ob-anim { animation: none !important } }
    `}</style>
  );
}

function Tag({ children, bg, color }) {
  return (
    <span className="inline-block font-fredoka font-bold text-[12px] px-3 py-1.5 rounded-full mb-4" style={{ background: bg, color, letterSpacing: 1.2 }}>
      {children}
    </span>
  );
}

function Title({ children }) {
  return (
    <h1 className="font-fredoka font-bold m-0 mb-4 leading-[1.1]" style={{ color: NAVY, fontSize: "clamp(28px, 5.4vw, 42px)", letterSpacing: -0.5 }}>
      {children}
    </h1>
  );
}

const Para = ({ children }) => <p className="text-[#475569] text-[16px] md:text-[17px] leading-relaxed m-0 mb-3">{children}</p>;

function Emphasis({ children, bg = "#EEEEFB", color = NAVY }) {
  return (
    <div className="mt-5 rounded-2xl px-4 py-3.5 font-fredoka font-bold text-[16px] leading-snug" style={{ background: bg, color }}>
      {children}
    </div>
  );
}

// Metin solda / görsel sağda (masaüstü), mobilde alt alta.
function Layout({ text, visual }) {
  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
      <div>{text}</div>
      <div className="min-w-0">{visual}</div>
    </div>
  );
}

/* ───────── Ekran 1 ───────── */
const FLOW = [
  { t: "Sen + Koçun", bg: NAVY, c: LIME },
  { t: "Planla", bg: "#EDE8FA", c: "#5B2FB0" },
  { t: "Uygula", bg: "#EEFBC7", c: "#3F6B0A" },
  { t: "Takip Et", bg: "#E0F2FE", c: "#0369A1" },
  { t: "Güncelle", bg: "#FFEDE3", c: "#C2410C" },
];

function FlowDiagram() {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center items-center gap-2 md:gap-3">
      {FLOW.map((n, i) => (
        <div key={n.t} className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className="font-fredoka font-bold text-[16px] px-5 py-3 rounded-2xl"
            style={{ background: n.bg, color: n.c, minWidth: 130, textAlign: "center" }}
          >
            {n.t}
          </motion.span>
          {i < FLOW.length - 1 && (
            <span className="text-[#94a3b8] text-lg md:rotate-0" aria-hidden>
              <span className="md:hidden">↓</span>
              <span className="hidden md:inline">→</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Screen1() {
  return (
    <div className="max-w-[720px] mx-auto text-center">
      <span
        className="ob-anim inline-flex items-center gap-2 font-fredoka font-bold text-[14px] px-4 py-2 rounded-full mb-5"
        style={{ background: "#EEFBC7", color: "#3F6B0A", animation: "obPop .5s ease-out both" }}
      >
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white" style={{ background: "#3F6B0A" }}>✓</span>
        Seni tanıdık. Şimdi başlayalım.
      </span>
      <Title>Bundan Sonra Seni Neler Bekliyor?</Title>
      <p className="text-[#475569] text-[16px] md:text-[17px] leading-relaxed mx-auto mb-8" style={{ maxWidth: 560 }}>
        Koçunla nasıl iletişim kuracağını, çalışma programının nasıl hazırlanacağını ve sürecin nasıl ilerleyeceğini 1 dakikada görelim.
      </p>
      <FlowDiagram />
    </div>
  );
}

/* ───────── Ekran 2 ───────── */
function Bubble({ me, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${me ? "self-end" : "self-start"}`}
      style={{ background: me ? "#EEFBC7" : "#fff", color: INK, boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}
    >
      {children}
    </motion.div>
  );
}

function ChatMockup({ name }) {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[26px] overflow-hidden" style={{ boxShadow: "0 20px 50px rgba(28,27,138,.18)", border: "1px solid #E4E1F0" }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#075E54" }}>
        <span className="w-9 h-9 rounded-full flex items-center justify-center font-fredoka font-bold text-sm" style={{ background: LIME, color: INK }}>K</span>
        <div>
          <div className="text-white font-bold text-[15px] leading-tight">Koçun</div>
          <div className="text-white/70 text-[12px]">WhatsApp</div>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}>Örnek görünüm</span>
      </div>
      <div className="flex flex-col gap-2 p-4" style={{ background: "#ECE5DD", minHeight: 250 }}>
        <Bubble delay={0.2}>Merhaba {name || "orada"} 👋</Bubble>
        <Bubble delay={0.5}>Ben Sözderece'deki koçunum. Tanışma formundaki cevaplarını inceledim.</Bubble>
        <Bubble delay={0.8}>Hedefin ve mevcut durumun üzerinden ilk rotanı birlikte çıkaracağız.</Bubble>
        <Bubble me delay={1.1}>Merhaba hocam, hazırım 🙌</Bubble>
        <div className="self-start flex gap-1 px-3.5 py-3 rounded-2xl bg-white" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.08)" }} aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="ob-anim w-1.5 h-1.5 rounded-full" style={{ background: "#94a3b8", animation: `obDot 1.2s ${i * 0.15}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Screen2({ name }) {
  return (
    <Layout
      text={
        <>
          <Tag bg="#EEFBC7" color="#3F6B0A">01 · KOÇUNLA TANIŞ</Tag>
          <Title>İlk olarak koçun seninle tanışacak. 👋</Title>
          <Para>Tanışma formundaki cevapların koçuna iletilecek. Koçun bilgilerini inceleyip seninle WhatsApp üzerinden iletişime geçecek.</Para>
          <Emphasis bg="#EEFBC7" color="#3F6B0A">WhatsApp, koçunla ana iletişim kanalın olacak.</Emphasis>
        </>
      }
      visual={<ChatMockup name={name} />}
    />
  );
}

/* ───────── Ekran 3 ───────── */
const PROGRAMS = {
  YKS: [
    ["Pazartesi", ["Matematik — Fonksiyonlar", "Türkçe — Paragraf", "Fizik — Hareket"]],
    ["Salı", ["Kimya — Mol Kavramı", "Matematik — Problemler", "Deneme Analizi"]],
    ["Çarşamba", ["Biyoloji — Hücre", "Türkçe — Dil Bilgisi", "Geometri — Üçgenler"]],
  ],
  LGS: [
    ["Pazartesi", ["Matematik — Üslü İfadeler", "Türkçe — Paragraf", "Fen — Basınç"]],
    ["Salı", ["Matematik — Kareköklü İfadeler", "İngilizce — Kelime Tekrarı", "Deneme Analizi"]],
    ["Çarşamba", ["Fen — Madde ve Endüstri", "Türkçe — Dil Bilgisi", "Sosyal — Kaynak Çalışma"]],
  ],
};

function ProgramMockup({ name, exam }) {
  const days = PROGRAMS[exam] || PROGRAMS.YKS;
  return (
    <div className="mx-auto w-full max-w-[400px] rounded-[22px] p-5 bg-white" style={{ boxShadow: "0 20px 50px rgba(115,64,200,.18)", border: "1px solid #E4E1F0" }}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="font-fredoka font-bold text-[13px]" style={{ color: "#5B2FB0", letterSpacing: 0.8 }}>
          {name ? `${name.toLocaleUpperCase("tr")} İÇİN HAFTALIK PROGRAM` : "SENİN HAFTALIK PROGRAMIN"}
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: "#EDE8FA", color: "#5B2FB0" }}>Örnek</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {days.map(([day, items], di) => (
          <motion.div key={day} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + di * 0.18 }}>
            <div className="font-fredoka font-bold text-[13px] mb-1.5" style={{ color: NAVY }}>{day}</div>
            <div className="flex flex-col gap-1.5">
              {items.map((it) => (
                <div key={it} className="text-[13px] rounded-xl px-3 py-2" style={{ background: "#F6F3FD", color: INK }}>{it}</div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Screen3({ name, exam }) {
  return (
    <Layout
      text={
        <>
          <Tag bg="#EDE8FA" color="#5B2FB0">02 · İLK ROTAN</Tag>
          <Title>Sana özel ilk çalışma programını oluşturacağız.</Title>
          <Para>Hedeflerin, mevcut durumun, okul/dershane düzenin ve eksiklerin değerlendirilerek ilk çalışma rotan hazırlanacak.</Para>
          <Emphasis bg="#EDE8FA" color="#5B2FB0">Hazır bir şablon değil. Senin haftana göre oluşturulan bir rota.</Emphasis>
        </>
      }
      visual={<ProgramMockup name={name} exam={exam} />}
    />
  );
}

/* ───────── Ekran 4 ───────── */
function SideCard({ title, items, bg, color, dot }) {
  return (
    <div className="rounded-[22px] p-5 md:p-6" style={{ background: bg }}>
      <div className="font-fredoka font-bold text-[13px] mb-3" style={{ color, letterSpacing: 1.2 }}>{title}</div>
      <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-[15px] leading-snug" style={{ color: INK }}>
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5" style={{ background: dot, color: "#fff" }}>✓</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Screen4() {
  return (
    <div>
      <div className="max-w-[720px] mb-7">
        <Tag bg="#E0F2FE" color="#0369A1">03 · TAKİP &amp; İLETİŞİM</Tag>
        <Title>Programın hazırlandı. Ama işimiz burada bitmiyor.</Title>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <SideCard
          title="SENİN TARAFIN"
          bg="#E0F2FE"
          color="#0369A1"
          dot="#0284C7"
          items={["Programını uygulamaya çalış.", "Takıldığın noktaları koçuna yaz.", "Deneme sonuçlarını paylaş.", "Programın sana uymayan yerlerini söyle."]}
        />
        <SideCard
          title="KOÇUNUN TARAFI"
          bg="#EEFBC7"
          color="#3F6B0A"
          dot="#3F6B0A"
          items={["İlerleyişini takip eder.", "Sorularına geri bildirim verir.", "Aksayan noktaları değerlendirir.", "Gerektiğinde rotanı günceller."]}
        />
      </div>
      <Emphasis>Koçluk, yalnızca program almak değil; programı birlikte yönetmek.</Emphasis>
    </div>
  );
}

/* ───────── Ekran 5 ───────── */
function Cycle() {
  const node = (label, style, hot) => (
    <span
      className="absolute font-fredoka font-bold text-[13px] px-3.5 py-2 rounded-full whitespace-nowrap"
      style={{ ...style, background: hot ? "#FF6B35" : "#fff", color: hot ? "#fff" : NAVY, border: hot ? "none" : "1.5px solid #E4E1F0", boxShadow: hot ? "0 8px 20px rgba(255,107,53,.4)" : "0 4px 12px rgba(28,27,138,.08)" }}
    >
      {label}
    </span>
  );
  return (
    <div className="relative mx-auto" style={{ width: 280, height: 280 }} aria-label="Planla, uygula, takip et, güncelle döngüsü">
      <svg width="280" height="280" viewBox="0 0 280 280" className="absolute inset-0" aria-hidden>
        <circle cx="140" cy="140" r="100" fill="none" stroke="#FFD9C7" strokeWidth="3" strokeDasharray="4 8" />
        <g className="ob-anim" style={{ transformOrigin: "140px 140px", animation: "obSpin 14s linear infinite" }}>
          <circle cx="140" cy="140" r="100" fill="none" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round" strokeDasharray="60 570" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[44px] leading-none" style={{ color: "#FF6B35" }}>↺</span>
        <span className="font-fredoka font-bold text-[12px] mt-1" style={{ color: NAVY, letterSpacing: 1.5 }}>ROTA</span>
      </div>
      {node("PLANLA", { top: 26, left: "50%", transform: "translate(-50%,-50%)" })}
      {node("UYGULA", { top: "50%", right: -8, transform: "translateY(-50%)" })}
      {node("TAKİP ET", { bottom: 26, left: "50%", transform: "translate(-50%,50%)" })}
      {node("GÜNCELLE", { top: "50%", left: -12, transform: "translateY(-50%)" }, true)}
    </div>
  );
}

function Screen5() {
  return (
    <Layout
      text={
        <>
          <Tag bg="#FFEDE3" color="#C2410C">04 · ROTANI GÜNCELLE</Tag>
          <Title>Programın aksarsa her şey bitmiş sayılmaz.</Title>
          <Para>Bir konu beklediğinden uzun sürebilir. Bir denemen kötü gelebilir. Okul yoğunlaşabilir veya bazı görevler yetişmeyebilir.</Para>
          <Para>Böyle durumlarda programı bırakmak yerine rotanı birlikte güncelleyeceğiz.</Para>
          <Emphasis bg="#FFEDE3" color="#C2410C">Sabit bir program değil. Sen ilerledikçe gelişen bir rota.</Emphasis>
        </>
      }
      visual={<Cycle />}
    />
  );
}

/* ───────── Ekran 6 ───────── */
const ROLES = [
  ["PROGRAMINI UYGULAMAYA ÇALIŞ", "Mükemmel olmak zorunda değilsin; ama denemelisin."],
  ["KOÇUNLA AÇIK İLETİŞİM KUR", "Yetişmeyen veya zorlayan noktaları saklama."],
  ["DENEMELERİNİ VE GELİŞİMİNİ PAYLAŞ", "Rotanı güncelleyebilmemiz için nasıl ilerlediğini bilmemiz gerekiyor."],
  ["SORUMLULUK AL", "Koçun sana yol gösterecek; o yolu birlikte yürüyeceğiz."],
];

function Screen6() {
  return (
    <div>
      <div className="max-w-[760px] mb-7">
        <Tag bg="#E6E6FA" color={NAVY}>05 · SENİN ROLÜN</Tag>
        <Title>Bu süreçte senden istediğimiz tek şey: sürece gerçekten katılman.</Title>
      </div>
      <div className="grid sm:grid-cols-2 gap-3.5">
        {ROLES.map(([t, d], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-[20px] p-5 bg-white flex gap-4"
            style={{ border: "1px solid #E4E1F0" }}
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-fredoka font-bold text-sm" style={{ background: NAVY, color: LIME }}>{i + 1}</span>
            <div>
              <div className="font-fredoka font-bold text-[14px] leading-snug mb-1" style={{ color: NAVY, letterSpacing: 0.3 }}>{t}</div>
              <div className="text-[14px] text-[#475569] leading-snug">{d}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 rounded-[24px] px-6 py-7 text-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #2B1FA8)` }}>
        <div className="font-fredoka font-bold text-[22px] md:text-[26px] leading-snug" style={{ color: LIME }}>Hazırsan ilk rotanı oluşturmaya başlayalım.</div>
        <div className="text-white/70 text-[14px] mt-2">Koçun seninle WhatsApp üzerinden iletişime geçecek.</div>
      </div>
    </div>
  );
}

/* ───────── Tamamlandı ───────── */
function Finished({ onReview, onGo }) {
  return (
    <div className="max-w-[560px] mx-auto text-center py-6">
      <div className="ob-anim w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: LIME, color: INK, boxShadow: "0 10px 30px rgba(216,255,79,.5)", animation: "obPop .5s ease-out both" }}>✓</div>
      <h1 className="font-fredoka font-bold m-0 mb-4" style={{ color: NAVY, fontSize: "clamp(30px, 6vw, 40px)" }}>Her şey hazır! 🎉</h1>
      <Para>Tanışma formun bize ulaştı. Bundan sonraki adımda koçun seninle WhatsApp üzerinden iletişime geçecek.</Para>
      <button
        type="button"
        onClick={onGo}
        className="mt-6 w-full py-4 rounded-2xl font-fredoka font-bold text-[17px] border-0 cursor-pointer"
        style={{ background: NAVY, color: LIME, boxShadow: "0 8px 24px rgba(28,27,138,.25)" }}
      >
        Panelime Git →
      </button>
      <button type="button" onClick={onReview} className="mt-4 bg-transparent border-0 underline text-[14px] text-[#64748b] cursor-pointer">
        Süreci tekrar gör
      </button>
    </div>
  );
}

/* ───────── Ana bileşen ───────── */
export default function OnboardingProcess() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const preview = isAdminPreview(params);
  const real = useOnboarding(preview);
  const loading = preview ? false : real.loading;
  // Önizlemede sunucuya hiç dokunulmuyor — kaldığı ekran/tamamlanma sadece bu
  // sayfa açıkken bellekte tutulur, kapatınca sıfırlanır.
  const ob = preview ? PREVIEW_ONBOARDING : real.data?.onboarding;

  const [dir, setDir] = useState(1);
  const [justFinished, setJustFinished] = useState(false);
  const [busy, setBusy] = useState(false);
  const touch = useRef(null);

  const eParam = parseInt(params.get("e"), 10);
  const hasParam = eParam >= 1 && eParam <= TOTAL;
  const screen = hasParam ? eParam : Math.min(TOTAL, Math.max(1, ob?.processStep || 1));
  const showFinished = justFinished || (!!ob?.processCompleted && !hasParam);

  useEffect(() => {
    if (preview || loading) return;
    if (!ob) navigate("/student/dashboard", { replace: true });
    else if (!ob.formCompleted) navigate("/onboarding/hos-geldin", { replace: true });
  }, [preview, loading, ob, navigate]);

  // Parametresiz açılışta kaldığı ekranı URL'ye yaz (geri tuşu ekranlar arasında çalışsın).
  useEffect(() => {
    if (!ob?.formCompleted || showFinished || hasParam) return;
    setParams(preview ? { e: String(screen), preview: "1" } : { e: String(screen) }, { replace: true });
  }, [ob, showFinished, hasParam, screen, preview, setParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, showFinished]);

  if (loading || !ob || !ob.formCompleted) return <OnboardingLoading />;

  const a = ob.answers || {};
  const name = (a.fullName || "").trim().split(/\s+/)[0] || "";
  const exam = a.exam === "LGS" ? "LGS" : "YKS";

  const go = (n) => {
    if (n < 1 || n > TOTAL) return;
    setDir(n > screen ? 1 : -1);
    setParams(preview ? { e: String(n), preview: "1" } : { e: String(n) });
    if (!preview && !ob.processCompleted) saveProcessStep(n).catch(() => {});
  };

  const finish = async () => {
    if (preview) {
      setJustFinished(true);
      return;
    }
    setBusy(true);
    try {
      await completeProcessIntro();
    } catch {
      // kayıt başarısız olsa da öğrenci akışı görsün; bir sonraki girişte tekrar denenir
    }
    setBusy(false);
    setJustFinished(true);
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 45) go(dx < 0 ? screen + 1 : screen - 1);
  };

  const body = {
    1: <Screen1 />,
    2: <Screen2 name={name} />,
    3: <Screen3 name={name} exam={exam} />,
    4: <Screen4 />,
    5: <Screen5 />,
    6: <Screen6 />,
  }[screen];

  if (showFinished) {
    return (
      <OnboardingShell maxWidth={1040}>
        <Styles />
        <Finished
          onGo={() => navigate(preview ? "/admin" : "/student/dashboard")}
          onReview={() => {
            setJustFinished(false);
            setDir(1);
            setParams(preview ? { e: "1", preview: "1" } : { e: "1" });
          }}
        />
      </OnboardingShell>
    );
  }

  const last = screen === TOTAL;
  return (
    <OnboardingShell maxWidth={1040}>
      <Styles />
      {preview && (
        <div className="mb-5 text-center font-fredoka font-bold text-[12px] px-3 py-1.5 rounded-full inline-block mx-auto" style={{ background: "#FFEDE3", color: "#C2410C" }}>
          Önizleme modu — hiçbir şey kaydedilmiyor, öğrenciler bunu görmüyor
        </div>
      )}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: TOTAL }, (_, i) => (
              <span key={i} className="h-2 rounded-full transition-all duration-300" style={{ width: i + 1 === screen ? 26 : 8, background: i + 1 <= screen ? NAVY : "#DAD6EA" }} />
            ))}
          </div>
          <div className="font-nunito font-bold text-[13px] text-[#8B87A6]">{screen} / {TOTAL}</div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E4E1F0" }} role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={screen}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(screen / TOTAL) * 100}%`, background: `linear-gradient(90deg, ${NAVY}, #7340C8)` }} />
        </div>
      </div>

      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="pb-28 md:pb-4 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.25 }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="ob-nav fixed md:static bottom-0 left-0 right-0 z-[50] px-4 md:px-0 pt-3 md:pt-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <div className="max-w-[1040px] mx-auto flex gap-3 md:justify-between">
          {screen > 1 ? (
            <button
              type="button"
              onClick={() => go(screen - 1)}
              className="px-5 py-4 rounded-2xl font-fredoka font-bold text-[16px] cursor-pointer bg-white"
              style={{ color: NAVY, border: "1.5px solid #D6D6F5" }}
            >
              ← Geri
            </button>
          ) : (
            <span className="hidden md:block" />
          )}
          <button
            type="button"
            disabled={busy}
            onClick={last ? finish : () => go(screen + 1)}
            className="flex-1 md:flex-none md:min-w-[260px] py-4 rounded-2xl font-fredoka font-bold text-[17px] border-0 cursor-pointer disabled:opacity-60"
            style={last ? { background: LIME, color: INK, boxShadow: "0 8px 24px rgba(216,255,79,.4)" } : { background: NAVY, color: LIME, boxShadow: "0 8px 24px rgba(28,27,138,.22)" }}
          >
            {busy ? "Kaydediliyor…" : last ? "Onboarding'i Tamamla ✓" : screen === 1 ? "Başlayalım →" : "Devam Et →"}
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
