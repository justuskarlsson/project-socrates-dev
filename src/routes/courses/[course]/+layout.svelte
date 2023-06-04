
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
  <div class="h-20 bg-blue-100">
    <Header />
  </div>
  <div class="sidebar flex-grow flex items-center">
    <div class="w-64 flex justify-center h-[100%] overflow-y-scroll">
      <Sidebar />
    </div>
    <slot></slot>
  </div>
</div>
{/await}