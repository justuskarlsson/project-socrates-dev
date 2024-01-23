<script lang="ts" context="module">
  export interface SearchResult {
    preview: string;
    pageIdx: number;
    pageLabel: string;
    distance: number;
  };
</script>

<script lang="ts">
	import { Embedding, Resource, allEmbeddings } from "$lib/client/stores";
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { getContext } from "svelte";
  import * as tf from '@tensorflow/tfjs';
	import { euclideanDists } from "$lib/client/compute";
  


  export let resource: Resource;
  // export let doc: PDFDocumentProxy;
  export let k: number = 5;
  export let previewLength: number = 800;
  export let pageLabels: string[] | null = null;
  export let onSelect: (item: SearchResult) => void = () => {};


  let searchResults: SearchResult[] = [];
  let searching = false;

  let docEmbeddings: Embedding[] = [];
  let searchPhrase: string = "";
  let refEmbeddings: tf.Tensor2D;

  function relevancePercent(distance: number): string {
    // Convert Euclidean distance to a rough relevance % (lower distance = higher relevance)
    const pct = Math.max(0, Math.min(100, 100 - (distance * 4)));
    return pct.toFixed(0);
  }

  // Works when popup
  let doc = getContext<PDFDocumentProxy>("doc");

  $: {
    docEmbeddings = $allEmbeddings.filter((emb) => (
      emb.ref_type === "resource" && emb.ref === resource.id 
    ))
    let data: number[][] = docEmbeddings.map((e) => e.embedding);
    if (refEmbeddings) {
      refEmbeddings.dispose();
    }
    refEmbeddings = tf.tensor(data);
  }

  async function search(){
    searching = true;
    let query = await Embedding.createRaw(searchPhrase);
    let inputEmbedding = tf.tensor(query.embedding) as tf.Tensor1D;

    let distances: number[] = await euclideanDists(inputEmbedding, refEmbeddings);
    let distancesAndIdx = distances.map((val, idx) => [val, idx])
    distancesAndIdx.sort();
    let promises: Promise<SearchResult>[] = [];
    for (let i = 0; i < k && i < distances.length; i++) {
      let [distance, idx] = distancesAndIdx[i];
      let embedding = docEmbeddings[idx];
      let pageIdx: number = embedding.data.page_idx;
      promises.push(new Promise(async (resolve, reject) => {
        let page = await doc.getPage(pageIdx);
        let text = await Resource.pageToText(page);
        let pageLabel = pageIdx.toString();
        if (pageLabels) {
          pageLabel = pageLabels[pageIdx - 1];
        }
        resolve({
          preview: text.slice(0, previewLength),
          pageIdx,
          distance,
          pageLabel
        })
      }))
    }
    searchResults = await Promise.all(promises);
    searching = false;
  }

  function maybeSearch(e: KeyboardEvent){
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  }

</script>


<div class="flex flex-col p-4 space-y-3">
  <input on:keydown={maybeSearch}
        autofocus
        bind:value={searchPhrase}
        class="input input-bordered bg-white text-gray-900 w-full"
        placeholder="Search documents..." />
  {#if searching}
    <div class="text-sm text-gray-500 italic">Searching...</div>
  {/if}
  {#each searchResults as result, i}
     <div class="w-full flex flex-col border rounded-lg p-3
                 bg-white border-gray-300 shadow-sm
                 hover:border-amber-400 hover:shadow-md
                 select-none cursor-pointer transition-all"
                on:click={() => onSelect(result)}
                 >
        <div class="flex flex-row items-center justify-between mb-2">
          <span class="text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            Page {result.pageLabel}
          </span>
          <span class="text-xs text-gray-400">
            {relevancePercent(result.distance)}% match
          </span>
        </div>
        <div class="text-sm text-gray-700 leading-relaxed line-clamp-4">
          {result.preview}
        </div>
     </div>
  {/each}
</div>