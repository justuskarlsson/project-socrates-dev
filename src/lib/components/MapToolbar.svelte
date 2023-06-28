<script>
	import { getMapRoot } from '$lib/client/stores';
	import { createEventDispatcher } from 'svelte';
	import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte';
	const dispatch = createEventDispatcher();

	async function addGroup() {
		dispatch('add-group');    
	}
</script>

<!-- Icons from heroicons.dev -->

<button type="button" on:click={addGroup} class="single-click" title="Show Lines">
	<IoIosAddCircleOutline />
</button>

<style>
	button {
		width: 2rem;
		height: 2rem;
		border: 0;
		background-color: theme('colors.ghost');
		transition-property: background-color, background-opacity;
		transition-duration: 250ms;
		border-radius: 0.375rem;
		@apply shadow-2xl;
	}

	.single-click:hover {
		background-color: rgba(211, 211, 211, 0.25);
	}
</style>
