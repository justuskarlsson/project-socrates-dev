<script lang="ts">
  import { curLessons, selectedLesson } from "$lib/client/stores"

  import { page } from '$app/stores'


  function getUrl(lessonIdx: number){
    let course = $page.params.course;
    return `/courses/${course}/${lessonIdx}`
  }

</script>

<div class="flex justify-center h-[100%] overflow-y-scroll">

  <ul class="menu bg-base-100 w-56">
    {#each $curLessons as lesson, index}
      <li>
        <a class:active={lesson.name === ($selectedLesson?.name || "")}
            href="{getUrl(index)}"
        >
          {lesson.name}
        </a>
      </li>
    {/each}
  </ul>
</div>