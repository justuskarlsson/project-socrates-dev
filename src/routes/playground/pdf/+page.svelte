<script lang="ts">
  import * as pdfJs from 'pdfjs-dist';
	import type {PDFDocumentProxy} from 'pdfjs-dist';
	import { onMount } from 'svelte';
  
	// If absolute URL from the remote server is provided, configure the CORS
	// header on that server.
	var url =
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
  
	let canvas: HTMLCanvasElement;
  let pdfContainer: HTMLDivElement;
  let textLayer: HTMLDivElement;
  let pageIdx = 12;
  let scale = 1.0;
  let doc: PDFDocumentProxy | null;
	// The workerSrc property shall be specified.
  // console.log(pdfJs)
	pdfJs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.js',
		import.meta.url
	).toString();
	async function loadLocal(file: File) : Promise<PDFDocumentProxy> {
		// let file = el.files && el.files[0];
    const buffer = await file.arrayBuffer();
    return pdfJs.getDocument(buffer).promise;
	}

  async function onChange(e: Event) {
    let target = e.target as HTMLInputElement;
    let file = target.files && target.files[0];
    if (!file) return;
    doc = await loadLocal(file);
    renderPage();
  }

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

  onMount(()=>{
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
<input type="file" on:change={onChange} />
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
  }

  :global(.textLayer > *) {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }

</style>