<script lang="ts">
	import L from "leaflet";
	import { onMount } from "svelte";
	import Map from "./Map.svelte"
	import Marker from "./Marker.svelte";
	import * as tf from '@tensorflow/tfjs';
	import { allEmbeddings, allMessages } from "$lib/client/stores";
	import { greedyClustering, pairwiseCosineDist } from "$lib/client/compute";

  // Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	let messages: {content: string, role: string, x: number, y: number}[] = [];
	const mapSize = 50000;
	function getMessage(embeddingIdx: number) {
		let embedding = $allEmbeddings[embeddingIdx];
		return $allMessages.find((m) => m.id === embedding.messageId);
	}

	async function cluster(a: any){
		let data: number[][] = $allEmbeddings.map((e) => e.embedding);
    let refEmbeddings: tf.Tensor2D = tf.tensor(data);
		let similarities = refEmbeddings.matMul(refEmbeddings.transpose());
		let clusters = await greedyClustering(similarities as tf.Tensor2D);
		messages = [];
		let step = 2000;
		let y = -mapSize;
		let x = -mapSize;
		for (let cluster of clusters) {
			for (let idx of cluster) {
				let message = getMessage(idx);
				if (message) {
					messages.push({
						content: message.content,
						role: message.role,
						x, y
					});
				}
				x += step;
			}
			x = -mapSize;
			y += step;
			console.log(messages);
		}

	}

	$ : {
		cluster($allEmbeddings);
	}

</script>

<Map size={mapSize}>
	{#each messages as {x, y, content}}
		 <Marker {x} {y} text={content} />
	{/each}
</Map>