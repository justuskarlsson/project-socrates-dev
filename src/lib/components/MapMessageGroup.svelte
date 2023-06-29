<script lang="ts" context="module">
  import MapMessageGroup from "./MapMessageGroup.svelte"
  export class MessageGroupTree {
    constructor(group: MessageGroup) {
      this.group = group;
    }
    group: MessageGroup;
    parent: MessageGroupTree | null;
    children: MessageGroupTree[] = [];
    messages: Message[] = [];

    isLeaf() : boolean {
      return this.children.length === 0;
    }
  };

</script>

<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
  import L, { map } from "leaflet"
	import ChatMessage from "$lib/components/ChatMessage.svelte";
	import type { MapContext } from "./Map.svelte";
	import { MessageGroup, type Message } from "$lib/client/stores";
	import type { Writable } from "svelte/store";
	import { marked } from "marked";

  export let tree: MessageGroupTree;
  export let hide: boolean = false;

  let group = tree.group;
  let x = group.data.x;
  let y = group.data.y;
  let el: HTMLDivElement;
  let context = getContext<MapContext>("map");
  let marker: L.Marker | null = null;
  let small = false;
  let scale = 1.0;

  const selectedGroup = getContext<Writable<MessageGroup | null>>("selectedGroup");
  const prompt = getContext<Writable<string>>("prompt");
  const answer = getContext<Writable<string >>("answer");
  let isSelected = false;

  $: isSelected = $selectedGroup?.id === group.id;

  function selectThis(){
    $selectedGroup = group;
  }

  function setScale(zoom: number) {
    scale = Math.pow(2, zoom+4);

  }
  function onZoom (event: L.ZoomAnimEvent){
    setScale(event.zoom);
  }

  async function onDragEnd(e: L.DragEndEvent) {
    let p = e.target.getLatLng();
    let pos = {
      y: p.lat,
      x: p.lng,
    };
    await MessageGroup.collection.update(group.id, {
      data: pos
    })
  }

  onMount(()=>{
    if (hide) return;

    let map = context.value as L.Map;
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
    marker.addEventListener("click", selectThis);
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
  <div class="min-w-[400px] min-h-[200px] bg-ghost"
      style="transform:scale({scale}); transform-origin: top left;"
    class:selected={isSelected}
  >
    {#each tree.children as child}
      <MapMessageGroup tree={child} />
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




<style>
	/* :global(.map-marker) {
		width:30px;
		transform:translateX(-50%) translateY(-25%);
	} */
  .selected {
    @apply border-2 border-blue-300;
  }

</style>