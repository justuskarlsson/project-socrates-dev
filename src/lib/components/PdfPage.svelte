<script lang="ts">
  import * as pdfJSViewer from 'pdfjs-dist/web/pdf_viewer.js'
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { afterUpdate, getContext, onMount } from "svelte";

  export let index: number;
  export let scale: "fit" | number = "fit";

  let pdfContainer: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let textLayer: HTMLDivElement;

  let renderingPage = false;

  let doc = getContext<PDFDocumentProxy>("doc");
  const eventBus = new pdfJSViewer.EventBus();

  afterUpdate(async ()=>{
    await renderPage();

  })
  async function renderPage(){
    console.log("Rendering Page", index);
    if (!doc) return;
    if (renderingPage) return;
    renderingPage = true;
    let page = await doc.getPage(index);
    let viewport;
    let scaleUsed: number;
    if (scale === "fit") {
      viewport = page.getViewport({scale: 1.0});
      scaleUsed = pdfContainer.clientHeight / viewport.height;
      console.log(viewport, pdfContainer.clientHeight);
      viewport = page.getViewport({scale: scaleUsed});
    } else {
      viewport = page.getViewport({scale});
      scaleUsed = scale;
    }
    pdfContainer.innerHTML = "";
    const pageView = new pdfJSViewer.PDFPageView({
      container: pdfContainer,
      id: index,
      defaultViewport: viewport,
      scale: 1 / scaleUsed - 0.03,
      eventBus
    })
    pageView.setPdfPage(page);
    await pageView.draw();
    renderingPage = false;
  }

</script>

<div class="pdfViewer singlePageView relative
            h-full w-full p-0  bg-slate-200"
            style="margin: inherit; overflow-scroll; display:block;" 
          bind:this={pdfContainer}

>
</div>


