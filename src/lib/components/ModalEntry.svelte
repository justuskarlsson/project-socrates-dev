<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import { modalComponent, modalProps, modalViewProps, type ModalViewProps } from "./ModalView.svelte";

  export let Component: typeof SvelteComponent;
  export let modal: ModalViewProps = {};

  function show(){
    $modalComponent = Component;
    $modalProps = $$restProps;
    $modalViewProps = modal;
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

