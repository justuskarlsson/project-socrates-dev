<script lang="ts">
  import { courses, selectedCourse, type Course } from "$lib/client/courses";
  
  let selected: number = 0;

  const onSelectChange = () => {
    console.log(selected);
    selectedCourse.set($courses[selected]);
  };
</script>


<div class="w-[100%] flex space-y-1">
  <select bind:value={selected} on:change={onSelectChange}>
    <option disabled selected>Select a course</option>
    {#each $courses as course, i}
      <option value={i}>{course.name}</option>
    {/each}
  </select>
  </div>
