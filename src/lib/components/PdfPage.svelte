<script lang="ts">
  import * as pdfJs from 'pdfjs-dist';
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { afterUpdate, getContext, onMount } from "svelte";

  export let index: number;
  export let scale: "fit" | number = "fit";

  let pdfContainer: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let textLayer: HTMLDivElement;

  let renderingPage = false;

  let doc = getContext<PDFDocumentProxy>("doc");
  afterUpdate(async ()=>{
    await renderPage();

  })
  async function renderPage(){
    if (!doc) return;
    if (renderingPage) return;
    renderingPage = true;
    let page = await doc.getPage(index);
    let viewport;
    let scaleUsed: number;
    if (scale === "fit") {
      viewport = page.getViewport({scale: 1.0});
      scaleUsed = pdfContainer.clientHeight / viewport.height;
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
    // // The tree TOC
    // let a = await doc.getOutline();
    let textContent = await page.getTextContent();
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

</script>

<div class="relative h-full w-full bg-slate-200" bind:this={pdfContainer}>
  <canvas class="right-0 mx-auto" bind:this={canvas} />
  <div class="textLayer" bind:this={textLayer}></div>
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