<script lang="ts" context="module">
  export interface OutlineNode {
    title: string;
    bold: boolean;
    italic: boolean;
    /**
     * - The color in RGB format to use for
     * display purposes.
     */
    color: Uint8ClampedArray;
    dest: string | Array<any> | null;
    url: string | null;
    unsafeUrl: string | undefined;
    newWindow: boolean | undefined;
    count: number | undefined;
    items: OutlineNode[];
  };
</script>
<script lang="ts">
	import type { PDFDocumentProxy } from "pdfjs-dist";
	import { getContext } from "svelte";

  export let nodes: OutlineNode[];

  let doc = getContext<PDFDocumentProxy>("doc");
  let numPages = doc.numPages;
  let prevPage = 1;
  let shares = nodes.map((node) => {
    if (node.dest instanceof Array) {
      let cur = node.dest[0].num as number;
      let size = cur - prevPage;
      console.log(size, node, node.title)
      prevPage = cur;
      return size / numPages;
    }
    return 1 / nodes.length;
  })
  console.log(shares);
</script>
