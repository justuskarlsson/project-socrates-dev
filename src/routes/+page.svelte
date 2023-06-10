<script lang="ts">
	import DataInput from '$lib/components/DataInput.svelte';
	import { Course, Lesson, allCourses } from '$lib/client/stores';
  
  async function onAddCourse(data: any) {
    let { name } = data;
    let course = await Course.collection.add({name});
    for (let { name, description } of data.lessons) {
      Lesson.collection.add({name, description, courseId: course.id})
    }
  }
</script>

<div class="container">

  <ul class="menu bg-base-100 w-56">
    {#each $allCourses as course}
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

