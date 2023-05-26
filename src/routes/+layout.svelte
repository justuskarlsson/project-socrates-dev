
<script>
	import '../app.css';

  import Sidebar from '$lib/views/Sidebar.svelte';
	import Header from '$lib/views/Header.svelte';

  export const ssr = false;
  export const prerender = false;
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
