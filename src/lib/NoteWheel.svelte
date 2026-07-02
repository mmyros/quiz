<script>
  import { ROOTS } from './theory.js';

  // suffix  = chord quality, e.g. '7' or 'maj7'
  // selected = the chord the user tapped (null until they pick)
  // correct  = the correct full chord string
  let { suffix = '7', onPick, selected = null, correct = null } = $props();

  const revealed = $derived(selected !== null);
</script>

<div class="flex flex-col gap-3">

  <!-- Context hint -->
  <div class="text-center text-slate-500 text-sm tracking-wide">
    Tap the root &rarr;
    <span class="text-slate-400 font-semibold">?{suffix}</span>
  </div>

  <!-- 4 × 3 chromatic grid: one tap = answer -->
  <div class="grid grid-cols-4 gap-2">
    {#each ROOTS as note}
      {@const chord      = note + suffix}
      {@const isCorrect  = chord === correct}
      {@const isWrong    = chord === selected && !isCorrect}
      <button
        onclick={() => onPick(chord)}
        disabled={revealed}
        class="py-[1.1rem] rounded-xl font-bold text-lg text-center
               transition-all duration-200
               {revealed && isCorrect
                 ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105'
                 : isWrong
                 ? 'bg-red-500 text-white'
                 : revealed
                 ? 'bg-slate-800 text-slate-600'
                 : 'bg-slate-700 text-slate-100 active:scale-95 hover:bg-slate-600'}"
      >{note}</button>
    {/each}
  </div>

</div>
