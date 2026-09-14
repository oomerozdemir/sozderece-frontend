// Küçük, dosyasız "tatmin" sesleri — Web Audio API ile sentezleniyor, hiçbir
// ses dosyası indirmiyor/barındırmıyor. Bir görev "Bitti" işaretlendiğinde
// kısa bir "klik", günün tamamı bittiğinde (Z-Raporu anı) daha coşkulu bir
// "level up" arpeji çalar.

let ctx = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

function tone(audioCtx, freq, startAt, duration, gainPeak = 0.12, type = "sine") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainPeak, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

// Görev "Bitti" işaretlenince — kısa, tok bir çift-tık.
export function playTaskDoneSound() {
  try {
    const audioCtx = getCtx();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    tone(audioCtx, 880, now, 0.08, 0.1, "triangle");
    tone(audioCtx, 1318.5, now + 0.06, 0.12, 0.1, "triangle");
  } catch {
    // sessizce yut — ses tamamen opsiyonel bir "juice", akışı bozmamalı
  }
}

// Günün tüm görevleri bitince (Z-Raporu anı) — küçük bir zafer arpeji.
export function playLevelUpSound() {
  try {
    const audioCtx = getCtx();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => tone(audioCtx, f, now + i * 0.09, 0.22, 0.09, "square"));
  } catch {
    // sessizce yut
  }
}
