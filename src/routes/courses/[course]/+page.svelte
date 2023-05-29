<script lang="ts">
	import FlashCard from '$lib/components/FlashCard.svelte';
	import { selectedCourse, courses, type Course, coursesLoading, selectCourseFromURL } from '$lib/client/courses';
	import { getCourseFlashcards } from '$lib/client/courses';
	import { page } from '$app/stores';
	import DataInput from '$lib/components/DataInput.svelte';
	import { type FlashcardWrite, addFlashcard, flashcards } from '$lib/client/flashcards';
	import { onMount } from 'svelte';


	onMount(async () => {
		await coursesLoading();
		await selectCourseFromURL($page.params.course,
			$selectedCourse, $courses);
		flashcards.set(await getCourseFlashcards($selectedCourse));
	})


	async function addFlashcards(data: FlashcardWrite[]) {
		for (let val of data) {
			val.courseId = $selectedCourse.id;
			let card = await addFlashcard(val);
			flashcards.set([...$flashcards, card]);
		}
	}
</script>

<DataInput onData={addFlashcards} label="Add flashcards" />
<div class="container flex flex-wrap">
	{#each $flashcards as flashcard}
		<FlashCard data={flashcard} />
	{/each}
</div>

<style>
</style>
