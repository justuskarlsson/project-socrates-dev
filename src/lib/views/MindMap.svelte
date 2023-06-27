<script lang="ts">
	import Map from "$lib/components/Map.svelte"
	import Marker from "$lib/components/Marker.svelte";
	import MessageGroup from "$lib/components/MessageGroup.svelte";

  // Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

	let messages: {content: string, role: string, x: number, y: number}[] = [
        {content: "Hello!", role: "user", x: 0, y: 0},
        {content: "Hi!", role: "assistant", x: 1000, y: 1000},
    ];
	const mapSize = 50000;

</script>

<div class="relative">
    <Map size={mapSize} minZoom={-6}>
        {#each messages as {x, y, content}}
             <MessageGroup {x} {y} text={content} />
        {/each}
    </Map>
    <div class="absolute right-4 top-4 z-1000">
        bla
    </div>
</div>