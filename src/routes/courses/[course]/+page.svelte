


<script lang="ts">
	import FlashCard from '$lib/components/FlashCard.svelte';
    import type * as Req from '$lib/request_types'
    import { selectedCourse, courses } from "$lib/client/courses"

    import { page } from "$app/stores"
    
    $: {
      console.log("Page params", $page.params)
      const name = $page.params.course.replaceAll("-", " ");
      const course = $courses.find((c) => c.name === name);
      console.log("Name", name);
      console.log($courses, course);
      if (course && $selectedCourse.name !== name) {
        console.log("Selected course set: ", course);
        selectedCourse.set(course);
      }
    }


  
    
</script>
  <FlashCard front="Hello" back="Hallo"  />
