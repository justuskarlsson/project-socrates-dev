
<script>
	import '../app.css';

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
    
    <div class="flex-grow p-8 bg-yellow-100">
      <slot></slot>
    </div>
  </div>
</div>