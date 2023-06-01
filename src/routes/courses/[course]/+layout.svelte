
<script>

  import Sidebar from '$lib/views/Sidebar.svelte';
	import Header from '$lib/views/Header.svelte';

</script>

<style>
  .header {
    height: 80px;
  }
  .sidebar {
    width: 260px;
    display: flex;
    justify-content: center;
    overflow-y: scroll;
    max-height: calc(100vh - 80px);

  }

  .main-parent {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .main {
    max-width: 960px;
    overflow-y: scroll;
    max-height: calc(100vh - 80px);
  }

</style>

<div class="h-screen flex flex-col">
  <div class="header bg-blue-100">
    <Header />
  </div>
  <div class="flex-grow flex">
    <div class="sidebar bg-gray-100">
      <Sidebar />
    </div>
    
    <div class="flex-grow p-8 bg-yellow-100 main-parent">
      <div class="main">
        <slot></slot>
      </div>
    </div>
  </div>
</div>