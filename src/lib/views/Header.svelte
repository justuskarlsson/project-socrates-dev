<script lang="ts">
	import FlashCardReview from './FlashCardReview.svelte';
  
  import { page } from '$app/stores'


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
    {#if $page.params.course}
    <a class="x-link" href={getCourseUrl()}>
      {$page.params.course}
    </a>
    <FlashCardReview />
    {/if}
  </div>
</nav>

