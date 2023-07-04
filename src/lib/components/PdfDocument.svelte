<script lang="ts">
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { Resource } from '$lib/client/stores';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import Context from './Context.svelte';

  export let data: ArrayBuffer | Resource;
  
  let pdfContainer: HTMLDivElement;

  const loadPromise = new Promise<PDFDocumentProxy>(async (resolve, reject) => {
    let buffer: ArrayBuffer;
    if (data instanceof Resource) {
      buffer = await Resource.load(data);
    } else {
      buffer = data;
    }
    let doc = await pdfJs.getDocument(buffer).promise;
    resolve(doc);
  })


</script>
<div class="relative h-full w-full bg-slate-200" bind:this={pdfContainer}>
  {#await loadPromise}
    <LoadingSpinner />
  {:then doc}
    <Context doc={doc} >
      <slot />
    </Context>
  {/await} 
  <slot />
</div>


