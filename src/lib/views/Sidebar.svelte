<script>
  import { selectedCourse } from "$lib/client/courses"

  $: lessons = $selectedCourse?.lessons || [];
  let selected = 0;
</script>


<ul class="menu bg-base-100 w-56">
  {#each lessons as lesson, index}
    <li>
      <a class:active={index === selected}
        on:click={() => {
          selected = index;
          window.history.pushState(null, '', `./${index}`);
        }}
      >
        {lesson.name}
      </a>
    </li>
  {/each}
</ul>
