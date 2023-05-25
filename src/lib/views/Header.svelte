<script lang="ts">
  import { courses, selectedCourse, type Course } from "$lib/client/courses";
  
  let selected: number = 0;

  const onSelectChange = () => {
    console.log(selected);
    selectedCourse.set($courses[selected]);
  };
</script>


<div class="w-[100%] flex items-center">
  <div class="w-60 p-3">
    <select class="w-full select select-bordered "
    bind:value={selected} on:change={onSelectChange}>
     {#each $courses as course, i}
       <option value={i}>{course.name}</option>
     {/each}
   </select>
  </div>
</div>
