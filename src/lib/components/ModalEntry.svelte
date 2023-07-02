<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import { modalComponent, modalProps } from "./ModalView.svelte";

  export let Component: typeof SvelteComponent;

  function show(){
    $modalComponent = Component;
    $modalProps = $$restProps;
  }
</script>

<button on:click={show}>
  Open
</button>

<style>

</style>

