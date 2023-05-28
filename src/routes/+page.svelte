<script lang="ts">
  import { courses } from "$lib/client/courses"
  import {addGermanCourse} from '$lib/client/import'

</script>


<div class="container">

  <ul class="menu bg-base-100 w-56">
    {#each $courses as course}
      <li>
        <a href="courses/{course.name.replaceAll(' ', '-')}"
           class="bg-green-100"
        >
          {course.name}
        </a>
      </li>
    {/each}
  </ul>

  <button class="btn" on:click={()=> addGermanCourse()}>
    Import
  </button>
</div>

