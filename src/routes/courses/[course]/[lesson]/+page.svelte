


<script lang="ts">
	import { courses, coursesLoading, selectCourseFromURL, selectedCourse } from '$lib/client/courses';
  import type * as Req from '$lib/request_types'
  import {
    selectedLesson, lessons, getLessonMessages 
  } from "$lib/client/lessons";

  import { messages, type Message, addMessage} from '$lib/client/messages'

  import { page } from "$app/stores"
	import type { ChatCompletionRequestMessage } from '$lib/request_types';
	import { afterUpdate, getContext, onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Markdown from '$lib/components/Markdown.svelte';
	import ScrollToBottom from '$lib/components/ScrollToBottom.svelte';
  

  let inputContent = "";

  onMount(async () => {
    await coursesLoading();
		await selectCourseFromURL($page.params.course,
			$selectedCourse, $courses);
	})

  // Does not remount
  $: {
    const idx = parseInt($page.params.lesson, 10);
    if (idx < $lessons.length) {
      const lesson = $lessons[idx];
      selectedLesson.set(lesson);
      getLessonMessages(lesson).then((val) => {
        messages.set(val);
      })
    }
  }

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
    const old_messages = [...$messages];
    const lessonId = $selectedLesson.id;
    let user_message = {
      content,
      role: "user",
      lessonId
    } as Message;

    messages.update((val) => ([
      ...val,
      user_message
    ]))
    
    const body: Req.Chat = { 
      messages: [
        SYS_MESSAGE,
        ...$messages.map(({content, role}) => ({
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
    let answer = {
      role: "assistant",
      content: "",
      lessonId
    } as Message;

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
      messages.set([...old_messages, user_message, answer]);
    }
    user_message = await addMessage(user_message);
    answer = await addMessage(answer);
  
    messages.set([...old_messages, user_message, answer]);
  }
  

  async function maybeSendMessage(event: KeyboardEvent){
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChat(inputContent);
    }
  }


</script>
<ScrollToBottom
         class="main-parent 
         flex-grow p-8 bg-yellow-100 flex flex-col
         items-center overflow-y-scroll h-full mx-auto"
>
  <div class="max-w-screen-md flex flex-col h-full ">
    {#if $selectedLesson}
    <div>
      {$selectedLesson?.description ||''}
    </div>
    {/if}
    {#each $messages as {role, content}}
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
    <textarea class="textarea textarea-info textarea-md text-base mt-auto overflow-hidden" 
              placeholder="Send a message..." on:keydown={maybeSendMessage}
              bind:value={inputContent} />
  </div>
</ScrollToBottom>

<style>

</style>