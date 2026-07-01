// 12 chromatic roots in jazz-preferred notation (flats for flat keys)
export const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function noteName(semitones) {
  return ROOTS[((semitones % 12) + 12) % 12];
}

export function rootIdx(name) {
  const i = ROOTS.indexOf(name);
  if (i === -1) throw new Error(`Unknown root: ${name}`);
  return i;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomRoot() {
  return ROOTS[Math.floor(Math.random() * 12)];
}

// ---------------------------------------------------------------------------
// Drill 1 — ii→V or V→I  (roots always move P4 upward)
// ---------------------------------------------------------------------------
export function nextChordQuestion() {
  const iiRoot = randomRoot();
  const iiIdx  = rootIdx(iiRoot);
  const vRoot  = noteName(iiIdx + 5);   // P4 above ii
  const iRoot  = noteName(iiIdx + 10);  // P4 above V

  const isIiToV = Math.random() < 0.5;

  const fromChord = isIiToV ? `${iiRoot}m7` : `${vRoot}7`;
  const fromLabel = isIiToV ? 'ii7'         : 'V7';
  const toChord   = isIiToV ? `${vRoot}7`   : `${iRoot}maj7`;
  const toLabel   = isIiToV ? 'V7'          : 'Imaj7';
  const toNote    = isIiToV ? vRoot         : iRoot;
  const fromNote  = isIiToV ? iiRoot        : vRoot;
  const suffix    = toChord.slice(toNote.length);  // '7' or 'maj7'

  const distractors = shuffle(ROOTS.filter(r => r !== toNote))
    .slice(0, 3)
    .map(r => r + suffix);

  return {
    drillType: 'nextChord',
    prompt: fromChord,
    sub: fromLabel,
    question: `What is the ${toLabel}?`,
    options: shuffle([toChord, ...distractors]),
    correct: toChord,
    suffix,
    explanation: `${toNote} is a P4 above ${fromNote}`,
    playRoot: iiRoot,
    playIntervals: [0, 3, 7, 10],
  };
}

// ---------------------------------------------------------------------------
// Drill 2 — Guide tones: 3rd & 7th of a chord
// ---------------------------------------------------------------------------
export function guideToneQuestion() {
  const root = randomRoot();
  const idx  = rootIdx(root);

  const types = [
    { suffix: 'm7',   thirdSemi: 3,  seventhSemi: 10, intervals: [0, 3, 7, 10] },
    { suffix: '7',    thirdSemi: 4,  seventhSemi: 10, intervals: [0, 4, 7, 10] },
    { suffix: 'maj7', thirdSemi: 4,  seventhSemi: 11, intervals: [0, 4, 7, 11] },
  ];
  const ct    = types[Math.floor(Math.random() * types.length)];
  const chord = `${root}${ct.suffix}`;

  const third   = noteName(idx + ct.thirdSemi);
  const seventh = noteName(idx + ct.seventhSemi);
  const correct = `${third} & ${seventh}`;

  const wrongCombos = [
    [noteName(idx + 2), seventh],
    [third,            noteName(idx + 7)],
    [noteName(idx + 5), seventh],
    [third,            noteName(idx + 9)],
  ];
  const distractors = shuffle(
    wrongCombos.map(([a, b]) => `${a} & ${b}`).filter(s => s !== correct)
  ).slice(0, 3);

  return {
    drillType: 'guideTone',
    prompt: chord,
    sub: 'Guide tones = 3rd & 7th',
    question: 'Which pair are the guide tones?',
    options: shuffle([correct, ...distractors]),
    correct,
    explanation: `3rd = ${third}  ·  7th = ${seventh}`,
    playRoot: root,
    playIntervals: ct.intervals,
  };
}

// ---------------------------------------------------------------------------
// Drill 3 — Rootless voicings: identify the top note
// ---------------------------------------------------------------------------
export function voicingTopNoteQuestion() {
  const root = randomRoot();
  const idx  = rootIdx(root);

  const voicings = [
    { chord: `${root}m7`,   type: 'Type A', tones: [3, 7, 10, 14],  desc: '♭3–5–♭7–9',   topName: '9th'  },
    { chord: `${root}m7`,   type: 'Type B', tones: [7, 10, 14, 17], desc: '5–♭7–9–11',    topName: '11th' },
    { chord: `${root}7`,    type: 'Type A', tones: [4, 10, 14, 21], desc: '3–♭7–9–13',    topName: '13th' },
    { chord: `${root}7`,    type: 'Type B', tones: [4, 9, 10, 14],  desc: '3–13–♭7–9',    topName: '9th'  },
    { chord: `${root}maj7`, type: 'Type A', tones: [4, 7, 11, 14],  desc: '3–5–7–9',      topName: '9th'  },
    { chord: `${root}maj7`, type: 'Type B', tones: [7, 11, 14, 18], desc: '5–7–9–♯11',    topName: '♯11'  },
  ];

  const v       = voicings[Math.floor(Math.random() * voicings.length)];
  const notes   = v.tones.map(t => noteName(idx + t));
  const correct = notes[notes.length - 1];

  return {
    drillType: 'voicingTop',
    prompt: v.chord,
    sub: `${v.type}  (${v.desc})`,
    question: 'Which voicing note is on top?',
    options: shuffle([...notes]),
    correct,
    explanation: `Top = the ${v.topName} of ${root}  →  ${correct}`,
    playRoot: root,
    playIntervals: v.tones,
  };
}

// ---------------------------------------------------------------------------
// Drill 4 — Altered extensions
// ---------------------------------------------------------------------------
export function altExtensionQuestion() {
  const root = randomRoot();
  const idx  = rootIdx(root);

  const exts = [
    { name: '♭9',  semi: 1 },
    { name: '♯9',  semi: 3 },
    { name: '♯11', semi: 6 },
    { name: '♭13', semi: 8 },
  ];
  const ext     = exts[Math.floor(Math.random() * exts.length)];
  const correct = noteName(idx + ext.semi);
  const distractors = shuffle(ROOTS.filter(n => n !== correct)).slice(0, 3);

  return {
    drillType: 'altExtension',
    prompt: `${root}7alt`,
    sub: 'Altered dominant',
    question: `What note is the ${ext.name}?`,
    options: shuffle([correct, ...distractors]),
    correct,
    explanation: `${ext.name} = ${ext.semi} semitone${ext.semi > 1 ? 's' : ''} above ${root}  →  ${correct}`,
    playRoot: root,
    playIntervals: [0, 4, 10, ext.semi],
  };
}

export const DRILLS = [
  { id: 'nextChord',    label: 'ii–V Flow',   icon: '→', gen: nextChordQuestion      },
  { id: 'guideTone',    label: 'Guide Tones', icon: '♩', gen: guideToneQuestion      },
  { id: 'voicingTop',   label: 'Voicings',    icon: '♪', gen: voicingTopNoteQuestion },
  { id: 'altExtension', label: 'Alterations', icon: '♯', gen: altExtensionQuestion   },
];
