<script lang="ts">
	import { Embedding, Resource, allEmbeddings } from '$lib/client/stores';
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { onMount } from 'svelte';
	import ModalEntry from './ModalEntry.svelte';
	import Form, { FormData, SelectInput, TextInput } from './Form.svelte';
	import PdfPage from './PdfPage.svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import Context from './Context.svelte';
	import Icon from './Icon.svelte';
	import PdfSearch from './PdfSearch.svelte';

  export let resource: Resource;
  
  let root: HTMLDivElement;
  let doc: PDFDocumentProxy;
  let pageIdx = resource.currentPageIdx;
  let doubleSided = false;
  let pageLabels: string[] | null = null;

  const loadPromise = new Promise<PDFDocumentProxy>(async (resolve, reject) => {
    let buffer: ArrayBuffer = await Resource.load(resource);
    doc = await pdfJs.getDocument(buffer).promise;
    pageLabels = await doc.getPageLabels();
    decideDoubleSided()
    resolve(doc);
  })

  const embeddingForm = new FormData({
    frequency: new SelectInput("Frequency of embeddings:", [
      {label: "Every page", value: "page"},
      {label: "Every sentence", value: "sentence"}
    ])
  }, submitEmbedding);

  async function submitEmbedding(values: Record<string, any>){
    let promises: Promise<Embedding>[] = [];
    let start = 44;
    let end = start + 4;
    for (let i = start; i < end; i++) {
      promises.push(new Promise(
        async (resolve, reject) => {
          let page = await doc.getPage(i);
          let content = await page.getTextContent()
          let text = content.items.map((x: any) => x.str || "").join(" ");
          let embedding = await Embedding.fromPage(
            resource.id, text, i);
          embedding = await Embedding.collection.add(embedding);
          resolve(embedding);
        }
      ))
    }
    let embeddings = await Promise.all(promises);
    $allEmbeddings = [...$allEmbeddings, ...embeddings];
  }

  onMount(async ()=> {
    document.addEventListener("keydown", async (e) => {
      let inc = doubleSided ? 2 : 1;
      if (e.key === "ArrowRight") {
        pageIdx = Math.min(pageIdx + inc, doc?.numPages || 1000);
      }
      else if(e.key === "ArrowLeft") {
        pageIdx = Math.max(pageIdx - inc, 0);
      }
      else {
        return;
      }
      Resource.collection.update(resource.id, {
        currentPageIdx: pageIdx
      })
    })
  })

  function decideDoubleSided(){
    let ratio = root.clientWidth / root.clientHeight;
    doubleSided = ratio > 1.42;
    return doubleSided;
  }

  function doubleSidedIndex(idxOne: number, right = false) {
    const getSide = (idx: number) => right ? idx + 1 : idx;
    if (!pageLabels || pageIdx === 1) return getSide(idxOne);

    let realPage = Number.parseInt(pageLabels[idxOne - 1]);
    if (Number.isNaN(realPage)) return getSide(pageIdx);
    let leftSide = realPage % 2 === 0 ? pageIdx : pageIdx - 1
    return getSide(leftSide);

    
  }

</script>
<svelte:window on:resize={decideDoubleSided} />
<div class="relative h-full w-full bg-slate-200 flex flex-row" bind:this={root}>
  {#await loadPromise}
    <LoadingSpinner />
  {:then doc}
  <Context doc={doc} >
    {#if doubleSided}
      <div class="w-1/2">
        <PdfPage index={doubleSidedIndex(pageIdx)}/>
      </div>
      <div class="w-1/2">
        <PdfPage index={doubleSidedIndex(pageIdx, true)}/>
      </div>
    {:else}
      <PdfPage index={pageIdx}/>
    {/if}
    <div class="absolute right-2 top-2 flex flex-col space-y-1">
      <ModalEntry Component={Form} 
                  modal={{type: "modal"}}
                  data={embeddingForm}
                  >
        <Icon icon="upload" tooltip="Create embeddings" class="w-12 h-12 text-yellow-400"/>
      </ModalEntry>
      <ModalEntry 
          Component={PdfSearch} 
          modal={{type: "popup"}}
          {resource}
        >
        <Icon icon="search" tooltip="Semantic search" class="w-12 h-12 text-yellow-400"/>
      </ModalEntry>
    </div>
  </Context>
  {/await} 
</div>
  



