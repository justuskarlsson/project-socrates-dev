<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
  import L, { map } from "leaflet"
	import ChatMessage from "$lib/components/ChatMessage.svelte";
	import type { MapContext } from "./Map.svelte";

  export let x: number;
  export let y: number;
  export let text: string;

  let el: HTMLDivElement;
  let context = getContext<MapContext>("map");
  let marker: L.Marker | null = null;
  let small = false;
  let scale = 1.0;
  function setScale(zoom: number) {
    scale = Math.pow(2, zoom+4);

  }
  function onZoom (event: L.ZoomAnimEvent){
    setScale(event.zoom);
  }

  onMount(()=>{
    let map = context.value as L.Map;
    small = map.getZoom() < 0;
    setScale(map.getZoom());
    let divIcon = L.divIcon({
      html: el,
      className: "map-marker"
    });
    marker = L.marker([y, x], {
      icon: divIcon,
      draggable: true,
    }).addTo(map)
    map.addEventListener("zoomanim", onZoom)
  })

  onDestroy(()=>{
    marker?.remove();
    context.value?.removeEventListener("zoomanim", onZoom);
  })

</script>

<div bind:this={el}>
  <div class="min-w-[200px] min-h-[200px] bg-slate-200"
      style="transform:scale({scale}); transform-origin: top left;"
  >
    <ChatMessage content={text} role="user" />
  </div>
</div>




<style>
	/* :global(.map-marker) {
		width:30px;
		transform:translateX(-50%) translateY(-25%);
	} */

</style>