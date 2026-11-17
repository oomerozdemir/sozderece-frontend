import { useCallback, useEffect, useRef, useState } from "react";
import { COACH_TOUR_STEPS, FINISH_STEP } from "./coachTourSteps";

// sessionStorage anahtarları — öğrenci turunun "sd_tour_*" namespace'iyle
// çakışmasın diye ayrı önek (bkz. plan K3).
const KEY_AUTO_PROMPTED = "sd_coach_tour_auto_prompted";
const KEY_DISMISSED = "sd_coach_tour_dismissed";
const KEY_RUNNING = "sd_coach_tour_running";
const KEY_STEP = "sd_coach_tour_step";

const TARGET_WAIT_MS = 4000;

const readSession = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeSession = (key, value) => {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* sessionStorage kullanılamıyorsa tur yine çalışır, yalnızca resume/dismiss hafızası olmaz */
  }
};

function clearRunState() {
  writeSession(KEY_RUNNING, null);
  writeSession(KEY_STEP, null);
}

// usePanelTour.js'teki AYNI hedef-çözümleme mantığı (bkz. o dosyadaki
// gerekçe notları) — koç turu için birebir aynı iki sebepten gerekiyor.
function resolveTarget(step) {
  for (const sel of step.targets) {
    const matches = document.querySelectorAll(sel);
    for (const el of matches) {
      if (el.getClientRects().length > 0) return el;
    }
  }
  return null;
}

function waitForTarget(step, { signal }) {
  return new Promise((resolve) => {
    const immediate = resolveTarget(step);
    if (immediate) return resolve(immediate);

    let settled = false;
    const finish = (el) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      resolve(el);
    };

    const observer = new MutationObserver(() => {
      const el = resolveTarget(step);
      if (el) finish(el);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    const timer = setTimeout(() => finish(null), TARGET_WAIT_MS);
    signal.addEventListener("abort", () => finish(null), { once: true });
  });
}

const dashboardSteps = COACH_TOUR_STEPS.filter((s) => s.page === "dashboard");
const dashboardOnlySteps = dashboardSteps.filter((s) => !s.isNavigationStep);

// Bir çalıştırmanın GERÇEK son adımı — koçun öğrencisi varsa global son adım
// ("notes"), yoksa dashboard'un son GERÇEK adımı ("status-cards"; "open-
// student" öğrenci olmadan asla ulaşılabilir değil).
function getEffectiveLastStep(hasStudents) {
  return hasStudents ? COACH_TOUR_STEPS[COACH_TOUR_STEPS.length - 1] : dashboardOnlySteps.slice(-1)[0];
}

/**
 * Koç Paneli Turu state machine — usePanelTour.js'in aynı iskeleti, iki
 * farkla: (1) iki BAĞIMSIZ mount noktası var (CoachDashboard.jsx ve
 * StudentWorkspace.jsx), state sessionStorage ÜZERİNDEN paylaşılıyor, ayrı
 * bir Context/Provider YOK (bkz. plan K5); (2) `coachTourCompletedVersion`
 * backend'den 3 durumlu geliyor (null/0/1) — `page==="workspace"` mount'u,
 * `completedVersion===0` ise (koçun hiç öğrencisi yokken dashboard bölümü
 * görülmüş, workspace bölümü bekliyor) kendi başına, Welcome GÖSTERMEDEN
 * doğrudan RUNNING'e geçip 4. adımdan (ilk workspace adımı) başlar (bkz.
 * plan K6). SADECE `page==="dashboard"` mount'u WELCOME fazına karar
 * verebilir.
 *
 * `page`: "dashboard" | "workspace" — bu mount'un hangi adımları
 * ÇÖZÜMLEMEYE çalışacağını belirler (diğer sayfaya ait bir adım index'i
 * gelirse bu hook hiçbir şey render etmez, navigasyonun gerçekleşmesini
 * bekler).
 * `hasStudents`: sadece page="dashboard" için anlamlı — false ise "open-
 * student" ve tüm workspace adımları bu çalıştırmadan dışlanır.
 * `onNavigateToStudent`: "open-student" adımının "İleri" yerine özel
 * davranışı — sessionStorage'a BİR SONRAKİ (workspace) adımı yazıp hemen
 * çağrılır; StudentWorkspace.jsx mount olduğunda kendi init'i bu kayıtlı
 * adımdan devam eder (route-change-resume, bkz. plan K5).
 * `tab`/`setTab`: sadece page="workspace" için anlamlı, StudentWorkspace'in
 * kendi ham (guard'sız) state'i.
 * `coachTourCompletedVersion`, `onPersistStage(stage)`: backend senkronu.
 */
export default function useCoachTour({
  page,
  hasStudents = false,
  onNavigateToStudent,
  tab,
  setTab,
  coachTourCompletedVersion,
  onPersistStage,
  manualStartSignal,
}) {
  const [phase, setPhase] = useState("NOT_STARTED");
  const [stepIndex, setStepIndex] = useState(0);
  const [targetEl, setTargetEl] = useState(null);
  const [rectVersion, setRectVersion] = useState(0);
  const [finishedWithStudents, setFinishedWithStudents] = useState(true);

  const initRef = useRef(false);
  const abortRef = useRef(null);
  const prevManualSignalRef = useRef(manualStartSignal);

  const totalSteps = hasStudents ? COACH_TOUR_STEPS.length : dashboardOnlySteps.length;

  // ── İlk karar ──
  useEffect(() => {
    if (coachTourCompletedVersion === undefined || initRef.current) return;
    initRef.current = true;

    const dismissed = readSession(KEY_DISMISSED) === "1";
    const autoPrompted = readSession(KEY_AUTO_PROMPTED) === "1";
    const running = readSession(KEY_RUNNING) === "1";
    const savedStep = readSession(KEY_STEP);
    const savedIdx = savedStep != null ? parseInt(savedStep, 10) : null;
    const savedStepBelongsHere = savedIdx != null && COACH_TOUR_STEPS[savedIdx]?.page === page;

    // Aynı oturumda refresh/route-change — kayıtlı adım BU sayfaya aitse devam.
    if (running && savedStepBelongsHere) {
      setStepIndex(savedIdx);
      setPhase("RUNNING");
      return;
    }

    if (page === "dashboard") {
      if (coachTourCompletedVersion === null && !dismissed && !autoPrompted) {
        writeSession(KEY_AUTO_PROMPTED, "1");
        setPhase("WELCOME");
        return;
      }
    } else if (page === "workspace") {
      // Dashboard bölümü görülmüş, workspace bekliyordu — Welcome GÖSTERMEDEN
      // doğrudan ilk workspace adımından devam (bkz. plan K6).
      if (coachTourCompletedVersion === 0 && !dismissed && !autoPrompted) {
        writeSession(KEY_AUTO_PROMPTED, "1");
        const firstWorkspaceIdx = COACH_TOUR_STEPS.findIndex((s) => s.page === "workspace");
        writeSession(KEY_RUNNING, "1");
        writeSession(KEY_STEP, String(firstWorkspaceIdx));
        setStepIndex(firstWorkspaceIdx);
        setPhase("RUNNING");
        return;
      }
    }

    setPhase("NOT_STARTED");
  }, [coachTourCompletedVersion, page]);

  // ── Manuel "Tekrar Başlat" (sadece dashboard'da erişilebilir) ──
  useEffect(() => {
    if (manualStartSignal === prevManualSignalRef.current) return;
    prevManualSignalRef.current = manualStartSignal;
    writeSession(KEY_RUNNING, "1");
    writeSession(KEY_STEP, "0");
    setStepIndex(0);
    setPhase("RUNNING");
  }, [manualStartSignal]);

  const startTour = useCallback(() => {
    writeSession(KEY_RUNNING, "1");
    writeSession(KEY_STEP, "0");
    setStepIndex(0);
    setPhase("RUNNING");
  }, []);

  const dismiss = useCallback(() => {
    clearRunState();
    writeSession(KEY_DISMISSED, "1");
    setPhase("DISMISSED_SESSION");
  }, []);

  const finishTour = useCallback(() => {
    clearRunState();
    setPhase("COMPLETED");
    if (FINISH_STEP.destinationTab && setTab) setTab(FINISH_STEP.destinationTab);
    onPersistStage?.("full");
  }, [setTab, onPersistStage]);

  // Öğrencisi olmayan koçun dashboard-only Bitiş ekranının CTA'sı — TAM
  // değil, sadece "0" (workspace bölümü beklemede, bkz. plan K6).
  const finishPending = useCallback(() => {
    clearRunState();
    setPhase("COMPLETED");
    onPersistStage?.(0);
  }, [onPersistStage]);

  const nextStep = useCallback(() => {
    const step = COACH_TOUR_STEPS[stepIndex];

    // "open-student" adımı: normal increment YERİNE workspace'in İLK adımını
    // sessionStorage'a yazıp navigasyonu tetikler — bu component az sonra
    // unmount olacağı için kendi stepIndex state'ini ileri almaya gerek yok.
    if (step?.isNavigationStep) {
      const nextIdx = stepIndex + 1;
      writeSession(KEY_RUNNING, "1");
      writeSession(KEY_STEP, String(nextIdx));
      onNavigateToStudent?.();
      return;
    }

    setStepIndex((i) => {
      // Bu çalıştırmanın GERÇEK son adımındaysak (bkz. getEffectiveLastStep) —
      // öğrenci yoksa "status-cards"ta, varsa "notes"ta — artık FINISHED'e
      // geçilir; COACH_TOUR_STEPS dizisinde "sonraki" teknik olarak var olsa
      // bile (ör. "open-student") bu çalıştırma için erişilebilir değildir.
      const atEffectiveLast = step?.id === getEffectiveLastStep(hasStudents)?.id;
      const next = i + 1;
      const nextBelongsHere = COACH_TOUR_STEPS[next]?.page === page;
      if (atEffectiveLast || next >= COACH_TOUR_STEPS.length || !nextBelongsHere) {
        setFinishedWithStudents(hasStudents);
        setPhase("FINISHED");
        return i;
      }
      writeSession(KEY_STEP, String(next));
      return next;
    });
  }, [stepIndex, page, hasStudents, onNavigateToStudent]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => {
      const prev = Math.max(0, i - 1);
      writeSession(KEY_STEP, String(prev));
      return prev;
    });
  }, []);

  // ── Hedef çözümleme ──
  useEffect(() => {
    if (phase !== "RUNNING") return;
    const step = COACH_TOUR_STEPS[stepIndex];
    if (!step || step.page !== page) return; // başka sayfaya ait adım — bu mount bekler

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (step.tab && setTab && step.tab !== tab) setTab(step.tab);

    setTargetEl(null);
    let cancelled = false;
    waitForTarget(step, { signal: controller.signal }).then((el) => {
      if (cancelled || controller.signal.aborted) return;
      if (!el) {
        nextStep();
        return;
      }
      el.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
      setTargetEl(el);
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIndex, page]);

  useEffect(() => {
    if (!targetEl) return;
    const recalc = () => setRectVersion((v) => v + 1);
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalc);
    };
  }, [targetEl]);

  const step = COACH_TOUR_STEPS[stepIndex];
  // Önceki adım BAŞKA bir sayfaya aitse (ör. workspace'in ilk adımından
  // dashboard'daki "open-student"a) "Geri" gösterilmez — cross-page geri
  // navigasyon yok, yalnızca ileri yönlü "open-student" navigasyonu var.
  const hasPrev = stepIndex > 0 && COACH_TOUR_STEPS[stepIndex - 1]?.page === page;
  const stepNumber = hasStudents
    ? stepIndex + 1
    : dashboardOnlySteps.findIndex((s) => s.id === step?.id) + 1;
  // Son adım, "Bitir" (mevcut öğrenci motoruyla aynı anlamda) — koçun o an
  // öğrencisi olup olmamasına göre "son" farklı bir adımdır (bkz. nextStep).
  const isLast = step?.id === getEffectiveLastStep(hasStudents)?.id;

  return {
    phase,
    stepIndex,
    stepNumber,
    totalSteps,
    step,
    hasPrev,
    isLast,
    targetEl,
    rectVersion,
    finishedWithStudents,
    startTour,
    dismiss,
    nextStep,
    prevStep,
    finishTour,
    finishPending,
  };
}

