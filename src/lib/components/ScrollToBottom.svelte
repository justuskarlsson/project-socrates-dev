<script lang="ts">
	import { onDestroy, onMount } from "svelte";


  let element: HTMLElement;
  let prevHeight = 0;
  let atBottomPrev = false;
  function onScroll(){
    atBottomPrev =  element.scrollTop + element.clientHeight === element.scrollHeight;
    // console.log("Scroll", atBottomPrev);
  }
  const delay = 200;
  let time = 0;
  function scrollToBottom() {
    if (element) {
      
      let height = element.scrollHeight;
      let bottomNew = atBottomPrev && height !== prevHeight;
      let first = time < 1000 && height > prevHeight;
      // console.log("..", element.scrollHeight, height);
      if (bottomNew || first) {
        element.scrollTop = element.scrollHeight;
      }
      prevHeight = height;
    }
    time += delay;
  }

  let interval: NodeJS.Timer;
  onMount(()=>{
    interval = setInterval(scrollToBottom, delay);
  });
  onDestroy(()=>{
    clearInterval(interval);
  })

</script>


<div bind:this={element} on:scroll={onScroll} {...$$props}>
  <slot />
</div>
