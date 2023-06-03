
<script lang="ts">

  import Sidebar from '$lib/views/Sidebar.svelte';
	import Header from '$lib/views/Header.svelte';
	import { onMount, setContext } from 'svelte';

</script>

<style>
  .sidebar {
    max-height: calc(100vh - 80px);

  }


</style>

<div class="h-screen flex flex-col">
  <div class="h-20 bg-blue-100">
    <Header />
  </div>
  <div class="sidebar flex-grow flex">
    <div class="w-64 flex justify-center overflow-y-scroll">
      <Sidebar />
    </div>
    <div>

      <slot></slot>
    </div>
  </div>
</div>