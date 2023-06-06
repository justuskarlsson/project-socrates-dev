<script lang="ts">

  import { onMount } from "svelte";
  import { marked } from 'marked'
  import hljs from 'highlight.js'


  export let content: string;
  let ref: HTMLElement;
  $: {
    if (ref) {
      ref.innerHTML = marked.parse(content, {mangle: false, headerIds: false});
      ref.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el as HTMLElement);
      });
    }
  }

</script>

<span class="markdown" bind:this={ref}>

</span>
