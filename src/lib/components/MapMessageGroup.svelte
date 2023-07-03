<script lang="ts" context="module">
  import MapMessageGroup from "./MapMessageGroup.svelte"
  export class MessageGroupTree {
    constructor(group: MessageGroup, parent: MessageGroupTree | null = null) {
      this.group = group;
      this.parent = parent;
    }
    group: MessageGroup;
    parent: MessageGroupTree | null;
    children: MessageGroupTree[] = [];
    messages: Message[] = [];
    marker: L.Marker | null = null;

    isLeaf() : boolean {
      return this.children.length === 0;
    }
  };

</script>

<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
  import L from "leaflet"
	import ChatMessage from "$lib/components/ChatMessage.svelte";
	import type { MapContext } from "./Map.svelte";
	import { MessageGroup, type Message } from "$lib/client/stores";
	import type { Writable } from "svelte/store";

  export let tree: MessageGroupTree;
  export let hide: boolean = false;
  export let noMarker: boolean = false;

  let group = tree.group;
  let x = group.data.x;
  let y = group.data.y;
  let el: HTMLDivElement;
  let context = getContext<MapContext>("map");
  const map = context.value as L.Map;
  let marker: L.Marker | null = null;
  let small = false;
  let scale = 1.0;

  const selectedGroup = getContext<Writable<MessageGroup | null>>("selectedGroup");
  const prompt = getContext<Writable<string>>("prompt");
  const answer = getContext<Writable<string >>("answer");
  const dragging = getContext<Writable<MessageGroup | null >>("dragging");
  const receiving = getContext<Writable<MessageGroupTree | null >>("receiving");
  let isSelected = false;
  let isHovered = false;

  $: isSelected = $selectedGroup?.id === group.id;

  function selectThis(){
    $selectedGroup = group;
  }

  function setScale(zoom: number) {
    scale = Math.pow(2, zoom+2);

  }
  function onZoom (event: L.ZoomAnimEvent){
    setScale(event.zoom);
  }

  async function onDragEnd(e: L.DragEndEvent) {
    if (!$dragging) return;
    let p = e.target.getLatLng();
    let pos = {
      y: p.lat,
      x: p.lng,
    };
    if ($receiving) {
      console.log("Merging:", $receiving, $dragging);
      if ($receiving.parent === null) throw Error("Should have parent");
      let parent = $receiving.parent.group;
      let parentIsRoot = $receiving.parent.parent === null;
      if (parentIsRoot) {
        parent = await MessageGroup.collection.add({
          parent: parent.id,
          ref_type: "map",
          data: $receiving.group.data
        });
        await MessageGroup.collection.update($receiving.group.id, {
          parent: parent.id,
        })
      } 
      await MessageGroup.collection.update($dragging.id, {
        parent: parent.id,
        data:pos,
      })
    }
    else {
      await MessageGroup.collection.update($dragging.id, {
        data: pos
      })
    }
    $dragging = null;
  }

  async function onDragStart(e: L.LeafletEvent) {
    $dragging = group;
  }

  onMount(()=>{
    if (hide || noMarker) return;
    small = map.getZoom() < 0;
    setScale(map.getZoom());
    let divIcon = L.divIcon({
      html: el,
      className: "map-marker"
    });
    marker = L.marker([y, x], {
      icon: divIcon,
      draggable: true,
    }).addTo(map)
    tree.marker = marker;
    marker.addEventListener("click", selectThis);
    marker.on("dragstart", onDragStart);
    marker.on("dragend", onDragEnd);
    map.addEventListener("zoomanim", onZoom)
  })

  onDestroy(()=>{
    if (hide) return;
    marker?.remove();
    context.value?.removeEventListener("zoomanim", onZoom);
    context.value?.removeEventListener("click", selectThis);
  })

</script>

<div bind:this={el}>
  <div class="map-message-group min-w-[400px] min-h-[200px]
             bg-ghost border-2 border-gray-50"
      style="transform:scale({scale}); transform-origin: top left;"
      class:selected={isSelected}
      class:receiving={$receiving?.group.id === group.id}
      on:mouseover={()=> {isHovered = true;}}
      on:mouseout= {()=> {isHovered = false;}}
  >
    {#each tree.children as child}
      <MapMessageGroup tree={child} noMarker={!hide} />
    {/each}
    {#each tree.messages as {content, role}}
       <ChatMessage {content} {role} />
    {/each}
    {#if isSelected && $prompt.length}
      <ChatMessage content={$prompt} role="user" />
    {/if}
    {#if isSelected && $answer.length}
      <ChatMessage content={$answer} role="assistant" />
    {/if}
  </div>
</div>




<style lang="postcss">
	/* :global(.map-marker) {
		width:30px;
		transform:translateX(-50%) translateY(-25%);
	} */
  .selected {
    @apply border-2 border-blue-300;
  }

  .receiving {
    @apply border-4 border-blue-400 border-dashed;
  }

</style>