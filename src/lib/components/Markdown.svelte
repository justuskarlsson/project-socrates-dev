<script lang="ts">

  import { onMount } from 'svelte';
  import { unified } from 'unified';
  import remarkParse from 'remark-parse';
  import remarkRehype from 'remark-rehype';
  import rehypeRaw from 'rehype-raw';
  import rehypeHighlight from 'rehype-highlight';
  import rehypeKatex from 'rehype-katex';
  import remarkMath from 'remark-math'
  import stringify from 'rehype-stringify';

  export let content: string;

  let htmlContent = '';

  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeHighlight, {plainText: ["latex"]})
    .use(stringify);

  async function processContent(content: string) {
    try {
      htmlContent = String(await processor.process(content));
    } catch(e) {
      console.error(e);
    }
  }

  onMount(() => processContent(content));
  
  $: {
    processContent(content);
  }

</script>

<span class="markdown-body">
  {@html htmlContent}
</span>
