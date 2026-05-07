// Tiny Web Audio sound + ambient music engine. No external files.
let audioCtx = null;
const getCtx = () => {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

const env = (gain, ctx, attack, decay, peak = 0.08) => {
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + attack + decay);
};

export const playClick = () => {
  const ctx = getCtx(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
  env(g, ctx, 0.005, 0.08, 0.06);
  osc.connect(g).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
};

export const playSuccess = () => {
  const ctx = getCtx(); if (!ctx) return;
  // Ascending arpeggio: C5, E5, G5, C6
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    const start = ctx.currentTime + i * 0.08;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.1, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(start); o.stop(start + 0.45);
  });
};

export const playError = () => {
  const ctx = getCtx(); if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(220, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.18);
  env(g, ctx, 0.005, 0.18, 0.06);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.2);
};

export const playReveal = () => {
  const ctx = getCtx(); if (!ctx) return;
  const notes = [261.63, 392.0, 523.25, 659.25, 783.99];
  notes.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    const start = ctx.currentTime + i * 0.18;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.08, start + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);
    o.connect(g).connect(ctx.destination);
    o.start(start); o.stop(start + 1.3);
  });
};

// Ambient drone pad
let drone = null;
export const startMusic = () => {
  const ctx = getCtx(); if (!ctx) return;
  if (drone) return;
  const master = ctx.createGain();
  master.gain.value = 0.025;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.18;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.012;
  lfo.connect(lfoGain).connect(master.gain);

  const make = (freq, type = "sine") => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(master);
    o.start();
    return o;
  };
  // Warm chord: A2, E3, A3, C#4 (A major)
  const oscs = [make(110), make(164.81, "triangle"), make(220), make(277.18, "sine")];
  master.connect(ctx.destination);
  lfo.start();
  drone = { master, lfo, oscs };
};

export const stopMusic = () => {
  if (!drone) return;
  try {
    drone.oscs.forEach((o) => o.stop());
    drone.lfo.stop();
  } catch (e) { /* noop */ }
  drone = null;
};

export const isMusicPlaying = () => Boolean(drone);
