<script>
  import { ROOTS } from './theory.js';

  let { suffix = '7', onPick, selected = null, correct = null } = $props();

  const ITEM_H  = 60;   // px per note row — big enough to tap comfortably
  const initIdx = Math.floor(Math.random() * 12);

  let container = $state(null);
  let idx       = $state(initIdx);

  const revealed  = $derived(selected !== null);
  const note      = $derived(ROOTS[idx]);
  const chord     = $derived(note + suffix);
  const isCorrect = $derived(chord === correct);

  // Set initial scroll position after the container mounts
  $effect(() => {
    if (!container) return;
    // rAF ensures layout is complete before we set scrollTop
    requestAnimationFrame(() => {
      container.scrollTo({ top: initIdx * ITEM_H, behavior: 'instant' });
    });
  });

  function onScroll() {
    if (revealed || !container) return;
    idx = Math.max(0, Math.min(11, Math.round(container.scrollTop / ITEM_H)));
  }

  function goTo(i) {
    i = Math.max(0, Math.min(11, i));
    container?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
  }

  function onKeydown(e) {
    if (revealed) return;
    if (e.key === 'ArrowUp')   { e.preventDefault(); goTo(idx - 1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); goTo(idx + 1); }
    if (e.key === 'Enter')     { e.preventDefault(); onPick(chord); }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="flex flex-col gap-3">

  <!-- Hint -->
  <div class="text-center text-slate-500 text-sm">
    Flick to the root
    <span class="text-slate-400 font-semibold ml-1">?{suffix}</span>
  </div>

  <!-- Drum-roll wheel — clips to 3 visible rows -->
  <div
    class="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden"
    style="height:{ITEM_H * 3}px"
  >
    <!-- Gradient masks fade top & bottom rows -->
    <div
      class="absolute inset-x-0 top-0 z-10 pointer-events-none"
      style="height:{ITEM_H}px; background:linear-gradient(to bottom,#1e293b 30%,transparent)"
    ></div>
    <div
      class="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
      style="height:{ITEM_H}px; background:linear-gradient(to top,#1e293b 30%,transparent)"
    ></div>

    <!-- Centre-row selection band -->
    <div
      class="absolute inset-x-3 z-10 pointer-events-none rounded-xl border border-slate-600 bg-slate-700/40"
      style="top:{ITEM_H}px; height:{ITEM_H}px"
    ></div>

    <!-- Scrollable note list -->
    <div
      bind:this={container}
      onscroll={onScroll}
      class="h-full scrollbar-hide"
      style="
        overflow-y:{revealed ? 'hidden' : 'scroll'};
        scroll-snap-type:y mandatory;
        -webkit-overflow-scrolling:touch;
      "
    >
      <!-- Top spacer: lets C reach the centre at scrollTop=0 -->
      <div style="height:{ITEM_H}px"></div>

      {#each ROOTS as n, i}
        {@const dist = Math.abs(i - idx)}
        <div
          class="flex items-center justify-center font-bold transition-all duration-100"
          style="
            height:{ITEM_H}px;
            scroll-snap-align:center;
            scroll-snap-stop:normal;
          "
        >
          <span class="
            {dist === 0 ? 'text-5xl' : dist === 1 ? 'text-2xl' : 'text-sm'}
            {dist === 0 && revealed && isCorrect   ? 'text-emerald-400'
              : dist === 0 && revealed && !isCorrect ? 'text-red-400'
              : dist === 0                           ? 'text-amber-400'
              : dist === 1                           ? 'text-slate-400'
              :                                        'text-slate-700'}
          ">{n}</span>
        </div>
      {/each}

      <!-- Bottom spacer: lets B reach the centre -->
      <div style="height:{ITEM_H}px"></div>
    </div>
  </div>

  <!-- Live preview / result -->
  <div class="text-center text-sm" style="min-height:1.5rem">
    {#if !revealed}
      <span class="text-slate-500">→</span>
      <span class="text-slate-200 font-semibold ml-1 text-base">{chord}</span>
      <span class="text-slate-600 text-xs ml-1">{suffix === '7' ? 'dominant' : 'major'} 7th</span>
    {:else if isCorrect}
      <span class="text-emerald-400 font-semibold">{chord}</span>
    {:else}
      <span class="text-red-400">{chord}</span>
      <span class="text-slate-600 mx-1.5">·</span>
      <span class="text-slate-500 text-xs">correct:</span>
      <span class="text-emerald-400 font-semibold ml-1">{correct}</span>
    {/if}
  </div>

  <!-- Confirm button (disappears after answering) -->
  {#if !revealed}
    <button
      onclick={() => onPick(chord)}
      class="w-full py-5 rounded-xl bg-amber-400 hover:bg-amber-300
             text-slate-900 font-bold text-xl transition-all active:scale-95"
    >Check ✓</button>
  {/if}

</div>
