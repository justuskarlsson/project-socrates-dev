


<script lang="ts">
	import { 
    Message, push,
    curMessages, selectedLesson, allMessages


   } from '$lib/client/stores';
  import type * as Req from '$lib/request_types'
	import type { ChatCompletionRequestMessage } from '$lib/request_types';
	import Markdown from '$lib/components/Markdown.svelte';
	import ScrollToBottom from '$lib/components/ScrollToBottom.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Sidebar from '$lib/views/Sidebar.svelte';
  

  let inputContent = "";

  const SYS_MESSAGE_TEACHER: ChatCompletionRequestMessage = {
    role: "system",
    content: "You are a teacher. You should be factual but also pedagogic. If the student strays away from the topic of the lesson, you will try to steer him/her back. Don't be too long-winded in your responses. Format your answers in Markdown to better convey your meaning."
  };

  const SYS_MESSAGE_HERMAN: ChatCompletionRequestMessage = {
    role: "system",
    content: "You are a teacher from germany. Your accent shows in the way you spell words. You are concise and can come across as rude. Your name is Herman."
  };

  const SYS_MESSAGE = SYS_MESSAGE_TEACHER;
 

  async function sendChat(content: string) {
    inputContent = "";
    const old_messages = [...$curMessages];
    if (!$selectedLesson) return console.warn("No selected lesson on message add");
    const lessonId = $selectedLesson.id;

    let user_message = new Message({
      content,
      role: "user",
      lessonId
    });

    push(curMessages, user_message);

    
    const body: Req.Chat = { 
      messages: [
        SYS_MESSAGE,
        ...$curMessages.map(({content, role}) => ({
          content,
          role
        }))
      ]
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
      'Content-Type': 'text/event-stream'
      },
      body: JSON.stringify(body)
    });
    let answer = new Message({
      role: "assistant",
      content: "",
      lessonId
    });

    const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      const chunks = value.split("data: ");
      for (let i = 1; i < chunks.length; i++) {
        if (chunks[i].startsWith("[DONE]")) {
          break;
        }
        const data = JSON.parse(chunks[i]);
        const delta = data.choices[0].delta;
        if ("content" in delta) {
          answer.content += delta.content;
        }
      }
      $curMessages = [...old_messages, user_message, answer];
    }
    user_message = await Message.collection.add(user_message);
    answer = await Message.collection.add(answer);
  
    $curMessages = [...old_messages, user_message, answer];
    push(allMessages, user_message, answer);
  }
  
</script>

<Sidebar />
<div
         class="main-parent 
         flex-grow p-8 bg-parchment flex flex-col
         items-center h-full mx-auto"
>
  <div class="max-w-screen-md flex flex-col h-full ">
    <ScrollToBottom class="h-full overflow-y-scroll overflow-x-hidden">
      {#if $selectedLesson}
      <div>
        {$selectedLesson?.description ||''}
      </div>
      {/if}
      {#each $curMessages as {role, content}}
      <div class="chat chat-start">
        <div class="chat-image avatar">
          <div class="w-14 rounded-full">
            <img src="{role === "user" ? "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" : "https://banner2.cleanpng.com/20190613/wvj/kisspng-socrates-classical-athens-ancient-greek-philosophy-socrates-on-emaze-5d02ab1271b305.4589557715604559544657.jpg"}"
              alt="{role}" />
          </div>
        </div>
        <div class="chat-bubble {role === "user" ? "chat-bubble-success" : "chat-bubble-info"}">
          <Markdown content={content} />
        </div>
      </div>
      {/each}
    </ScrollToBottom>
    <ChatInput onSendMessage={sendChat} />
  </div>
</div>

<style>

</style>