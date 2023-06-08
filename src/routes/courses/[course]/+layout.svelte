
<script lang="ts">

  import Sidebar from '$lib/views/Sidebar.svelte';
	import Header from '$lib/views/Header.svelte';
	import { onMount, setContext } from 'svelte';
	import { coursesLoading } from '$lib/client/courses';

</script>

<style>
  .sidebar {
    max-height: calc(100vh - 80px);

  }


</style>

{#await coursesLoading()}
<div class="container">
  <h1 class="text-3xl">Loading</h1>
</div>
{:then}


<div class="h-screen flex flex-col">
  <Header />
  <div class="sidebar flex-grow flex items-center">
    <Sidebar />
    <slot></slot>
  </div>
</div>
{/await}