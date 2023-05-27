<script lang="ts">
  import { lessons, selectedLesson, selectedCourse } from "$lib/client/courses"

  import { page } from '$app/stores'


  function getUrl(lessonIdx: number){
    let course = $page.params.course;
    return `/courses/${course}/${lessonIdx}`
  }

</script>


<ul class="menu bg-base-100 w-56">
  {#each $lessons as lesson, index}
    <li>
      <a class:active={lesson.name === ($selectedLesson?.name || "")}
          href="{getUrl(index)}"
      >
        {lesson.name}
      </a>
    </li>
  {/each}
</ul>
