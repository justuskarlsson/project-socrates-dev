<script lang="ts">
	import { flashcards, type Flashcard, updateFlashcard } from '$lib/client/flashcards';
	import { updateArrayItem } from '$lib/client/util';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { onDestroy, onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { elasticInOut } from "svelte/easing";

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
    console.log($flashcards);
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
    console.log(card)
	}




  function keypress(event: KeyboardEvent){
    if (card === null) {
      return;
    }
    let new_card = card as Flashcard;
    let next_review = new Date();
    switch(event.key) {
      case "ArrowDown":
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
        break;
      case "ArrowUp":
        next_review.setDate(next_review.getDate() + 1);
        new_card.reviews.push(next_review);
        new_card.prio = 0;
        flashcards.set(updateArrayItem($flashcards, new_card));
        updateFlashcard(new_card);
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

  const flipHorizontal = (node: any) => {
    console.log("Node:", node)
    return {
      duration: 5000,
      easing: elasticInOut,
      css: (t: any, u: any) => `
        transform: perspective(60px) rotateY(${(t) * 180}deg);
        opacity: ${t};
      `
    };
  };
</script>

<label class="btn" for={modalId}>
	Review ({cards.length})
</label>

<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal cursor-pointer">
	<label class="card modal-box" for=""
      on:click={flip}
      class:bg-green-400={flipped}
  >
			{#if card}
				<div class="text-3xl text-center centered select-none"
        >
					{#if flipped}
            <span in:flipHorizontal class="bg-green-600">

						{card.back}
						{#if card.back_extra}
							<br />
							<div class="font-extralight">
								{card.back_extra}
							</div>
						{/if}
            </span>

					{:else}
          <span>
						{card.front}
          </span>
					{/if}
				</div>
			{:else}
				All Done!
			{/if}
	</label>
</label>

<style>
	.card {
    height: 60vh;
    width: 60vh;
    display: flex;       /* Add this */
    justify-content: center;  /* Center children horizontally */
    align-items: center; /* Center children vertically */
	}
</style>
