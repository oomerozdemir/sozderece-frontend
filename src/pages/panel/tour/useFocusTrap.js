import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Projede hiçbir mevcut modalde (NewExamChoiceModal.jsx, RefundModal.jsx)
// focus-trap/ARIA yok — Panel Turu için küçük, özel bir hook. Dialog açıkken
// Tab/Shift+Tab son/ilk odaklanabilir elemanda döngü yapar, Escape'i dışarı
// bildirir, kapanınca odağı tetikleyen elemana geri verir.
export default function useFocusTrap({ active, onEscape }) {
  const containerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocusedRef.current = document.activeElement;

    const container = containerRef.current;
    const focusables = () => Array.from(container?.querySelectorAll(FOCUSABLE) || []);
    const first = focusables()[0];
    (first || container)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [active, onEscape]);

  return containerRef;
}
