import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingShell, { OnboardingLoading } from "../../components/OnboardingShell";
import useOnboarding, { saveOnboarding, completeOnboardingForm } from "../../hooks/useOnboarding";

// Seçenek metinleri sunucudaki whitelist (utils/onboarding.js) ile birebir aynı.
const CHALLENGES = [
  "Nereden başlayacağımı bilmiyorum",
  "Program yapıyorum ama sürdüremiyorum",
  "Günümü planlamakta zorlanıyorum",
  "Düzenli çalışamıyorum",
  "Eksiklerimi nasıl kapatacağımı bilmiyorum",
  "Zorlandığım dersleri erteliyorum",
  "Deneme sonuçlarımı nasıl değerlendireceğimi bilmiyorum",
  "Çalışıyorum ama doğru ilerlediğimden emin değilim",
  "Diğer",
];
const ROUTINES = ["Düzenli çalışıyorum", "Bazen düzenli çalışıyorum", "Oldukça dağınık ilerliyorum", "Henüz bir çalışma düzenim yok"];
const DAILY_HOURS = ["Henüz düzenli çalışmıyorum", "1 saatten az", "1–2 saat", "2–4 saat", "4 saat+"];
const SUPPORTS = [
  "Bana uygun çalışma programı",
  "Düzenli takip",
  "Zaman yönetimi",
  "Deneme analizi",
  "Eksiklerimi belirleme",
  "Çalışma düzeni oluşturma",
  "Zorlandığım dersleri yönetme",
  "Süreç boyunca yönlendirilme",
];
const YKS_GRADES = ["12. sınıf", "Mezun", "Diğer"];
const LGS_GRADES = ["5. sınıf", "6. sınıf", "7. sınıf", "8. sınıf"];
const FIELDS = ["Sayısal", "Eşit Ağırlık", "Sözel", "Dil"];

const STEP_TITLES = ["Seni Tanıyalım", "Hedefin", "Şu An Neredesin?", "Koçun Seni Tanısın"];

const inputCls =
  "w-full px-4 py-3.5 rounded-2xl border border-[#e2e8f0] outline-none text-[16px] text-[#0f172a] bg-white focus:border-page-navy transition-colors";

function Label({ children, hint }) {
  return (
    <div className="mb-2.5">
      <div className="font-fredoka font-bold text-[15px] text-page-navy">{children}</div>
      {hint && <div className="text-[13px] text-[#94a3b8] mt-0.5">{hint}</div>}
    </div>
  );
}

// Büyük dokunma alanlı seçenek (tek ya da çoklu seçim).
function Choice({ selected, onClick, children, multi = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border cursor-pointer transition-colors"
      style={{
        background: selected ? "#EEEEFB" : "#fff",
        borderColor: selected ? "#1C1B8A" : "#e2e8f0",
        color: "#0f172a",
      }}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
        style={{
          width: 22,
          height: 22,
          borderRadius: multi ? 7 : 999,
          background: selected ? "#1C1B8A" : "#fff",
          border: selected ? "none" : "2px solid #cbd5e1",
          color: "#D8FF4F",
        }}
      >
        {selected ? "✓" : ""}
      </span>
      <span className="text-[15px] font-semibold leading-snug">{children}</span>
    </button>
  );
}

function ChoiceGrid({ children, cols = 1 }) {
  return <div className={`grid gap-2.5 ${cols === 2 ? "grid-cols-2 max-[380px]:grid-cols-1" : "grid-cols-1"}`}>{children}</div>;
}

export default function OnboardingForm() {
  const navigate = useNavigate();
  const { loading, data } = useOnboarding();
  const ob = data?.onboarding;

  const [answers, setAnswers] = useState(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef(null);

  // Kaydedilmiş cevaplar + hesaptan bilinenler (ad, telefon vb.) — kayıtlı cevap
  // her zaman önceliklidir, tamamlanmış bir formda hiçbir şey sıfırlanmaz.
  useEffect(() => {
    if (loading) return;
    if (!ob) {
      navigate("/student/dashboard", { replace: true });
      return;
    }
    if (answers !== null) return;
    const pre = data.prefill || {};
    const saved = ob.answers || {};
    setAnswers({
      fullName: pre.fullName || "",
      phone: pre.phone || "",
      exam: pre.exam || "",
      field: pre.field || "",
      ...saved,
    });
    setStep(Math.min(4, Math.max(1, ob.currentStep || 1)));
  }, [loading, ob, data, answers, navigate]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const a = useMemo(() => answers || {}, [answers]);
  const set = (patch) => {
    setError("");
    setAnswers((prev) => ({ ...prev, ...patch }));
  };
  const toggle = (key, value) => {
    const cur = Array.isArray(a[key]) ? a[key] : [];
    set({ [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] });
  };
  const setExam = (exam) => {
    if (exam === a.exam) return;
    set({ exam, grade: "", field: "", targetSchool: a.targetSchool, targetRank: "" });
  };

  const step1Errors = useMemo(() => {
    const e = [];
    if (!a.fullName || a.fullName.trim().length < 3) e.push("Ad soyad yaz.");
    if (!a.phone || a.phone.replace(/\D/g, "").length < 10) e.push("Geçerli bir telefon numarası yaz.");
    if (!a.respondent) e.push("Öğrenci mi veli mi olduğunu seç.");
    if (!a.exam) e.push("Hazırlandığın sınavı seç.");
    return e;
  }, [a]);

  const persist = async (nextStep) => {
    await saveOnboarding(nextStep, a);
  };

  const next = async () => {
    if (step === 1 && step1Errors.length) {
      setError(step1Errors[0]);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await persist(step + 1);
      setStep(step + 1);
    } catch {
      setError("Kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.");
    } finally {
      setBusy(false);
    }
  };

  const back = async () => {
    setBusy(true);
    try {
      await persist(step - 1);
    } catch {
      // geri dönüşte kayıt hatası kullanıcıyı engellemesin
    } finally {
      setStep(step - 1);
      setBusy(false);
    }
  };

  const finish = async () => {
    if (step1Errors.length) {
      setStep(1);
      setError(step1Errors[0]);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await completeOnboardingForm(a);
      navigate("/onboarding/tamamlandi");
    } catch {
      setError("Form gönderilemedi. Lütfen tekrar dene.");
      setBusy(false);
    }
  };

  if (loading || !ob || answers === null) return <OnboardingLoading />;

  const isLgs = a.exam === "LGS";
  const pct = (step / 4) * 100;

  return (
    <OnboardingShell wide>
      <div ref={topRef} style={{ scrollMarginTop: 12 }} />
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2.5">
          <div className="font-fredoka font-bold text-page-navy text-[18px]">{STEP_TITLES[step - 1]}</div>
          <div className="font-nunito font-bold text-[13px] text-[#8B87A6]">Adım {step} / 4</div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#E4E1F0" }} role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1C1B8A, #7340C8)" }} />
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-5 md:p-8" style={{ border: "1px solid #ECEAF5", boxShadow: "0 16px 44px rgba(28,27,138,0.08)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">
            {step === 1 && (
              <>
                <div>
                  <h2 className="font-fredoka font-bold text-page-navy text-2xl m-0 mb-1.5">Önce seni tanıyalım.</h2>
                  <p className="text-[#64748b] text-[15px] leading-relaxed m-0">
                    Bu bilgiler koçunun seni ve sınav sürecini daha iyi tanımasına yardımcı olacak.
                  </p>
                </div>
                <div>
                  <Label>Ad Soyad</Label>
                  <input className={inputCls} value={a.fullName || ""} onChange={(e) => set({ fullName: e.target.value })} autoComplete="name" />
                </div>
                <div>
                  <Label hint="Koçun sana buradan ulaşacak.">Telefon / WhatsApp numarası</Label>
                  <input className={inputCls} type="tel" inputMode="tel" placeholder="05XX XXX XX XX" value={a.phone || ""} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" />
                </div>
                <div>
                  <Label>Öğrenci misin / Veli misin?</Label>
                  <ChoiceGrid cols={2}>
                    <Choice selected={a.respondent === "ogrenci"} onClick={() => set({ respondent: "ogrenci" })}>Öğrenciyim</Choice>
                    <Choice selected={a.respondent === "veli"} onClick={() => set({ respondent: "veli" })}>Veliyim</Choice>
                  </ChoiceGrid>
                </div>
                <div>
                  <Label>Hangi sınava hazırlanıyorsun?</Label>
                  <ChoiceGrid cols={2}>
                    <Choice selected={a.exam === "YKS"} onClick={() => setExam("YKS")}>YKS</Choice>
                    <Choice selected={a.exam === "LGS"} onClick={() => setExam("LGS")}>LGS</Choice>
                  </ChoiceGrid>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="font-fredoka font-bold text-page-navy text-2xl m-0 mb-1.5">Nereye ulaşmak istiyorsun?</h2>
                  <p className="text-[#64748b] text-[15px] leading-relaxed m-0">Net bir hedefin yoksa sorun değil, boş bırakabilirsin.</p>
                </div>
                <div>
                  <Label>{isLgs ? "Sınıf" : "Sınıf / durum"}</Label>
                  <ChoiceGrid cols={2}>
                    {(isLgs ? LGS_GRADES : YKS_GRADES).map((g) => (
                      <Choice key={g} selected={a.grade === g} onClick={() => set({ grade: a.grade === g ? "" : g })}>{g}</Choice>
                    ))}
                  </ChoiceGrid>
                </div>
                {!isLgs && (
                  <div>
                    <Label>Alan</Label>
                    <ChoiceGrid cols={2}>
                      {FIELDS.map((f) => (
                        <Choice key={f} selected={a.field === f} onClick={() => set({ field: a.field === f ? "" : f })}>{f}</Choice>
                      ))}
                    </ChoiceGrid>
                  </div>
                )}
                <div>
                  <Label hint="Opsiyonel">{isLgs ? "Hedeflediğin lise/liseler var mı?" : "Hedeflediğin bölüm / üniversite var mı?"}</Label>
                  <textarea className={inputCls} rows={3} maxLength={300} value={a.targetSchool || ""} onChange={(e) => set({ targetSchool: e.target.value })} />
                </div>
                <div>
                  <Label hint="Opsiyonel">{isLgs ? "Hedef puanın veya yüzdelik dilimin varsa yaz." : "Hedef sıralaman varsa yaz."}</Label>
                  <input className={inputCls} maxLength={100} value={a.targetRank || ""} onChange={(e) => set({ targetRank: e.target.value })} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h2 className="font-fredoka font-bold text-page-navy text-2xl m-0 mb-1.5">Şimdi başlangıç noktanı anlayalım.</h2>
                </div>
                <div>
                  <Label hint="Birden fazla seçebilirsin.">Şu anda sınav sürecinde seni en çok zorlayan şeyler neler?</Label>
                  <ChoiceGrid>
                    {CHALLENGES.map((c) => (
                      <Choice key={c} multi selected={(a.challenges || []).includes(c)} onClick={() => toggle("challenges", c)}>{c}</Choice>
                    ))}
                  </ChoiceGrid>
                  {(a.challenges || []).includes("Diğer") && (
                    <textarea className={`${inputCls} mt-2.5`} rows={2} maxLength={300} placeholder="Kısaca anlat…" value={a.challengesOther || ""} onChange={(e) => set({ challengesOther: e.target.value })} />
                  )}
                </div>
                <div>
                  <Label>Şu an çalışma düzenini nasıl tanımlarsın?</Label>
                  <ChoiceGrid>
                    {ROUTINES.map((r) => (
                      <Choice key={r} selected={a.routine === r} onClick={() => set({ routine: a.routine === r ? "" : r })}>{r}</Choice>
                    ))}
                  </ChoiceGrid>
                </div>
                <div>
                  <Label>Günde ortalama ne kadar çalışıyorsun?</Label>
                  <ChoiceGrid>
                    {DAILY_HOURS.map((h) => (
                      <Choice key={h} selected={a.dailyHours === h} onClick={() => set({ dailyHours: a.dailyHours === h ? "" : h })}>{h}</Choice>
                    ))}
                  </ChoiceGrid>
                </div>
                <div>
                  <Label hint="Opsiyonel">{isLgs ? "Son denemenin puanı / neti" : "Son deneme netin veya sıralaman"}</Label>
                  <input className={inputCls} maxLength={200} value={a.lastExam || ""} onChange={(e) => set({ lastExam: e.target.value })} />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div>
                  <h2 className="font-fredoka font-bold text-page-navy text-2xl m-0 mb-1.5">Son olarak, koçunun seni biraz daha tanımasına yardım et.</h2>
                </div>
                <div>
                  <Label hint="Birden fazla seçebilirsin.">Koçluktan en çok hangi konularda destek almak istiyorsun?</Label>
                  <ChoiceGrid>
                    {SUPPORTS.map((s) => (
                      <Choice key={s} multi selected={(a.supports || []).includes(s)} onClick={() => toggle("supports", s)}>{s}</Choice>
                    ))}
                  </ChoiceGrid>
                </div>
                <div>
                  <Label hint="Çalışma alışkanlığın, okul programın, zorlandığın bir durum veya süreçten beklentin olabilir. (Opsiyonel)">
                    Koçunun senin hakkında mutlaka bilmesini istediğin bir şey var mı?
                  </Label>
                  <textarea className={inputCls} rows={5} maxLength={1500} value={a.note || ""} onChange={(e) => set({ note: e.target.value })} />
                </div>
              </>
            )}

            {error && <p className="text-[#dc2626] text-[14px] font-semibold m-0" role="alert">{error}</p>}

            <div className="flex gap-3 pt-1">
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  disabled={busy}
                  className="px-5 py-4 rounded-2xl font-fredoka font-bold text-[16px] cursor-pointer disabled:opacity-50"
                  style={{ background: "#fff", color: "#1C1B8A", border: "1.5px solid #D6D6F5" }}
                >
                  ← Geri
                </button>
              )}
              <button
                type="button"
                onClick={step < 4 ? next : finish}
                disabled={busy}
                className="flex-1 py-4 rounded-2xl font-fredoka font-bold text-[17px] border-0 cursor-pointer disabled:opacity-60"
                style={step < 4 ? { background: "#1C1B8A", color: "#D8FF4F" } : { background: "#D8FF4F", color: "#0D0A2E", boxShadow: "0 8px 24px rgba(216,255,79,0.35)" }}
              >
                {busy ? "Kaydediliyor…" : step < 4 ? "Devam Et →" : "Tanışma Formumu Tamamla →"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </OnboardingShell>
  );
}
