<script lang="ts">
	import type { Flashcard } from '$lib/client/flashcards';
  import { slide, fly, fade } from 'svelte/transition'
	import Markdown from './Markdown.svelte';
  export let data: Flashcard;

  let flipped = false;
  function flip(){
    flipped = !flipped;
  }
  function back() {
    let val = data.back;
    if (data.back_extra) {
      val += `\n\n*${data.back_extra}*`;
    }
    return val;
  }
</script>


<div class="root card w-96 bg-base-100 h-80 shadow-xl cursor-pointer"
     on:click={flip}
     class:bg-green-400={flipped}

  >
  {#key flipped}
     <!-- content here -->
    <div class="card-body text-3xl text-center centered select-none"
        in:fly="{{x:flipped ? 200 : -200, duration: 500}}"
        out:fly="{{x:flipped ? -200 : 200, duration:500 }}"
    >
      <Markdown content={flipped ? back() : data.front} />
    </div>
  {/key}

</div>

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