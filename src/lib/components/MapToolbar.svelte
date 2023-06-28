<script>
	import { createEventDispatcher } from 'svelte';
	import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte';
	const dispatch = createEventDispatcher();
	let eye = true;
	function clickEye() {
		eye = !eye;
		dispatch('click-eye', eye);
	}
	
	let lines = true;
	function clickLines() {
		lines = !lines;
		dispatch('click-lines', lines);
	}
</script>

<style>
	
	button {
		width: 2rem;
		height: 2rem;
		border: 0;
		background-color: rgba(221, 204, 204, 0.5);
		transition-property: background-color, background-opacity; 
		transition-duration: 250ms;
		border-radius: 0.375rem;
    @apply shadow-2xl ;
	}
	
	.single-click:hover {
		background-color: rgba(211, 211, 211, 0.25);
	}
</style>

<!-- Icons from heroicons.dev -->


<button type="button" on:click={clickLines} class="single-click" title="Show Lines">
  <IoIosAddCircleOutline />
</button>