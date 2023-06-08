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

<nav class="bg-gray-800 px-2 h-16 flex-x mb-2">
  <div class="flex-x space-x-4">
    <a class="x-link" href="/" >
      Home
    </a>
    <a class="x-link" href={getCourseUrl()}>
      {$page.params.course}
    </a>
    <FlashCardReview />
  </div>
</nav>

