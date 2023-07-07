<script lang="ts">
  import * as pdfJs from 'pdfjs-dist';
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import type { TextItem } from 'pdfjs-dist/types/src/display/api';
	import { afterUpdate, getContext, onDestroy, onMount } from "svelte";
	import { text } from 'svelte/internal';

  export let index: number;
  export let scale: "fit" | number = "fit";

  let pdfContainer: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let textLayer: HTMLDivElement;

  let renderingPage = false;
  let searchText = "Extracellular Fluid";


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
    
    for (let i = 0; i < textLayer.children.length; i++) {
      let item = textLayer.children.item(i);
      if (!item) continue;
      
      item.innerHTML = item.innerHTML.replace(
          new RegExp(`(${searchText})`, 'gi'), injectHighlight);
    
      
    }
    renderingPage = false;
  }

  function injectHighlight(matched: string) {
    return `<span class="highlight">${matched}</span>`;
  }

  let selectedText = "";

	function onHighlight() {
		let selection = document.getSelection();
		let text = selection?.toString() || "";
    // console.log(selectedText)
		if (text.length) {
      selectedText = text;
			// console.log(selectedText);
			// if (selectedText.length > 5) {
			//   alert(selectedText);
			// }
		}
	}

  function maybeCompleteSelection(event: MouseEvent){
    console.log("Mouse up:", event, selectedText);
    searchText = selectedText;
    renderPage();
    // selectedText = "";
  }

  onMount(() => {
		document.addEventListener('selectionchange', onHighlight);
	});

	onDestroy(() => {
		document.removeEventListener('selectionchange', onHighlight);
	});


</script>

<div class="relative h-full w-full bg-slate-200 overflow-x-hidden" bind:this={pdfContainer}>
  <canvas class="right-0 mx-auto" bind:this={canvas} />
  <div class="textLayer" on:mouseup={maybeCompleteSelection} bind:this={textLayer}></div>
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

  :global(.highlight) {
    background-color: red;
  }

</style>