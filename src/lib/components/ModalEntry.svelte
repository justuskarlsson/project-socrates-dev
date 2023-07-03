<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import { showModal, type ModalViewProps } from "./ModalView.svelte";

  export let Component: typeof SvelteComponent;
  export let modal: ModalViewProps = {};

  function show(){
    showModal(Component, $$restProps, modal);
  }
</script>

<div on:click={show}>
  <slot>
    <button >
      Open
    </button>
  </slot>
</div>

<style>

</style>

