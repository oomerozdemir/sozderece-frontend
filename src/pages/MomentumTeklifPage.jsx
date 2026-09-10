import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaWhatsapp, FaLock } from "react-icons/fa";
import TopBar from "../components/TopBar";
import Navbar from "../components/navbar";
import Seo from "../components/Seo";

// Bu teklif/lansman sayfası, "14 Günde Çalışma Alışkanlığı Kazan Teklif
// Dokümanı" (Word/PDF) metnine BİREBİR sadık kalınarak hazırlandı — başlıklar,
// madde metinleri ve kapanış cümlesi dokümandan aynen alındı. Sadece görsel
// biçimlendirme (kalın/liste/kart) eklendi, içerik parafraze edilmedi.
//
// Paket: backend'de aynı slug ile, vitrine kapalı (hidden:true) bir Package
// kaydı olarak duruyor — PricingSection/CoachingWizardPaket listelerinde
// GÖRÜNMÜYOR, sadece bu sayfanın "Programa Katıl" butonuyla doğrudan
// /hemen-basla/odeme adımına link verilerek ulaşılabiliyor (bkz. App.jsx'te
// CoachingWizardOdeme'nin hidden paketleri de çözebilmesi için ?all=true).
const OFFER_SLUG = "14-gunde-calisma-aliskanligi-kazan";
const CHECKOUT_HREF = `/hemen-basla/odeme?slug=${OFFER_SLUG}&alan=${encodeURIComponent("Diğer")}`;

// Dokümandaki tarihler — Türkiye saatiyle (UTC+3, DST yok) sabitlendi.
const OPEN_AT = new Date("2026-09-11T00:00:00+03:00");
const CLOSE_AT = new Date("2026-09-17T23:59:59+03:00");

function usePhase() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const phase = now < OPEN_AT ? "before" : now > CLOSE_AT ? "closed" : "open";
  return { phase, now };
}

// Not bir hook — sadece iki Date arasındaki farkı parçalara ayırıyor. "use"
// ile başlamıyor ki CtaButton içinde koşullu çağrılabilsin (Rules of Hooks'a
// takılmasın).
function countdownParts(target, now) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

function Eyebrow({ children, color = "#FF6B35" }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-block w-6 h-[3px] rounded-full" style={{ background: color }} />
      <span className="font-fredoka font-bold text-[12px] uppercase" style={{ color, letterSpacing: 3 }}>
        {children}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      className="font-fredoka font-bold text-page-navy m-0 mb-5"
      style={{ fontSize: "clamp(26px, 3vw, 36px)", letterSpacing: -0.5 }}
    >
      {children}
    </h2>
  );
}

function CtaButton({ phase, now, size = "md", className = "" }) {
  const navigate = useNavigate();

  if (phase === "before") {
    const { days, hours, minutes, seconds } = countdownParts(OPEN_AT, now);
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          className={`w-full font-fredoka font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 ${
            size === "lg" ? "text-lg py-4 px-8" : "text-base py-3.5 px-6"
          }`}
          style={{ background: "#EDEBFB", color: "#8B87A6" }}
        >
          <FaLock size={13} /> Kayıtlar 11 Eylül'de Açılıyor
        </button>
        <p className="font-nunito text-xs text-[#94a3b8] text-center mt-2">
          {days}g {String(hours).padStart(2, "0")}sa {String(minutes).padStart(2, "0")}dk {String(seconds).padStart(2, "0")}sn sonra
        </p>
      </div>
    );
  }

  if (phase === "closed") {
    return (
      <button
        type="button"
        disabled
        className={`w-full font-fredoka font-bold rounded-2xl cursor-not-allowed ${
          size === "lg" ? "text-lg py-4 px-8" : "text-base py-3.5 px-6"
        } ${className}`}
        style={{ background: "#EDEBFB", color: "#8B87A6" }}
      >
        Kayıtlar Kapandı
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => navigate(CHECKOUT_HREF)}
      className={`w-full font-fredoka font-bold rounded-2xl text-white transition-shadow ${
        size === "lg" ? "text-lg py-4 px-8" : "text-base py-3.5 px-6"
      } ${className}`}
      style={{ background: "#1C1B8A", boxShadow: "0 10px 26px rgba(28,27,138,0.28)" }}
    >
      Programa Katıl →
    </motion.button>
  );
}

const CIKTILAR = [
  {
    bold: "Kendi çalışma programını oluşturmuş olacaksın.",
    rest: "Hangi gün, hangi derse ve ne zaman çalışacağını netleştireceksin.",
  },
  {
    bold: "Gününü yönetmek için bir sistemin olacak.",
    rest: "Okul, dinlenme ve ders çalışma zamanlarını kendi hayatına göre yerleştirebileceksin.",
  },
  {
    bold: "Sorunlu derslerin için bir çalışma yöntemi belirleyeceksin.",
    rest: "Ertelediğin veya kaçtığın dersleri çalışma düzenine nasıl dahil edeceğini bileceksin.",
  },
  {
    bold: "Oluşturduğun programı 14 gün boyunca uygulamış olacaksın.",
    rest: "Sadece plan yapmakla kalmayacak, kurduğun sistemi gerçek hayatında test edeceksin.",
  },
  {
    bold: "Programının aksayan noktalarını fark edip düzenleyebileceksin.",
    rest: "Sana uymayan bölümleri görüp çalışma sistemini revize etmeyi öğreneceksin.",
  },
  {
    bold: "Kendi çalışma düzenini yönetmeye başlayacaksın.",
    rest: "Sürekli birinin sana “ders çalış” demesini beklemek yerine ne yapman gerektiğini daha net görebileceksin.",
  },
];

const DEGIL_LISTESI = [
  "14 günde net artışı veya sıralama garantisi bekliyorsan.",
  "Hiçbir uygulama yapmadan, sadece videoları izleyerek sonuç almak istiyorsan.",
  "Sana hazır ve tamamen kişiye özel bir ders programı verilmesini bekliyorsan.",
  "Kendi çalışma düzenini uygulamak için sorumluluk almak istemiyorsan.",
  "Ders anlatımı veya özel ders hizmeti arıyorsan.",
  "Verilen sistemi 14 gün boyunca denemeye açık değilsen.",
  "Tüm sınav sürecinin 14 günde çözülmesini bekliyorsan.",
];

const EGER_LISTESI = [
  "Ders çalışmak istiyor ama nereden başlayacağını bilmiyorsan.",
  "Kendine uygun bir çalışma düzeni kurmak istiyorsan.",
  "Program hazırlıyor ama uygulamakta zorlanıyorsan.",
  "Gününü ve ders çalışma saatlerini daha iyi yönetmek istiyorsan.",
  "Zorlandığın veya sürekli ertelediğin dersleri sistemli şekilde ele almak istiyorsan.",
];

const ADIMLAR = [
  {
    no: "1",
    baslik: "Mevcut Düzeni Gör",
    amac: "Şu anda nasıl çalıştığını ve çalışma düzeninin nerelerde aksadığını fark etmek.",
    uygulamalar: "Günlük çalışma saatlerini, ders dağılımını ve en çok aksayan noktaları kısa bir değerlendirmeyle ortaya çıkarmak.",
    cikti: "Mevcut çalışma düzenindeki temel sorunları net şekilde görmüş olacaksın.",
  },
  {
    no: "2",
    baslik: "Kendi Çalışma Programını Kur",
    amac: "Sana uygun ve uygulanabilir bir çalışma programı oluşturmak.",
    uygulamalar: "15 dakikalık program hazırlama videosunu izlemek, verilen taslağı doldurmak, derslerini ve çalışma bloklarını haftana yerleştirmek.",
    cikti: "Başkasının hazırladığı değil, kendi hayatına göre oluşturduğun net bir çalışma programın olacak.",
  },
  {
    no: "3",
    baslik: "Gününü ve Sorunlu Dersini Yönet",
    amac: "Hazırladığın programı günlük hayatında uygulanabilir hale getirmek.",
    uygulamalar: "Gün yönetimi videosunu izlemek, okul-dinlenme-ders dengesini kurmak ve sorunlu ders videosuyla zorlandığın dersi programına doğru şekilde yerleştirmek.",
    cikti: "Ne zaman çalışacağını ve sürekli ertelediğin ya da zorlandığın derslere nasıl yaklaşacağını bileceksin.",
  },
  {
    no: "4",
    baslik: "14 Gün Uygula ve Sistemi Düzelt",
    amac: "Programı sadece hazırlamak değil, gerçek hayatında uygulayarak sana uygun hale getirmek.",
    uygulamalar: "Oluşturduğun programı 14 gün boyunca uygulamak, aksayan noktaları belirlemek, gerektiğinde programını revize etmek ve takıldığın yerlerde WhatsApp üzerinden soru sormak.",
    cikti: "14 günün sonunda kendi hayatında test ettiğin ve sana daha uygun hale getirdiğin bir çalışma düzenin olacak.",
  },
];

export default function MomentumTeklifPage() {
  const { phase, now } = usePhase();

  const statusBadge =
    phase === "before"
      ? { text: "Kayıtlar henüz açılmadı", bg: "#FEF3C7", color: "#92400E" }
      : phase === "open"
      ? { text: "Kayıtlar açık", bg: "#DCFCE7", color: "#166534" }
      : { text: "Kayıtlar kapandı", bg: "#F1F5F9", color: "#64748B" };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo
        title="14 Günde Çalışma Alışkanlığı Kazan"
        description="Kendi çalışma düzenini kurmak ve çalışma alışkanlığı kazanmaya başlamak isteyen LGS ve YKS öğrencileri için 14 günlük butik program. Sadece 10 öğrenci."
      />
      <TopBar />
      <Navbar />

      <main className="flex-1">
        {/* ── HERO / Başlık ── */}
        <section className="relative overflow-hidden" style={{ background: "#FFFFFF", borderBottom: "1px solid #F0EFF5" }}>
          <div className="absolute top-0 right-0" style={{ width: 320, height: 320, background: "#ede8fa", borderRadius: "0 0 0 100%", opacity: 0.6 }} />
          <div className="mx-auto px-6 py-20 max-w-[820px] text-center relative" style={{ zIndex: 1 }}>
            <motion.div {...fadeUp} className="flex justify-center">
              <Eyebrow>14 Günlük Program · LGS &amp; YKS</Eyebrow>
            </motion.div>
            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="font-fredoka font-bold text-page-navy m-0"
              style={{ fontSize: "clamp(34px, 5vw, 56px)", letterSpacing: -1, lineHeight: 1.05 }}
            >
              14 Günde Çalışma Alışkanlığı Kazan
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="font-nunito text-[#475569] mt-5"
              style={{ fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.6 }}
            >
              Kendi çalışma düzenini kurmak ve çalışma alışkanlığı kazanmaya başlamak isteyen
              LGS ve YKS öğrencileri için.
            </motion.p>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="mt-8 max-w-[360px] mx-auto">
              <CtaButton phase={phase} now={now} size="lg" />
              <span
                className="inline-flex items-center gap-1.5 font-nunito font-bold text-xs px-3 py-1.5 rounded-full mt-4"
                style={{ background: statusBadge.bg, color: statusBadge.color }}
              >
                ● {statusBadge.text}
              </span>
              <p className="font-nunito text-sm text-[#64748b] mt-3">
                Sadece 10 öğrenci · 1.250 TL tek çekim
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Kontenjan, Kapanış Tarihi ve Koşul ── */}
        <section className="py-16 px-6" style={{ background: "#F8F7FC" }}>
          <div className="max-w-[720px] mx-auto">
            <motion.div {...fadeUp}>
              <Eyebrow color="#1C1B8A">Kontenjan, Kapanış Tarihi ve Koşul</Eyebrow>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="bg-white rounded-[24px] p-8 border border-[#ECEAF5] space-y-4"
              style={{ boxShadow: "0 10px 30px rgba(28,27,138,0.06)" }}
            >
              <p className="font-fredoka font-bold text-page-navy text-lg m-0">Sadece 10 öğrenci alacağım.</p>
              <p className="font-nunito text-[#334155] text-base m-0">
                Kayıtlar <strong>11 Eylül 2026 Cuma günü</strong> açılacak.
              </p>
              <p className="font-nunito text-[#334155] text-base m-0">
                Alımlar <strong>17 Eylül 2026 Perşembe günü</strong> veya <strong>10 kişilik kontenjan dolduğunda</strong> kapanacak.
                Hangisi önce gerçekleşirse kayıtlar sona erecek.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Vizyonumuz ── */}
        <section className="py-16 px-6">
          <div className="max-w-[720px] mx-auto">
            <motion.div {...fadeUp}>
              <Eyebrow>Vizyonumuz</Eyebrow>
            </motion.div>
            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="font-nunito text-[#334155] text-lg leading-relaxed">
              Bu programda, hazır çalışma programlarına bağlı kalmak yerine kendi çalışma
              sistemini kurmak isteyen öğrencilerle çalışacağım.
            </motion.p>
            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="font-nunito text-[#334155] text-lg leading-relaxed">
              Çünkü çalışma düzeninin kişiye göre kurulması gerektiğine inanıyorum. Amacımız
              seni 14 günde sınava hazırlamak değil; kendi çalışma düzenini kurmanı ve bu
              düzeni sürdürebilecek temeli oluşturmanı sağlamak.
            </motion.p>
          </div>
        </section>

        {/* ── Hedeflenen Çıktılar ── */}
        <section className="py-16 px-6" style={{ background: "#F8F7FC" }}>
          <div className="max-w-[820px] mx-auto">
            <motion.div {...fadeUp}>
              <SectionTitle>Hedeflenen Çıktılar</SectionTitle>
            </motion.div>
            <div className="grid gap-4 md:grid-cols-2">
              {CIKTILAR.map((c, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-[#ECEAF5] flex items-start gap-3"
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold mt-0.5"
                    style={{ width: 22, height: 22, background: "#ede8fa", color: "#1C1B8A" }}
                  >
                    <FaCheck size={10} />
                  </span>
                  <p className="font-nunito text-[#334155] text-[15px] leading-relaxed m-0">
                    <strong className="text-page-navy">{c.bold}</strong> {c.rest}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kimin İçin ve Kimin İçin Değil ── */}
        <section className="py-16 px-6">
          <div className="max-w-[900px] mx-auto">
            <motion.div {...fadeUp}>
              <SectionTitle>Kimin için ve Kimin için değil</SectionTitle>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 }}
                className="rounded-[24px] p-7 border"
                style={{ background: "#FFF5F4", borderColor: "#FBD9D5" }}
              >
                <p className="font-fredoka font-bold text-[#B42318] text-base mb-4">Sana yardımcı olamam eğer…</p>
                <ul className="space-y-3 list-none p-0 m-0">
                  {DEGIL_LISTESI.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 font-nunito text-[#7A271A] text-sm leading-relaxed">
                      <FaTimes size={12} className="flex-shrink-0 mt-1" />
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="rounded-[24px] p-7 border"
                style={{ background: "#F1FBF6", borderColor: "#BFE8D2" }}
              >
                <p className="font-fredoka font-bold text-[#166534] text-base mb-4">Ama eğer…</p>
                <ul className="space-y-3 list-none p-0 m-0">
                  {EGER_LISTESI.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 font-nunito text-[#14532D] text-sm leading-relaxed">
                      <FaCheck size={12} className="flex-shrink-0 mt-1" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="font-nunito font-bold text-[#14532D] text-sm mt-4 pt-4 border-t border-[#BFE8D2]">
                  Kurduğun sistemi 14 gün boyunca gerçekten uygulamaya hazırsan, bu program senin için.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Programda Birlikte Neler Yapacağız ── */}
        <section className="py-16 px-6" style={{ background: "#F8F7FC" }}>
          <div className="max-w-[820px] mx-auto">
            <motion.div {...fadeUp}>
              <SectionTitle>Programda Birlikte Neler Yapacağız</SectionTitle>
            </motion.div>
            <div className="space-y-4">
              {ADIMLAR.map((a, i) => (
                <motion.div
                  key={a.no}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.06 }}
                  className="bg-white rounded-[24px] p-7 border border-[#ECEAF5] flex gap-5 max-[560px]:flex-col"
                  style={{ boxShadow: "0 6px 20px rgba(28,27,138,0.05)" }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-2xl font-fredoka font-bold text-lg"
                    style={{ width: 48, height: 48, background: "#1C1B8A", color: "#D8FF4F" }}
                  >
                    {a.no}
                  </div>
                  <div className="flex-1">
                    <p className="font-fredoka font-bold text-page-navy text-lg mb-3">
                      Adım {a.no}: {a.baslik}
                    </p>
                    <p className="font-nunito text-[#334155] text-sm leading-relaxed mb-2">
                      <strong className="text-[#0f172a]">Amaç:</strong> {a.amac}
                    </p>
                    <p className="font-nunito text-[#334155] text-sm leading-relaxed mb-2">
                      <strong className="text-[#0f172a]">Uygulamalar:</strong> {a.uygulamalar}
                    </p>
                    <p className="font-nunito text-[#334155] text-sm leading-relaxed m-0">
                      <strong className="text-[#0f172a]">Çıktı:</strong> {a.cikti}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ödeme Süreci ve Planı ── */}
        <section className="py-16 px-6">
          <div className="max-w-[720px] mx-auto">
            <motion.div {...fadeUp}>
              <SectionTitle>Ödeme Süreci ve Planı</SectionTitle>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="rounded-[28px] p-8 text-white mb-6"
              style={{ background: "linear-gradient(135deg, #1C1B8A 0%, #2a1f9e 100%)" }}
            >
              <div className="flex items-end gap-2 mb-2">
                <span className="font-fredoka font-bold text-2xl" style={{ color: "rgba(255,255,255,0.7)" }}>₺</span>
                <span className="font-fredoka font-bold leading-none" style={{ fontSize: 52 }}>1.250</span>
                <span className="font-nunito font-bold text-sm mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>tek çekim</span>
              </div>
              <p className="font-nunito text-sm m-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                Program yatırımı 1.250 TL'dir ve ödeme tek çekim olarak yapılır.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="space-y-4">
              <p className="font-nunito text-[#334155] text-base leading-relaxed">
                Bu, uzun süreli bir koçluk paketi değil; 14 gün boyunca uygulayabileceğin kısa
                ve butik bir programdır. İçeriğinde kısa eğitim videoları, uygulama
                materyalleri ve 14 günlük WhatsApp soru-cevap desteği bulunur.
              </p>
              <p className="font-nunito text-[#475569] text-sm leading-relaxed bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                Program dijital içerik ve destek süreci içerdiği için <strong>iade garantisi sunulmaz.</strong>{" "}
                Süreçte bir problem yaşarsan konu Sözderece ekibi tarafından değerlendirilir ve
                çözüm odaklı destek sağlanır.
              </p>
              <p className="font-nunito text-[#475569] text-sm leading-relaxed bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                Bu program belirli bir net artışı, sıralama veya akademik başarı garantisi
                vermez. Alacağın sonuç, sistemi ne kadar uyguladığına bağlıdır.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="max-w-[360px] mx-auto mt-8">
              <CtaButton phase={phase} now={now} size="lg" />
            </motion.div>
          </div>
        </section>

        {/* ── Kapanış ve Yönlendirme ── */}
        <section className="py-20 px-6" style={{ background: "#1C1B8A" }}>
          <div className="max-w-[640px] mx-auto text-center">
            <motion.p {...fadeUp} className="font-nunito text-white/85 text-base leading-relaxed mb-2">
              Hazır bir çalışma programının sana verilmesini değil,{" "}
              <strong className="text-white">kendi çalışma düzenini kurmayı ve 14 gün boyunca uygulamayı</strong>{" "}
              istiyorsan sonraki adımın net:
            </motion.p>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="font-fredoka font-bold text-white text-xl leading-snug mb-8"
            >
              Web sitemizdeki program sayfasına git ve "Programa Katıl" butonuna tıkla.
            </motion.p>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="max-w-[360px] mx-auto">
              <CtaButton phase={phase} now={now} size="lg" />
            </motion.div>

            <motion.a
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              href="https://wa.me/905312546701?text=14%20G%C3%BCnl%C3%BCk%20Program%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-nunito font-bold text-sm text-white/70 hover:text-white mt-6 no-underline transition-colors"
            >
              <FaWhatsapp size={15} /> Sorun mu var? WhatsApp'tan sor
            </motion.a>
          </div>
        </section>
      </main>
    </div>
  );
}
