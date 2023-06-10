
<script>
	import '../app.css';
  import 'highlight.js/styles/stackoverflow-light.css'
  import { userStore } from '$lib/client/firebase'
	import Login from '$lib/views/Login.svelte';
	import App from '$lib/views/App.svelte';
</script>

<style>

</style>

    {#if $userStore}
      <App>
        <slot/>
      </App>
    {:else}
       <Login />
    {/if}
    
