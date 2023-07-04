<script lang="ts">
	import { Resource } from '$lib/client/stores';
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { onMount } from 'svelte';
	import ModalEntry from './ModalEntry.svelte';
	import Form from './Form.svelte';
	import PdfDocument from './PdfDocument.svelte';
	import PdfPage from './PdfPage.svelte';

  export let resource: Resource;
  export let pageIdx = 30;
  export let scale: "fit" | number = "fit";
  
  let renderingPage = false;
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
    if (renderingPage) return;
    renderingPage = true;
    let page = await doc.getPage(pageIdx);
    let viewport;
    let scaleUsed: number;
    if (scale === "fit") {
      viewport = page.getViewport({scale: 1.0});
      scaleUsed = pdfContainer.clientHeight / viewport.height;
      console.log(scaleUsed, scaleUsed.toString());
      viewport = page.getViewport({scale: scaleUsed});
    } else {
      viewport = page.getViewport({scale});
      scaleUsed = scale;
    }
    textLayer.style.setProperty('--scale-factor', scaleUsed.toString());
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({
      canvasContext: canvas.getContext("2d")!,
      viewport
    })
    let textContent = await page.getTextContent();
    let content = textContent.items.map((x: any) => x.str || "").join(" ");
    // console.log(content)
    textLayer.innerHTML = '';

    let textLayerRenderTask = pdfJs.renderTextLayer({
      textContentSource: textContent,
      container: textLayer,
      viewport,
      textDivs: []
    });

    await textLayerRenderTask.promise;
    renderingPage = false;
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
<div class="relative h-full w-full bg-slate-200" bind:this={pdfContainer}>
  <canvas class="right-0 mx-auto" bind:this={canvas} />
  <div class="textLayer" bind:this={textLayer}></div>
  <PdfDocument data={resource}>
    <PdfPage />
  </PdfDocument>
  <div class="absolute right-2 top-2 flex flex-col space-y-1">
    <ModalEntry Component={Form} 
                modal={{type: "modal"}}
                inputs={[
                  {name: "bla"}
                ]}
                >
      <button class="w-12 h-12 bg-blue-400">
        E
      </button>
    </ModalEntry>
    <div class="w-12 h-12 bg-blue-400"></div>
  </div>
</div>


<style>
  canvas, .textLayer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
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
    pointer-events: fill;
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }

</style>