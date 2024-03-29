<script lang="ts">
	import {
	Message,
		MessageGroup,
		addMapGroup,
		addMapMessageGroup,
		allMessageGroups,
		allMessages,
		getMapRoot
	} from '$lib/client/stores';
	import { MessageStream, SYS_MESSAGE_TEACHER } from '$lib/client/util';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Map from '$lib/components/Map.svelte';
	import MapMessageGroup, { MessageGroupTree } from '$lib/components/MapMessageGroup.svelte';
	import { onMount, setContext } from 'svelte';
	import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte';
  import IoMdRemoveCircleOutline from 'svelte-icons/io/IoMdRemoveCircleOutline.svelte'
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
  import type * as Req from "$lib/request_types"
	import L from 'leaflet';

	// Example: https://svelte.dev/repl/62271e8fda854e828f26d75625286bc3?version=4.0.0
	const mapSize = 50000;
  let map: L.Map | null = null;
	let mapRoot: MessageGroup | null = null;
  let selectedGroup = writable<MessageGroup | null>(null);
  let prompt = writable<string>("");
  let answer = writable<string>("");
  let dragging = writable<MessageGroup | null>(null);
  let receiving = writable<MessageGroupTree | null>(null);
    
  let trees: Record<string, MessageGroupTree> = {};
  let treeRoot: MessageGroupTree | null = null;
  setContext("selectedGroup", selectedGroup);
  setContext("prompt", prompt);
  setContext("answer", answer);
  setContext("dragging", dragging);
  setContext("receiving", receiving);

  async function sendMessage(content: string) {
		if (!$selectedGroup || !($selectedGroup.id in trees)) {
			return console.error("Could not find active group");
		}
    
    const body: Req.Chat = { 
      messages: [
        SYS_MESSAGE_TEACHER,
        ...trees[$selectedGroup.id].messages.map(({content, role}) => ({
          content,
          role
        })), {
					content: $prompt,
					role: "user",
				}
      ]
    };

    const messageStream = MessageStream(body);
    
    for await (let part of messageStream){
      $answer += part;
    }
    let newPrompt = await Message.collection.add({
      content: $prompt,
      groupId: $selectedGroup.id,
      role: "user"
    });
    let newAnswer = await Message.collection.add({
      content: $answer,
      groupId: $selectedGroup.id,
      role: "assistant"
    });
		$allMessages = [...$allMessages, newPrompt, newAnswer];
    $answer = "";
    $prompt = "";
	}


	async function makeTree(...reactive: any) {
		if (mapRoot === null) {
			return;
		}
    treeRoot = new MessageGroupTree(mapRoot);
		trees = {
			[mapRoot.id]: treeRoot
		};
		let prevSize = 0;
		const curSize = () => Object.keys(trees).length;
		while (curSize() > prevSize) {
			prevSize = curSize();
			$allMessageGroups.map((group) => {
				if (group.parent in trees && !(group.id in trees)) {
					const tree = new MessageGroupTree(group, trees[group.parent]);
					trees[group.id] = tree;
					trees[group.parent].children.push(tree);
				}
			});
		}
		$allMessages.map((message) => {
			if (message.groupId && message.groupId in trees) {
        trees[message.groupId].messages.push(message);
			}
		});
    console.log(treeRoot);
	}

	$: {
		makeTree($allMessageGroups, $allMessages, mapRoot);
	}

  function onMouseMove(e: L.LeafletMouseEvent) {
    if (!$dragging) {
      return;
    }
    let mousePos = e.latlng;
    for (let tree of Object.values(trees)) {
      if ($dragging.id === tree.group.id) continue;
      let marker = tree.marker;
      if (!marker) continue;
      let markerPos = marker.getLatLng();
      let markerSize = marker.getElement()
        ?.querySelector(".map-message-group")
        ?.getBoundingClientRect();
      if (!markerSize) continue;
      let markerPoint = map!.latLngToContainerPoint(markerPos);

      // Calculate the screen (pixel) coordinates of the marker bounds
      let markerBoundsPoint = L.bounds(
        [markerPoint.x, markerPoint.y],
        [markerPoint.x + markerSize.width, markerPoint.y + markerSize.height]
      );

      // Convert the screen (pixel) coordinates of the marker bounds back to geographical coordinates
      let markerBounds = L.latLngBounds(
        map!.containerPointToLatLng(markerBoundsPoint.getBottomLeft()),
        map!.containerPointToLatLng(markerBoundsPoint.getTopRight())
      );

      if (markerBounds.contains(mousePos)) {
        $receiving = tree;
        return;
      }
    }
    $receiving = null;
  }

	onMount(async () => {
		mapRoot = (await getMapRoot()) as MessageGroup;
    map?.on("click", () => {
      $selectedGroup = null;
    })
    map?.on("mousemove", onMouseMove);
	});

  async function onAddClick(){
    let pos = map!.getCenter();
    let y = pos.lat;
    let x = pos.lng;
    let mapRoot = await getMapRoot() as MessageGroup;
    let newGroup = await addMapGroup(mapRoot.id, x, y);
    $allMessageGroups = [...$allMessageGroups, newGroup];
  }

</script>

<div class="relative ">
	<Map bind:map={map} size={mapSize} minZoom={-6} maxZoom={-1}
       x={-1024} y={4176} zoom={-2.5}
  >
		{#if treeRoot}
			<MapMessageGroup tree={treeRoot} hide={true} />
		{/if}
	</Map>
  <div class="toolbar absolute flex flex-row-reverse top-4 right-4 z-[4000]">
    <div
      class="group w-12 h-12 x-icon
                mx-0 bg-gray-800 text-gray-300"
      on:click={onAddClick}
    >
      <IoIosAddCircleOutline />
      <span class="x-icon-tooltip group-hover:scale-100 -left-8 -bottom-12"> Add group </span>
    </div>
    {#if $selectedGroup}
    <div
      class="group w-12 h-12 x-icon
                mx-0 bg-red-500 text-white"
      on:click={onAddClick}
    >
      <IoMdRemoveCircleOutline />
      <span class="x-icon-tooltip group-hover:scale-100 -left-8 -bottom-12"> Remove group </span>
    </div>
    {/if}
  </div>
  <div class="ui">
    {#if $selectedGroup}
		<div class="absolute px-6 bottom-6 mx-auto max-w-[720px]"
          in:fly
          out:fly
    >
			<ChatInput onSendMessage={sendMessage} bind:value={$prompt} />
		</div>
    {/if}
	</div>
</div>


<style>
  .toolbar > * {
    margin-right: 4px;
  }
  .ui > * {
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		position: absolute;
		z-index: 5000;
	}
</style>