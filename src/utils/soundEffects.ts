// ── Web Audio API UI Sound Synthesizer ───────────────────────────────────────
// Generates purely synthetic sounds using oscillators and gain envelopes.
// No audio files or external dependencies.

let audioCtx: AudioContext | null = null;
let compressor: DynamicsCompressorNode | null = null;

// Initial state: default to sound on (false = not muted), unless prefers-reduced-motion
let isMutedGlobal = false;
const listeners = new Set<(muted: boolean) => void>();

// Respect prefers-reduced-motion by defaulting to muted
if (typeof window !== "undefined") {
  try {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      isMutedGlobal = true;
    }
  } catch {
    // Ignore mediaQuery errors
  }
}

export function getIsMuted(): boolean {
  return isMutedGlobal;
}

export function setIsMuted(muted: boolean): void {
  isMutedGlobal = muted;
  listeners.forEach((listener) => listener(muted));
}

export function toggleMute(): boolean {
  setIsMuted(!isMutedGlobal);
  // If unmuting, prepare context
  if (!isMutedGlobal) {
    initAudioContext();
  }
  return isMutedGlobal;
}

export function subscribeMuteChange(callback: (muted: boolean) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// ── Lazy AudioContext creation on first user interaction ────────────────────
export function initAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();

      // ── DynamicsCompressor: boosts perceived loudness on mobile speakers ──
      compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -18;  // start compressing at -18 dBFS
      compressor.knee.value      =  6;   // soft knee
      compressor.ratio.value     =  4;   // 4:1 ratio
      compressor.attack.value    =  0.003;
      compressor.release.value   =  0.18;
      compressor.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  } catch {
    return null;
  }
}

/** Returns the compressor node (or destination if compressor not ready) */
function getOutput(): AudioNode {
  return compressor ?? (audioCtx!.destination);
}

// ── 1. "Agregar" button: soft short pop (sine 600Hz -> 900Hz, 120ms) ────────
export function playAddSound(): void {
  try {
    if (isMutedGlobal) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(getOutput());

    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    // Fail silently
  }
}

// ── 2. Quantity +/-: punchy tick (~50ms) ────────────────────────────────
export function playTickSound(): void {
  try {
    if (isMutedGlobal) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.05);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(getOutput());

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Fail silently
  }
}

// ── 3. Selecting a payment method: crisp click (~70ms) ────────────────────────
export function playClickSound(): void {
  try {
    if (isMutedGlobal) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(getOutput());

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Fail silently
  }
}

// ── 4. "Enviar pedido por WhatsApp": ascending 2-note chime (660Hz -> 880Hz) ─
export function playWhatsAppChime(): void {
  try {
    if (isMutedGlobal) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const out = getOutput();

    // First note: 660 Hz (160 ms)
    const osc1  = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(660, now);
    gain1.gain.setValueAtTime(0.9, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc1.connect(gain1);
    gain1.connect(out);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Second note: 880 Hz (160 ms)
    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.9, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.31);
    osc2.connect(gain2);
    gain2.connect(out);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.31);
  } catch {
    // Fail silently
  }
}

// ── 5. Order confirmation screen: light three-note chime ────────────────────
export function playConfirmationChime(): void {
  try {
    if (isMutedGlobal) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const out = getOutput();
    // F#5 (739.99 Hz), A5 (880.00 Hz), C#6 (1108.73 Hz) - harmonic chord
    const notes = [739.99, 880.0, 1108.73];
    const noteDuration = 0.15;

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.1;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.9, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(out);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  } catch {
    // Fail silently
  }
}
