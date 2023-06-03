<script lang="ts">

  import { onMount } from "svelte";
  import { marked } from 'marked'


  export let content: string;
  let ref: HTMLElement;
  onMount(()=>{
    console.log("Markdown Ref:", ref);
    ref.innerHTML = marked.parse(content);
  })

</script>

<span class="markdown" bind:this={ref}>

</span>
