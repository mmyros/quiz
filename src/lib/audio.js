// Lightweight Web Audio chord playback — no dependencies, ~1 KB
const ROOT_MIDI = {
  C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65,
  'F#': 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71,
};

let _ctx = null;

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Play a chord as gently staggered triangle-wave oscillators.
 * @param {string}   rootName  - e.g. 'G'
 * @param {number[]} intervals - semitones above root (may exceed 12)
 * @param {number}   octave    - base octave for root (3 = left-hand comping range)
 */
export function playChord(rootName, intervals, octave = 3) {
  const ac   = getCtx();
  const base = ROOT_MIDI[rootName] + (octave - 4) * 12;
  const now  = ac.currentTime;
  const dur  = 2.2;

  intervals.forEach((semi, i) => {
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'triangle';
    osc.frequency.value = midiToHz(base + semi);

    const t = now + i * 0.045;  // slight stagger = arpeggiated feel
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.11, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}
