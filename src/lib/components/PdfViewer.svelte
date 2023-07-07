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
	import Popup from './Popup.svelte';
	import type { OutlineNodeOrg } from './PdfOutline.svelte';
	import PdfOutline from './PdfOutline.svelte';

  export let resource: Resource;
  
  let root: HTMLDivElement;
  let doc: PDFDocumentProxy;
  let pageIdx = resource.currentPageIdx;
  let doubleSided = false;
  let pageLabels: string[] | null = null;
  let outlineNodes: OutlineNodeOrg[] = [];

  const loadPromise = new Promise<PDFDocumentProxy>(async (resolve, reject) => {
    let buffer: ArrayBuffer = await Resource.load(resource);
    doc = await pdfJs.getDocument(buffer).promise;
    pageLabels = await doc.getPageLabels();
    outlineNodes = await doc.getOutline();
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
    // let start = 24;
    // let end = start + 8;
    console.log("Deleting old embeddings...")
    await Embedding.collection.deleteMany("ref", "==", resource.id);
    let promises: Promise<Embedding>[] = [];
    for (let i = 1; i < doc.numPages + 1; i++) {
      promises.push(new Promise(
        async (resolve, reject) => {
          let page = await doc.getPage(i);
          let text = await Resource.pageToText(page);
          let embedding = await Embedding.fromPage(
            resource.id, text, i);
          resolve(embedding);
        }
      ))
    }
    console.log("Creating new embeddings");
    let embeddings = await Promise.all(promises);
    console.log("Adding new embeddings to db..");
    embeddings = await Embedding.collection.addMany(embeddings);
    console.log("Fetching new embeddings..");
    await Embedding.collection.fetch(allEmbeddings);
  }
  $: console.log(pageIdx);

  function nextPage(){
    pageIdx = Math.min(pageIdx + (doubleSided ? 2 : 1), doc?.numPages || 1000);
    Resource.collection.update(resource.id, {
        currentPageIdx: pageIdx
    })
  }

  function prevPage(){
    pageIdx = Math.max(pageIdx - (doubleSided ? 2 : 1), 0);
    Resource.collection.update(resource.id, {
        currentPageIdx: pageIdx
    })
  }

  onMount(async ()=> {
    document.addEventListener("keydown", async (e) => {
      if (e.key === "ArrowRight") {
        nextPage();
      }
      else if(e.key === "ArrowLeft") {
        prevPage();
      }
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

  let startX: number = 0;
  let startY: number = 0;
  let endX: number = 0;
  let endY: number = 0;
  let isMultiTouch: boolean = false;

  const touchStart = (e: TouchEvent) => {
    // Start tracking the touch points
    isMultiTouch = e.touches.length > 1;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const touchMove = (e: TouchEvent) => {
    // If at any time we detect multiple touch points, cancel the swipe gesture
    if(e.touches.length > 1){
      isMultiTouch = true;
    }
  };

  const touchEnd = (e: TouchEvent) => {
    if(!isMultiTouch){
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      handleSwipe();
    }
  };

  function handleSwipe() {
    const threshold = 100;
    if (startX - endX > threshold) { // Swipe left
      nextPage();
    } else if (startX - endX < -threshold) { // Swipe right
      prevPage();
    }
  };

</script>

<svelte:window on:resize={decideDoubleSided} />
<div class="relative h-full w-full bg-slate-200 
          flex flex-row" 
  on:touchstart={touchStart}
  on:touchend={touchEnd}
  on:touchmove={touchMove}
  bind:this={root}>
  
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
    <div class="absolute bottom-0 
                h-[40px] w-full z-10 shadow-xl"
        style="transform: translateY(25%);"
                >
      <PdfOutline nodes={outlineNodes} bind:pageIdx={pageIdx}/>
    </div>
    <div class="absolute right-2 top-2 flex flex-col space-y-1 z-10">
      <ModalEntry Component={Form} 
                  modal={{type: "modal"}}
                  data={embeddingForm}
                  >
        <Icon icon="upload" tooltip="Create embeddings" class="w-12 h-12 text-yellow-400"/>
      </ModalEntry>
      <div class="relative">
        <Popup>
          <Icon slot="entry" icon="search" tooltip="Semantic search" 
                class="w-12 h-12 text-yellow-400"/>
          <div class="w-[40vw] h-[70vh] absolute top-0 
                      x-float-left bg-opacity-50 bg-gray-200 overflow-y-scroll"
          >
            <PdfSearch {resource} {pageLabels} 
                  onSelect={(item) => {pageIdx = item.pageIdx;}}
              />
          </div>
        </Popup>
      </div>
    </div>
  </Context>
  {/await} 
</div>
  



