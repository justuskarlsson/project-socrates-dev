<script lang="ts">
	import { flashcards, type Flashcard } from '$lib/client/flashcards';
	import Modal from '$lib/components/Modal.svelte';
	import { onDestroy, onMount } from 'svelte';

	const modalId = 'review-flashcards';
	let cards: Flashcard[];
	let card: Flashcard | null = null;
	let redo: Record<string, boolean> = {};
  let flipped = false;


	function flip() {
		flipped = !flipped;
	}

	$: {
    updateCards($flashcards);
	}

  function back(a: any[]) {
    return a[a.length - 1];
  }

  function updateCards(c: any){
    cards = $flashcards.filter((flashcard) => {
			const len = flashcard.reviews.length;
			if (len === 0) {
        flashcard.reviews.push(new Date());
				return true;
			}
			const next_review = flashcard.reviews[len - 1];
			return next_review <= new Date();
		});
    cards = [...cards];
    console.log(cards.length);
    cards.sort((a, b) => {
      // either none or both are in redo
      return a.timestamp.getTime() - b.timestamp.getTime();
    })
		card = cards.length > 0 ? cards[0] : null;
    console.log(card)
  }

  function keypress(event: KeyboardEvent){
    console.log(event.key);
    if (card === null) {
      return;
    }
    switch(event.key) {
      case "ArrowDown":
        card.reviews[card.reviews.length - 1] = new Date();
        flipped = false;
        updateCards($flashcards);
        break;
      case "ArrowUp":
        let next_review = new Date();
        next_review.setDate(next_review.getDate() + 30);
        let new_card = card as Flashcard;
        new_card.reviews.push(next_review);
        flashcards.set([
          ...$flashcards.filter(f => f.id !== new_card.id),
          new_card
        ]);
        updateCards($flashcards);
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
						{card.back}
						{#if card.back_extra}
							<br />
							<div class="font-extralight">
								{card.back_extra}
							</div>
						{/if}
					{:else}
						{card.front}
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
