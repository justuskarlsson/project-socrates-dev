<script lang="ts">
	import { flashcards, type Flashcard, updateFlashcard } from '$lib/client/flashcards';
	import { updateArrayItem } from '$lib/client/util';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { onDestroy, onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { elasticInOut, elasticOut, quadOut } from "svelte/easing";
	import Markdown from '$lib/components/Markdown.svelte';

	const modalId = 'review-flashcards';
	let cards: Flashcard[];
	let card: Flashcard | null = null;
	let redo: Record<string, boolean> = {};
  let flipped = false;


	function flip() {
		flipped = !flipped;
	}

  function back(a: any[]) {
    return a[a.length - 1];
  }

	$: {
    cards = $flashcards.filter((flashcard) => {
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
    let new_card = card as Flashcard;
    let next_review = new Date();
    switch(event.key) {
      case "ArrowDown":
        failed = true;
        const DELAY_MS = 1 * 60 * 1000;
        next_review.setTime(next_review.getTime() + DELAY_MS);
        card.reviews[card.reviews.length - 1] = next_review;
        flipped = false;
        new_card.reviews[new_card.reviews.length - 1] = next_review;
        new_card.prio = 1;
        flashcards.set(updateArrayItem($flashcards, new_card));
        // setTimeout(() => {
        //   flashcards.update((val) => val);
        // }, DELAY_MS);
        updateFlashcard(new_card);
        flipped = false;
        break;
      case "ArrowUp":
        failed = false;
        next_review.setDate(next_review.getDate() + 1);
        new_card.reviews.push(next_review);
        new_card.prio = 0;
        flashcards.set(updateArrayItem($flashcards, new_card));
        updateFlashcard(new_card);
        flipped = false;
        break;
      case "ArrowLeft":
        flipped = false;
        break;
      case "ArrowRight":
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
        console.log(t, y)
        return `
          position: absolute;
          transform: translate(0px, ${y}px);
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

<label class="btn" for={modalId}>
	Review ({cards.length})
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
          in:fly="{{x:flipped ? 200 : -200, duration: 150, delay:150}}"
          out:fly="{{x:flipped ? -200 : 200, duration:150 }}"
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
