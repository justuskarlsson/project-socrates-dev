<script lang="ts">
	import { fade } from 'svelte/transition';
  import FaSearchengin from 'svelte-icons/fa/FaSearchengin.svelte'
  export let onSendMessage: Function;
  export let maxHeight: number = 210;

  let inputContent = "";
  let lightningPromptVisible = false;

  let curWord = "";

  $ : {
    let parts = inputContent.split(" ");
    let num = parts.length;
    let word = parts[num - 1];
    curWord = word.toLowerCase();
  }


  function maybeSendMessage(event: KeyboardEvent){
    if (event.altKey && event.key == "s") {
      lightningPromptVisible = !lightningPromptVisible;
      event.preventDefault();
    }
    else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage(inputContent);
      inputContent = "";
    }

  }

  function resizable(node: HTMLTextAreaElement) {
    const updateHeight = () => {
      node.style.height = 'auto'; // reset the height
      if (node.scrollHeight > maxHeight) {
        node.style.height = maxHeight + 'px'; // set the height to the maximum
        node.scrollTop = node.scrollHeight; 
      } else {
        node.style.height = node.scrollHeight + 'px'; // set the height to the scroll height
      }
    };
    node.addEventListener('input', updateHeight);

    return {
      destroy() {
        node.removeEventListener('input', updateHeight);
      },
    };
  }

  function toggleLightningPrompt(){
    lightningPromptVisible = !lightningPromptVisible;
  }

</script>


<span class="relative mt-2">
  <textarea class="w-full p-2 min-h-[70px] resize-none" 
            style="max-height: {maxHeight}px;" 
            placeholder="Send a message..." on:keydown={maybeSendMessage}
            bind:value={inputContent} use:resizable />

  <span 
        class="x-icon absolute right-4 top-0 p-2
               shadow-xl rounded-3xl bg-parchment text-green-500"
        class:active={lightningPromptVisible}
    on:click={toggleLightningPrompt}
  >
    <FaSearchengin />
  </span>
  {#if lightningPromptVisible}
    <span 
        transition:fade
        class="absolute -top-80 left-0 right-0 mx-auto
          w-full h-64 bg-slate-50">
      {curWord}
    </span>
  {/if}
</span>

<style>
</style>