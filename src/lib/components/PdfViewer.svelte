<script lang="ts">
	import { Resource } from '$lib/client/stores';
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { onMount } from 'svelte';
	import ModalEntry from './ModalEntry.svelte';
	import Form, { FormData, SelectInput, TextInput } from './Form.svelte';
	import PdfPage from './PdfPage.svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import Context from './Context.svelte';

  export let resource: Resource;
  
  let root: HTMLDivElement;
  let doc: PDFDocumentProxy;
  let pageIdx = 1;
  let doubleSided = false;


  const loadPromise = new Promise<PDFDocumentProxy>(async (resolve, reject) => {
    let buffer: ArrayBuffer = await Resource.load(resource);
    doc = await pdfJs.getDocument(buffer).promise;
    resolve(doc);
  })

  const embeddingForm = new FormData({
    frequency: new SelectInput("Frequency of embeddings:", [
      {label: "Every page", value: "page"},
      {label: "Every sentence", value: "sentence"}
    ])
  }, submitEmbedding);

  async function submitEmbedding(values: Record<string, any>){
    let promises: Promise<string>[] = [];
    for (let i = 1; i < doc.numPages; i++) {
      promises.push(new Promise(
        async (resolve, reject) => {
          let page = await doc.getPage(i);
          let content = await page.getTextContent()
          let text = content.items.map((x: any) => x.str || "").join(" ");
          resolve(text);
        }
      ))
    }
    let textPages = await Promise.all(promises);
    console.log(textPages[55].slice(0, 20));
    console.log(textPages[56].slice(0, 20));
  }

  onMount(async ()=> {
    document.addEventListener("keydown", async (e) => {
      if (e.key === "ArrowRight") {
        pageIdx = Math.min(pageIdx + 1, doc?.numPages || 1000);
      }
      else if(e.key === "ArrowLeft") {
        pageIdx = Math.max(pageIdx - 1, 0);
      }
    })
  })

  function useDoubleSided(){
    let ratio = root.clientWidth / root.clientHeight;
    doubleSided = ratio > 1.42;
    return doubleSided;
  }

</script>


<div class="relative h-full w-full bg-slate-200" bind:this={root}>
  {#await loadPromise}
    <LoadingSpinner />
  {:then doc}
  <Context doc={doc} >
    {#if useDoubleSided()}
      <PdfPage index={pageIdx}/>
      <PdfPage index={pageIdx + 1}/>
    {:else}
      <PdfPage index={pageIdx}/>
    {/if}
    <div class="absolute right-2 top-2 flex flex-col space-y-1">
      <ModalEntry Component={Form} 
                  modal={{type: "modal"}}
                  data={embeddingForm}
                  >
        <button class="w-12 h-12 bg-blue-400">
          E
        </button>
      </ModalEntry>
      <div class="w-12 h-12 bg-blue-400">

      </div>
    </div>
  </Context>
  {/await} 
</div>
  



