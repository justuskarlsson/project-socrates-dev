<script lang="ts">
	import L from "leaflet";
	import { onMount } from "svelte";
	import Map from "./Map.svelte"
	import Marker from "./Marker.svelte";
	import * as tf from '@tensorflow/tfjs';
	import { allEmbeddings } from "$lib/client/stores";

  // Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	let markers = [1, 2, 3];

	$ : {
		let data: number[][] = $allEmbeddings.map((e) => e.embedding);
    let refEmbeddings: tf.Tensor2D = tf.tensor(data);
	}

</script>

<Map>
	<Marker x={-1000} y={200} text="Jet engines" />
	<Marker x={2000} y={200} text="Science" />
	<Marker x={-2000} y={2000} text="German language" />
</Map>