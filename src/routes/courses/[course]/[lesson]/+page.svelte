


<script lang="ts">
	import { courses, coursesLoading, selectCourseFromURL, selectedCourse } from '$lib/client/courses';
  import type * as Req from '$lib/request_types'
  import {
    selectedLesson, lessons, getLessonMessages 
  } from "$lib/client/lessons";

  import { messages, type Message, addMessage} from '$lib/client/messages'

  import { page } from "$app/stores"
	import type { ChatCompletionRequestMessage } from '$lib/request_types';
	import { onMount } from 'svelte';
  

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
      console.log("Selected lesson: ", lesson);
      selectedLesson.set(lesson);
      console.log("Fetch messages:")
      getLessonMessages(lesson).then((val) => {
        messages.set(val);
      })
    }
  }

  const SYS_MESSAGE: ChatCompletionRequestMessage = {
    role: "system",
    content: "You are a teacher. You should be factual but also pedagogic. If the student strays away from the topic of the lesson, you will try to steer him/her back. Don't be too long-winded in your responses."
  };

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

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    user_message = await addMessage(user_message);
    let answers_org = await res.json() as Req.ChatCompletionRequestMessage[];
    let new_messages = answers_org.map(({content, role}) => ({
      content, role, lessonId
    })) as Message[];
  
    new_messages = await Promise.all(new_messages.map(async (message) => {
      let updated_message = await addMessage(message);
      return updated_message;
    }));
    messages.set([...old_messages, user_message, ...new_messages]);
  }
  

  async function maybeSendMessage(event: KeyboardEvent){
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChat(inputContent);
    }
  }

  function formatContent(content: string) {
    content = content.replaceAll("\n", "<br>");
    content = content.replace("```", "<code>");
    content = content.replace("```", "</code>");
    return content;
  }
  
</script>

  <div class=" flex flex-col h-full">
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
        {@html formatContent(content)}
      </div>
    </div>
    {/each}
    <textarea class="textarea textarea-info textarea-md text-base mt-auto" 
              placeholder="Send a message..." on:keydown={maybeSendMessage} bind:value={inputContent} />
  </div>