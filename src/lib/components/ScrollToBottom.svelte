<script lang="ts">
	import { onDestroy, onMount } from "svelte";


  let element: HTMLElement;
  let prevHeight = 0;
  let atBottomPrev = false;
  let scrollMargin = 150;
  function scrollPos(){
    return element.scrollTop + element.clientHeight;
  }
  function onScroll(event: any){
    atBottomPrev = scrollPos() + scrollMargin >= element.scrollHeight;
    // console.log("Scroll", element.offsetHeight, element.clientHeight,
    //   scrollPos() + scrollMargin, element.scrollHeight);
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
        atBottomPrev = true;
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
