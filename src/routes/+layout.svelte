
<script>
	import '../app.css';
  import 'highlight.js/styles/stackoverflow-light.css'
  import { user } from '$lib/client/firebase'
	import Login from '$lib/views/Login.svelte';
</script>

<style>

</style>

    {#if $user}
      <slot/>
    {:else}
       <Login />
    {/if}
    
