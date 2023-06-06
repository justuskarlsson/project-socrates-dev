<script lang="ts">
	import FlashCardReview from './FlashCardReview.svelte';
  import { courses, selectedCourse } from "$lib/client/courses";
  
  let selected: number = 0;

  const onSelectChange = () => {
    selectedCourse.set($courses[selected]);
    window.history.pushState(null, '', `./${$courses[selected].name}`);
  };
  import { page } from '$app/stores'
	import { patchFlashcards } from '$lib/client/flashcards';


  function getCourseUrl(){
    let course = $page.params.course;
    return `/courses/${course}`
  }
</script>


<div class="w-[100%] flex items-center">
  <div>
    <a href="/" >
      Home
    </a>
    <a href={getCourseUrl()}>
      {$page.params.course}
    </a>
    <FlashCardReview />
    <!-- <button class="btn" on:click={patchFlashcards}> Patch Flashcards</button> -->
  </div>
</div>
