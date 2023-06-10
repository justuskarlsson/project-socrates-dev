
<script lang="ts">

  import Sidebar from '$lib/views/Sidebar.svelte';
	import Header from '$lib/views/Header.svelte';

</script>

<style>
  .body {
    max-height: calc(100vh - 80px);

  }

</style>




<div class="h-screen flex flex-col">
  <Header />
  <div class="body flex-grow flex items-center">
    <Sidebar />
    <slot></slot>
  </div>
</div>