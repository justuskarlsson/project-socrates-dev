
<script>

  import Sidebar from '$lib/views/Sidebar.svelte';
	import Header from '$lib/views/Header.svelte';

</script>

<style>
  .sidebar {
    max-height: calc(100vh - 80px);

  }

  .main-parent {
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
    
    <div class="main-parent flex-grow p-8 bg-yellow-100 flex flex-col items-center overflow-y-scroll">
      <div class="max-w-screen-md">
        <slot></slot>
      </div>
    </div>
  </div>
</div>