import { useCallback, useEffect, useRef, useState } from "react";
import axios from "../../../utils/axios";
import { PANEL_TOUR_STEPS, FINISH_STEP } from "./panelTourSteps";

const FINISH_DESTINATION_TAB = FINISH_STEP.destinationTab;

// sessionStorage anahtarları — "sd_" öneki projede başka localStorage/
// sessionStorage anahtarlarıyla (sd_visitor_id vb.) tutarlı.
const KEY_AUTO_PROMPTED = "sd_tour_auto_prompted"; // StrictMode/remount bariyeri — kalıcı oturum bazlı
const KEY_DISMISSED = "sd_tour_dismissed"; // "Şimdilik Geç"/"Turu Kapat" — bu oturumda tekrar otomatik açılmasın
const KEY_RUNNING = "sd_tour_running"; // yalnızca aktif bir RUNNING varken step ile BİRLİKTE var
const KEY_STEP = "sd_tour_step"; // yalnızca refresh-resume amaçlı, RUNNING ile atomik set/clear edilir

const TARGET_WAIT_MS = 4000; // karar #4 — kısa sabit süreye güvenilmez, veri çeken sekmeler için üst sınır
const MOBILE_QUERY = "(max-width: 767px)";

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
    /* sessionStorage kullanılamıyorsa (gizli sekme vb.) tur yine de çalışır, yalnızca resume/dismiss hafızası olmaz */
  }
};

// "Şimdilik Geç" ve "Turu Kapat" ikisi de aynı temizliği yapar (karar #3):
// aktif-adım kaydı asla bir SONRAKİ otomatik welcome'a sızmasın.
function clearRunState() {
  writeSession(KEY_RUNNING, null);
  writeSession(KEY_STEP, null);
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;
}

// İki ayrı sebepten querySelector + offsetParent yeterli değil (ikisi de
// canlı testte yakalandı):
// 1) offsetParent, position:fixed elemanlarda spec gereği her zaman null
//    döner (gerçekten görünür olsa bile) — mobil alt navigasyon gibi
//    hedefler yanlışlıkla "görünmüyor" sayılıyordu. getClientRects().length
//    her konumlama türünde doğru çalışıyor (display:none zincirinde boş).
// 2) Aynı data-tour değeri masaüstü VE mobil'de aynı anda DOM'da olabilir
//    (ör. "tour-restart" butonu hem sidebar footer'da hem Diğer sheet'inde)
//    — querySelector yalnızca DOM'daki İLK eşleşmeyi döner, o görünmüyorsa
//    görünür ikinci eşleşmeyi hiç denemez. querySelectorAll ile TÜM
//    eşleşmeler aranır, ilk görünür olan kullanılır.
function resolveTarget(step) {
  for (const sel of step.targets) {
    const matches = document.querySelectorAll(sel);
    for (const el of matches) {
      if (el.getClientRects().length > 0) return el;
    }
  }
  return null;
}

// Hedef DOM'a girene kadar bekler — kısa polling yerine MutationObserver,
// üst sınır 4sn (karar #4: veri çeken sekmeler erken skip edilmesin).
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

/**
 * Panel Turu state machine: NOT_STARTED | WELCOME | RUNNING | COMPLETED | DISMISSED_SESSION.
 * `student` — StudentPanel.jsx'in zaten çektiği profil (panelTourCompletedAt dahil).
 * `tab`/`setTab`, `moreOpen`/`setMoreOpen` — StudentPanel.jsx'in paylaşılan state'i;
 * tur bunlar üzerinden sekme değiştirir, öğrencinin kendisi değil (karar #7).
 * `manualStartSignal` — değiştiğinde (artan sayaç) "Tekrar Başlat" tetiklenir.
 */
export default function usePanelTour({ student, tab, setTab, moreOpen, setMoreOpen, manualStartSignal }) {
  const [phase, setPhase] = useState("NOT_STARTED");
  const [stepIndex, setStepIndex] = useState(0);
  const [targetEl, setTargetEl] = useState(null);
  const [rectVersion, setRectVersion] = useState(0); // resize/scroll sonrası rect yeniden okunsun diye

  const initRef = useRef(false); // aynı mount ömründe çift-çağrıya karşı iç katman (StrictMode)
  const abortRef = useRef(null);
  const prevManualSignalRef = useRef(manualStartSignal);

  // ── İlk karar: otomatik Welcome mi, hiç mi ──
  useEffect(() => {
    if (!student || initRef.current) return;
    initRef.current = true;

    const hasCompleted = !!student.panelTourCompletedAt;
    const dismissed = readSession(KEY_DISMISSED) === "1";
    const autoPrompted = readSession(KEY_AUTO_PROMPTED) === "1";
    const running = readSession(KEY_RUNNING) === "1";
    const savedStep = readSession(KEY_STEP);

    if (!hasCompleted && running && savedStep != null) {
      // Aynı oturumda refresh — kayıtlı adımdan devam (yalnızca ikisi birlikteyken).
      const idx = Math.min(Math.max(parseInt(savedStep, 10) || 0, 0), PANEL_TOUR_STEPS.length - 1);
      setStepIndex(idx);
      setPhase("RUNNING");
      return;
    }

    if (!hasCompleted && !dismissed && !autoPrompted) {
      writeSession(KEY_AUTO_PROMPTED, "1"); // karar #2: kalıcı bariyer, senkron
      setPhase("WELCOME");
      return;
    }

    setPhase("NOT_STARTED");
  }, [student]);

  // ── Manuel "Tekrar Başlat" ──
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
    setMoreOpen(false);
    setPhase("DISMISSED_SESSION");
  }, [setMoreOpen]);

  // Son adımın "Bitir"i önce Bitiş ekranını açar (spec ADIM 10) — kalıcı
  // completion ve backend yazımı yalnızca o ekrandaki asıl CTA'ya
  // basıldığında olur (finishTour). Session'daki running/step kaydı bu
  // nedenle burada henüz TEMİZLENMEZ — Bitiş ekranı sırasında bir refresh
  // olursa son adıma güvenli şekilde geri döner (son tooltip tekrar gösterilir).
  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      const next = i + 1;
      if (next >= PANEL_TOUR_STEPS.length) {
        setMoreOpen(false);
        setPhase("FINISHED");
        return i;
      }
      writeSession(KEY_STEP, String(next));
      return next;
    });
  }, [setMoreOpen]);

  // Bitiş ekranındaki asıl CTA — kalıcı completion + backend yazımı + öğrenciyi
  // mantıklı default sekmeye (bugünkü görevler/ana ekran) götürür.
  const finishTour = useCallback(() => {
    clearRunState();
    setMoreOpen(false);
    setPhase("COMPLETED");
    if (FINISH_DESTINATION_TAB) setTab(FINISH_DESTINATION_TAB);
    axios
      .patch("/api/v1/ogrenci/me/tour-completed", {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .catch(() => {
        /* ağ hatası paneli bloklamaz — UI zaten COMPLETED, bir sonraki girişte backend hâlâ null dönerse tur tekrar teklif edilir, en kötü ihtimalle bu */
      });
  }, [setMoreOpen, setTab]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => {
      const prev = Math.max(0, i - 1);
      writeSession(KEY_STEP, String(prev));
      return prev;
    });
  }, []);

  // ── Hedef çözümleme: her adım değişiminde tab/sheet ayarla, DOM'u bekle ──
  useEffect(() => {
    if (phase !== "RUNNING") return;
    const step = PANEL_TOUR_STEPS[stepIndex];
    if (!step) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (step.tab && step.tab !== tab) setTab(step.tab);
    setMoreOpen(step.requiresMobileSheet && isMobileViewport());

    setTargetEl(null);
    let cancelled = false;
    waitForTarget(step, { signal: controller.signal }).then((el) => {
      if (cancelled || controller.signal.aborted) return;
      if (!el) {
        // Hedef bulunamadı (feature flag/koşullu gizli/gerçek hata) — crash
        // etmeden sonraki adıma geç.
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
  }, [phase, stepIndex]);

  // ── resize/orientation değişiminde rect yeniden hesaplansın ──
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

  return {
    phase,
    stepIndex,
    totalSteps: PANEL_TOUR_STEPS.length,
    step: PANEL_TOUR_STEPS[stepIndex],
    targetEl,
    rectVersion,
    startTour,
    dismiss,
    nextStep,
    prevStep,
    finishTour,
  };
}
