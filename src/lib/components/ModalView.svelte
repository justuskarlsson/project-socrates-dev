
<script lang="ts" context="module">
	import type { SvelteComponent } from "svelte";
	import { writable } from "svelte/store";

  export interface ModalViewProps {
    size?: "3/4" | "full";
    type?: "modal" | "popup";
  };

  export interface ModalInstance {
    viewProps: ModalViewProps;
    props: any;
    component: typeof SvelteComponent;
  };

  export const modalComponent = writable<typeof SvelteComponent | null>(null);
  export const modalProps = writable<any>({});
  export const modalViewProps = writable<ModalViewProps>({});
  export function closeModal(){
    modalComponent.set(null);
    modalProps.set({});
    modalViewProps.set({});
  }
</script>
<script lang="ts">
  let size = "75%";
  $: size = $modalViewProps.size === "full" ? "95%" : "75%";
  
</script>
{#if $modalComponent}
  <div class="modal-background absolute w-full h-full
             bg-gray-500 bg-opacity-50 
             flex justify-center cursor-pointer"
    on:click={closeModal}
  >
    <div class="z-[100000] m-auto bg-opacity-100
                bg-white cursor-auto"
         style="width: {size}; height: {size};"
      on:click={(e)=>{ e.stopPropagation();}}
    >
      <svelte:component 
        this={$modalComponent}
        {...$modalProps} />
    </div>
  </div>
{/if}
<style lang="postcss">

</style>
