<script lang="ts">
  /**
   * Root for all layout or whatever
  */
	import { page } from '$app/stores';
  import { loaded, updateFromURL } from "$lib/client/stores"

  $: if ($loaded) updateFromURL($page.params);

  // Await all loaded

</script>


{#if $loaded}
    <slot/>
{:else}
    <span class="text-3xl left-0 right-0 top-0 bottom-0 m-auto">Loading..</span>
{/if}