<script lang="ts">
	import L from "leaflet";
	import { onMount } from "svelte";

  // Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0
	const SIZE = 5000;
	let map: L.Map | null = null;

  function createMap(container: HTMLDivElement) {
    map = L.map(container, {
			crs: L.CRS.Simple,
			minZoom: -4
		})
		let image = L.imageOverlay(
			"https://www.camelotgamestore.com/nopc/content/images/thumbs/0000494_blank-grid-map-36x72-double-sided_550.jpeg",
			[[-SIZE, -SIZE], [SIZE, SIZE]],
		).addTo(map);
    map.fitBounds([[-SIZE, -SIZE], [SIZE, SIZE]]);
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

</div>