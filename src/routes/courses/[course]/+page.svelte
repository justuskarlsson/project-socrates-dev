


<script lang="ts">
	import FlashCard from '$lib/components/FlashCard.svelte';
    import type * as Req from '$lib/request_types'
    import { selectedCourse, courses } from "$lib/client/courses"

    import { page } from "$app/stores"
    
    $: {
      console.log("Page params", $page.params)
      const name = $page.params.course.replaceAll("-", " ");
      const course = $courses.find((c) => c.name === name);
      console.log("Name", name);
      console.log($courses, course);
      if (course && $selectedCourse.name !== name) {
        console.log("Selected course set: ", course);
        selectedCourse.set(course);
      }
    }

    const flashcards = [
      {
      "front": "Hello",
      "back": "Hallo"
      },
      {
      "front": "Goodbye",
      "back": "Tschüss"
      },
      {
      "front": "How are you?",
      "back": "Wie geht es dir?"
      },
      {
      "front": "I am fine, thank you",
      "back": "Mir geht es gut, danke."
      },
      {
      "front": "What's your name?",
      "back": "Wie ist dein Name?"
      },
      {
      "front": "Can you please help me?",
      "back": "Können Sie mir bitte helfen?"
      },
      {
      "front": "Thank you",
      "back": "Danke"
      },
      {
      "front": "You're welcome",
      "back": "Bitte"
      }
    ]

    
</script>

<style>

</style>

<div class="container flex flex-wrap">
  {#each flashcards as flashcard}
  <FlashCard {...flashcard} />
  {/each}
</div>

