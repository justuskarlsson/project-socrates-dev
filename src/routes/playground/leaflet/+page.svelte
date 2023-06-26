<script lang="ts">
	import L from "leaflet";
	import { onMount } from "svelte";
	import Map from "./Map.svelte"
	import Marker from "./Marker.svelte";

  // Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	let markers = [1, 2, 3];


</script>

<Map>
	<Marker x={-1000} y={200} text="Jet engines" />
	<Marker x={2000} y={200} text="Science" />
	<Marker x={-2000} y={2000} text="German language" />
</Map>