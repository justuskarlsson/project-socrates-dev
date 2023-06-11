<script lang="ts">
  import ChatInput from "$lib/components/ChatInput.svelte";
	import { connectFirestoreEmulator } from "firebase/firestore";
  import { onDestroy, onMount } from "svelte";

  let scaleLevel = 0;
  let scale = 1.0;
  let mapRoot: HTMLElement;
  let mapWorld: HTMLElement;
  let start = {x: 0, y: 0};
  let scroll = {top: 5000, left: 5000};
  let mousePos = {x: 0, y: 0};

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
      (event.currentTarget as HTMLElement).style.cursor = 'grabbing';
  }

  function getTopLeft(){
    const { scrollTop, scrollLeft, offsetTop, offsetLeft } = mapRoot;
    // console.log({ scrollTop, scrollLeft, offsetTop, offsetLeft })
    return {x: scrollLeft - offsetLeft, y: scrollTop - offsetTop};
  }

  function updateMousePosition(dx = 0, dy = 0){
    let tl = getTopLeft();
    mousePos.x = tl.x + dx / scale;
    mousePos.y = tl.y + dy / scale;
    // console.log(tl, mousePos);
  }


  function onMouseMove(event: MouseEvent) {
    updateMousePosition(event.clientX, event.clientY)
    if (event.buttons !== 1) return;
    const dx = (event.clientX - start.x);
    const dy = (event.clientY - start.y);
    // console.log("", dx, "", dy);
    // console.log("Y:", mapRoot.scrollTop, mapRoot.offsetHeight);
    // console.log("X:", mapRoot.scrollLeft, mapRoot.offsetWidth);
    mapRoot.scrollTop = scroll.top - dy;
    mapRoot.scrollLeft = scroll.left - dx;
  }

  function onMouseUp(event: MouseEvent) {
      (event.currentTarget as HTMLElement).style.cursor = 'grab';
  }

  function zoom(event: WheelEvent) {
      event.preventDefault();
      let delta = event.deltaY * -0.01;
      let prevScaleVal = scale;
      scaleLevel += delta;
      scale = Math.pow(1.25, scaleLevel);
      let {clientWidth, clientHeight} = mapRoot;
      let width = clientWidth / scale;
      // console.log("\n", scale, getTopLeft(), mousePos);
      console.log(mapRoot.getBoundingClientRect(), clientWidth)
      mapWorld.style.transform = `scale(${scale})`;
      mapRoot.scrollTop = scroll.top;
      mapRoot.scrollLeft = scroll.left;
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
    <div class="bg-gray-100 w-[10000px] h-[10000px] absolute"
         bind:this={mapWorld}
    >

      <div class="w-48 h-48 bg-green-200 absolute" 
        style="left:5000px; top:5000px;">
        <p>Hello World!</p>
      </div>
    </div>

  </div>
  <div class="absolute bottom-6 w-full px-6">
    <ChatInput onSendMessage={sendMessage}/>
  </div>
</div>


<style>
  /* Add custom scrollbar styles */
::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}



::-webkit-scrollbar-track {
  background-color: black;
  border-radius: 0px;
}

::-webkit-scrollbar-thumb {
  background-color: ghostwhite;
  border-radius: 4px;
  width: 40px;
  height: 40px;
}

</style>