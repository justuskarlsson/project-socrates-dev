<script lang="ts">
	import DataInput from '$lib/components/DataInput.svelte';
  import { addCourse, courses, type CourseWrite } from "$lib/client/courses"
  import {addGermanCourse} from '$lib/client/import'
  
  function onAddCourse(data: CourseWrite) {
    addCourse(data);
  }
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
    <li>
      <DataInput label="Add course" onData={onAddCourse} />
    </li>
  </ul>


</div>

