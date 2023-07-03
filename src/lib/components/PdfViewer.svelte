<script lang="ts">
	import { Resource } from '$lib/client/stores';
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { onMount } from 'svelte';

  export let resource: Resource;
  export let pageIdx = 30;
  export let scale = 1.0;
  

	let canvas: HTMLCanvasElement;
  let pdfContainer: HTMLDivElement;
  let textLayer: HTMLDivElement;
  let doc: PDFDocumentProxy | null;
	// The workerSrc property shall be specified.
  // console.log(pdfJs)
	pdfJs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.js',
		import.meta.url
	).toString();

  async function renderPage(){
    if (!doc) return;
    let page = await doc.getPage(pageIdx);
    let viewport = page.getViewport({scale});
    textLayer.style.setProperty('--scale-factor', scale.toString());
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({
      canvasContext: canvas.getContext("2d")!,
      viewport
    })
    // Prepare to render the text layer
    let textContent = await page.getTextContent();
    console.log(textContent);
    // Clear the previous text layer
    textLayer.innerHTML = '';

    let textLayerRenderTask = pdfJs.renderTextLayer({
      textContentSource: textContent,
      container: textLayer,
      viewport,
      textDivs: []
    });

    await textLayerRenderTask.promise;
  }

  onMount(async ()=> {
    const buffer = await Resource.load(resource);
    doc = await pdfJs.getDocument(buffer).promise;
    await renderPage();
    document.addEventListener("keydown", async (e) => {
      if (e.key === "ArrowRight") {
        pageIdx = Math.min(pageIdx + 1, doc?.numPages || 1000);
        await renderPage();
      }
      else if(e.key === "ArrowLeft") {
        pageIdx = Math.max(pageIdx - 1, 0);
        await renderPage();
      }
    })
  })

</script>
<div class="pdfContainer" bind:this={pdfContainer}>
  <canvas bind:this={canvas} />
  <div class="textLayer" bind:this={textLayer}></div>
</div>


<style>
  .pdfContainer {
    position: relative;
  }

  canvas, .textLayer {
    position: absolute;
    top: 0;
    left: 0;
  }

  .textLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    opacity: 0.8;
    line-height: 1.0;
    pointer-events: none;

  }

  :global(.textLayer > *) {
    pointer-events: visibleStroke;
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }

</style>