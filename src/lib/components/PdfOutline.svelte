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
	import type { RefProxy } from "pdfjs-dist/types/src/display/api";
	import { getContext } from "svelte";

  export let nodes: OutlineNode[];

  let doc = getContext<PDFDocumentProxy>("doc");
  let numPages = doc.numPages;
  let prevPage = 1;
  let sharesPromise = nodes.map(async (node) => {
    if (node.dest instanceof Array) {
      let cur = await doc.getPageIndex(node.dest[0] as RefProxy) + 1;
      // let cur = node.dest[0].num as number;
      let size = cur - prevPage + 1;
      console.log(size, cur, node.color)
      prevPage = cur;
      return size / numPages;
    }
    return 1 / nodes.length;
  })
  // shares = Promise.allSettled(shares);
  console.log(sharesPromise);
  function mapToHue(idx: number) {
    let hue = (idx / nodes.length) * 360;
    let str = Math.round(hue).toString();
    console.log(str);
    return str;
  }
</script>
<div class="w-full h-full flex flex-row">
  {#await Promise.all(sharesPromise)}
  <!-- promise is pending -->
  {:then shares}
    {#each nodes as node, i}
    <div class="group relative" 
      style="width: {(100 * shares[i]).toFixed(0)}%;"
        >
      <div class="block w-full h-full"
           style="background-color: hsla({mapToHue(i)}, 30%, 91%);"
      >
      </div>
    
      <span class="block-tooltip group-hover:scale-100">
        {node.title}
      </span>
    </div>

    {/each}
  {/await}

</div>


<style lang="postcss">
  .block {
  @apply shadow-lg border-r-[1px] border-gray-300 transition-all duration-100
    ease-linear cursor-pointer  hover:contrast-50;
}

  .block-tooltip {
    --tw-translate-y: -100%;
    --tw-translate-x: -50%;
    left: 50%;
    right:50%;
    @apply absolute z-20 -top-4 w-auto p-2 m-2 min-w-max 
    rounded-md shadow-md text-white bg-gray-900 
    text-xs font-bold transition-all duration-100
    select-none origin-center scale-0  ;
  }
</style>