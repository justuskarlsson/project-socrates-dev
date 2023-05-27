
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


    <slot/>
