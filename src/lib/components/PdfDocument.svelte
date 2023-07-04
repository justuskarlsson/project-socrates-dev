<script lang="ts">
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { onMount, setContext } from 'svelte';
	import ModalEntry from './ModalEntry.svelte';
	import Form from './Form.svelte';
	import { Resource } from '$lib/client/stores';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import Context from './Context.svelte';

  export let data: ArrayBuffer | Resource;
  
  let pdfContainer: HTMLDivElement;
  let doc: PDFDocumentProxy | null;
	// The workerSrc property shall be specified.
  // console.log(pdfJs)
	pdfJs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.js',
		import.meta.url
	).toString();
  type DocContext = {value: PDFDocumentProxy | null};
  const docContext: DocContext = {value: null};
  // setContext("doc", docContext);

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


