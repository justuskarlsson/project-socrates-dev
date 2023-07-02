
<script>
	import '../app.css';
  import 'highlight.js/styles/stackoverflow-light.css'
  import 'leaflet/dist/leaflet.css'
	import App from '$lib/views/App.svelte';
	import ModalView from '$lib/components/ModalView.svelte';
</script>

<style>

</style>
  <ModalView />
  <App>
    <slot />
  </App>

