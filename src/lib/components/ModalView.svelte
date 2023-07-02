
<script lang="ts" context="module">
	import type { SvelteComponent } from "svelte";
	import { writable } from "svelte/store";


  export const modalComponent = writable<typeof SvelteComponent | null>(null);
  export const modalProps = writable<any>({});
  export function closeModal(){
    modalComponent.set(null);
    modalProps.set({});
  }
</script>
<script lang="ts">

</script>
{#if $modalComponent}
  <div class="absolute w-screen h-screen
             bg-gray-500 bg-opacity-50 
             flex justify-center cursor-pointer"
    on:click={closeModal}
  >
    <div class="z-[100000] m-auto bg-opacity-100
                bg-white w-3/4 h-3/4 cursor-auto"
      on:click={(e)=>{ e.stopPropagation();}}
    >
      <svelte:component 
        this={$modalComponent}
        {...$modalProps} />
    </div>
  </div>
{/if}
<style>

</style>
