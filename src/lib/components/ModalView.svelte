<script lang="ts" context="module">
	import App from '$lib/views/App.svelte';
	import type { SvelteComponent } from 'svelte';
	import { writable, get } from 'svelte/store';

	export interface ModalViewProps {
		size?: '3/4' | 'full';
		type?: 'modal' | 'popup';
	}

	export interface ModalInstance {
		component: typeof SvelteComponent;
		props: any;
		viewProps: ModalViewProps;
	}

  const modalStack = writable<ModalInstance[]>([]);
	export function closeModal() {
		let stack = get(modalStack);
    stack.pop();
    modalStack.set(stack);
	}
	export function showModal(
    component: typeof SvelteComponent,                
    props: any,     
    viewProps: ModalViewProps = {}
  ) 
  {
		modalStack.update((stack) => [
      ...stack,
      {component, props, viewProps}
    ])
	}
</script>

<script lang="ts">
  const baseZ = 10000;
  function getSize(size: string | undefined){
    return size === 'full' ? '95%' : '75%';
  }
</script>

{#each $modalStack as {component, props, viewProps}, i}
   <div
     class="modal-background absolute w-full h-full
              bg-gray-500 bg-opacity-50
              flex justify-center cursor-pointer"
    style="--tw-bg-opacity: {viewProps.type === "popup" ? "1.0" : "0.5"};
           z-index: {(i+1) * baseZ};"
     on:click={closeModal}
   >
     <div
       class="z-[100000] m-auto bg-opacity-100
                 bg-white cursor-auto"
       style="width: {getSize(viewProps.size)};
              height: {getSize(viewProps.size)};
              z-index: {(i+1) * baseZ + 1};"
       on:click={(e) => {
         e.stopPropagation();
       }}
     >
       <svelte:component this={component} {...props} />
     </div>
   </div>
{/each}

<style lang="postcss">
</style>
