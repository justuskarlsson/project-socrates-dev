<script>
  import { selectedCourse } from "$lib/client/courses"

  $: lessons = $selectedCourse?.lessons || [];
</script>


<ul class="w-[100%] flex flex-col space-y-1">
  {#each lessons as lesson}
    <li class="h-12 bg-green-200 pl-3 flex items-center">
      {lesson.name}
    </li>
  {/each}
</ul>
