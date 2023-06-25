<script lang="ts">
	import { MessageStream } from "$lib/client/util";
	import ChatMessage from "$lib/components/ChatMessage.svelte";
  import type * as Req from "$lib/request_types"
	import { onMount } from "svelte";

  const modelUser = "gpt-3.5-turbo";
  const modelAssistant = "gpt-3.5-turbo";
  let stop = false;
  let messages: Req.ChatCompletionRequestMessage[] = [];
  const SUBJECT = "How to stop poverty"

  function getSysMessage(isUser: boolean) : Req.ChatCompletionRequestMessage{
    return {
      role: "system",
      content: `
Your assignment is to together with the\
 user discuss a solution for the subject '${SUBJECT}'.\
 You will have the perspective\
 of ${isUser ? "capitalism" : "socialism"}.`
    }
//     return {
//       role: "system",
//       content: `
// Your assignment is to together with the\
// user discuss a solution for the subject '${SUBJECT}'.\
// Keep each answer relatively short so you can listen\
// to the thoughts of the user.`
//     }
  }

  async function sendMessage(isUser: boolean){
    const n = messages.length;
    const delta = 1;
    const stream = MessageStream({
      messages: [
        ...messages.slice(0, Math.max(n - delta, 0)),
        getSysMessage(isUser),
        ...messages.slice(Math.max(n - delta, 0), n)
      ]
    })

    let message: Req.ChatCompletionRequestMessage = {
      role: isUser ? "user" : "assistant",
      content: "",
    }

    for await (let chunk of stream) {
      message.content += chunk;
    }
    messages = [...messages, message];

    if (!stop) {
      sendMessage(!isUser);
    }
  }

  onMount(async () => {
    // sendMessage(true);
  })

</script>


{#each messages as message}
   <!-- content here -->
  <ChatMessage {...message} />

{/each}

<button class="btn" on:click={()=>{stop = true;}}>
  Stop
</button>