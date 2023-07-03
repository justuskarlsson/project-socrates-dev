<script lang="ts" context="module">
  export interface Input {
    name: string;
    [x: string]: any;
  };
</script>

<script lang="ts">
	import { closeModal } from "./ModalView.svelte";

  export let inputs: Input[] = [];
  HTMLInputElement
</script>


<div class="w-full h-full bg-white flex flex-col p-4 space-y-2">
  {#each inputs as input}
    <label class="label">
      <span class="label-text">{input.name}:</span>
    </label>
    <input type="text" placeholder="Type here" 
           class="input input-bordered"
           />
  {/each}
  <button class="btn" on:click={closeModal}>
    Submit
  </button>
</div>


<style>

</style>