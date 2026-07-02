<script>
  import { DRILLS } from './lib/theory.js';
  import { playChord } from './lib/audio.js';
  import NoteWheel from './lib/NoteWheel.svelte';

  let drillIdx = $state(0);
  let q        = $state(null);
  let selected = $state(null);
  let score    = $state(0);
  let total    = $state(0);
  let streak   = $state(0);
  let best     = $state(0);
  let timer    = null;

  function next() {
    clearTimeout(timer);
    q        = DRILLS[drillIdx].gen();
    selected = null;
  }

  function setDrill(i) {
    if (i === drillIdx) return;
    drillIdx = i;
    score = 0; total = 0; streak = 0; best = 0;
    next();
  }

  function pick(opt) {
    if (selected !== null) return;
    selected = opt;
    total++;
    if (opt === q.correct) {
      score++;
      streak++;
      if (streak > best) best = streak;
      timer = setTimeout(next, 1800);
    } else {
      streak = 0;
    }
  }

  function handlePlay() {
    if (q?.playRoot) playChord(q.playRoot, q.playIntervals);
  }

  function onKeydown(e) {
    if (!q) return;
    if (selected !== null && (e.key === 'Enter' || e.key === 'ArrowRight')) {
      e.preventDefault(); next(); return;
    }
    if (selected !== null) return;
    // 1–4 shortcuts only for the 4-option drills
    if (q.drillType !== 'nextChord') {
      const n = parseInt(e.key);
      if (n >= 1 && n <= q.options.length) { pick(q.options[n - 1]); return; }
    }
    if (e.key === ' ' || e.key === 'p') { e.preventDefault(); handlePlay(); }
  }

  next();
</script>

<svelte:window onkeydown={onKeydown} />

<div class="min-h-[100dvh] bg-slate-900 text-slate-100 flex flex-col select-none">

  <!-- ── Header -->
  <header class="px-4 pt-4 pb-2 border-b border-slate-800 safe-top">
    <div class="flex items-baseline justify-between mb-3">
      <h1 class="text-amber-400 font-bold text-xl tracking-tight">ii–V–I Trainer</h1>
      {#if total > 0}
        <span class="text-xs text-slate-500">{Math.round(score / total * 100)}% accuracy</span>
      {/if}
    </div>
    <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {#each DRILLS as drill, i}
        <button
          onclick={() => setDrill(i)}
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                 text-sm font-medium transition-all
                 {drillIdx === i
                   ? 'bg-amber-400 text-slate-900 shadow-md'
                   : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
        ><span>{drill.icon}</span><span>{drill.label}</span></button>
      {/each}
    </div>
  </header>

  <!-- ── Main -->
  {#if q}
  <main class="flex-1 flex flex-col px-4 py-5 gap-4 max-w-lg mx-auto w-full">

    <!-- Chord card -->
    <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative">
      <div class="text-6xl font-bold tracking-tight text-white leading-none">{q.prompt}</div>
      <div class="text-slate-400 text-sm mt-2">{q.sub}</div>
      <div class="text-slate-200 text-base font-semibold mt-4">{q.question}</div>
      <button
        onclick={handlePlay}
        title="Play chord (Space or P)"
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-700
               hover:bg-amber-400 hover:text-slate-900
               flex items-center justify-center text-amber-400 transition-colors"
      >▶</button>
    </div>

    <!-- Answer area -->
    {#if q.drillType === 'nextChord'}
      <!-- 12-note chromatic grid; handles both picking and reveal in-place -->
      <NoteWheel
        suffix={q.suffix}
        onPick={pick}
        selected={selected}
        correct={q.correct}
      />
    {:else if selected === null}
      <!-- 4-option grid (picking) -->
      <div class="grid grid-cols-2 gap-3">
        {#each q.options as opt, i}
          <button
            onclick={() => pick(opt)}
            class="py-5 px-3 rounded-xl font-bold text-xl text-center relative
                   bg-slate-700 text-slate-100 active:scale-95 hover:bg-slate-600
                   transition-all duration-200"
          >
            <span class="absolute top-1.5 left-2 text-xs text-slate-500">{i + 1}</span>
            {opt}
          </button>
        {/each}
      </div>
    {:else}
      <!-- 4-option grid (reveal) -->
      <div class="grid grid-cols-2 gap-3">
        {#each q.options as opt}
          {@const isCorrect = opt === q.correct}
          {@const isWrong   = opt === selected && !isCorrect}
          <div class="py-5 px-3 rounded-xl font-bold text-xl text-center
                      transition-all duration-200
                      {isCorrect
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800 text-slate-600'}"
          >{opt}</div>
        {/each}
      </div>
    {/if}

    <!-- Feedback row -->
    {#if selected !== null}
      {@const wasCorrect = selected === q.correct}
      <div class="flex items-center gap-3 px-1">
        <div class="flex-1 text-sm leading-relaxed">
          <span class="font-semibold {wasCorrect ? 'text-emerald-400' : 'text-red-400'}">
            {wasCorrect ? '✓ Correct' : '✗ Nope'}
          </span>
          <span class="text-slate-400"> — {q.explanation}</span>
        </div>
        {#if !wasCorrect}
          <button
            onclick={next}
            class="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600
                   text-slate-200 font-semibold text-sm transition-colors active:scale-95"
          >Next →</button>
        {/if}
      </div>
    {/if}

  </main>
  {/if}

  <!-- ── Footer stats -->
  <footer class="px-6 py-4 border-t border-slate-800 flex justify-around safe-bottom">
    <div class="text-center">
      <div class="text-2xl font-bold text-amber-400">
        {score}<span class="text-slate-600 text-lg">/{total}</span>
      </div>
      <div class="text-xs text-slate-500 uppercase tracking-wide mt-0.5">Score</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold {streak >= 5 ? 'text-orange-400' : 'text-emerald-400'}">{streak}</div>
      <div class="text-xs text-slate-500 uppercase tracking-wide mt-0.5">Streak</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-slate-400">{best}</div>
      <div class="text-xs text-slate-500 uppercase tracking-wide mt-0.5">Best</div>
    </div>
  </footer>

</div>
