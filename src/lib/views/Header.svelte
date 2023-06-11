<script lang="ts">
	import FlashCardReview from './FlashCardReview.svelte';
  
  import { page } from '$app/stores'


  function getCourseUrl(){
    let course = $page.params.course;
    return `/courses/${course}`
  }
</script>

<nav class="bg-gray-800 px-2 h-16 flex-x">
  <div class="flex-x space-x-4">
    <a class="x-link" href="/" >
      Home
    </a>
    {#if $page.params.course}
    <a class="x-link" href={getCourseUrl()}>
      {$page.params.course}
    </a>
    <span class="w-[1px] h-12 bg-gray-500 rounded-xl">

    </span>
    <a class="x-link" href={getCourseUrl() + "/map"}>
      Map
    </a>
    <FlashCardReview />
    {/if}
  </div>
</nav>

