


<script lang="ts">
    import type * as Req from '$lib/request_types'
    import { selectedLesson, courses, lessons, messages, addMessage, type Message } from "$lib/client/courses"

    import { page } from "$app/stores"
    

    let inputContent = "";

    $: {
      const idx = parseInt($page.params.lesson, 10);
      if (idx < $lessons.length) {
        const oldDesc = $selectedLesson?.description || "";
        const lesson = $lessons[idx];
        console.log("Selected lesson: ", lesson);
        selectedLesson.set(lesson);
        if ($messages.length === 0 && (inputContent === "" || inputContent === oldDesc)) {
          inputContent = `Teach me about ${lesson.description}`;
        } 
      }
    }

    // let messages: Req.ChatCompletionRequestMessage[] = [
    //   {
    //     role: "user",
    //     content: "Hello! Who was Socrates?"
    //   },
    //   {
    //     role: "assistant",
    //     content: "Socrates was a classical Greek philosopher who lived between 469/470 BCE and 399 BCE. He is considered one of the founders of Western philosophy, known for his teaching style of asking questions to challenge assumptions and beliefs. Socrates believed in objective truth and the importance of self-knowledge, and he was known for his commitment to ethics and morality. His ideas and teachings were recorded by his followers, including Plato, and have been studied and debated for centuries. Socrates was famously sentenced to death by drinking hemlock, after being accused of corrupting the youth of Athens and challenging the authority of the city's leaders."
    //   }
    // ];
  
    async function sendChat(content: string) {
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
        messages: $messages.map(({content, role}) => ({
          content,
          role
        }))
      };
  
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      let answers_org = await res.json() as Req.ChatCompletionRequestMessage[];
      let new_messages = answers_org.map(({content, role}) => ({
        content, role, lessonId
      })) as Message[];
    
      new_messages = await Promise.all(new_messages.map(async (message) => {
        let updated_message = await addMessage(message);
        return updated_message;
      }));
      messages.set([...old_messages, ...new_messages]);
    }
    

    async function maybeSendMessage(event: KeyboardEvent){
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChat(inputContent);
      }
    }
    
  </script>
  
    <div class=" flex flex-col h-full">
      {#each $messages as {role, content}}
      <div class="chat chat-start">
        <div class="chat-image avatar">
          <div class="w-14 rounded-full">
            <img src="{role === "user" ? "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" : "https://banner2.cleanpng.com/20190613/wvj/kisspng-socrates-classical-athens-ancient-greek-philosophy-socrates-on-emaze-5d02ab1271b305.4589557715604559544657.jpg"}"
              alt="{role}" />
          </div>
        </div>
        <div class="chat-bubble {role === "user" ? "chat-bubble-success" : "chat-bubble-info"}">{content}</div>
      </div>
      {/each}
      <textarea class="textarea textarea-info textarea-md text-base mt-auto" 
                placeholder="Send a message..." on:keydown={maybeSendMessage} bind:value={inputContent} />
    </div>