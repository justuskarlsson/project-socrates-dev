<script lang="ts">
	import {
		MessageGroup,
		addMapMessageGroup,
		allMessageGroups,
		allMessages,
		getMapRoot
	} from '$lib/client/stores';
	import Map from '$lib/components/Map.svelte';
	import MapMessageGroup, { MessageGroupTree } from '$lib/components/MapMessageGroup.svelte';
	import { onMount } from 'svelte';

	// Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0

  let treeRoot: MessageGroupTree | null = null;
	async function makeTree(...reactive: any) {
		if (mapRoot === null) {
			return;
		}
    treeRoot = new MessageGroupTree(mapRoot);
		let groups: Record<string, MessageGroupTree> = {
			[mapRoot.id]: treeRoot
		};
		let prevSize = 0;
		const curSize = () => Object.keys(groups).length;
		while (curSize() > prevSize) {
			prevSize = curSize();
			$allMessageGroups.map((group) => {
				if (group.parent in groups) {
					const tree = new MessageGroupTree(group);
					groups[group.id] = tree;
					groups[group.parent].children.push(tree);
				}
			});
		}
    console.log(curSize())
		$allMessages.map((message) => {
			if (message.groupId && message.groupId in groups) {
        groups[message.groupId].messages.push(message);
			}
		});
	}

	$: {
		makeTree($allMessageGroups, $allMessages, mapRoot);
	}

	let mapRoot: MessageGroup | null = null;
	onMount(async () => {
		mapRoot = (await getMapRoot()) as MessageGroup;
	});

	const mapSize = 50000;
</script>

<div class="relative">
	<Map size={mapSize} minZoom={-6}>
		{#if treeRoot}
			<MapMessageGroup tree={treeRoot} />
		{/if}
	</Map>
</div>
