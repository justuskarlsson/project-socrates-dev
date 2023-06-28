<script lang="ts">
	import { MessageGroup, addMapMessageGroup, allMessageGroups, getMapRoot } from '$lib/client/stores';
	import Map from '$lib/components/Map.svelte';
	import MapMessageGroup from '$lib/components/MapMessageGroup.svelte';
	import { onMount } from 'svelte';

	// Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	let messages: { content: string; role: string; x: number; y: number }[] = [
		{ content: 'Hello!', role: 'user', x: 0, y: 0 },
		{ content: 'Hi!', role: 'assistant', x: 1000, y: 1000 }
	];

  let mapRoot: MessageGroup | null = null;
  onMount(async() => {
    mapRoot = await getMapRoot() as MessageGroup;
  })

	const mapSize = 50000;
</script>

<div class="relative">
	<Map size={mapSize} minZoom={-6}>
    {#if mapRoot}
			<MapMessageGroup x={0} y={0} text="" />
    {/if}
	</Map>
</div>
