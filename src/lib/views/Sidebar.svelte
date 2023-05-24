<script>
  // Fetch the courses from Firestore and set the `courses` variable
  // This is just a placeholder, you'll need to replace it with your actual Firestore code
  let courses = ['Lesson 1', 'Lesson 2', 'Lesson 3'];
</script>


<ul class="w-[100%] flex flex-col space-y-1">
  {#each courses as course}
    <li class="h-12 bg-green-200 p-2 pl-6 pt-2.5">
      {course}
    </li>
  {/each}
</ul>
