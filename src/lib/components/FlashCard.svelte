<script lang="ts">
	import type { Flashcard } from '$lib/client/flashcards';
  export let data: Flashcard;

  let flipped = false;
  function flip(){
    flipped = !flipped;
  }
</script>

<style>
  .root {
    margin: 10px;

  }
  .centered {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: fit-content;
  }
</style>

<div class="root card w-96 bg-base-100 h-80 shadow-xl cursor-pointer"
     on:click={flip}
     class:bg-green-400={flipped}

  >
  <div class="card-body text-3xl text-center centered select-none"
  >
    {flipped ? data.back : data.front}
  </div>
</div>