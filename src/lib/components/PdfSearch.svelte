<script lang="ts">
	import { Embedding, Resource, allEmbeddings } from "$lib/client/stores";
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { getContext } from "svelte";
  import * as tf from '@tensorflow/tfjs';
	import { euclideanDists } from "$lib/client/compute";

  export let resource: Resource;
  export let doc: PDFDocumentProxy;
  export let k: number = 5;
  export let previewLength: number = 800;

  interface SearchResult {
    preview: string;
    pageIdx: number;
    distance: number;
  };
  let searchResults: SearchResult[] = [];

  let docEmbeddings: Embedding[] = [];
  let searchPhrase: string = "";
  let refEmbeddings: tf.Tensor2D;

  // Works when popup
  // let doc = getContext<PDFDocumentProxy>("doc");

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
        resolve({
          preview: text.slice(0, previewLength),
          pageIdx,
          distance,
        })
      }))
    }
    searchResults = await Promise.all(promises);
  }

  function maybeSearch(e: KeyboardEvent){
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  }

</script>


<div class="flex flex-col p-4 space-y-2">
  <input on:keydown={maybeSearch}
        bind:value={searchPhrase}
        class="input input-bordered" 
        placeholder="Search.." />
  {#each searchResults as result}
     <div class="w-full flex flex-row border-2 border-gray-300 rounded-md p-2 space-x-4">
        <div class="flex flex-col">
          <div>
            {result.pageIdx}
          </div>
          <div>
            {result.distance.toFixed(3)}
          </div>
        </div>
        <div>
          {result.preview}
        </div>
     </div>
  {/each}
</div>