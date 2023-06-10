<script lang="ts">
  /**
   * Root for all layout or whatever
  */
	import { page } from '$app/stores';
  import { loaded, updateFromURL } from "$lib/client/stores"

  $: updateFromURL($page.data);

  // Await all loaded

</script>

<div class="flex justify-center h-[100%] overflow-y-scroll">

  {#if $loaded}
     <slot/>
  {:else}
     <span class="text-3xl">Loading</span>
  {/if}
</div>