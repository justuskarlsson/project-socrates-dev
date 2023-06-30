<script context="module" lang="ts">
	export interface MapContext {
		value: L.Map | null;
	}
</script>

<script lang="ts">

	import L from 'leaflet';
	import { setContext } from 'svelte';
	import MapBackground from './MapBackground.svelte';

	export let size: number = 5000;
	export let minZoom: number = -7;
	export let maxZoom: number = -2;
  export let x: number = 0.0;
  export let y: number = 0.0;
  export let zoom = -4;
	export let map: L.Map | null = null;

	let context: MapContext = {
		value: null
	};

	// Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	setContext('map', context);

	const bounds = L.latLngBounds([-size, -size], [size, size]);
	function createMap(container: HTMLDivElement) {
		map = L.map(container, {
			crs: L.CRS.Simple,
			minZoom,
      maxZoom,
      attributionControl: false,
      keyboardPanDelta: 100.0,
      zoomSnap: 0.25
		});
		context.value = map;
    let bgDummy = document.createElement("div");
    new MapBackground({target: bgDummy});

    // convert the SVG pattern to a data URL
    // const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgPattern)}`;
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(bgDummy.innerHTML)}`;
    const imageUrl = 'https://wallpaperset.com/w/full/a/f/f/371852.jpg'
		L.imageOverlay(svgDataUrl, bounds).addTo(map);
		map.fitBounds(bounds);
    map.setView([y, x], zoom)
		return {
			destroy: () => {
				map?.remove();
				map = null;
			}
		};
	}

	function resizeMap() {
		if (map) {
			map.invalidateSize();
		}
	}
</script>

<svelte:window on:resize={resizeMap} />

<div class="w-screen h-[calc(100vh-4rem)]" use:createMap>
	<slot />
</div>


<style>
  /* :global(.leaflet-container) {
    background:
      linear-gradient(0deg, transparent 24px, rgba(0,0,0,.1) 25px, transparent 26px),
      linear-gradient(90deg, transparent 24px, rgba(0,0,0,.1) 25px, transparent 26px),
      theme("colors.parchment") !important;
    background-size: 50px 50px !important;
  } */
  /* :global(.leaflet-container) {
    background: linear-gradient(to right, theme("colors.parchment"), theme("colors.gray.600")) !important;
  } */
</style>