<script lang="ts">
	import { allFlashcards, curFlashcards, Flashcard } from '$lib/client/stores';
	import { updateArrayItem } from '$lib/client/util';
	import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { quadOut } from "svelte/easing";
	import Markdown from '$lib/components/Markdown.svelte';
  import GiCardDraw from 'svelte-icons/gi/GiCardDraw.svelte'

	const modalId = 'review-flashcards';
	let cards: Flashcard[];
	let card: Flashcard | null = null;
  let flipped = false;


	function flip() {
		flipped = !flipped;
	}

  function back(a: any[]) {
    return a[a.length - 1];
  }

	$: {
    cards = $curFlashcards.filter((flashcard) => {
			const next_review = back(flashcard.reviews);
			return next_review <= new Date();
		});
    cards = [...cards];
    cards.sort((a, b) => {
      if (a.prio !== b.prio) {
        return b.prio - a.prio;
      }
      let t1 = back(a.reviews).getTime();
      let t2 = back(b.reviews).getTime();
      return t1 - t2;
    })
		card = cards.length > 0 ? cards[0] : null;
	}



  let failed: boolean = false;
  function keypress(event: KeyboardEvent){
    if (card === null) {
      return;
    }
    switch(event.key) {
      case "ArrowDown":
        event.preventDefault();
        failed = true;
        flipped = false;
        card.updateFailed();
        $curFlashcards = updateArrayItem($curFlashcards, card);
        $allFlashcards = updateArrayItem($curFlashcards, card);
        card.updateCollection();
        flipped = false;
        break;
        case "ArrowUp":
        event.preventDefault();
        failed = false;
        card.updateSuccess();
        $curFlashcards = updateArrayItem($curFlashcards, card);
        $allFlashcards = updateArrayItem($curFlashcards, card);
        card.updateCollection();
        flipped = false;
        break;
      case "ArrowLeft":
        event.preventDefault();
        flipped = false;
        break;
      case "ArrowRight":
        event.preventDefault();
        flipped = true;
        break;
    }
  }
  onMount(() => {
    window.addEventListener('keydown', keypress);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', keypress);
  });

  const throwCard = (node: HTMLElement, args: any = {}) => {
    return {
      duration: 400,
      css: (t: number) => {
        let y = quadOut(1 - t)*400;
        y *= (failed ? 1 : -1); 
        return `
          position: absolute;
          transform: translate(0px, ${y}px);
        `;
      }
      
    };
  };

  const flipCard = (node: HTMLElement, args: any = {}) => {
    return {
      duration: 400,
      css: (t: number) => {
        let x = (1 - t)*400;
        x *= (flipped ? -1 : 1); 
        return `
          position: absolute;
          transform: translate(${x}px, 0px);
        `;
      }
      
    };
  };

  function card_back() {
    if (card === null) {
      return "";
    }
    let val = card.back;
    if (card.back_extra) {
      val += `\n\n*${card.back_extra}*`;
    }
    return val;
  }
</script>

<label for={modalId}>
	<span class="x-icon group bg-gray-700">
    <GiCardDraw />
    <span class="x-icon-tooltip group-hover:scale-100">
      Flashcards
    </span>
  </span>
</label>

<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal cursor-pointer overflow-hidden">
  {#key card?.id}
	<label class="card modal-box p-0" for=""
      on:click={flip}
      in:fade={{delay: 500}}
      out:throwCard
  >
			{#if card}
      <div  class="flex justify-center items-center w-[100%] h-[100%] flex-wrap">
        <span class="w-[100%] h-[10%] bg-green-700 text-3xl 
        flex flex-col  justify-center items-center">
          ↑
        </span>
        <span class="w-[10%] h-[80%] text-3xl 
          flex flex-col  justify-center items-center"
        class:bg-slate-200={flipped}
        >
         <span>
           {flipped ? "←" : ""}
         </span>

        </span>
				<div class="w-[80%] h-[80%] text-3xl text-center overflow-clip
        select-none flex flex-col justify-center"
        >
        <!-- content here -->
        
        {#key flipped}
        <span
          in:flipCard
          out:flipCard
        >

          <Markdown content={flipped ? card_back() : card.front} />
        </span>
        {/key}
        </div>
        <span class="w-[10%] h-[80%] text-3xl
          flex flex-col  justify-center items-center"
            class:bg-slate-200={!flipped}

        >
          <span>

            {!flipped ? "→" : ""}
          </span>
        </span>
        <span class="w-[100%] h-[10%] bg-red-600 text-3xl 
        flex flex-col  justify-center items-center">
          ↓
        </span>

			</div>
			{:else}
				All Done!
			{/if}
	</label>
  {/key}
</label>

<style>
	.card {
    height: 60vh;
    width: 60vh;
    display: flex;       /* Add this */
    justify-content: center;  /* Center children horizontally */
    align-items: center; /* Center children vertically */
    overflow: hidden;
	}
</style>
