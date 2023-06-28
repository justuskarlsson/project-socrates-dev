<script lang="ts">
	import {
		MessageGroup,
		addMapGroup,
		addMapMessageGroup,
		allMessageGroups,
		allMessages,
		getMapRoot
	} from '$lib/client/stores';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Map from '$lib/components/Map.svelte';
	import MapMessageGroup, { MessageGroupTree } from '$lib/components/MapMessageGroup.svelte';
	import MapToolbar from '$lib/components/MapToolbar.svelte';
	import { onMount } from 'svelte';
	import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte';

	// Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0
	const mapSize = 50000;
  let map: L.Map | null = null;
  
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
				if (group.parent in groups && !(group.id in groups)) {
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

  async function onAddClick(){
    let pos = map!.getCenter();
    let y = pos.lat;
    let x = pos.lng;
    let mapRoot = await getMapRoot() as MessageGroup;
    addMapGroup(mapRoot.id, x, y);
  }

</script>

<div class="relative ">
	<Map bind:map={map} size={mapSize} minZoom={-6}>
		{#if treeRoot}
			<MapMessageGroup tree={treeRoot} hide={true} />
		{/if}
	</Map>
  <div class="ui">
		<div class=" flex flex-row-reverse top-4 " style="right: 20px;">
			<div
				class="group w-12 h-12 x-icon
								  mx-0 bg-gray-800 text-gray-300"
				on:click={onAddClick}
			>
				<IoIosAddCircleOutline />
				<span class="x-icon-tooltip group-hover:scale-100 -left-8 -bottom-12"> Add island </span>
			</div>
		</div>
		<div class="absolute px-6 bottom-6 mx-auto max-w-[720px]">
			<ChatInput onSendMessage={()=>{}} />
		</div>
	</div>
</div>


<style>
  .ui > * {
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		position: absolute;
		z-index: 5000;
	}
</style>