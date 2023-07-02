<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import { modalComponent, modalProps } from "./ModalView.svelte";

  export let Component: typeof SvelteComponent;

  function show(){
    $modalComponent = Component;
    $modalProps = $$restProps;
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

