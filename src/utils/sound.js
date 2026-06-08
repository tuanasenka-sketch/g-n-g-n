/**
 * dayday — Sound Utility
 * Web Audio API ile harici dosya gerektirmeden ses üretir.
 * localStorage 'pref_sound' değerine göre açılıp kapatılır.
 */

let _audioCtx = null;

function getCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Safari / Chrome require resuming after user gesture
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
}

/** Returns true when the user has sound effects enabled */
export function isSoundEnabled() {
  return localStorage.getItem('pref_sound') !== 'false';
}

/**
 * Core function — plays an oscillator-based tone.
 * @param {number} frequency   Hz
 * @param {string} type        OscillatorType: 'sine' | 'square' | 'triangle' | 'sawtooth'
 * @param {number} duration    seconds
 * @param {number} gainPeak    peak volume 0–1
 * @param {number} [detune]    cents detuning for a richer sound
 */
function playTone(frequency, type = 'sine', duration = 0.12, gainPeak = 0.18, detune = 0) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (detune) osc.detune.setValueAtTime(detune, ctx.currentTime);

    // Quick attack, exponential decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently ignore — audio not available
  }
}

// ── Named Sound Effects ────────────────────────────────────────────────────

/** Soft button click — used for most buttons */
export function playClick() {
  playTone(680, 'sine', 0.10, 0.15);
}

/** Toggle ON */
export function playToggleOn() {
  playTone(520, 'sine', 0.13, 0.14);
  setTimeout(() => playTone(780, 'sine', 0.10, 0.10), 55);
}

/** Toggle OFF */
export function playToggleOff() {
  playTone(520, 'sine', 0.10, 0.12);
  setTimeout(() => playTone(360, 'sine', 0.12, 0.09), 55);
}

/** Save / success action */
export function playSuccess() {
  playTone(520, 'sine', 0.10, 0.13);
  setTimeout(() => playTone(660, 'sine', 0.10, 0.13), 70);
  setTimeout(() => playTone(780, 'sine', 0.14, 0.12), 140);
}

/** Destructive / delete action */
export function playDelete() {
  playTone(340, 'triangle', 0.14, 0.14);
  setTimeout(() => playTone(260, 'triangle', 0.14, 0.10), 80);
}

/** Avatar / picker select */
export function playPick() {
  playTone(740, 'sine', 0.09, 0.12, 10);
}

/** Export data */
export function playExport() {
  playTone(480, 'sine', 0.09, 0.12);
  setTimeout(() => playTone(600, 'sine', 0.12, 0.10), 70);
}
