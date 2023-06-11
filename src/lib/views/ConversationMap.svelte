<script lang="ts">
  import ChatInput from "$lib/components/ChatInput.svelte";
  import { onDestroy, onMount } from "svelte";

  let scale = 1;
  let mapRoot: HTMLElement;
  let start = {x: 0, y: 0};
  let scroll = {top: 5000, left: 5000};

  function sendMessage(content: string){

  }

  function onHighlight(){
      let selection = document.getSelection();
      let selectedText = selection?.toString();
      if (selectedText?.length) {
          // console.log(selectedText);
      }
  }

  onMount(()=> {
      document.addEventListener("selectionchange", onHighlight);
      mapRoot.scrollTop = scroll.top;
      mapRoot.scrollLeft = scroll.left;
  })

  onDestroy(()=>{
      document.removeEventListener("selectionchange", onHighlight);
  })

  function onMouseDown(event: MouseEvent) {
      start = {x: event.clientX, y: event.clientY};
      if (!event.currentTarget) return;
      const currentTarget = event.currentTarget as HTMLElement;
      scroll = {top: currentTarget.scrollTop,
               left: currentTarget.scrollLeft};
      console.log("Scroll:", scroll);
      (event.currentTarget as HTMLElement).style.cursor = 'grabbing';
  }

  function onMouseMove(event: MouseEvent) {
    
    if (event.buttons !== 1) return;
    const dx = (event.clientX - start.x);
    const dy = (event.clientY - start.y);
    console.log("", dx, "", dy);
    console.log("Y:", mapRoot.scrollTop, mapRoot.offsetHeight);
    console.log("X:", mapRoot.scrollLeft, mapRoot.offsetWidth);
    mapRoot.scrollTop = scroll.top - dy;
    mapRoot.scrollLeft = scroll.left - dx;
  }

  function onMouseUp(event: MouseEvent) {
      (event.currentTarget as HTMLElement).style.cursor = 'grab';
  }

  function zoom(event: WheelEvent) {
      event.preventDefault();
      scale += event.deltaY * -0.01;
      scale = Math.min(Math.max(.125, scale), 4); 
  }
</script>


<div class="bg-gray-300 w-full h-full overflow-hidden" 
  >

  <div class="cursor-grab overflow-scroll w-full h-full relative"
  on:mousedown={onMouseDown}
  on:mousemove={onMouseMove}
  on:mouseup={onMouseUp}
  on:wheel={zoom}
  bind:this={mapRoot}

  >
    <div class="bg-gray-300 w-[10000px] h-[10000px] absolute"
    >

      <div class="w-48 h-48 bg-green-200 m-4 absolute" 
        style="left:5000px; top:5000px;">
        <p>Hello World!</p>
      </div>
    </div>

  </div>
  <div class="absolute bottom-6 w-full px-6">
    <ChatInput onSendMessage={sendMessage}/>
  </div>
</div>
