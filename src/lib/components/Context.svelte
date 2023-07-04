<script lang="ts">
	import { setContext } from 'svelte';

	// export let key: string;
	// export let val: any;

	// export let keys: string[] = [];
	for (let [key, val] of Object.entries($$restProps)) {
		setContext(key, val);
		console.log('Context', key, val);
	}
	// Object.entries($$restProps).map((key, val) => {
	//   setContext(key, val);
	//   console.log("Context", key, val);
	// })
</script>

<slot />
