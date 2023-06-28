<script context="module" lang="ts">
	export interface MapContext {
		value: L.Map | null;
	}
</script>

<script lang="ts">

	import L from 'leaflet';
	import { setContext } from 'svelte';
	import MapToolbar from './MapToolbar.svelte';

	export let size: number = 5000;
	export let minZoom: number = -7;
	let map: L.Map | null = null;

	let context: MapContext = {
		value: null
	};

	// Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	setContext('map', context);

	const bounds = L.latLngBounds([-size, -size], [size, size]);
	let toolbar = new L.Control({ position: 'topright' });
	let toolbarComponent;
	toolbar.onAdd = (map) => {
		let div = L.DomUtil.create('div');
		toolbarComponent = new MapToolbar({
			target: div,
			props: {}
		});
    toolbarComponent.$on('click-eye', ({ detail }) => console.log(detail));
		return div;
	};
	function createMap(container: HTMLDivElement) {
		map = L.map(container, {
			crs: L.CRS.Simple,
			minZoom
		});
		context.value = map;
		L.imageOverlay('https://wallpaperset.com/w/full/a/f/f/371852.jpg', bounds).addTo(map);
		map.fitBounds(bounds);
    map.setView([0, 0], -5)
		toolbar.addTo(map);
		return {
			destroy: () => {
				toolbar.remove();
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

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
	integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
	crossorigin=""
/>
<svelte:window on:resize={resizeMap} />

<div class="w-screen h-[90vh]" use:createMap>
	<slot />
</div>
