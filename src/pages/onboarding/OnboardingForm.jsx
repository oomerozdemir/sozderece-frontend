import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingShell, { OnboardingLoading } from "../../components/OnboardingShell";
import useOnboarding, { saveOnboarding, completeOnboardingForm } from "../../hooks/useOnboarding";

// Cevap değerleri sabit kodlu; ekranda gösterilen etiketler.
const OPTION_LABELS = { ogrenci: "Öğrenciyim", veli: "Veliyim" };
const optionLabel = (o) => OPTION_LABELS[o] || o;
const isCoreSingle = (key) => key === "respondent" || key === "exam";

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
  const form = data?.form;
  const total = form?.steps?.length || 1;

  const [answers, setAnswers] = useState(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef(null);

  // Kaydedilmiş cevaplar + hesaptan bilinenler (ad, telefon vb.) — kayıtlı cevap
  // her zaman önceliklidir, tamamlanmış bir formda hiçbir şey sıfırlanmaz.
  useEffect(() => {
    if (loading) return;
    if (!ob || !form) {
      navigate("/student/dashboard", { replace: true });
      return;
    }
    if (answers !== null) return;
    const pre = data.prefill || {};
    setAnswers({
      fullName: pre.fullName || "",
      phone: pre.phone || "",
      exam: pre.exam || "",
      field: pre.field || "",
      ...(ob.answers || {}),
    });
    setStep(Math.min(total, Math.max(1, ob.currentStep || 1)));
  }, [loading, ob, form, data, answers, total, navigate]);

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
  // Sınav değişince, sınava özel (YKS/LGS) seçmeli soruların eski cevapları temizlenir.
  const setExam = (exam) => {
    if (exam === a.exam) return;
    const patch = { exam };
    form.steps.forEach((st) =>
      st.questions.forEach((q) => {
        if (q.exam && (q.type === "single" || q.type === "multi")) patch[q.key] = q.type === "multi" ? [] : "";
      })
    );
    set(patch);
  };

  const visible = (st) => st.questions.filter((q) => !q.exam || q.exam === a.exam);
  const filled = (q) => (Array.isArray(a[q.key]) ? a[q.key].length > 0 : !!String(a[q.key] || "").trim());
  const stepError = (st) => {
    for (const q of visible(st)) {
      if (!q.required) continue;
      if (q.key === "phone" ? String(a.phone || "").replace(/\D/g, "").length < 10 : !filled(q)) {
        return `“${q.label}” zorunlu.`;
      }
    }
    return "";
  };

  const persist = (nextStep) => saveOnboarding(nextStep, a);

  const next = async () => {
    const err = stepError(form.steps[step - 1]);
    if (err) {
      setError(err);
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
    for (let i = 0; i < form.steps.length; i += 1) {
      const err = stepError(form.steps[i]);
      if (err) {
        setStep(i + 1);
        setError(err);
        return;
      }
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

  if (loading || !ob || !form || answers === null) return <OnboardingLoading />;

  const st = form.steps[step - 1];
  const pct = (step / total) * 100;
  const isLast = step === total;

  const renderQuestion = (q, idx) => {
    const val = a[q.key];
    const labelEl = <Label hint={q.hint}>{q.label}{q.required ? " *" : ""}</Label>;
    let control = null;
    if (q.type === "text" || q.type === "tel") {
      control = (
        <input
          className={inputCls}
          type={q.type === "tel" ? "tel" : "text"}
          inputMode={q.type === "tel" ? "tel" : undefined}
          maxLength={200}
          value={val || ""}
          onChange={(e) => set({ [q.key]: e.target.value })}
          autoComplete={q.key === "fullName" ? "name" : q.key === "phone" ? "tel" : "off"}
        />
      );
    } else if (q.type === "textarea") {
      control = <textarea className={inputCls} rows={3} maxLength={1500} value={val || ""} onChange={(e) => set({ [q.key]: e.target.value })} />;
    } else if (q.type === "single") {
      const two = q.options.length <= 4 && q.options.every((o) => optionLabel(o).length <= 16);
      control = (
        <ChoiceGrid cols={two ? 2 : 1}>
          {q.options.map((o) => (
            <Choice
              key={o}
              selected={val === o}
              onClick={() => (q.key === "exam" ? setExam(o) : set({ [q.key]: val === o && !isCoreSingle(q.key) ? "" : o }))}
            >
              {optionLabel(o)}
            </Choice>
          ))}
        </ChoiceGrid>
      );
    } else if (q.type === "multi") {
      const otherKey = `${q.key}Other`;
      control = (
        <>
          <ChoiceGrid>
            {q.options.map((o) => (
              <Choice key={o} multi selected={(val || []).includes(o)} onClick={() => toggle(q.key, o)}>{o}</Choice>
            ))}
          </ChoiceGrid>
          {q.options.includes("Diğer") && (val || []).includes("Diğer") && (
            <textarea className={`${inputCls} mt-2.5`} rows={2} maxLength={300} placeholder="Kısaca anlat…" value={a[otherKey] || ""} onChange={(e) => set({ [otherKey]: e.target.value })} />
          )}
        </>
      );
    }
    return (
      <div key={`${q.key}-${q.exam || "all"}-${idx}`}>
        {labelEl}
        {control}
      </div>
    );
  };

  return (
    <OnboardingShell wide>
      <div ref={topRef} style={{ scrollMarginTop: 12 }} />
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2.5">
          <div className="font-fredoka font-bold text-page-navy text-[18px]">{st.title}</div>
          <div className="font-nunito font-bold text-[13px] text-[#8B87A6]">Adım {step} / {total}</div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#E4E1F0" }} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1C1B8A, #7340C8)" }} />
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-5 md:p-8" style={{ border: "1px solid #ECEAF5", boxShadow: "0 16px 44px rgba(28,27,138,0.08)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">
            <div>
              {st.heading && <h2 className="font-fredoka font-bold text-page-navy text-2xl m-0 mb-1.5">{st.heading}</h2>}
              {st.description && <p className="text-[#64748b] text-[15px] leading-relaxed m-0">{st.description}</p>}
            </div>

            {visible(st).map(renderQuestion)}

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
                onClick={isLast ? finish : next}
                disabled={busy}
                className="flex-1 py-4 rounded-2xl font-fredoka font-bold text-[17px] border-0 cursor-pointer disabled:opacity-60"
                style={isLast ? { background: "#D8FF4F", color: "#0D0A2E", boxShadow: "0 8px 24px rgba(216,255,79,0.35)" } : { background: "#1C1B8A", color: "#D8FF4F" }}
              >
                {busy ? "Kaydediliyor…" : isLast ? "Tanışma Formumu Tamamla →" : "Devam Et →"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </OnboardingShell>
  );
}
