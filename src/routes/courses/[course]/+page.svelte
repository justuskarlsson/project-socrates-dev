<script lang="ts">
	import FlashCardView from '$lib/components/FlashCardView.svelte';
	import { Flashcard, allFlashcards, curFlashcards, push, selectedCourse } from '$lib/client/stores';
	import DataInput from '$lib/components/DataInput.svelte';

	async function addFlashcards(data: any[]) {
		for (let val of data) {
			val.courseId = $selectedCourse!.id;
			let card = await Flashcard.collection.add(val);
			push(allFlashcards, card);
			push(curFlashcards, card);
		}
	}
</script>

<div class="h-[100%]">
	<DataInput onData={addFlashcards} label="Add flashcards" />
	<div class="container flex flex-wrap">
		{#each $curFlashcards as flashcard}
			<FlashCardView data={flashcard} />
		{/each}
	</div>
</div>

<style>
</style>
