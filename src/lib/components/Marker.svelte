<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
  import L, { map } from "leaflet"
	import ChatMessage from "$lib/components/ChatMessage.svelte";

  export let x: number;
  export let y: number;
  export let text: string;

  let el: HTMLDivElement;
  let mapContext = getContext<{value: L.Map}>("map");
  let marker: L.Marker | null = null;
  let small = false;
  function onZoom (event: L.ZoomAnimEvent){
    const mapX = event.center.lat;
    const mapY = event.center.lng;
    let dist = Math.hypot(x - mapX, y - mapY);
    console.log(mapX, mapY, x, y);
    if (dist < 200000000) {
      small = event.zoom < -4;
    }
    
  }
  onMount(()=>{
    let map = mapContext.value;
    small = map.getZoom() < 0;
    let divIcon = L.divIcon({
      html: el,
      className: "map-marker"
    });
    marker = L.marker([y, x], {
      icon: divIcon,

    }).addTo(map)
    map.addEventListener("zoomanim", onZoom)
  })

  onDestroy(()=>{
    marker?.remove();
    mapContext.value.removeEventListener("zoomanim", onZoom);
  })

</script>

<div bind:this={el}>
  {#if small}
    <div class="bg-white w-fit h-fit">
      {text.slice(0, 5)}
    </div>
  {:else}
    <div class="w-[200px] h-[200px]">
      <ChatMessage content={text} role="user" />
    </div>
  {/if}

</div>

<style>
	/* :global(.map-marker) {
		width:30px;
		transform:translateX(-50%) translateY(-25%);
	} */
</style>