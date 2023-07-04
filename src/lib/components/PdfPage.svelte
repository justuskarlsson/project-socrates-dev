<script lang="ts">
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { getContext } from "svelte";

  let doc = getContext<PDFDocumentProxy>("doc");
  console.log("Doc from page:", doc);
</script>