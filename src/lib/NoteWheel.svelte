<script>
  import { ROOTS } from './theory.js';

  // suffix = chord quality after the root, e.g. '7' or 'maj7'
  let { suffix = '7', onPick } = $props();

  // Start at a random position so the correct answer isn't always centred
  let idx = $state(Math.floor(Math.random() * 12));
  let touchX = null;

  const note  = $derived(ROOTS[idx]);
  const chord = $derived(note + suffix);

  function go(dir) { idx = (idx + dir + 12) % 12; }

  function onTouchStart(e) { touchX = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 25) go(dx < 0 ? 1 : -1);
    touchX = null;
  }

  // Keyboard: arrows to scroll, Enter to confirm
  function onKeydown(e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1);  }
    if (e.key === 'Enter')      { e.preventDefault(); onPick(chord); }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="flex flex-col gap-4">

  <!-- Note strip -->
  <div
    class="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden select-none"
    ontouchstart={onTouchStart}
    ontouchend={onTouchEnd}
  >
    <!-- Five-note chromatic strip; tap a neighbour to move toward it -->
    <div class="flex items-center h-28 relative">
      <!-- Centre highlight -->
      <div class="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[18%]
                  bg-slate-700 rounded-xl pointer-events-none"></div>

      {#each [-2, -1, 0, 1, 2] as offset}
        {@const n    = ROOTS[(idx + offset + 12) % 12]}
        {@const dist = Math.abs(offset)}
        <button
          onclick={() => go(offset)}
          disabled={offset === 0}
          class="relative z-10 flex-1 flex items-center justify-center
                 font-bold transition-all duration-150 h-full
                 {dist === 0
                   ? 'text-5xl text-amber-400'
                   : dist === 1
                   ? 'text-2xl text-slate-400 active:text-slate-100'
                   : 'text-sm text-slate-700 pointer-events-none'}"
        >{n}</button>
      {/each}
    </div>

    <!-- Live chord preview -->
    <div class="flex items-center justify-center gap-1.5 py-3
                border-t border-slate-700 text-sm">
      <span class="text-slate-600">→</span>
      <span class="font-semibold text-base text-slate-200">{chord}</span>
      <span class="text-slate-600 text-xs">{suffix === '7' ? 'dominant 7th' : 'major 7th'}</span>
    </div>
  </div>

  <!-- Confirm -->
  <button
    onclick={() => onPick(chord)}
    class="w-full py-5 rounded-xl bg-amber-400 hover:bg-amber-300
           text-slate-900 font-bold text-xl transition-all active:scale-95"
  >
    Check ✓
  </button>

</div>
