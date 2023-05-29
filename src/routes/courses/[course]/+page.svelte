<script lang="ts">
	import FlashCard from '$lib/components/FlashCard.svelte';
	import { selectedCourse, courses, type Course } from '$lib/client/courses';
	import { getCourseFlashcards } from '$lib/client/courses';
	import { page } from '$app/stores';
	import DataInput from '$lib/components/DataInput.svelte';
	import { type FlashcardWrite, addFlashcard, flashcards } from '$lib/client/flashcards';

	$: {
		console.log('Page params [course].svelte', $page.params, 
      "Selected course: ", $selectedCourse);
		const name = $page.params.course.replaceAll('-', ' ');
		const course = $courses.find((c) => c.name === name);
    if (course) {
      fetchInitialCards(course);
    }
		if (course && $selectedCourse.name !== name) {
			console.log('[course].svelte: Selected course set: ', course);
			selectedCourse.set(course);
		}
	}

	async function fetchInitialCards(course: Course){
	  const val = await getCourseFlashcards(course);
    flashcards.set(val);
  }

	const flashcardsSample = [
		{
			front: 'Hello',
			back: 'Hallo'
		},
		{
			front: 'Goodbye',
			back: 'Tschüss'
		},
		{
			front: 'How are you?',
			back: 'Wie geht es dir?'
		},
		{
			front: 'I am fine, thank you',
			back: 'Mir geht es gut, danke.'
		},
		{
			front: "What's your name?",
			back: 'Wie ist dein Name?'
		},
		{
			front: 'Can you please help me?',
			back: 'Können Sie mir bitte helfen?'
		},
		{
			front: 'Thank you',
			back: 'Danke'
		},
		{
			front: "You're welcome",
			back: 'Bitte'
		}
	];

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
