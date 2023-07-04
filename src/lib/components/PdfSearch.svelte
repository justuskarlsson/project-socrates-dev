<script lang="ts">
	import { Embedding, Resource, allEmbeddings } from "$lib/client/stores";
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { getContext } from "svelte";
  export let resource: Resource;

  let docEmbeddings: Embedding[] = [];
  let searchPhrase: string = "";
  let searchResults: string[] = [];

  let doc = getContext<PDFDocumentProxy>("doc");

  $: {
    docEmbeddings = $allEmbeddings.filter((emb) => (
      emb.ref_type === "resource" && emb.ref === resource.id 
    ))
    console.log(docEmbeddings);
  }

  async function search(){
    let query = await Embedding.createRaw(searchPhrase);
    console.log(searchPhrase, query); 
  }

  function maybeSearch(e: KeyboardEvent){
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  }

</script>


<div class="flex flex-col p-4">
  <input on:keydown={maybeSearch}
        bind:value={searchPhrase}
        class="input input-bordered" 
        placeholder="Search.." />
  {#each searchResults as result}
     <!-- content here -->
  {/each}
</div>