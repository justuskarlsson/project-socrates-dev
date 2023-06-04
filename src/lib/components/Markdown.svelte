<script lang="ts">

  import { onMount } from "svelte";
  import { marked } from 'marked'


  export let content: string;
  let ref: HTMLElement;
  $: {
    if (ref) {
      ref.innerHTML = marked.parse(content, {mangle: false, headerIds: false});
    }
  }

</script>

<span class="markdown" bind:this={ref}>

</span>
