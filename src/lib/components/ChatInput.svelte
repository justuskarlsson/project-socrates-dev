<script lang="ts">
	import { fade } from 'svelte/transition';
  import FaSearchengin from 'svelte-icons/fa/FaSearchengin.svelte'
	import { allPrompts, push, Prompt } from '$lib/client/stores';
  export let onSendMessage: Function;
  export let maxHeight: number = 210;
  export let value: string = "";

  let textareaValue: string = "";

  let lightningPromptVisible = false;

  let curWord = "";

  let filteredPrompts: Prompt[] = [];
  const filterLimit = 6;
  let promptIdx = 0;

  $ : {
    let parts = value.split(" ");
    let num = parts.length;
    let word = parts[num - 1];
    curWord = word.toLowerCase();
    filteredPrompts = $allPrompts.filter((prompt) => {
      return prompt.name.startsWith(curWord);
    }).slice(0, filterLimit);

    if (promptIdx > filteredPrompts.length) {
      promptIdx = filteredPrompts.length;
    }
  }

  let sending = false;
  $: {
    if (!sending) {
      value = textareaValue;
    }
  }

  async function maybeSendMessage(event: KeyboardEvent){
    if (event.altKey && event.key == "s") {
      lightningPromptVisible = !lightningPromptVisible;
      event.preventDefault();
    }
    else if(event.key === "Enter" && lightningPromptVisible) {
      if (promptIdx < filteredPrompts.length) {
        textareaValue = textareaValue.slice(0, 
          textareaValue.length - curWord.length
        )
        textareaValue += filteredPrompts[promptIdx].content;
      } else {
        let content = prompt(`Content for '${curWord}':`);
        value = value.slice(0, 
          value.length - curWord.length
        )
        if (content !== null) {
          let prompt = new Prompt({
            name: curWord,
            content: content
          });

          push(allPrompts, prompt);
          Prompt.collection.add(prompt);
          textareaValue += content;
        }
      }
      lightningPromptVisible = false;
      promptIdx = 0;
      event.preventDefault();
    }
    else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sending = true;
      textareaValue = "";
      await onSendMessage(value);
      sending = false;
      value = "";
    }
    else if (event.key === "ArrowUp") {
      promptIdx = promptIdx === 0 ? filteredPrompts.length : promptIdx - 1;
    }
    else if (event.key === "ArrowDown") {
      promptIdx = promptIdx === filteredPrompts.length ? 0 : promptIdx + 1;
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

<svelte:options accessors={true} />

<div class="relative mt-2">
  <textarea class="w-full p-2 min-h-[70px] resize-none pr-16
    shadow-xl rounded-xl border-slate-200 border-2" 
            style="max-height: {maxHeight}px;" 
            placeholder="Send a message..." on:keydown={maybeSendMessage}
            bind:value={textareaValue} use:resizable />

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
        class="absolute -top-64 mb-2 left-0 right-0 mx-auto
          w-full h-60 bg-green-200 flex flex-col text-black">
      
      <span class="underline p-1 m-1"> {curWord} </span>
      {#each filteredPrompts as prompt, index}
         <span class="p-1 m-1" 
              class:bg-green-500={index === promptIdx}>
            <b>{prompt.name}</b>: {prompt.contentSlice(50)}
         </span>
      {/each}
      <span class="underline p-1 m-1"
            class:bg-green-500={promptIdx === filteredPrompts.length}
      > 
        <b>New Prompt </b> 
      </span>
    </span>
  {/if}
</div>

<style>
</style>