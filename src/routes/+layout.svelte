
<script>
	import '../app.css';
  import { user } from '$lib/client/firebase'
	import Login from '$lib/views/Login.svelte';

</script>

<style>
  .header {
    height: 80px;
  }

</style>

    {#if $user}
      <slot/>
    {:else}
       <Login />
    {/if}
    
