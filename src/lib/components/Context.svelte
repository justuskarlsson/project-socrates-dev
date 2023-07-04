<script lang="ts">
	import { setContext } from 'svelte';

	for (let [key, val] of Object.entries($$restProps)) {
		setContext(key, val);
	}
</script>

<slot />
