


<script lang="ts">
	import { 
    Message, push,
    curMessages, selectedLesson, allMessages


   } from '$lib/client/stores';
  import type * as Req from '$lib/request_types'
	import ScrollToBottom from '$lib/components/ScrollToBottom.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Sidebar from '$lib/views/Sidebar.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { MessageStream, SYS_MESSAGE_TEACHER } from '$lib/client/util';
  

  

  const SYS_MESSAGE = SYS_MESSAGE_TEACHER;
 

  async function sendChat(content: string) {
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

    const messageStream = MessageStream(body);
    
    let answer = new Message({
      role: "assistant",
      content: "",
      lessonId
    });

    for await (let part of messageStream){
      answer.content += part;
      $curMessages = [...old_messages, user_message, answer];
    }
    delete user_message.groupId;
    delete answer.groupId;
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
        <ChatMessage {role} {content} />
      {/each}
    </ScrollToBottom>
    <ChatInput onSendMessage={sendChat} />
  </div>
</div>
