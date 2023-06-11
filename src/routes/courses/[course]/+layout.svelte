
<script lang="ts">

	import Header from '$lib/views/Header.svelte';

</script>

<style>
  .body {
    max-height: calc(100vh - 64px);

  }

</style>




<div class="h-screen flex flex-col p-0 m-0">
  <Header />
  <div class="body flex-grow flex items-center">
    <slot></slot>
  </div>
</div>