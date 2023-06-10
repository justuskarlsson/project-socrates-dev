<script lang="ts">
  /**
   * Root for all layout or whatever
   */
  import { loadingAuthState } from '$lib/client/firebase';
	import { page } from '$app/stores';
  import { loaded, updateFromURL } from "$lib/client/stores"
  import FaSpinner from 'svelte-icons/fa/FaSpinner.svelte'
  import { userStore } from '$lib/client/firebase'
	import Login from '$lib/views/Login.svelte';

  $: if ($loaded) updateFromURL($page.params);

  // Await all loaded

</script>


   
{#if !$loaded || $loadingAuthState}
  <div class="animate-spin w-32 h-32 mx-auto mt-[20%]"> 
    <FaSpinner /> 
  </div>
{:else if !$userStore}
  <Login />
{:else}
  <slot/>
{/if}