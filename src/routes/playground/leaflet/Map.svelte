<script lang="ts">
	import L from "leaflet";
	import { setContext } from "svelte";

  // Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0
	export let size: number = 5000;
	let map: L.Map | null = null;
  let mapContext: {value: L.Map | null} = {value: null};


  setContext("map", mapContext);

  const bounds = L.latLngBounds([-size, -size], [size, size]);

  function createMap(container: HTMLDivElement) {
    map = L.map(container, {
			crs: L.CRS.Simple,
			minZoom: -4
		})
    mapContext.value = map;
		let image = L.imageOverlay(
			"https://wallpaperset.com/w/full/a/f/f/371852.jpg",
			bounds,
		).addTo(map);
    map.fitBounds(bounds);
		return {
       destroy: () => {
				 map?.remove();
				 map = null;
			 }
    };
	}

	function resizeMap() {
	  if(map) { map.invalidateSize(); }
  }

</script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>
<svelte:window on:resize={resizeMap} />

<div class="w-screen h-screen" use:createMap>
  <slot></slot>
</div>