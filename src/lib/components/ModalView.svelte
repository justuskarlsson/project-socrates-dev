
<script lang="ts" context="module">
	import type { SvelteComponent } from "svelte";
	import { writable } from "svelte/store";


  export const modalComponent = writable<typeof SvelteComponent | null>(null);
  export const modalProps = writable<any>({});
</script>
<script lang="ts">
  
</script>
{#if $modalComponent}
  <svelte:component this={$modalComponent} {...$modalProps} />
{/if}
<style>

</style>
